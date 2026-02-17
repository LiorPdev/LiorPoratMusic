const fs = require('fs');
const path = require('path');

const songsDir = path.join(__dirname, 'songs');

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if chords script already exists
    if (content.includes('id="chords"')) {
        console.log(`Skipping ${path.basename(filePath)} - chords script already exists.`);
        return;
    }

    // Find the lyrics script tag
    const lyricsMatch = content.match(/<script type="text\/plain" id="lyrics">([\s\S]*?)<\/script>/);
    if (!lyricsMatch) {
        console.log(`Skipping ${path.basename(filePath)} - lyrics script not found.`);
        return;
    }

    const lyricsTag = lyricsMatch[0];
    const chordsTag = lyricsTag.replace('id="lyrics"', 'id="chords"');

    // Insert chords tag after lyrics tag
    const newContent = content.replace(lyricsTag, `${lyricsTag}\n\n    ${chordsTag}`);
    
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`Processed ${path.basename(filePath)}`);
}

function run() {
    if (!fs.existsSync(songsDir)) {
        console.error('Songs directory not found at:', songsDir);
        return;
    }

    const files = fs.readdirSync(songsDir).filter(file => file.endsWith('.html'));
    console.log(`Found ${files.length} HTML files.`);

    files.forEach(file => {
        processFile(path.join(songsDir, file));
    });

    console.log('Finished processing all files.');
}

run();
