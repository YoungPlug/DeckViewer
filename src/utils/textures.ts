import * as THREE from "three";

function makeCanvas(size: number): {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
} {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  return { canvas, ctx };
}

function toTexture(canvas: HTMLCanvasElement): THREE.CanvasTexture {
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  tex.needsUpdate = true;
  return tex;
}

/** Black griptape with fine grain noise + a faint stamped wordmark. */
export function buildGriptapeTexture(): THREE.CanvasTexture {
  const size = 1024;
  const { canvas, ctx } = makeCanvas(size);

  ctx.fillStyle = "#0b0b0c";
  ctx.fillRect(0, 0, size, size);

  const grains = 42000;
  for (let i = 0; i < grains; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const shade = 8 + Math.random() * 26;
    ctx.fillStyle = `rgb(${shade + 6},${shade + 4},${shade})`;
    ctx.fillRect(x, y, 1, 1);
  }

  // faint vignette so edges read slightly darker
  const grad = ctx.createRadialGradient(
    size / 2,
    size / 2,
    size * 0.2,
    size / 2,
    size / 2,
    size * 0.72
  );
  grad.addColorStop(0, "rgba(0,0,0,0)");
  grad.addColorStop(1, "rgba(0,0,0,0.55)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  // stamped wordmark, centered, subtle
  ctx.save();
  ctx.translate(size / 2, size / 2);
  ctx.globalAlpha = 0.14;
  ctx.fillStyle = "#f5c518";
  ctx.font = "700 42px 'IBM Plex Mono', monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.letterSpacing = "10px";
  ctx.fillText("LOW CLEARANCE", 0, 0);
  ctx.restore();

  return toTexture(canvas);
}

/** Hazard-yellow burst graphic with stencil wordmark for the underside. */
export function buildBottomGraphicTexture(): THREE.CanvasTexture {
  const size = 1024;
  const { canvas, ctx } = makeCanvas(size);

  ctx.fillStyle = "#0b0b0c";
  ctx.fillRect(0, 0, size, size);

  const cx = size / 2;
  const cy = size / 2;

  // radiating hazard stripes (like a burst / warning beacon)
  const stripes = 28;
  for (let i = 0; i < stripes; i++) {
    const a0 = (i / stripes) * Math.PI * 2;
    const a1 = a0 + (Math.PI * 2) / stripes / 1.9;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, size * 0.75, a0, a1);
    ctx.closePath();
    ctx.fillStyle = i % 2 === 0 ? "#f5c518" : "#0b0b0c";
    ctx.fill();
  }

  // concentric rings to tame the burst near the center
  for (let r = size * 0.34; r > 0; r -= size * 0.055) {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = (r / (size * 0.055)) % 2 < 1 ? "#0b0b0c" : "#f5c518";
    ctx.fill();
  }

  // crop the burst into a soft circle so it doesn't fight the deck outline
  const mask = ctx.createRadialGradient(
    cx,
    cy,
    size * 0.4,
    cx,
    cy,
    size * 0.5
  );
  mask.addColorStop(0, "rgba(11,11,12,0)");
  mask.addColorStop(1, "rgba(11,11,12,1)");
  ctx.fillStyle = mask;
  ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = "#0b0b0c";
  ctx.fillRect(0, 0, size, size * 0.02);
  ctx.fillRect(0, size * 0.98, size, size * 0.02);
  ctx.fillRect(0, 0, size * 0.02, size);
  ctx.fillRect(size * 0.98, 0, size * 0.02, size);

  // center emblem
  ctx.save();
  ctx.translate(cx, cy);
  ctx.fillStyle = "#0b0b0c";
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.16, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#f5c518";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.16, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = "#edeae2";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "700 30px 'Anton', sans-serif";
  ctx.fillText("CAUTION", 0, -6);
  ctx.font = "400 16px 'IBM Plex Mono', monospace";
  ctx.fillStyle = "#f5c518";
  ctx.fillText("SERIES 004", 0, 22);
  ctx.restore();

  // top/bottom stencil wordmark bands
  ctx.save();
  ctx.fillStyle = "#edeae2";
  ctx.textAlign = "center";
  ctx.font = "700 64px 'Anton', sans-serif";
  ctx.translate(cx, size * 0.145);
  ctx.fillText("LOW CLEARANCE", 0, 0);
  ctx.restore();

  return toTexture(canvas);
}

/** Maple wood-grain texture used on the deck body / edges. */
export function buildWoodTexture(): THREE.CanvasTexture {
  const size = 512;
  const { canvas, ctx } = makeCanvas(size);

  const base = ctx.createLinearGradient(0, 0, size, 0);
  base.addColorStop(0, "#e7cf9e");
  base.addColorStop(0.5, "#dcbd88");
  base.addColorStop(1, "#e3c795");
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, size, size);

  ctx.globalAlpha = 0.35;
  for (let i = 0; i < 60; i++) {
    const y = Math.random() * size;
    ctx.strokeStyle = `rgba(120,84,42,${0.05 + Math.random() * 0.12})`;
    ctx.lineWidth = 0.6 + Math.random() * 1.6;
    ctx.beginPath();
    ctx.moveTo(0, y);
    for (let x = 0; x <= size; x += 32) {
      ctx.lineTo(x, y + Math.sin(x * 0.02 + i) * 6 + (Math.random() - 0.5) * 4);
    }
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  const tex = toTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(1, 3);
  return tex;
}
