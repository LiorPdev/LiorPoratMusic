const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const { ALL_SONGS } = require(path.join(rootDir, 'songsData.js'));
const contentDir = path.join(rootDir, 'content');

console.log(`Updating metadata for ${ALL_SONGS.length} songs...`);

let updatedCount = 0;

ALL_SONGS.forEach(song => {
  const slug = song.slug;
  if (!slug) return;

  const fileName = `${slug}.html`;
  const filePath = path.join(contentDir, fileName);

  if (!fs.existsSync(filePath)) {
    console.warn(`File not found: ${fileName}`);
    return;
  }

  const cleanTitle = song.name;
  const canonicalUrl = `https://liorporat.com/content/${slug}.html`;

  const ogTags = `  <!-- Canonical & Open Graph (Social Previews & WhatsApp) -->
  <link rel="canonical" href="${canonicalUrl}" />
  <meta property="og:type" content="music.song" />
  <meta property="og:title" content="${cleanTitle} - ליאור פורת" />
  <meta property="og:description" content="מילים ואקורדים לשיר ${cleanTitle} מאת ליאור פורת. האזנה וגלילה אוטומטית." />
  <meta property="og:url" content="${canonicalUrl}" />
  <meta property="og:image" content="https://liorporat.com/Media/main/og.jpg" />
  <meta property="og:image:secure_url" content="https://liorporat.com/Media/main/og.jpg" />
  <meta property="og:image:type" content="image/jpeg" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="${cleanTitle} - ליאור פורת" />
  <meta property="og:site_name" content="ליאור פורת" />
  <meta property="og:locale" content="he_IL" />

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${cleanTitle} - ליאור פורת" />
  <meta name="twitter:description" content="מילים ואקורדים לשיר ${cleanTitle} מאת ליאור פורת." />
  <meta name="twitter:image" content="https://liorporat.com/Media/main/og.jpg" />`;

  let html = fs.readFileSync(filePath, 'utf8');

  // Remove any previous tags/scripts
  html = html.replace(/<link rel="canonical"[^>]*>\s*/gi, '');
  html = html.replace(/<meta property="og:[^>]*>\s*/gi, '');
  html = html.replace(/<meta name="twitter:[^>]*>\s*/gi, '');
  html = html.replace(/<!-- Canonical & Open Graph[\s\S]*?<!-- Twitter Card -->\s*/gi, '');
  html = html.replace(/<!-- Instant Clean URL Masking -->\s*/gi, '');
  html = html.replace(/<script id="clean-url-mask">[\s\S]*?<\/script>\s*/gi, '');

  // Insert right after <meta name="description"...> or after <title>
  if (html.includes('<meta name="description"')) {
    html = html.replace(/(<meta name="description"[^>]*>)/i, `$1\n\n${ogTags}`);
  } else if (html.includes('</title>')) {
    html = html.replace(/(<\/title>)/i, `$1\n\n${ogTags}`);
  }

  // Ensure window.SONG contains name and slug
  if (html.includes('window.SONG = {')) {
    html = html.replace(/(\s*name:\s*['"][^'"]*['"],?)/g, '');
    html = html.replace(/(\s*slug:\s*['"][^'"]*['"],?)/g, '');
    html = html.replace(/(window\.SONG\s*=\s*\{)/, `$1\n        name: '${cleanTitle.replace(/'/g, "\\'")}',\n        slug: '${slug}',`);
  }

  fs.writeFileSync(filePath, html, 'utf8');
  updatedCount++;
});

console.log(`Updated metadata in ${updatedCount} song files.`);
