const fs = require('fs');
const path = require('path');

// Copy public folder to standalone output
const publicDir = path.join(process.cwd(), 'public');
const standalonePublicDir = path.join(process.cwd(), '.next', 'standalone', 'public');

if (fs.existsSync(publicDir)) {
  if (!fs.existsSync(standalonePublicDir)) {
    fs.mkdirSync(standalonePublicDir, { recursive: true });
  }
  
  // Copy all files from public to standalone/public
  const copyRecursiveSync = (src, dest) => {
    const exists = fs.existsSync(src);
    const stats = exists && fs.statSync(src);
    const isDirectory = exists && stats.isDirectory();
    
    if (isDirectory) {
      if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
      }
      fs.readdirSync(src).forEach((childItemName) => {
        copyRecursiveSync(
          path.join(src, childItemName),
          path.join(dest, childItemName)
        );
      });
    } else {
      fs.copyFileSync(src, dest);
    }
  };
  
  copyRecursiveSync(publicDir, standalonePublicDir);
  console.log('✅ Copied public folder to standalone output');
}

// Create symlink for .next/static in standalone
const staticDir = path.join(process.cwd(), '.next', 'static');
const standaloneStaticLink = path.join(process.cwd(), '.next', 'standalone', '.next', 'static');

if (fs.existsSync(staticDir)) {
  const standaloneNextDir = path.join(process.cwd(), '.next', 'standalone', '.next');
  if (!fs.existsSync(standaloneNextDir)) {
    fs.mkdirSync(standaloneNextDir, { recursive: true });
  }
  
  // Remove existing link if it exists
  if (fs.existsSync(standaloneStaticLink)) {
    fs.unlinkSync(standaloneStaticLink);
  }
  
  // Create symlink (relative path)
  const relativeStaticPath = path.relative(
    path.dirname(standaloneStaticLink),
    staticDir
  );
  fs.symlinkSync(relativeStaticPath, standaloneStaticLink, 'dir');
  console.log('✅ Created symlink for .next/static');
}

console.log('✅ Post-build setup complete');
