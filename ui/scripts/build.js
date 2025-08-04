const fs = require('fs').promises;
const path = require('path');
const { minify } = require('html-minifier');
const { minify: minifyJS } = require('terser');

async function copyFile(src, dest) {
  try {
    await fs.mkdir(path.dirname(dest), { recursive: true });
    await fs.copyFile(src, dest);
    console.log(`Copied: ${src} -> ${dest}`);
  } catch (error) {
    console.error(`Error copying ${src}:`, error.message);
  }
}

async function minifyHTML(src, dest) {
  try {
    const html = await fs.readFile(src, 'utf8');
    const minified = minify(html, {
      removeComments: true,
      removeRedundantAttributes: true,
      removeScriptTypeAttributes: true,
      removeTagWhitespace: true,
      useShortDoctype: true,
      collapseWhitespace: true,
      minifyCSS: true,
      minifyJS: true
    });
    
    await fs.mkdir(path.dirname(dest), { recursive: true });
    await fs.writeFile(dest, minified);
    console.log(`Minified HTML: ${src} -> ${dest}`);
  } catch (error) {
    console.error(`Error minifying ${src}:`, error.message);
  }
}

async function minifyJavaScript(src, dest) {
  try {
    const js = await fs.readFile(src, 'utf8');
    const result = await minifyJS(js, {
      compress: {
        drop_console: false, // Keep console logs for debugging
        drop_debugger: true
      },
      mangle: true
    });
    
    await fs.mkdir(path.dirname(dest), { recursive: true });
    await fs.writeFile(dest, result.code);
    console.log(`Minified JS: ${src} -> ${dest}`);
  } catch (error) {
    console.error(`Error minifying ${src}:`, error.message);
  }
}

async function walkDirectory(dir, callback) {
  const files = await fs.readdir(dir, { withFileTypes: true });
  
  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    
    if (file.isDirectory()) {
      await walkDirectory(fullPath, callback);
    } else {
      await callback(fullPath);
    }
  }
}

async function build() {
  console.log('🚀 Starting build process...');
  
  try {
    // Clean dist directory
    await fs.rm('dist', { recursive: true, force: true });
    await fs.mkdir('dist', { recursive: true });
    
    // Build standalone pages and their assets
    await walkDirectory('src', async (filePath) => {
      const relativePath = path.relative('src', filePath);
      const destPath = path.join('dist', relativePath);
      const ext = path.extname(filePath).toLowerCase();
      
      console.log(`Processing: ${relativePath}`);
      
      if (ext === '.html') {
        await minifyHTML(filePath, destPath);
      } else if (ext === '.js') {
        await minifyJavaScript(filePath, destPath);
      } else if (ext === '.css') {
        // Copy CSS files as-is (already minified by Tailwind)
        await copyFile(filePath, destPath);
      } else {
        // Copy other files as-is
        await copyFile(filePath, destPath);
      }
    });

    console.log('✅ Build completed successfully!');
    console.log('📁 Built files structure:');
    console.log('   dist/');
    console.log('   ├── index.html              # Landing page');
    console.log('   ├── login/index.html         # Login page');
    console.log('   ├── category/index.html      # Category management');
    console.log('   ├── topic/index.html         # Topic management');
    console.log('   ├── bookmark/index.html      # Bookmark management');
    console.log('   └── static/                  # Assets (JS, CSS)');
    console.log('');
    console.log('🌐 Server routing configuration:');
    console.log('   /-/ln/         -> dist/index.html');
    console.log('   /-/ln/login    -> dist/login/index.html');
    console.log('   /-/ln/category -> dist/category/index.html');
    console.log('   /-/ln/topic    -> dist/topic/index.html');
    console.log('   /-/ln/bookmark -> dist/bookmark/index.html');
    console.log('   /-/ln/static/* -> dist/static/*');
    
  } catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
  }
}

build();