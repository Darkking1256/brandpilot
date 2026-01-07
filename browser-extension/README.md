# MarketPilot AI Browser Extension

A browser extension for quickly creating social media posts from any webpage.

## Installation

1. Open Chrome/Edge and navigate to `chrome://extensions/` (or `edge://extensions/` for Edge)
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `browser-extension` folder
5. The extension icon should appear in your toolbar

## Usage

1. Click the extension icon in your browser toolbar
2. The popup will automatically try to fill in content from:
   - Selected text on the page
   - Page title and URL (if no text is selected)
3. Select your platform
4. Click "Save Post" to save as a draft in MarketPilot AI

## Configuration

1. Click "Configure API URL" in the popup
2. Enter your MarketPilot AI API URL (e.g., `https://your-domain.com` or `http://localhost:3000` for local development)
3. The extension will remember your API URL

## Features

- Quick post creation from any webpage
- Automatic content extraction (selected text or page info)
- Support for all platforms (Twitter, LinkedIn, Facebook, Instagram, TikTok, YouTube)
- Saves posts as drafts in MarketPilot AI
- Opens dashboard after saving (optional)

## Development

To modify the extension:

1. Edit files in this directory
2. Go to `chrome://extensions/`
3. Click the refresh icon on the extension card
4. Test your changes

## Icons

You'll need to add icon files:
- `icon16.png` (16x16 pixels)
- `icon48.png` (48x48 pixels)
- `icon128.png` (128x128 pixels)

You can create these from your app logo or use placeholder images for development.

## Notes

- The extension requires the MarketPilot AI API to be running
- Posts are saved as drafts by default
- Make sure CORS is configured correctly on your API if using a different domain

