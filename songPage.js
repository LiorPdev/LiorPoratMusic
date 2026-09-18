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
  [...main.querySelectorAll('h1,.icons,.share-link,.back-link,.credits,pre,.close-btn,.song-topbar,.show-floating-controls,.show-speed-controls,.show-next-btn,.show-prev-btn')].forEach(n => n.remove());
  document.querySelectorAll('.song-topbar, .show-floating-controls, .show-speed-controls, .show-next-btn, .show-prev-btn').forEach(n => n.remove());

  // ── Fixed top bar ────────────────────────────────────────────────────────
  const topbar = document.createElement('div');
  topbar.className = 'song-topbar';

  const topbarInner = document.createElement('div');
  topbarInner.className = 'topbar-inner';

  const isShow = Boolean(cfg.hideFooter || window.location.pathname.replace(/\\/g, '/').toLowerCase().includes('/show/'));
  if (isShow) {
    document.body.classList.add('show-song');
  }

  // Close button (×)
  const closeBtn = document.createElement('a');
  closeBtn.href = isShow ? '../show.html' : '../songs.html'; // fallback
  closeBtn.className = 'close-btn';
  closeBtn.setAttribute('aria-label', 'חזרה');
  closeBtn.innerHTML = isShow ? '<i class="fa-solid fa-xmark"></i>' : '×';

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
  let lyricsText = lyricsNode ? lyricsNode.textContent.trim() : '';
  let chordsText = chordsNode ? chordsNode.textContent.trim() : '';

  if (cfg.mode === 'lyrics') {
    chordsText = '';
  } else if (cfg.mode === 'chords') {
    lyricsText = '';
  }

  const highlightChords = (text) => {
    const rawLines = text.split('\n');
    const resultLines = [];
    let pendingSeconds = null;

    for (let i = 0; i < rawLines.length; i++) {
      let line = rawLines[i];
      const timeMatch = line.match(/[<\[](\d{1,2}):(\d{2})[>\]]/);
      let lineSeconds = null;

      if (timeMatch) {
        lineSeconds = parseInt(timeMatch[1], 10) * 60 + parseInt(timeMatch[2], 10);
        line = line.replace(timeMatch[0], '');
      }

      // If the line was solely a timestamp (and is now empty)
      if (lineSeconds !== null && line.trim() === '') {
        pendingSeconds = lineSeconds;
        continue;
      }

      // If this line is empty and we have a pending timestamp for the next section,
      // preserve the blank line and keep pendingSeconds for the upcoming text
      if (pendingSeconds !== null && line.trim() === '') {
        resultLines.push('');
        continue;
      }

      const isChorus = /^(\t| {2,})/.test(line);
      const displayLine = isChorus ? line.replace(/^(\t| {2,})/, '') : line;
      let formatted = displayLine
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\[(.*?)\]/g, '<b class="chord">[$1]</b>')
        .replace(/♫/g, '<span class="scroll-pause-marker">♫</span>');

      const secToAttach = pendingSeconds !== null ? pendingSeconds : lineSeconds;
      if (secToAttach !== null) {
        const anchor = `<span class="scroll-time-anchor" data-seconds="${secToAttach}" style="display:inline-block;width:0;height:0;overflow:hidden;vertical-align:top;pointer-events:none;"></span>`;
        formatted = anchor + formatted;
        pendingSeconds = null;
      }

      resultLines.push(isChorus && line.trim() ? `<span class="chorus">${formatted}</span>` : formatted);
    }

    if (pendingSeconds !== null) {
      resultLines.push(`<span class="scroll-time-anchor" data-seconds="${pendingSeconds}" style="display:inline-block;width:0;height:0;overflow:hidden;vertical-align:top;pointer-events:none;"></span>`);
    }

    return resultLines.join('\n');
  };

  // Content <pre>
  const pre = document.createElement('pre');
  const isAutoFont = cfg.fontSize === 'auto' || (isShow && (!cfg.fontSize || cfg.fontSize === 'auto'));

  if (cfg.fontSize && cfg.fontSize !== 'auto') {
    const fs = typeof cfg.fontSize === 'number' ? `${cfg.fontSize}em` : cfg.fontSize;
    pre.style.setProperty('font-size', fs, 'important');
    document.documentElement.style.setProperty('--song-font-size', fs);
  }
  if (cfg.lineHeight) {
    pre.style.setProperty('line-height', cfg.lineHeight, 'important');
    document.documentElement.style.setProperty('--song-line-height', cfg.lineHeight);
  }
  pre.style.paddingBottom = '60vh';
  if (lyricsText || chordsText) {
    pre.innerHTML = highlightChords(lyricsText || chordsText);
  }

  const fitSongFontSize = () => {
    if (!isAutoFont || !pre.isConnected) return;

    // Measure the widest line using an off-screen clone with identical styling
    const measurer = document.createElement('div');
    const computed = window.getComputedStyle(pre);
    measurer.style.cssText = `
      position: absolute !important;
      top: -99999px !important;
      left: -99999px !important;
      visibility: hidden !important;
      white-space: pre !important;
      width: max-content !important;
      max-width: none !important;
      margin: 0 !important;
      padding: 0 !important;
      border: none !important;
      font-family: ${computed.fontFamily} !important;
      font-weight: ${computed.fontWeight} !important;
      letter-spacing: ${computed.letterSpacing} !important;
      font-size: 100px !important;
      line-height: normal !important;
    `;
    measurer.innerHTML = pre.innerHTML;
    document.body.appendChild(measurer);

    const measurerWidth = measurer.getBoundingClientRect().width;
    measurer.remove();

    if (measurerWidth <= 0) return;

    // Available content width inside pre
    const paddingLeft = parseFloat(computed.paddingLeft) || 16;
    const paddingRight = parseFloat(computed.paddingRight) || 16;
    const availableWidth = Math.max(100, (pre.clientWidth || window.innerWidth) - paddingLeft - paddingRight - 8);

    // Calculate proportional font size
    let targetPx = 100 * (availableWidth / measurerWidth);

    // Limits
    const isMobile = window.innerWidth <= 500;
    const defaultMin = isMobile ? 15 : 22;
    const minPx = typeof cfg.minFontSize === 'number' ? cfg.minFontSize : defaultMin;
    const maxPx = typeof cfg.maxFontSize === 'number' ? cfg.maxFontSize : 140;
    targetPx = Math.max(minPx, Math.min(maxPx, targetPx));

    const fsStr = `${Math.round(targetPx * 10) / 10}px`;
    pre.style.setProperty('font-size', fsStr, 'important');
    document.documentElement.style.setProperty('--song-font-size', fsStr);
  };

  // credits – declared early so updateView can show/hide it
  const cr = document.createElement('div');
  cr.className = 'credits';
  if (cfg.lyricsBy) {
    const line1 = document.createElement('div');
    line1.textContent = 'מילים: ' + cfg.lyricsBy;
    cr.appendChild(line1);
  }

  // ── Auto-scroll state variables (declared early to avoid TDZ errors on load) ──
  let scrollRafId = null;
  let scrollSpeed = (cfg.scrollSpeed ?? 0.1) * (isShow ? 2 : 1);
  let scrollAccum = 0;
  let pauseUntil = 0;
  let pausePositions = [];
  let nextPauseIdx = 0;

  // Timed scroll state
  let currentElapsedSec = 0;
  let lastTargetY = 0;
  let activeKeyframes = null;

  // Speed modifier & controls (defaults to cfg.speedModifier or 0)
  const parseSpeedModifier = (val) => {
    if (val == null) return 0;
    if (typeof val === 'number') {
      if (Math.abs(val) >= 1) return val / 100;
      return val;
    }
    if (typeof val === 'string') {
      const num = parseFloat(val.replace('%', ''));
      if (!isNaN(num)) {
        if (val.includes('%') || Math.abs(num) >= 1) return num / 100;
        return num;
      }
    }
    return 0;
  };

  let speedModifier = parseSpeedModifier(cfg.speedModifier);
  let speedMultiplier = Math.max(0.4, Math.min(2.5, Math.round((1.0 + speedModifier) * 100) / 100));

  let speedBadge = null;
  const updateSpeedDisplay = () => {
    if (!speedBadge) return;
    const pct = Math.round(speedMultiplier * 100);
    speedBadge.textContent = `${pct}%`;
    const diff = Math.round(speedModifier * 100);
    const diffStr = diff > 0 ? `+${diff}%` : (diff < 0 ? `${diff}%` : '0%');
    speedBadge.setAttribute('title', `מהירות: ${pct}% (${diffStr}) - לחץ לאיפוס`);
  };

  const changeSpeed = (delta) => {
    speedModifier = Math.round((speedModifier + delta) * 100) / 100;
    speedMultiplier = Math.max(0.4, Math.min(2.5, Math.round((1.0 + speedModifier) * 100) / 100));
    updateSpeedDisplay();
  };

  const resetSpeed = () => {
    speedModifier = parseSpeedModifier(cfg.speedModifier);
    speedMultiplier = Math.max(0.4, Math.min(2.5, Math.round((1.0 + speedModifier) * 100) / 100));
    updateSpeedDisplay();
  };

  const btnMinus = document.createElement('button');
  btnMinus.className = 'speed-btn speed-minus';
  btnMinus.setAttribute('aria-label', 'האט מהירות ב-10%');
  btnMinus.title = 'האט ב-10%';
  btnMinus.innerHTML = '<i class="fa-solid fa-minus"></i>';
  btnMinus.addEventListener('click', (e) => {
    e.stopPropagation();
    changeSpeed(-0.10);
  });

  speedBadge = document.createElement('span');
  speedBadge.className = 'speed-badge';
  speedBadge.addEventListener('click', (e) => {
    e.stopPropagation();
    resetSpeed();
  });
  updateSpeedDisplay();

  const btnPlus = document.createElement('button');
  btnPlus.className = 'speed-btn speed-plus';
  btnPlus.setAttribute('aria-label', 'הגבר מהירות ב-10%');
  btnPlus.title = 'הגבר ב-10%';
  btnPlus.innerHTML = '<i class="fa-solid fa-plus"></i>';
  btnPlus.addEventListener('click', (e) => {
    e.stopPropagation();
    changeSpeed(0.10);
  });

  // Auto-scroll Play/Stop button – available for all views (lyrics & chords)
  let playBtn;
  if (lyricsText || chordsText) {
    playBtn = document.createElement('button');
    playBtn.id = 'scroll-play-btn';
    playBtn.setAttribute('aria-label', 'הפעל גלילה אוטומטית');
    playBtn.innerHTML = '<i class="fa-solid fa-angles-down"></i>';
  }

  // מילים / אקורדים toggle
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

    // YouTube Play/Stop button (omitted for Show songs)
    let ytPlayBtn;
    let ytIframe = null;
    let ytPlaying = false;

    const setYtPlaying = (playing) => {
      if (!ytPlayBtn) return;
      ytPlaying = playing;
      ytPlayBtn.textContent = playing ? '■' : '▶';
      ytPlayBtn.setAttribute('aria-label', playing ? 'עצור שיר' : 'נגן שיר מיוטיוב');
      ytPlayBtn.classList.toggle('active', playing);
    };

    if (cfg.youtubeId && !isShow) {
      ytPlayBtn = document.createElement('button');
      ytPlayBtn.id = 'youtube-play-btn';
      ytPlayBtn.setAttribute('aria-label', 'נגן שיר מיוטיוב');
      ytPlayBtn.textContent = '▶';
      h1.appendChild(ytPlayBtn);

      ytPlayBtn.addEventListener('click', () => {
        if (ytPlaying) {
          if (ytIframe) {
            ytIframe.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
          }
          setYtPlaying(false);
        } else {
          if (!ytIframe) {
            ytIframe = document.createElement('iframe');
            ytIframe.id = 'youtube-player';
            ytIframe.style.display = 'none';
            ytIframe.setAttribute('allow', 'autoplay');
            ytIframe.src = `https://www.youtube.com/embed/${cfg.youtubeId}?enablejsapi=1&autoplay=1`;
            document.body.appendChild(ytIframe);
          } else {
            ytIframe.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
          }
          setYtPlaying(true);
        }
      });
    }

    if (playBtn && !isShow) {
      h1.appendChild(playBtn);
    }

    const updateView = (showChords) => {
      if (scrollRafId) stopScroll();
      currentElapsedSec = 0;
      lastTargetY = 0;
      activeKeyframes = null;
      pre.innerHTML = highlightChords(showChords ? chordsText : lyricsText);
      btnLyrics.classList.toggle('active', !showChords);
      btnChords.classList.toggle('active', showChords);
      const hash = showChords ? '#chords' : '#lyrics';
      if (window.location.hash !== hash) history.replaceState(null, '', hash);
      // hide credits in chords view
      if (cr) cr.style.display = showChords ? 'none' : '';
      if (playBtn) playBtn.style.display = '';
      if (isAutoFont) fitSongFontSize();
    };

    btnLyrics.addEventListener('click', () => updateView(false));
    btnChords.addEventListener('click', () => updateView(true));
    updateView(window.location.hash === '#chords');
  } else if (playBtn && !isShow) {
    h1.appendChild(playBtn);
  }

  const SHOW_SONGS = [
    { name: "בלוז לשבת", file: "בלוז לשבת" },
    { name: "בלוז לחילוני", file: "בלוז לחילוני" },
    { name: "להיות ישראלי", file: "להיות ישראלי" },
    { name: "לוח וגיר", file: "לוח וגיר" },
    { name: "לאון השען", file: "לאון השען" },
    { name: "בדד", file: "בדד" },
    { name: "תל אביבי", file: "תל אביבי" },
    { name: "קלישאות", file: "בשורה תחתונה (קלישאות)" },
    { name: "כל כך לחוץ", file: "כל כך לחוץ" },
    { name: "צל עץ תמר", file: "צל עץ תמר" },
    { name: "הים נחצה לשניים", file: "הים נחצה לשניים" },
    { name: "תקוע באדום", file: "תקוע באדום" },
    { name: "בלוז לנפטר", file: "בלוז לנפטר" },
    { name: "אסיר 1376", file: "אסיר 1376" },
    { name: "ניפגש שוב בקרוב", file: "ניפגש שוב בקרוב" },
    { name: "הרשימה", file: "הרשימה" }
  ];

  if (isShow) {
    const floatingControls = document.createElement('div');
    floatingControls.className = 'show-floating-controls';
    floatingControls.appendChild(closeBtn);
    if (playBtn) {
      floatingControls.appendChild(playBtn);
    }
    document.body.prepend(floatingControls);

    // Middle-left vertical speed controls: [+] [speedBadge] [-]
    const speedControls = document.createElement('div');
    speedControls.className = 'show-speed-controls';
    speedControls.appendChild(btnPlus);
    speedControls.appendChild(speedBadge);
    speedControls.appendChild(btnMinus);
    document.body.appendChild(speedControls);

    // Show navigation buttons (bottom-left): Prev (->) and Next (<-)
    const rawPath = decodeURIComponent(window.location.pathname).replace(/\\/g, '/');
    const curFile = rawPath.split('/').pop().replace(/\.html$/i, '').trim();
    const curTitle = document.title.trim();

    let idx = SHOW_SONGS.findIndex(s => s.file === curFile || s.name === curFile || s.name === curTitle || s.file === curTitle);
    if (idx === -1) {
      idx = SHOW_SONGS.findIndex(s => curTitle.includes(s.name) || curTitle.includes(s.file));
    }
    if (idx !== -1) {
      const navControls = document.createElement('div');
      navControls.className = 'show-nav-controls';

      // Prev song button (back)
      const prevBtn = document.createElement('a');
      prevBtn.className = 'show-nav-btn show-prev-btn';
      prevBtn.innerHTML = '<i class="fa-solid fa-arrow-right"></i>';
      if (idx > 0) {
        const prevSong = SHOW_SONGS[idx - 1];
        prevBtn.href = `${encodeURIComponent(prevSong.file || prevSong.name)}.html`;
        prevBtn.setAttribute('aria-label', `לשיר הקודם: ${prevSong.name}`);
        prevBtn.title = `השיר הקודם: ${prevSong.name}`;
      } else {
        prevBtn.classList.add('disabled');
        prevBtn.setAttribute('aria-disabled', 'true');
        prevBtn.title = 'תחילת הרשימה (אין שיר קודם)';
        prevBtn.addEventListener('click', (e) => e.preventDefault());
      }

      // Next song button (forward)
      const nextBtn = document.createElement('a');
      nextBtn.className = 'show-nav-btn show-next-btn';
      nextBtn.innerHTML = '<i class="fa-solid fa-arrow-left"></i>';
      if (idx < SHOW_SONGS.length - 1) {
        const nextSong = SHOW_SONGS[idx + 1];
        nextBtn.href = `${encodeURIComponent(nextSong.file || nextSong.name)}.html`;
        nextBtn.setAttribute('aria-label', `לשיר הבא: ${nextSong.name}`);
        nextBtn.title = `השיר הבא: ${nextSong.name}`;
      } else {
        nextBtn.classList.add('disabled');
        nextBtn.setAttribute('aria-disabled', 'true');
        nextBtn.title = 'סוף הרשימה (אין שיר נוסף)';
        nextBtn.addEventListener('click', (e) => e.preventDefault());
      }

      document.body.appendChild(nextBtn);
      document.body.appendChild(prevBtn);
    }
  } else {
    // Assemble standard topbar: [ title+toggle+play ]   [ × ]
    topbarInner.appendChild(h1);
    topbarInner.appendChild(closeBtn);
    topbar.appendChild(topbarInner);
    document.body.prepend(topbar);
  }

  // Content goes into main (below the topbar)
  main.appendChild(pre);

  if (isAutoFont) {
    fitSongFontSize();
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        fitSongFontSize();
      });
    }
    setTimeout(fitSongFontSize, 200);
    setTimeout(fitSongFontSize, 600);
    let resizeTimer;
    window.addEventListener('resize', () => {
      cancelAnimationFrame(resizeTimer);
      resizeTimer = requestAnimationFrame(fitSongFontSize);
    });
    window.addEventListener('orientationchange', () => {
      setTimeout(fitSongFontSize, 100);
      setTimeout(fitSongFontSize, 400);
    });
  }

  if (!isShow) {
    main.appendChild(cr);
  }

  // listen icons and footer action buttons (omitted for Show songs)
  if (!isShow) {
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

    const actionRow = document.createElement('div');
    actionRow.style.cssText = 'display:flex;gap:36px;align-items:center;flex-wrap:wrap;';

    const share = document.createElement('a');
    share.href = '#';
    share.className = 'share-link';
    share.id = 'shareBtn';
    share.setAttribute('aria-label', 'שתף עמוד זה');
    share.innerHTML = '<i class="fa-solid fa-share-nodes"></i> שיתוף';
    actionRow.appendChild(share);

    const printBtn = document.createElement('a');
    printBtn.href = '#';
    printBtn.className = 'share-link';
    printBtn.id = 'printBtn';
    printBtn.setAttribute('aria-label', 'הדפס עמוד זה');
    printBtn.innerHTML = '<i class="fa-solid fa-print"></i> הדפסה';
    printBtn.addEventListener('click', (e) => { e.preventDefault(); window.print(); });
    actionRow.appendChild(printBtn);

    main.appendChild(actionRow);

    const spacer2 = document.createElement('div');
    spacer2.style.height = '20px';
    main.appendChild(spacer2);
  }

  // ── Auto-scroll ────────────────────────────────────────────────────────────

  function setPlaying(playing) {
    if (!playBtn) return;
    playBtn.innerHTML = playing ? '<i class="fa-solid fa-pause"></i>' : '<i class="fa-solid fa-angles-down"></i>';
    playBtn.setAttribute('aria-label', playing ? 'עצור גלילה' : 'הפעל גלילה אוטומטית');
    playBtn.classList.toggle('active', playing);
  }

  function getKeyframes() {
    const topBar = document.querySelector('.song-topbar');
    const topBarHt = topBar ? topBar.offsetHeight : 0;
    const anchorEls = [...pre.querySelectorAll('.scroll-time-anchor')];
    if (anchorEls.length === 0) return null;

    // Viewport height available below topbar
    const viewportHeight = window.innerHeight - topBarHt;
    // Position the active line higher up (~25% down the available reading area)
    const offsetRatio = typeof cfg.scrollTargetRatio === 'number' ? cfg.scrollTargetRatio : 0.3;
    const targetOffsetFromTop = topBarHt + (viewportHeight * offsetRatio);

    const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);

    let kfs = anchorEls.map(el => {
      const secs = parseFloat(el.getAttribute('data-seconds'));
      const rect = el.getBoundingClientRect();
      const rawTargetY = rect.top + window.scrollY - targetOffsetFromTop;
      const targetY = Math.max(0, Math.min(maxScroll, Math.round(rawTargetY)));
      return { seconds: secs, targetY };
    }).sort((a, b) => a.seconds - b.seconds);

    const uniqueKfs = [];
    kfs.forEach(kf => {
      if (!uniqueKfs.length || uniqueKfs[uniqueKfs.length - 1].seconds !== kf.seconds) {
        uniqueKfs.push(kf);
      }
    });
    kfs = uniqueKfs;

    if (kfs[0].seconds > 0) {
      kfs.unshift({ seconds: 0, targetY: 0 });
    }

    return kfs;
  }

  function startScroll() {
    if (scrollRafId) return;

    activeKeyframes = getKeyframes();

    // ── CASE 1: Untimed song (legacy scrollSpeed fallback) ──
    if (!activeKeyframes) {
      const topBar = document.querySelector('.song-topbar');
      const topBarHt = topBar ? topBar.offsetHeight : 0;
      const markers = document.querySelectorAll('.scroll-pause-marker');

      const grouped = {};
      [...markers].forEach(m => {
        const pos = Math.round(m.getBoundingClientRect().top + window.scrollY - topBarHt);
        const key = Object.keys(grouped).find(k => Math.abs(k - pos) < 5) || pos;
        grouped[key] = (grouped[key] || 0) + 1;
      });

      pausePositions = Object.entries(grouped)
        .map(([pos, count]) => ({ pos: Number(pos), duration: count * 2000 }))
        .filter(p => p.pos > window.scrollY)
        .sort((a, b) => a.pos - b.pos);

      nextPauseIdx = 0;
      scrollAccum = 0;
      pauseUntil = 0;

      setPlaying(true);
      const stepLegacy = () => {
        if (Date.now() < pauseUntil) {
          scrollRafId = requestAnimationFrame(stepLegacy);
          return;
        }

        scrollAccum += scrollSpeed * speedMultiplier;
        const px = Math.floor(scrollAccum);
        if (px > 0) {
          window.scrollBy(0, px);
          scrollAccum -= px;

          if (nextPauseIdx < pausePositions.length && window.scrollY >= pausePositions[nextPauseIdx].pos) {
            pauseUntil = Date.now() + pausePositions[nextPauseIdx].duration;
            while (nextPauseIdx < pausePositions.length && window.scrollY >= pausePositions[nextPauseIdx].pos) {
              nextPauseIdx++;
            }
          }
        }

        const atBottom = (window.innerHeight + window.scrollY) >= document.body.scrollHeight - 2;
        if (atBottom) { scrollRafId = null; setPlaying(false); }
        else { scrollRafId = requestAnimationFrame(stepLegacy); }
      };
      scrollRafId = requestAnimationFrame(stepLegacy);
      return;
    }

    // ── CASE 2: Timed song (Continuous dynamic scroll based on keyframes) ──
    const currentY = window.scrollY;
    const lastKf = activeKeyframes[activeKeyframes.length - 1];

    // Check if user reached end or manually scrolled away while paused
    if ((currentY >= lastKf.targetY - 10 || currentElapsedSec >= lastKf.seconds) && lastKf.targetY > 0) {
      currentElapsedSec = 0;
      window.scrollTo(0, 0);
      lastTargetY = 0;
    } else if (Math.abs(currentY - lastTargetY) > 20) {
      if (currentY <= activeKeyframes[0].targetY) {
        currentElapsedSec = activeKeyframes[0].seconds;
      } else if (currentY >= lastKf.targetY) {
        currentElapsedSec = lastKf.seconds;
      } else {
        let idx = 0;
        while (idx < activeKeyframes.length - 1 && activeKeyframes[idx + 1].targetY <= currentY) {
          idx++;
        }
        const k1 = activeKeyframes[idx];
        const k2 = activeKeyframes[idx + 1];
        const spanY = k2.targetY - k1.targetY;
        const prog = spanY > 0 ? (currentY - k1.targetY) / spanY : 0;
        currentElapsedSec = k1.seconds + prog * (k2.seconds - k1.seconds);
      }
    }

    let lastFrameTime = performance.now();
    setPlaying(true);

    const stepTimed = (now) => {
      const dt = Math.min((now - lastFrameTime) / 1000, 0.1);
      lastFrameTime = now;
      currentElapsedSec += dt * speedMultiplier;

      const elapsed = currentElapsedSec;
      const firstKf = activeKeyframes[0];
      const lastKf = activeKeyframes[activeKeyframes.length - 1];

      let targetY = 0;
      if (elapsed <= firstKf.seconds) {
        targetY = firstKf.targetY;
      } else if (elapsed >= lastKf.seconds) {
        targetY = lastKf.targetY;
        window.scrollTo(0, targetY);
        lastTargetY = targetY;
        stopScroll();
        return;
      } else {
        let i = 0;
        while (i < activeKeyframes.length - 1 && activeKeyframes[i + 1].seconds <= elapsed) {
          i++;
        }
        const k1 = activeKeyframes[i];
        const k2 = activeKeyframes[i + 1];
        const duration = k2.seconds - k1.seconds;
        const progress = duration > 0 ? (elapsed - k1.seconds) / duration : 1;
        targetY = k1.targetY + (k2.targetY - k1.targetY) * progress;
      }

      window.scrollTo(0, targetY);
      lastTargetY = targetY;

      scrollRafId = requestAnimationFrame(stepTimed);
    };

    scrollRafId = requestAnimationFrame(stepTimed);
  }

  function stopScroll() {
    if (!scrollRafId) return;
    cancelAnimationFrame(scrollRafId);
    scrollRafId = null;
    lastTargetY = window.scrollY;
    setPlaying(false);
  }

  if (playBtn) {
    playBtn.addEventListener('click', () => scrollRafId ? stopScroll() : startScroll());
  }

  // Tap anywhere (not on interactive elements) to toggle scroll
  document.addEventListener('click', (e) => {
    if (playBtn && playBtn.style.display === 'none') return;
    const tag = e.target.tagName;
    if (['A', 'BUTTON', 'INPUT', 'LABEL', 'SELECT', 'TEXTAREA'].includes(tag)) return;
    if (e.target.closest('a, button, .speed-badge')) return;
    scrollRafId ? stopScroll() : startScroll();
  });

  // Spacebar to toggle scroll (Play / Pause)
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.key === ' ' || e.keyCode === 32) {
      const tag = (e.target && e.target.tagName) || '';
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag) || (e.target && e.target.isContentEditable)) {
        return;
      }
      e.preventDefault();
      scrollRafId ? stopScroll() : startScroll();
    } else if (e.key === '+' || e.key === '=' || e.code === 'NumpadAdd') {
      e.preventDefault();
      changeSpeed(0.10);
    } else if (e.key === '-' || e.key === '_' || e.code === 'NumpadSubtract') {
      e.preventDefault();
      changeSpeed(-0.10);
    }
  });

  // User manual scroll gestures immediately pause auto-scroll
  window.addEventListener('wheel', () => {
    if (scrollRafId) stopScroll();
  }, { passive: true });

  window.addEventListener('touchmove', () => {
    if (scrollRafId) stopScroll();
  }, { passive: true });

  window.addEventListener('resize', () => {
    if (activeKeyframes) activeKeyframes = getKeyframes();
  });
  // ──────────────────────────────────────────────────────────────────────────

});
