# PWA Icons

This directory contains the Progressive Web App icons for Intelligent Todo.

## Icon Requirements

The following icon sizes are provided for comprehensive PWA support:
- 16x16, 32x32, 48x48 - Browser favorites and tabs
- 72x72, 96x96, 128x128 - Android home screen
- 144x144, 152x152 - Windows tiles and iOS
- 192x192, 256x256 - Android Chrome
- 384x384, 512x512 - High-resolution displays and splash screens

## Design Guidelines

### Brand Colors
- Primary: #3b82f6 (Blue)
- Secondary: #10b981 (Green)
- Background: #f8fafc (Light gray)

### Icon Design
- Target emoji: 🎯 representing goal achievement
- Clean, minimal design with high contrast
- Celebration-focused aesthetic matching app theme
- Professional appearance suitable for business use

## Production Notes

Current icons are placeholder implementations. For production deployment:

1. Replace with professionally designed icons created by a graphic designer
2. Ensure all sizes maintain visual consistency
3. Test icon appearance across different platforms and backgrounds
4. Validate icon readability at smallest sizes (16x16)
5. Consider platform-specific design guidelines (iOS, Android, Windows)

## Generating Icons

To create placeholder icons (requires Node.js and canvas library):
```bash
npm install canvas
node create-icons.js
```

Note: The canvas library may require additional system dependencies on some platforms.