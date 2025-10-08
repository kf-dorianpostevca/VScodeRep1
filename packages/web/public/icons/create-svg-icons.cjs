// Professional PWA Icon Generator using SVG and Sharp
// Creates target-based icons with celebration theme
// Windows-compatible alternative to canvas-based generation

const fs = require('fs');
const sharp = require('sharp');

const sizes = [16, 32, 48, 72, 96, 128, 144, 152, 192, 256, 384, 512];
const brandColors = {
  primary: '#3b82f6',    // Blue
  secondary: '#10b981',  // Green
  accent: '#f59e0b',     // Amber for target center
  white: '#ffffff',
  background: '#f8fafc'
};

/**
 * Creates professional target-based SVG icon
 * @param {number} size - Icon size in pixels
 * @param {boolean} maskable - Whether to create maskable version (with safe area)
 * @returns {string} SVG markup
 */
function createTargetSVG(size, maskable = false) {
  const center = size / 2;
  const safeArea = maskable ? 0.8 : 1; // 80% for maskable icons
  const iconRadius = (size * safeArea) / 2;

  // Calculate target dimensions
  const targetRadius = iconRadius * 0.7;

  // Create sparkles for larger icons
  const sparkles = size >= 96 ? createSparkles(center, iconRadius * 0.9, size) : '';

  const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <!-- Background gradient -->
        <radialGradient id="bgGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" style="stop-color:#60a5fa;stop-opacity:1" />
          <stop offset="100%" style="stop-color:${brandColors.primary};stop-opacity:1" />
        </radialGradient>

        <!-- Shadow filter -->
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="${iconRadius * 0.02}" stdDeviation="${iconRadius * 0.02}"
                       flood-color="rgba(0,0,0,0.2)" flood-opacity="1"/>
        </filter>

        <!-- Sparkle glow -->
        <filter id="sparkleGlow">
          <feGaussianBlur stdDeviation="${size / 64}" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      ${maskable ? `<rect width="${size}" height="${size}" fill="${brandColors.background}"/>` : ''}

      <!-- Main background circle -->
      <circle cx="${center}" cy="${center}" r="${iconRadius}"
              fill="url(#bgGrad)" filter="url(#shadow)"/>

      <!-- Target rings -->
      <!-- Outer ring (white) -->
      <circle cx="${center}" cy="${center}" r="${targetRadius}" fill="${brandColors.white}"/>

      <!-- Second ring (green) -->
      <circle cx="${center}" cy="${center}" r="${targetRadius * 0.75}" fill="${brandColors.secondary}"/>

      <!-- Inner ring (white) -->
      <circle cx="${center}" cy="${center}" r="${targetRadius * 0.5}" fill="${brandColors.white}"/>

      <!-- Center bullseye (accent) -->
      <circle cx="${center}" cy="${center}" r="${targetRadius * 0.25}" fill="${brandColors.accent}"/>

      ${sparkles}

      <!-- Subtle border -->
      <circle cx="${center}" cy="${center}" r="${iconRadius - 1}"
              fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="${Math.max(1, size / 128)}"/>
    </svg>`;

  return svg.trim();
}

/**
 * Creates sparkle decorations for celebration theme
 */
function createSparkles(centerX, centerY, sparkleRadius, size) {
  const sparkleCount = Math.min(8, Math.floor(size / 32));
  const sparkleSize = Math.max(2, size / 64);

  let sparkles = '';

  for (let i = 0; i < sparkleCount; i++) {
    const angle = (i / sparkleCount) * 2 * Math.PI + Math.PI / 4; // Offset by 45 degrees
    const x = centerX + Math.cos(angle) * sparkleRadius;
    const y = centerY + Math.sin(angle) * sparkleRadius;

    // Four-pointed star sparkle
    sparkles += `
      <g transform="translate(${x},${y}) rotate(${angle * 180 / Math.PI})" filter="url(#sparkleGlow)">
        <polygon points="0,-${sparkleSize} ${sparkleSize * 0.3},0 0,${sparkleSize} -${sparkleSize * 0.3},0"
                 fill="${brandColors.white}"/>
        <polygon points="-${sparkleSize},0 0,${sparkleSize * 0.3} ${sparkleSize},0 0,-${sparkleSize * 0.3}"
                 fill="${brandColors.white}"/>
      </g>`;
  }

  return sparkles;
}

/**
 * Converts SVG to PNG using Sharp
 */
async function svgToPng(svgString, size, outputPath) {
  try {
    await sharp(Buffer.from(svgString))
      .resize(size, size)
      .png()
      .toFile(outputPath);
    return true;
  } catch (error) {
    console.error(`Error creating ${outputPath}:`, error.message);
    return false;
  }
}

/**
 * Creates favicon from 32x32 icon
 */
async function createFavicon() {
  const svg = createTargetSVG(32);
  const success = await svgToPng(svg, 32, '../favicon.ico');
  if (success) {
    console.log('✅ Created favicon.ico');
  }
}

/**
 * Main generation function
 */
async function generateAllIcons() {
  console.log('🎯 Creating professional Intelligent Todo icons...\n');

  let successCount = 0;
  const totalIcons = sizes.length + 2; // +2 for maskable versions

  // Generate all standard sizes
  for (const size of sizes) {
    const svg = createTargetSVG(size);
    const success = await svgToPng(svg, size, `icon-${size}x${size}.png`);

    if (success) {
      console.log(`✅ Created icon-${size}x${size}.png`);
      successCount++;
    }

    // Create maskable versions for specific sizes
    if (size === 192 || size === 512) {
      const maskableSvg = createTargetSVG(size, true);
      const maskableSuccess = await svgToPng(maskableSvg, size, `icon-${size}x${size}-maskable.png`);

      if (maskableSuccess) {
        console.log(`✅ Created icon-${size}x${size}-maskable.png (maskable)`);
        successCount++;
      }
    }
  }

  // Create favicon
  await createFavicon();
  successCount++;

  console.log(`\n🎉 Successfully created ${successCount}/${totalIcons + 1} icons!`);
  console.log('\nIcon features:');
  console.log('• Professional target-based design with celebration theme');
  console.log('• Brand colors: Blue (#3b82f6), Green (#10b981), Amber (#f59e0b)');
  console.log('• Sparkle effects for larger icons (96px+)');
  console.log('• Maskable versions for Android adaptive icons');
  console.log('• SVG-based generation for crisp, scalable graphics');
  console.log('• Proper gradients, shadows, and professional finish');
  console.log('\nNext steps:');
  console.log('1. Update manifest.json to use maskable variants');
  console.log('2. Test icons across different platforms');
  console.log('3. Validate appearance on various backgrounds');
}

// Run the generator
generateAllIcons().catch(console.error);