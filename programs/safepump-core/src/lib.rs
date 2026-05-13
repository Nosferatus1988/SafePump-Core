use anchor_lang::prelude::*;
use anchor_lang::system_program;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token::{self, Mint, MintTo, Token, TokenAccount, Transfer};

declare_id!("H3DyK56MDPAfcHwocGyUEeTS4oS9avkZ7xxz26R5Fe9z");

pub const SNIPE_WINDOW_SLOTS: u64 = 10;
pub const VESTING_DURATION_SECONDS: i64 = 48 * 60 * 60;

#[program]
pub mod safepump_core {
    use super::*;

    pub fn initialize_curve(
        ctx: Context<InitializeCurve>,
        virtual_sol_reserves: u64,
        virtual_token_reserves: u64,
        token_supply: u64,
    ) -> Result<()> {
        require!(
            virtual_sol_reserves > 0 && virtual_token_reserves > 0,
            ErrorCode::InvalidReserves
        );
        require!(
            token_supply > 0 && token_supply <= virtual_token_reserves,
            ErrorCode::InvalidSupply
        );

        let clock = Clock::get()?;
        let curve = &mut ctx.accounts.bonding_curve;
        curve.mint = ctx.accounts.mint.key();
        curve.creator = ctx.accounts.creator.key();
        curve.mint_slot = clock.slot;
        curve.virtual_sol_reserves = virtual_sol_reserves;
        curve.virtual_token_reserves = virtual_token_reserves;
        curve.real_sol_reserves = 0;
        curve.real_token_reserves = token_supply;
        curve.token_total_supply = token_supply;
        curve.complete = false;
        curve.bump = ctx.bumps.bonding_curve;

        let mint_key = ctx.accounts.mint.key();
        let bump = curve.bump;
        let seeds: &[&[u8]] = &[b"bonding_curve", mint_key.as_ref(), &[bump]];
        let signer: &[&[&[u8]]] = &[seeds];
        let cpi_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.key(),
            MintTo {
                mint: ctx.accounts.mint.to_account_info(),
                to: ctx.accounts.token_vault.to_account_info(),
                authority: curve.to_account_info(),
            },
            signer,
        );
        token::mint_to(cpi_ctx, token_supply)?;

        emit!(CurveInitialized {
            mint: curve.mint,
            creator: curve.creator,
            mint_slot: curve.mint_slot,
            token_supply,
        });
        Ok(())
    }

    pub fn buy(ctx: Context<Buy>, sol_amount: u64, min_tokens_out: u64) -> Result<()> {
        require!(sol_amount > 0, ErrorCode::ZeroAmount);
        let curve = &mut ctx.accounts.bonding_curve;
        require!(!curve.complete, ErrorCode::CurveComplete);

        let clock = Clock::get()?;
        let slot_delta = clock.slot.saturating_sub(curve.mint_slot);
        let is_snipe = slot_delta < SNIPE_WINDOW_SLOTS;

        // Constant product: tokens_out = vtok - (vsol * vtok) / (vsol + sol_in)
        let k = (curve.virtual_sol_reserves as u128)
            .checked_mul(curve.virtual_token_reserves as u128)
            .ok_or(ErrorCode::MathOverflow)?;
        let new_vsol = (curve.virtual_sol_reserves as u128)
            .checked_add(sol_amount as u128)
            .ok_or(ErrorCode::MathOverflow)?;
        let new_vtok = k.checked_div(new_vsol).ok_or(ErrorCode::MathOverflow)?;
        let tokens_out_u128 = (curve.virtual_token_reserves as u128)
            .checked_sub(new_vtok)
            .ok_or(ErrorCode::MathOverflow)?;
        let tokens_out: u64 = tokens_out_u128
            .try_into()
            .map_err(|_| ErrorCode::MathOverflow)?;

        require!(tokens_out >= min_tokens_out, ErrorCode::SlippageExceeded);
        require!(
            tokens_out <= curve.real_token_reserves,
            ErrorCode::InsufficientLiquidity
        );

        curve.virtual_sol_reserves = new_vsol.try_into().map_err(|_| ErrorCode::MathOverflow)?;
        curve.virtual_token_reserves = new_vtok.try_into().map_err(|_| ErrorCode::MathOverflow)?;
        curve.real_sol_reserves = curve
            .real_sol_reserves
            .checked_add(sol_amount)
            .ok_or(ErrorCode::MathOverflow)?;
        curve.real_token_reserves = curve
            .real_token_reserves
            .checked_sub(tokens_out)
            .ok_or(ErrorCode::MathOverflow)?;

        // SOL in: buyer -> bonding_curve PDA (the curve account itself stores lamports).
        let cpi_ctx = CpiContext::new(
            ctx.accounts.system_program.key(),
            system_program::Transfer {
                from: ctx.accounts.buyer.to_account_info(),
                to: curve.to_account_info(),
            },
        );
        system_program::transfer(cpi_ctx, sol_amount)?;

        // Tokens out: from token_vault -> destination.
        // Destination depends on whether this is an anti-MEV snipe.
        let mint_key = curve.mint;
        let bump = curve.bump;
        let seeds: &[&[u8]] = &[b"bonding_curve", mint_key.as_ref(), &[bump]];
        let signer: &[&[&[u8]]] = &[seeds];
        let destination = if is_snipe {
            ctx.accounts.vesting_token_vault.to_account_info()
        } else {
            ctx.accounts.buyer_token_account.to_account_info()
        };
        let cpi_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.key(),
            Transfer {
                from: ctx.accounts.token_vault.to_account_info(),
                to: destination,
                authority: curve.to_account_info(),
            },
            signer,
        );
        token::transfer(cpi_ctx, tokens_out)?;

        if is_snipe {
            let vault = &mut ctx.accounts.vesting_vault;
            if vault.beneficiary == Pubkey::default() {
                vault.beneficiary = ctx.accounts.buyer.key();
                vault.mint = curve.mint;
                vault.bump = ctx.bumps.vesting_vault;
            }
            vault.amount = vault
                .amount
                .checked_add(tokens_out)
                .ok_or(ErrorCode::MathOverflow)?;
            // Every snipe resets the 48h clock — repeat sniping compounds the penalty.
            vault.unlock_timestamp = clock
                .unix_timestamp
                .checked_add(VESTING_DURATION_SECONDS)
                .ok_or(ErrorCode::MathOverflow)?;

            emit!(SnipeLocked {
                buyer: ctx.accounts.buyer.key(),
                mint: curve.mint,
                slot_delta,
                tokens_locked: tokens_out,
                unlock_timestamp: vault.unlock_timestamp,
            });
        } else {
            emit!(BuyExecuted {
                buyer: ctx.accounts.buyer.key(),
                mint: curve.mint,
                sol_in: sol_amount,
                tokens_out,
            });
        }

        Ok(())
    }

    pub fn claim_vested(ctx: Context<ClaimVested>) -> Result<()> {
        let clock = Clock::get()?;
        let vault = &mut ctx.accounts.vesting_vault;
        require!(vault.amount > 0, ErrorCode::NothingToClaim);
        require!(
            clock.unix_timestamp >= vault.unlock_timestamp,
            ErrorCode::StillLocked
        );

        let amount = vault.amount;
        let beneficiary = vault.beneficiary;
        let mint = vault.mint;
        let bump = vault.bump;
        let seeds: &[&[u8]] = &[
            b"vesting",
            beneficiary.as_ref(),
            mint.as_ref(),
            &[bump],
        ];
        let signer: &[&[&[u8]]] = &[seeds];

        let cpi_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.key(),
            Transfer {
                from: ctx.accounts.vesting_token_vault.to_account_info(),
                to: ctx.accounts.beneficiary_token_account.to_account_info(),
                authority: vault.to_account_info(),
            },
            signer,
        );
        token::transfer(cpi_ctx, amount)?;

        vault.amount = 0;
        emit!(VestedClaimed {
            beneficiary,
            mint,
            amount,
        });
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeCurve<'info> {
    #[account(mut)]
    pub creator: Signer<'info>,

    #[account(
        init,
        payer = creator,
        mint::decimals = 6,
        mint::authority = bonding_curve,
        mint::freeze_authority = bonding_curve,
    )]
    pub mint: Account<'info, Mint>,

    #[account(
        init,
        payer = creator,
        space = 8 + BondingCurve::INIT_SPACE,
        seeds = [b"bonding_curve", mint.key().as_ref()],
        bump,
    )]
    pub bonding_curve: Account<'info, BondingCurve>,

    #[account(
        init,
        payer = creator,
        token::mint = mint,
        token::authority = bonding_curve,
        seeds = [b"token_vault", mint.key().as_ref()],
        bump,
    )]
    pub token_vault: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct Buy<'info> {
    #[account(mut)]
    pub buyer: Signer<'info>,

    pub mint: Account<'info, Mint>,

    #[account(
        mut,
        seeds = [b"bonding_curve", mint.key().as_ref()],
        bump = bonding_curve.bump,
        has_one = mint @ ErrorCode::WrongMint,
    )]
    pub bonding_curve: Account<'info, BondingCurve>,

    #[account(
        mut,
        seeds = [b"token_vault", mint.key().as_ref()],
        bump,
    )]
    pub token_vault: Account<'info, TokenAccount>,

    #[account(
        init_if_needed,
        payer = buyer,
        associated_token::mint = mint,
        associated_token::authority = buyer,
    )]
    pub buyer_token_account: Account<'info, TokenAccount>,

    #[account(
        init_if_needed,
        payer = buyer,
        space = 8 + VestingVault::INIT_SPACE,
        seeds = [b"vesting", buyer.key().as_ref(), mint.key().as_ref()],
        bump,
    )]
    pub vesting_vault: Account<'info, VestingVault>,

    #[account(
        init_if_needed,
        payer = buyer,
        token::mint = mint,
        token::authority = vesting_vault,
        seeds = [b"vesting_tokens", buyer.key().as_ref(), mint.key().as_ref()],
        bump,
    )]
    pub vesting_token_vault: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct ClaimVested<'info> {
    #[account(mut)]
    pub beneficiary: Signer<'info>,

    pub mint: Account<'info, Mint>,

    #[account(
        mut,
        seeds = [b"vesting", beneficiary.key().as_ref(), mint.key().as_ref()],
        bump = vesting_vault.bump,
        has_one = mint @ ErrorCode::WrongMint,
        has_one = beneficiary @ ErrorCode::WrongBeneficiary,
    )]
    pub vesting_vault: Account<'info, VestingVault>,

    #[account(
        mut,
        seeds = [b"vesting_tokens", beneficiary.key().as_ref(), mint.key().as_ref()],
        bump,
    )]
    pub vesting_token_vault: Account<'info, TokenAccount>,

    #[account(
        init_if_needed,
        payer = beneficiary,
        associated_token::mint = mint,
        associated_token::authority = beneficiary,
    )]
    pub beneficiary_token_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[account]
#[derive(InitSpace)]
pub struct BondingCurve {
    pub mint: Pubkey,
    pub creator: Pubkey,
    pub mint_slot: u64,
    pub virtual_sol_reserves: u64,
    pub virtual_token_reserves: u64,
    pub real_sol_reserves: u64,
    pub real_token_reserves: u64,
    pub token_total_supply: u64,
    pub complete: bool,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct VestingVault {
    pub beneficiary: Pubkey,
    pub mint: Pubkey,
    pub amount: u64,
    pub unlock_timestamp: i64,
    pub bump: u8,
}

#[event]
pub struct CurveInitialized {
    pub mint: Pubkey,
    pub creator: Pubkey,
    pub mint_slot: u64,
    pub token_supply: u64,
}

#[event]
pub struct BuyExecuted {
    pub buyer: Pubkey,
    pub mint: Pubkey,
    pub sol_in: u64,
    pub tokens_out: u64,
}

#[event]
pub struct SnipeLocked {
    pub buyer: Pubkey,
    pub mint: Pubkey,
    pub slot_delta: u64,
    pub tokens_locked: u64,
    pub unlock_timestamp: i64,
}

#[event]
pub struct VestedClaimed {
    pub beneficiary: Pubkey,
    pub mint: Pubkey,
    pub amount: u64,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Reserves must be greater than zero")]
    InvalidReserves,
    #[msg("Initial supply must be > 0 and <= virtual_token_reserves")]
    InvalidSupply,
    #[msg("Amount must be greater than zero")]
    ZeroAmount,
    #[msg("Bonding curve has graduated and is no longer active")]
    CurveComplete,
    #[msg("Math overflow")]
    MathOverflow,
    #[msg("Output below minimum slippage tolerance")]
    SlippageExceeded,
    #[msg("Insufficient liquidity in curve")]
    InsufficientLiquidity,
    #[msg("Vesting period has not elapsed")]
    StillLocked,
    #[msg("Nothing to claim")]
    NothingToClaim,
    #[msg("Caller is not the beneficiary")]
    WrongBeneficiary,
    #[msg("Mint mismatch")]
    WrongMint,
}
