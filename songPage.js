// Build the repeated song page chrome from window.SONG and the lyrics block
document.addEventListener('DOMContentLoaded', () => {
  const main = document.querySelector('main.wrap') || document.body;

  const cfg = window.SONG || {};
  const title = document.title.trim();
  const urls = {
    spotify: cfg.spotifyId ? `https://open.spotify.com/track/${cfg.spotifyId}` : null,
    apple: cfg.appleId ? `https://music.apple.com/us/song/${cfg.appleId}` : null,
    youtube: cfg.youtubeId ? `https://www.youtube.com/watch?v=${cfg.youtubeId}` : null
  };

  // remove any legacy duplicated markup if exists
  [...main.querySelectorAll('h1,.icons,.share-link,.back-link,.credits,pre,.close-btn,.song-topbar')].forEach(n => n.remove());
  document.querySelectorAll('.song-topbar').forEach(n => n.remove());

  // ── Fixed top bar ────────────────────────────────────────────────────────
  const topbar = document.createElement('div');
  topbar.className = 'song-topbar';

  const topbarInner = document.createElement('div');
  topbarInner.className = 'topbar-inner';

  // Close button (×)
  const closeBtn = document.createElement('a');
  closeBtn.href = '../songs.html'; // fallback
  closeBtn.className = 'close-btn';
  closeBtn.setAttribute('aria-label', 'חזרה');
  closeBtn.textContent = '×';

  try {
    const ref = document.referrer ? new URL(document.referrer) : null;
    if (ref && ref.origin === location.origin && ref.href !== location.href) {
      closeBtn.href = ref.href;
    }
  } catch (_) { /* ignore */ }

  closeBtn.addEventListener('click', (e) => {
    if (window.history.length > 1) {
      e.preventDefault();
      window.history.back();
    }
  });

  // Title
  const h1 = document.createElement('h1');
  h1.className = 'song-header';
  const spanTitle = document.createElement('span');
  spanTitle.className = 'title';
  spanTitle.textContent = title;
  h1.appendChild(spanTitle);

  // Read lyrics / chords
  const lyricsNode = document.getElementById('lyrics');
  const chordsNode = document.getElementById('chords');
  const lyricsText = lyricsNode ? lyricsNode.textContent.trim() : '';
  const chordsText = chordsNode ? chordsNode.textContent.trim() : '';

  const highlightChords = (text) =>
    text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\[(.*?)\]/g, '<b class="chord">[$1]</b>');

  // Content <pre>
  const pre = document.createElement('pre');
  if (lyricsText || chordsText) {
    pre.innerHTML = highlightChords(lyricsText || chordsText);
  }

  // מילים / אקורדים toggle
  let playBtn; // declared here so auto-scroll section can reference it
  if (lyricsText && chordsText) {
    const toggle = document.createElement('div');
    toggle.className = 'view-toggle';

    const btnLyrics = document.createElement('button');
    btnLyrics.className = 'toggle-btn';
    btnLyrics.textContent = 'מילים';

    const btnChords = document.createElement('button');
    btnChords.className = 'toggle-btn';
    btnChords.textContent = 'אקורדים';

    const separator = document.createElement('span');
    separator.className = 'toggle-separator';
    separator.textContent = '|';

    toggle.appendChild(btnLyrics);
    toggle.appendChild(separator);
    toggle.appendChild(btnChords);
    h1.appendChild(toggle);

    // Play/Stop button – after the toggle
    playBtn = document.createElement('button');
    playBtn.id = 'scroll-play-btn';
    playBtn.setAttribute('aria-label', 'הפעל גלילה אוטומטית');
    playBtn.textContent = '▶';
    h1.appendChild(playBtn);

    const updateView = (showChords) => {
      pre.innerHTML = highlightChords(showChords ? chordsText : lyricsText);
      btnLyrics.classList.toggle('active', !showChords);
      btnChords.classList.toggle('active', showChords);
      const hash = showChords ? '#chords' : '#lyrics';
      if (window.location.hash !== hash) history.replaceState(null, '', hash);
    };

    btnLyrics.addEventListener('click', () => updateView(false));
    btnChords.addEventListener('click', () => updateView(true));
    updateView(window.location.hash === '#chords');
  }

  // Assemble topbar: [ title+toggle+play ]   [ × ]
  topbarInner.appendChild(h1);
  topbarInner.appendChild(closeBtn);
  topbar.appendChild(topbarInner);
  document.body.prepend(topbar);

  // Content goes into main (below the topbar)
  main.appendChild(pre);

  // credits
  const cr = document.createElement('div');
  cr.className = 'credits';
  if (cfg.lyricsBy) {
    const line1 = document.createElement('div');
    line1.textContent = 'מילים: ' + cfg.lyricsBy;
    cr.appendChild(line1);
  }
  main.appendChild(cr);

  // listen icons
  const icons = document.createElement('span');
  icons.className = 'icons';
  icons.appendChild(document.createTextNode('האזינו לשיר '));

  const mkIcon = (href, cls, label) => {
    if (!href) return null;
    const a = document.createElement('a');
    a.href = href;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.className = 'song-icon';
    a.setAttribute('aria-label', label);
    const i = document.createElement('i');
    i.className = cls;
    a.appendChild(i);
    return a;
  };

  [mkIcon(urls.spotify, 'fa-brands fa-spotify', 'Spotify'),
  mkIcon(urls.apple, 'fa-brands fa-apple', 'Apple Music'),
  mkIcon(urls.youtube, 'fa-brands fa-youtube', 'YouTube')
  ].forEach(x => x && icons.appendChild(x));
  main.appendChild(icons);

  const spacer1 = document.createElement('div');
  spacer1.style.height = '20px';
  main.appendChild(spacer1);

  const share = document.createElement('a');
  share.href = '#';
  share.className = 'share-link';
  share.id = 'shareBtn';
  share.setAttribute('aria-label', 'שתף עמוד זה');
  share.innerHTML = '<i class="fa-solid fa-share-nodes"></i> שיתוף';
  main.appendChild(share);

  const spacer2 = document.createElement('div');
  spacer2.style.height = '20px';
  main.appendChild(spacer2);

  // ── Auto-scroll ────────────────────────────────────────────────────────────
  let scrollRafId = null;
  let scrollSpeed = cfg.scrollSpeed ?? 0.1;
  let scrollAccum = 0;

  const setPlaying = (playing) => {
    if (!playBtn) return;
    playBtn.textContent = playing ? '■' : '▶';
    playBtn.setAttribute('aria-label', playing ? 'עצור גלילה' : 'הפעל גלילה אוטומטית');
    playBtn.classList.toggle('active', playing);
  };

  const startScroll = () => {
    if (scrollRafId) return;
    scrollAccum = 0;
    setPlaying(true);
    const step = () => {
      scrollAccum += scrollSpeed;
      const px = Math.floor(scrollAccum);
      if (px > 0) { window.scrollBy(0, px); scrollAccum -= px; }
      const atBottom = (window.innerHeight + window.scrollY) >= document.body.scrollHeight - 2;
      if (atBottom) { scrollRafId = null; setPlaying(false); }
      else { scrollRafId = requestAnimationFrame(step); }
    };
    scrollRafId = requestAnimationFrame(step);
  };

  const stopScroll = () => {
    if (!scrollRafId) return;
    cancelAnimationFrame(scrollRafId);
    scrollRafId = null;
    setPlaying(false);
  };

  if (playBtn) {
    playBtn.addEventListener('click', () => scrollRafId ? stopScroll() : startScroll());
  }

  // Tap anywhere (not on interactive elements) to toggle scroll
  document.addEventListener('click', (e) => {
    const tag = e.target.tagName;
    if (['A', 'BUTTON', 'INPUT', 'LABEL', 'SELECT', 'TEXTAREA'].includes(tag)) return;
    if (e.target.closest('a, button')) return;
    scrollRafId ? stopScroll() : startScroll();
  });
  // ──────────────────────────────────────────────────────────────────────────

});
