# Kraken Icon Setup Instructions

## Adding the Kraken Icon

The app is configured to use `/kraken-icon.png` as the favicon and app icon. You need to add your octopus image to the `public` folder.

### Steps:

1. Save your octopus image (the one with the octopus embracing a sailing ship) as `kraken-icon.png` in the `public` folder
2. The image should be:
   - At least 512x512 pixels for best quality
   - PNG format
   - Square aspect ratio
   - Optimized for web (compressed but high quality)

### Current Configuration:

The following files are already configured to use `kraken-icon.png`:
- `index.html` - Favicon and Apple touch icon
- `public/manifest.json` - PWA icon
- `src/App.tsx` - Header logo

Once you add the image file, it will automatically be used throughout the app.

