const programId = "FMAhGG8ETyqnd4zan4HBdLRPEQvk7Cvc6kzWbsvnXj5q";

const solIn = document.querySelector("#solIn");
const vSol = document.querySelector("#vSol");
const vTokens = document.querySelector("#vTokens");
const solInOut = document.querySelector("#solInOut");
const vSolOut = document.querySelector("#vSolOut");
const vTokensOut = document.querySelector("#vTokensOut");
const tokensOut = document.querySelector("#tokensOut");
const curveCanvas = document.querySelector("#curveCanvas");
const heroCanvas = document.querySelector("#heroCanvas");
const copyProgram = document.querySelector("#copyProgram");

function formatTokenAmount(value) {
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(3)}B`;
  }

  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(2)}M`;
  }

  return Math.round(value).toLocaleString("en-US");
}

function resizeCanvas(canvas) {
  const ratio = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = Math.max(1, Math.floor(rect.width * ratio));
  canvas.height = Math.max(1, Math.floor(rect.height * ratio));
  const ctx = canvas.getContext("2d");
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  return { ctx, width: rect.width, height: rect.height };
}

function quoteBuy(solAmount, virtualSol, virtualTokens) {
  const invariant = virtualSol * virtualTokens;
  const newSolReserve = virtualSol + solAmount;
  const newTokenReserve = Math.ceil(invariant / newSolReserve);
  return Math.max(0, virtualTokens - newTokenReserve);
}

function drawCurve() {
  if (!curveCanvas) return;

  const { ctx, width, height } = resizeCanvas(curveCanvas);
  const pad = 42;
  const chartWidth = width - pad * 2;
  const chartHeight = height - pad * 2;
  const virtualSol = Number(vSol.value);
  const virtualSupply = Number(vTokens.value) * 1_000_000;
  const inputSol = Number(solIn.value);
  const output = quoteBuy(inputSol, virtualSol, virtualSupply);

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#0d100c";
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = "rgba(244, 247, 239, 0.12)";
  ctx.lineWidth = 1;
  for (let i = 0; i <= 6; i += 1) {
    const x = pad + (chartWidth / 6) * i;
    const y = pad + (chartHeight / 6) * i;
    ctx.beginPath();
    ctx.moveTo(x, pad);
    ctx.lineTo(x, height - pad);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(pad, y);
    ctx.lineTo(width - pad);
    ctx.stroke();
  }

  ctx.strokeStyle = "#57f287";
  ctx.lineWidth = 3;
  ctx.beginPath();
  for (let i = 0; i <= 120; i += 1) {
    const xSol = (inputSol * 1.35 * i) / 120;
    const yTokens = quoteBuy(xSol, virtualSol, virtualSupply);
    const x = pad + (xSol / (inputSol * 1.35 || 1)) * chartWidth;
    const y = height - pad - (yTokens / (virtualSupply * 0.78)) * chartHeight;

    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  ctx.stroke();

  const markerX = pad + (inputSol / (inputSol * 1.35 || 1)) * chartWidth;
  const markerY =
    height - pad - (output / (virtualSupply * 0.78)) * chartHeight;
  ctx.fillStyle = "#f7c948";
  ctx.beginPath();
  ctx.arc(markerX, markerY, 7, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(244, 247, 239, 0.74)";
  ctx.font = "700 13px Inter, system-ui, sans-serif";
  ctx.fillText("SOL in", pad, height - 16);
  ctx.save();
  ctx.translate(18, height - pad);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText("Tokens out", 0, 0);
  ctx.restore();

  solInOut.value = `${inputSol} SOL`;
  vSolOut.value = `${virtualSol} SOL`;
  vTokensOut.value = `${(Number(vTokens.value) / 1000).toFixed(3)}B`;
  tokensOut.textContent = formatTokenAmount(output);
}

function drawHero(time) {
  if (!heroCanvas) return;

  const { ctx, width, height } = resizeCanvas(heroCanvas);
  const t = time / 1000;

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#080908";
  ctx.fillRect(0, 0, width, height);

  const step = 46;
  ctx.strokeStyle = "rgba(244, 247, 239, 0.07)";
  ctx.lineWidth = 1;

  for (let x = -step; x < width + step; x += step) {
    const offset = (Math.sin(t + x * 0.01) + 1) * 4;
    ctx.beginPath();
    ctx.moveTo(x + offset, 0);
    ctx.lineTo(x - offset, height);
    ctx.stroke();
  }

  for (let y = 0; y < height + step; y += step) {
    ctx.beginPath();
    ctx.moveTo(0, y + Math.sin(t + y * 0.01) * 5);
    ctx.lineTo(width, y + Math.cos(t + y * 0.01) * 5);
    ctx.stroke();
  }

  ctx.lineWidth = 2;
  ctx.strokeStyle = "rgba(87, 242, 135, 0.42)";
  ctx.beginPath();
  for (let x = 0; x <= width; x += 10) {
    const progress = x / width;
    const y =
      height * 0.74 -
      Math.log1p(progress * 8) * 72 -
      Math.sin(progress * 12 + t) * 12;

    if (x === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  ctx.stroke();

  ctx.fillStyle = "rgba(247, 201, 72, 0.82)";
  for (let i = 0; i < 18; i += 1) {
    const x = ((i * 127 + t * 34) % (width + 120)) - 60;
    const y = height * 0.2 + ((i * 61) % Math.max(120, height * 0.56));
    ctx.fillRect(x, y, 3, 18);
  }

  requestAnimationFrame(drawHero);
}

[solIn, vSol, vTokens].forEach((control) => {
  control?.addEventListener("input", drawCurve);
});

copyProgram?.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(programId);
    copyProgram.textContent = "Copied";
    window.setTimeout(() => {
      copyProgram.textContent = "Copy devnet program";
    }, 1400);
  } catch {
    copyProgram.textContent = programId;
  }
});

window.addEventListener("resize", drawCurve);
drawCurve();
requestAnimationFrame(drawHero);
