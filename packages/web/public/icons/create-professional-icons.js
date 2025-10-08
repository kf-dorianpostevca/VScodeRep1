// Professional PWA Icon Generator for Intelligent Todo
// Creates target-based icons with celebration theme and high-quality design
// Replaces placeholder icons with production-ready artwork

const fs = require('fs');
const { createCanvas } = require('canvas');

const sizes = [16, 32, 48, 72, 96, 128, 144, 152, 192, 256, 384, 512];
const brandColors = {
  primary: '#3b82f6',    // Blue
  secondary: '#10b981',  // Green
  accent: '#f59e0b',     // Amber for target center
  white: '#ffffff',
  background: '#f8fafc'
};

/**
 * Creates a professional target-based icon with celebration theme
 * @param {number} size - Icon size in pixels
 * @param {boolean} maskable - Whether to create maskable version (with safe area)
 * @returns {Buffer} PNG image buffer
 */
function createProfessionalIcon(size, maskable = false) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Calculate dimensions
  const center = size / 2;
  const safeArea = maskable ? 0.8 : 1; // 80% for maskable icons (20% safe area)
  const iconRadius = (size * safeArea) / 2;

  // Clear background for maskable icons
  if (maskable) {
    ctx.fillStyle = brandColors.background;
    ctx.fillRect(0, 0, size, size);
  }

  // Create circular background with gradient
  const backgroundGradient = ctx.createRadialGradient(
    center, center, 0,
    center, center, iconRadius
  );
  backgroundGradient.addColorStop(0, '#60a5fa'); // Lighter blue center
  backgroundGradient.addColorStop(1, brandColors.primary); // Primary blue edge

  ctx.fillStyle = backgroundGradient;
  ctx.beginPath();
  ctx.arc(center, center, iconRadius, 0, 2 * Math.PI);
  ctx.fill();

  // Add subtle shadow for depth
  ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
  ctx.shadowBlur = iconRadius * 0.05;
  ctx.shadowOffsetY = iconRadius * 0.02;

  // Draw target rings
  const targetSize = iconRadius * 0.7;
  const ringThickness = targetSize * 0.08;

  // Outer ring (white)
  ctx.fillStyle = brandColors.white;
  ctx.shadowColor = 'transparent'; // Remove shadow for rings
  ctx.beginPath();
  ctx.arc(center, center, targetSize, 0, 2 * Math.PI);
  ctx.fill();

  // Secondary ring (green)
  ctx.fillStyle = brandColors.secondary;
  ctx.beginPath();
  ctx.arc(center, center, targetSize * 0.75, 0, 2 * Math.PI);
  ctx.fill();

  // Inner ring (white)
  ctx.fillStyle = brandColors.white;
  ctx.beginPath();
  ctx.arc(center, center, targetSize * 0.5, 0, 2 * Math.PI);
  ctx.fill();

  // Center bullseye (accent color)
  ctx.fillStyle = brandColors.accent;
  ctx.beginPath();
  ctx.arc(center, center, targetSize * 0.25, 0, 2 * Math.PI);
  ctx.fill();

  // Add celebration sparkle effect for larger icons
  if (size >= 96) {
    drawSparkles(ctx, center, iconRadius, size);
  }

  // Add subtle border for definition
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.lineWidth = Math.max(1, size / 128);
  ctx.beginPath();
  ctx.arc(center, center, iconRadius - ctx.lineWidth/2, 0, 2 * Math.PI);
  ctx.stroke();

  return canvas.toBuffer('image/png');
}

/**
 * Draws celebratory sparkles around the target for larger icons
 */
function drawSparkles(ctx, centerX, centerY, iconRadius, size) {
  const sparkleCount = Math.min(8, Math.floor(size / 32));
  const sparkleRadius = iconRadius * 0.9;

  ctx.fillStyle = brandColors.white;
  ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
  ctx.shadowBlur = size / 64;

  for (let i = 0; i < sparkleCount; i++) {
    const angle = (i / sparkleCount) * 2 * Math.PI + Math.PI / 4; // Offset by 45 degrees
    const x = centerX + Math.cos(angle) * sparkleRadius;
    const y = centerY + Math.sin(angle) * sparkleRadius;
    const sparkleSize = Math.max(1, size / 64);

    // Draw four-pointed star sparkle
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);

    ctx.beginPath();
    ctx.moveTo(0, -sparkleSize);
    ctx.lineTo(sparkleSize * 0.3, 0);
    ctx.lineTo(0, sparkleSize);
    ctx.lineTo(-sparkleSize * 0.3, 0);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(-sparkleSize, 0);
    ctx.lineTo(0, sparkleSize * 0.3);
    ctx.lineTo(sparkleSize, 0);
    ctx.lineTo(0, -sparkleSize * 0.3);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  ctx.shadowColor = 'transparent';
}

/**
 * Creates favicon.ico file from the 32x32 icon
 */
function createFavicon() {
  // For simplicity, we'll create a PNG favicon
  // In production, you might want to use a proper ICO converter
  const iconBuffer = createProfessionalIcon(32);
  fs.writeFileSync('../favicon.ico', iconBuffer);
  console.log('Created favicon.ico (PNG format)');
}

// Generate all icon sizes
console.log('🎯 Creating professional Intelligent Todo icons...\n');

sizes.forEach(size => {
  // Regular icon
  const iconBuffer = createProfessionalIcon(size);
  fs.writeFileSync(`icon-${size}x${size}.png`, iconBuffer);
  console.log(`✅ Created icon-${size}x${size}.png`);

  // Maskable versions for specific sizes
  if (size === 192 || size === 512) {
    const maskableBuffer = createProfessionalIcon(size, true);
    fs.writeFileSync(`icon-${size}x${size}-maskable.png`, maskableBuffer);
    console.log(`✅ Created icon-${size}x${size}-maskable.png (maskable)`);
  }
});

// Create favicon
createFavicon();

console.log('\n🎉 All professional PWA icons created successfully!');
console.log('\nIcons created:');
console.log('• Target-based design with celebration theme');
console.log('• Brand colors: Blue (#3b82f6), Green (#10b981), Amber (#f59e0b)');
console.log('• Sparkle effects for larger icons');
console.log('• Maskable versions for Android adaptive icons');
console.log('• Production-ready quality with proper shadows and gradients');
console.log('\nNext steps:');
console.log('1. Update manifest.json to use maskable variants');
console.log('2. Test icons across different platforms');
console.log('3. Validate icon appearance on various backgrounds');