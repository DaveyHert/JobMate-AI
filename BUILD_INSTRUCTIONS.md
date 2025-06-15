# 🚀 JobMate AI+ Extension - Build Instructions

## Quick Start (For Downloaded Source)

If you downloaded the source code, follow these steps:

### 1. Install Dependencies
```bash
npm install
```

### 2. Build the Extension
```bash
npm run build:extension
```

### 3. Load in Chrome
1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `dist/` folder that was created

## Development Workflow

### For Active Development:
```bash
# Start development server (for testing components)
npm run dev

# Build extension for testing
npm run build:extension

# Clean build (removes old dist folder first)
npm run build:clean
```

### File Structure After Build:
```
dist/
├── manifest.json
├── popup.html
├── dashboard.html
├── popup.js
├── dashboard.js
├── background/
│   └── background.js
├── content/
│   └── contentScript.js
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── assets/
    └── [CSS and other assets]
```

## Troubleshooting

### "vite: command not found"
- Run `npm install` first to install all dependencies
- Make sure you're in the project root directory

### "Permission denied" errors
- On macOS/Linux, you might need to run: `chmod +x node_modules/.bin/vite`

### Extension not loading
- Make sure you built the extension first: `npm run build:extension`
- Check that the `dist/` folder exists and contains all files
- Try refreshing the extension in Chrome after making changes

### Content script errors
- The content script needs to be injected into web pages
- Some pages (like chrome:// URLs) cannot be accessed by extensions
- Check the browser console for detailed error messages

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:extension` - Build extension and copy files
- `npm run build:clean` - Clean build (removes old files first)
- `npm run lint` - Run ESLint
- `npm run preview` - Preview built app

## Extension Features

- ✅ Auto-fill job application forms
- ✅ Track job applications
- ✅ AI-powered cover letter generation
- ✅ Job fit analysis
- ✅ Resume tailoring suggestions
- ✅ Interview answer generation

## Need Help?

1. Make sure all dependencies are installed: `npm install`
2. Try a clean build: `npm run build:clean`
3. Check the browser console for errors
4. Ensure you're loading the `dist/` folder in Chrome, not the source folder