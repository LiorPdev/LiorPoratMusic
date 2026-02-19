const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, 'version.json');
const version = JSON.parse(fs.readFileSync(configPath, 'utf8')).version;

function processDirectory(dir, isSongsDir = false) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stats = fs.statSync(filePath);

        if (stats.isDirectory() && file === 'songs') {
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
                console.log(`Updated ${path.relative(__dirname, filePath)} to v${version}`);
                fs.writeFileSync(filePath, content, 'utf8');
            }
        }
    });
}

console.log(`Starting sync to version ${version}...`);
processDirectory(__dirname);
console.log('Sync complete!');
