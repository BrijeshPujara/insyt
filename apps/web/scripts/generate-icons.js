/**
 * Generates PWA icons for INSYT.
 * Design: teal gradient rounded square with white "I." text — matches app/icon.tsx
 *
 * Usage: node scripts/generate-icons.js
 * Output: public/icons/icon-192.png, public/icons/icon-512.png
 */

const { createCanvas } = require("canvas");
const fs = require("fs");
const path = require("path");

const ICONS_DIR = path.join(__dirname, "../public/icons");

if (!fs.existsSync(ICONS_DIR)) {
  fs.mkdirSync(ICONS_DIR, { recursive: true });
}

function drawIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext("2d");

  const radius = size * 0.22; // rounded corner radius ~22% of size

  // ── Rounded rect clip ──────────────────────────────────────────────────
  ctx.beginPath();
  ctx.moveTo(radius, 0);
  ctx.lineTo(size - radius, 0);
  ctx.quadraticCurveTo(size, 0, size, radius);
  ctx.lineTo(size, size - radius);
  ctx.quadraticCurveTo(size, size, size - radius, size);
  ctx.lineTo(radius, size);
  ctx.quadraticCurveTo(0, size, 0, size - radius);
  ctx.lineTo(0, radius);
  ctx.quadraticCurveTo(0, 0, radius, 0);
  ctx.closePath();
  ctx.clip();

  // ── Teal gradient background ───────────────────────────────────────────
  const grad = ctx.createLinearGradient(0, 0, size, size);
  grad.addColorStop(0, "#006874"); // primary teal
  grad.addColorStop(1, "#004f5a"); // deeper teal
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  // ── Subtle inner glow ──────────────────────────────────────────────────
  const glow = ctx.createRadialGradient(
    size * 0.35,
    size * 0.3,
    0,
    size * 0.35,
    size * 0.3,
    size * 0.6,
  );
  glow.addColorStop(0, "rgba(0, 200, 210, 0.25)");
  glow.addColorStop(1, "rgba(0, 200, 210, 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, size, size);

  // ── "I." text ──────────────────────────────────────────────────────────
  const fontSize = Math.round(size * 0.44);
  ctx.font = `900 ${fontSize}px sans-serif`;
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  // Slight upward nudge so the period sits visually centred
  ctx.fillText("I.", size / 2, size * 0.51);

  return canvas.toBuffer("image/png");
}

for (const size of [192, 512]) {
  const buf = drawIcon(size);
  const outPath = path.join(ICONS_DIR, `icon-${size}.png`);
  fs.writeFileSync(outPath, buf);
  console.log(`✓ public/icons/icon-${size}.png (${size}×${size})`);
}

console.log("Icons generated.");
