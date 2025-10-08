// Simple icon generator script for PWA
// Creates placeholder icons with the target emoji and blue background
// In production, these would be replaced with professionally designed icons

const fs = require('fs');
const { createCanvas } = require('canvas');

const sizes = [16, 32, 48, 72, 96, 128, 144, 152, 192, 256, 384, 512];
const emoji = '🎯';
const bgColor = '#3b82f6';
const emojiSize = 0.6; // 60% of icon size

function createIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, size, size);

  // Add subtle gradient
  const gradient = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
  gradient.addColorStop(0, '#60a5fa');
  gradient.addColorStop(1, '#3b82f6');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  // Emoji (simplified as text for now)
  ctx.fillStyle = '#ffffff';
  ctx.font = `${size * emojiSize}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(emoji, size/2, size/2);

  return canvas.toBuffer('image/png');
}

// Generate all icon sizes
sizes.forEach(size => {
  const iconBuffer = createIcon(size);
  fs.writeFileSync(`icon-${size}x${size}.png`, iconBuffer);
  console.log(`Created icon-${size}x${size}.png`);
});

console.log('All PWA icons created successfully!');
console.log('Note: These are placeholder icons. In production, use professionally designed icons.');