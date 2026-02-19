const fs = require('fs');
const path = require('path');

const songsDir = path.join(__dirname, 'songs');
const files = fs.readdirSync(songsDir).filter(f => f.endsWith('.html'));
const version = '1.0.1';

files.forEach(file => {
    const filePath = path.join(songsDir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    console.log(`Updating cache busting for ${file}...`);

    // CSS
    content = content.replace('href="../styles.css"', `href="../styles.css?v=${version}"`);
    content = content.replace('href="../song.css"', `href="../song.css?v=${version}"`);

    // JS
    content = content.replace('src="../songPage.js"', `src="../songPage.js?v=${version}"`);
    content = content.replace('src="../script.js"', `src="../script.js?v=${version}"`);

    fs.writeFileSync(filePath, content, 'utf8');
});
