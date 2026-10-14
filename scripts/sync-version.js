const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const configPath = path.join(rootDir, 'version.json');
const version = JSON.parse(fs.readFileSync(configPath, 'utf8')).version;

function processDirectory(dir, isSongsDir = false) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stats = fs.statSync(filePath);

        if (stats.isDirectory() && (isSongsDir || file === 'songs' || file === 'show' || file === 'content' || file === 'ctrlfreaks' || file === 'playlists')) {
            processDirectory(filePath, true);
        } else if (file.endsWith('.html')) {
            let content = fs.readFileSync(filePath, 'utf8');
            let modified = false;

            // Regex for CSS and JS links with version params
            // Matches: href="file.css?v=..." OR src="file.js?v=..."
            const regex = /(href|src)=["']([^"']+\.(css|js))(\?v=[^"']*)?["']/g;

            content = content.replace(regex, (match, attr, fileUrl) => {
                // Ignore external URLs (starting with http or //)
                if (fileUrl.startsWith('http') || fileUrl.startsWith('//')) {
                    return match;
                }
                modified = true;
                return `${attr}="${fileUrl}?v=${version}"`;
            });

            if (modified) {
                console.log(`Updated ${path.relative(rootDir, filePath)} to v${version}`);
                fs.writeFileSync(filePath, content, 'utf8');
            }
        }
    });
}

console.log(`Starting sync to version ${version}...`);
processDirectory(rootDir);

// Also sync root sw.js cache version and asset query versions
const rootSwPath = path.join(rootDir, 'sw.js');
if (fs.existsSync(rootSwPath)) {
    let swContent = fs.readFileSync(rootSwPath, 'utf8');
    swContent = swContent.replace(/const CACHE_NAME = ['"]liorporat-show-v[^'"]*['"];/, `const CACHE_NAME = 'liorporat-show-v${version}';`);
    swContent = swContent.replace(/\?v=[0-9.]+/g, `?v=${version}`);
    fs.writeFileSync(rootSwPath, swContent, 'utf8');
    console.log(`Updated sw.js to v${version}`);
}

console.log('Sync complete!');
