const PLAYLISTS = [
  {
    name: "Drive",
    url: "https://open.spotify.com/playlist/6VOJdiNq1lGprqQLfOm7pl",
    image: "../Media/playlists/drive.webp",
    description: "פלייליסט לאוטו/לחג/כל מצב רוח",
  },
  {
    name: "Quiet",
    url: "https://open.spotify.com/playlist/2pItlRIEcNpVrdrNPvTJiU",
    image: "../Media/playlists/quiet.webp",
    description: "ישראלי שקט ברקע",
  },
  {
    name: "Radio - Heb",
    url: "https://open.spotify.com/playlist/5T7r6CHJZd5ifrkjbhKHJR",
    image: "../Media/playlists/Radio IL Playlist.webp",
    description: "מה שמושמע עכשיו ברדיו | ישראלי",
  },
  {
    name: "Indie",
    url: "https://open.spotify.com/playlist/0qYgjCnqOmG1WyJ3nZf841",
    image: "../Media/playlists/Indie.webp",
    description: "פולק/אינדי ישראלי רגוע",
  },
  {
    name: "Blues",
    url: "https://open.spotify.com/playlist/65wTGctt19zF9RWcopD5uq",
    image: "../Media/playlists/blues.webp",
    description: "בלוז ישראלי לנשמה",
  },
  {
    name: "Rock",
    url: "https://open.spotify.com/playlist/36YoT388ljvJSssrC0LUMK",
    image: "../Media/playlists/rock.webp",
    description: "לאוהבי רוק ישראלי קצבי",
  },
  {
    name: "Funky",
    url: "https://open.spotify.com/playlist/79qphBQwrMcGO0j91QioBb",
    image: "../Media/playlists/groove.webp",
    description: "קצב טוב, פאנקי/גרוב שמח ומקפיץ",
  },
  {
    name: "Words",
    url: "https://open.spotify.com/playlist/4tf2K4dTwv7fHRttgGhjgq",
    image: "../Media/playlists/words.webp",
    description: "המילים עושות את השיר",
  },
  {
    name: "Radio - Heb/Eng",
    url: "https://open.spotify.com/playlist/7EMf0tuEIQHBPj3ol56LyV",
    image: "../Media/playlists/Radio All Playlist.webp",
    description: "מה שמושמע עכשיו ברדיו | ישראלי/לועזי",
  },
];

const toId = (url) =>
  (url.match(/playlist\/([a-zA-Z0-9]+)/) || [, ""])[1];

function openInApp(playlistUrl) {
  if (typeof fbq === 'function') {  // פייסבוק פיקסל
    fbq('track', 'Contact', { content_name: playlistUrl });
  }

  const id = toId(playlistUrl);
  const web = playlistUrl;
  const uri = `spotify:playlist:${id}`;
  const ua = navigator.userAgent || "";
  const isIOS = /iPhone|iPad|iPod/i.test(ua);
  const isAndroid = /Android/i.test(ua);

  if (isIOS) {
    // iOS: נסה לפתוח את האפליקציה דרך spotify: URI
    // אם האפליקציה לא מותקנת, fallback ל-HTTPS אחרי 1.2 שניות
    const t = Date.now();
    location.href = uri;
    setTimeout(() => {
      if (Date.now() - t < 1500) location.href = web;
    }, 1200);
    return;
  }

  if (isAndroid) {
    // אנדרואיד: שימוש ב-Android Intent של כרום לפתיחת אפליקציית ספוטיפיי ישירות,
    // עם fallback מובנה לאתר אם האפליקציה לא מותקנת
    const intentUrl = `intent://open.spotify.com/playlist/${id}#Intent;scheme=https;package=com.spotify.music;S.browser_fallback_url=${encodeURIComponent(web)};end`;
    location.href = intentUrl;
    return;
  }

  // מחשב: קישור HTTPS ישיר
  location.href = web;
}

function cardTemplate({ name, url, thumbnail, description }) {
  const id = toId(url);
  const img = thumbnail || "";
  return `
    <article class="card" data-id="${id}" data-open-app="${url}">
      ${description ? `<div class="description">${description}</div>` : ""}
      <div class="thumb">
        ${img
      ? `<img class="img" alt="${name}" src="${img}" loading="lazy" width="512" height="512">`
      : `<div class="skeleton" aria-hidden="true"></div>`
    }
        <span class="btn">האזנה בספוטיפיי</span>
      </div>
    </article>
  `;
}

async function fetchThumb(url) {
  try {
    const res = await fetch(
      `https://open.spotify.com/oembed?url=${encodeURIComponent(url)}`
    );
    if (!res.ok) throw new Error("oEmbed failed");
    const data = await res.json();
    return data.thumbnail_url || "";
  } catch {
    return "";
  }
}

(async function render() {
  const thumbs = await Promise.all(
    PLAYLISTS.map(async (p) =>
      p.image ? p.image : await fetchThumb(p.url)
    )
  );
  const html = PLAYLISTS.map((p, i) =>
    cardTemplate({ ...p, thumbnail: thumbs[i] })
  ).join("");
  document.getElementById("list").innerHTML = html;

  document.querySelectorAll("[data-open-app]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      openInApp(btn.getAttribute("data-open-app"));
    });
  });
})();
