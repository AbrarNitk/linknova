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
        drop_console: true,
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
    
    // Process components folder - copy contents directly to dist root
    const componentsDir = 'src/components';
    try {
      await walkDirectory(componentsDir, async (filePath) => {
        const relativePath = path.relative(componentsDir, filePath);
        const destPath = path.join('dist', relativePath);
        const ext = path.extname(filePath).toLowerCase();
        
        if (ext === '.html') {
          await minifyHTML(filePath, destPath);
        } else {
          await copyFile(filePath, destPath);
        }
      });
    } catch (error) {
      console.log('Components directory not found, skipping...');
    }
    
    // Process other files in src (excluding components)
    await walkDirectory('src', async (filePath) => {
      const relativePath = path.relative('src', filePath);
      
      // Skip components folder as we've already processed it
      if (relativePath.startsWith('components/') || relativePath === 'components') {
        return;
      }
      
      const destPath = path.join('dist', relativePath);
      const ext = path.extname(filePath).toLowerCase();
      
      if (ext === '.html') {
        await minifyHTML(filePath, destPath);
      } else if (ext === '.js') {
        await minifyJavaScript(filePath, destPath);
      } else {
        await copyFile(filePath, destPath);
      }
    });
    
    console.log('✅ Build completed successfully!');
    
  } catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
  }
}

build();