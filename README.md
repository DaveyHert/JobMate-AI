# JobMate AI+ Chrome Extension

## 🚀 How React Apps Become Chrome Extensions (Beginner's Guide)

### The Magic Behind the Scenes

Ever wondered how a React app can run as a Chrome extension? Here's the complete breakdown:

## 📋 Table of Contents
1. [Core Concepts](#core-concepts)
2. [Architecture Overview](#architecture-overview)
3. [Step-by-Step Guide](#step-by-step-guide)
4. [Build Pipeline](#build-pipeline)
5. [Development Workflow](#development-workflow)
6. [Replicating with Any React App](#replicating-with-any-react-app)

## 🎯 Core Concepts

### What Makes a Chrome Extension?

A Chrome extension is essentially a **web app with special permissions** that can:
- Access browser APIs (tabs, storage, etc.)
- Inject scripts into web pages
- Run background processes
- Display UI in popups or sidebars

### Key Components:

1. **Manifest.json** - The "birth certificate" of your extension
2. **Background Script** - The "brain" that runs in the background
3. **Content Scripts** - Code that runs on web pages
4. **Popup/UI** - Your React app interface
5. **Web Accessible Resources** - Files that web pages can access

## 🏗️ Architecture Overview

```
JobMate AI+ Extension
├── manifest.json          # Extension configuration
├── popup.html             # Entry point for popup UI
├── dashboard.html          # Full dashboard page
├── background/
│   └── background.js       # Background service worker
├── content/
│   └── contentScript.js    # Injected into web pages
├── src/
│   ├── components/         # React components
│   ├── hooks/             # Custom React hooks
│   ├── utils/             # Utility functions
│   └── ...
└── dist/                  # Built extension files
```

## 📝 Step-by-Step Guide

### 1. Start with a Regular React App

```bash
npm create vite@latest my-extension -- --template react-ts
cd my-extension
npm install
```

### 2. Create the Manifest File

The `manifest.json` is the **most important file**. It tells Chrome:
- What your extension does
- What permissions it needs
- Which files to load

```json
{
  "manifest_version": 3,
  "name": "My React Extension",
  "version": "1.0.0",
  "description": "A React app as Chrome extension",
  
  "permissions": [
    "activeTab",
    "storage",
    "scripting"
  ],
  
  "action": {
    "default_popup": "popup.html"
  },
  
  "background": {
    "service_worker": "background/background.js"
  },
  
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["content/contentScript.js"]
    }
  ]
}
```

### 3. Create Multiple Entry Points

Unlike a regular React app with one entry point, extensions need multiple:

**popup.html** (Main UI):
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>My Extension</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/popup.tsx"></script>
</body>
</html>
```

**src/popup.tsx** (React Entry):
```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import Popup from './components/Popup';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Popup />
  </StrictMode>
);
```

### 4. Configure Vite for Multiple Builds

**vite.config.ts**:
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'popup.html'),
        background: resolve(__dirname, 'src/background/background.ts'),
        contentScript: resolve(__dirname, 'src/content/contentScript.ts'),
      },
      output: {
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === 'background') {
            return 'background/[name].js';
          }
          if (chunkInfo.name === 'contentScript') {
            return 'content/[name].js';
          }
          return '[name].js';
        },
      },
    },
  },
});
```

### 5. Create Background Script

**src/background/background.ts**:
```typescript
// This runs in the background and handles extension logic
chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed');
});

// Handle messages from content scripts and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Your background logic here
});
```

### 6. Create Content Script

**src/content/contentScript.ts**:
```typescript
// This runs on web pages and can interact with the DOM
console.log('Content script loaded');

// Listen for messages from popup/background
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'doSomething') {
    // Interact with the page
    const title = document.title;
    sendResponse({ title });
  }
});
```

## 🔧 Build Pipeline

### How Vite Transforms Your React App:

1. **Development Mode**:
   ```bash
   npm run dev
   ```
   - Runs normal React dev server
   - Hot reload works for components
   - Extension features won't work (need to build)

2. **Extension Build**:
   ```bash
   npm run build
   ```
   - Creates `dist/` folder with all extension files
   - Bundles React components into popup.js
   - Compiles TypeScript to JavaScript
   - Copies manifest.json and other assets

3. **Load in Chrome**:
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select your `dist/` folder

## 🔄 Development Workflow

### The Development Loop:

1. **Code your React components** normally
2. **Build the extension**: `npm run build`
3. **Reload extension** in Chrome (click refresh button)
4. **Test your changes**
5. **Repeat**

### Pro Tips:

- **Use React DevTools**: Works in popup when opened in new tab
- **Debug background script**: Go to `chrome://extensions/` → Details → Inspect views
- **Debug content script**: Use browser DevTools on any webpage
- **Hot reload**: Use `web-ext` for automatic reloading during development

## 🎯 Replicating with Any React App

### Quick Conversion Checklist:

1. ✅ **Add manifest.json** to your project root
2. ✅ **Create popup.html** entry point
3. ✅ **Update vite.config.ts** for multiple builds
4. ✅ **Add background script** (optional but recommended)
5. ✅ **Add content script** (if you need page interaction)
6. ✅ **Update package.json** build scripts
7. ✅ **Handle extension-specific APIs** (chrome.*)

### Example Package.json Scripts:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "build:extension": "npm run build && npm run copy:files",
    "copy:files": "cp manifest.json dist/ && cp -r icons dist/"
  }
}
```

### Common Gotchas:

- **CSP (Content Security Policy)**: Extensions have strict CSP, avoid inline scripts
- **File paths**: Use relative paths in manifest.json
- **Permissions**: Request only what you need in manifest.json
- **CORS**: Extensions can bypass CORS for declared hosts
- **Storage**: Use `chrome.storage` instead of localStorage for persistence

## 🚀 Advanced Features

### Communication Between Components:

```typescript
// Popup → Content Script
chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
  chrome.tabs.sendMessage(tabs[0].id, {action: 'getData'});
});

// Content Script → Background
chrome.runtime.sendMessage({action: 'saveData', data: someData});

// Background → Popup
chrome.runtime.sendMessage({action: 'updateUI', data: newData});
```

### Storage Management:

```typescript
// Save data
chrome.storage.local.set({key: 'value'});

// Load data
chrome.storage.local.get(['key'], (result) => {
  console.log(result.key);
});
```

## 🎉 You're Ready!

Now you understand how React apps become Chrome extensions! The key is:

1. **Multiple entry points** instead of one
2. **Special build configuration** for extension files
3. **Chrome APIs** for browser integration
4. **Proper file structure** following extension conventions

Happy building! 🚀

---

## 📚 Additional Resources

- [Chrome Extension Documentation](https://developer.chrome.com/docs/extensions/)
- [Manifest V3 Migration Guide](https://developer.chrome.com/docs/extensions/mv3/intro/)
- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)