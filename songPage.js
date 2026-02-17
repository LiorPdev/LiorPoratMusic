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
  [...main.querySelectorAll('h1,.icons,.share-link,.back-link,.credits,pre,.close-btn')].forEach(n => n.remove());

  // add close button automatically (prefers previous page; falls back to songs list)
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
  } catch (_) {
    // ignore
  }

  closeBtn.addEventListener('click', (e) => {
    if (window.history.length > 1) {
      e.preventDefault();
      window.history.back();
    }
  });

  main.prepend(closeBtn);


  // read lyrics and chords from scripts
  const lyricsNode = document.getElementById('lyrics');
  const chordsNode = document.getElementById('chords');
  const lyricsText = lyricsNode ? lyricsNode.textContent.trim() : '';
  const chordsText = chordsNode ? chordsNode.textContent.trim() : '';

  // title container
  const h1 = document.createElement('h1');
  h1.className = 'song-header';

  const spanTitle = document.createElement('span');
  spanTitle.className = 'title';
  spanTitle.textContent = title;
  h1.appendChild(spanTitle);

  // toggle
  if (lyricsText && chordsText) {
    const toggle = document.createElement('div');
    toggle.className = 'view-toggle';

    const btnLyrics = document.createElement('button');
    btnLyrics.className = 'toggle-btn active';
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

    const highlightChords = (text) => {
      return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\[(.*?)\]/g, '<b class="chord">[$1]</b>');
    };

    const updateView = (showChords) => {
      const text = showChords ? chordsText : lyricsText;
      pre.innerHTML = highlightChords(text);
      btnLyrics.classList.toggle('active', !showChords);
      btnChords.classList.toggle('active', showChords);
    };

    btnLyrics.addEventListener('click', () => updateView(false));
    btnChords.addEventListener('click', () => updateView(true));
  }

  main.appendChild(h1);

  // content display
  const pre = document.createElement('pre');
  if (lyricsText || chordsText) {
    const highlightChords = (text) => {
      return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\[(.*?)\]/g, '<b class="chord">[$1]</b>');
    };
    pre.innerHTML = highlightChords(lyricsText || chordsText);
    main.appendChild(pre);
  }

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

  // share
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

  // back link (prefers previous page; falls back to songs list)
  const back = document.createElement('a');
  back.href = '../songs.html'; // fallback URL
  back.className = 'back-link';
  back.innerHTML = '<i class="fa-solid fa-arrow-right"></i> חזרה לרשימת השירים';

  // If there is a same-origin referrer and it's not this page, prefer it
  try {
    const ref = document.referrer ? new URL(document.referrer) : null;
    if (ref && ref.origin === location.origin && ref.href !== location.href) {
      back.href = ref.href;
    }
  } catch (_) {
    // ignore malformed referrer
  }

  // Use history.back() when possible
  back.addEventListener('click', (e) => {
    if (window.history.length > 1) {
      e.preventDefault();
      window.history.back();
    }
  });

  main.appendChild(back);


});
