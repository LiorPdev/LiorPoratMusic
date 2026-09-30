// Microsoft Clarity
(function (c, l, a, r, i, t, y) {
  c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
  t = l.createElement(r);
  t.async = 1;
  t.src = "https://www.clarity.ms/tag/" + i;
  y = l.getElementsByTagName(r)[0];
  y.parentNode.insertBefore(t, y);
})(window, document, "clarity", "script", "tqmhdyey6p");

document.addEventListener('DOMContentLoaded', () => {
  // 1. Toast notification helper
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  let toastTimer = null;
  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 2800);
  }

  // 2. Share button logic
  const shareBtn = document.getElementById('shareBtn');
  if (shareBtn) {
    function fallbackCopy() {
      const url = window.location.href;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url)
          .then(() => showToast('הקישור הועתק בהצלחה!'))
          .catch(() => prompt('העתיקו את הקישור:', url));
      } else {
        prompt('העתיקו את הקישור:', url);
      }
    }

    function doShare() {
      const payload = {
        title: document.title || 'ליאור פורת',
        text: 'ליאור פורת - בלוז-רוק ומה שביניהם',
        url: window.location.href
      };
      if (navigator.share && navigator.canShare && navigator.canShare(payload)) {
        navigator.share(payload).catch((err) => {
          if (err && err.name !== 'AbortError') {
            fallbackCopy();
          }
        });
      } else {
        fallbackCopy();
      }
    }

    shareBtn.addEventListener('click', (e) => {
      e.preventDefault();
      doShare();
    });
  }

  // 3. Scroll cue button (Scroll smoothly to gallery)
  const cueBtn = document.getElementById('cueBtn');
  const sheet = document.querySelector('.sheet');
  if (cueBtn && sheet) {
    cueBtn.addEventListener('click', () => {
      const y = sheet.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: y, behavior: 'smooth' });
    });
  }

  // 4. Hero docking / parallax effect with IntersectionObserver
  const pin = document.querySelector('.pin');
  const dockAt = document.getElementById('dockAt');
  if (pin && dockAt && 'IntersectionObserver' in window) {
    try {
      if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        new IntersectionObserver((entries) => {
          pin.classList.toggle('docked', entries[0].isIntersecting);
        }, { threshold: 0 }).observe(dockAt);
      }
    } catch (e) {
      console.warn('IntersectionObserver error', e);
    }
  }

  // 5. Gallery Lightbox Modal
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxClose = document.getElementById('lightboxClose');
  const shots = document.querySelectorAll('.shot');

  if (lightbox && lightboxImg) {
    function openLightbox(src, alt) {
      lightboxImg.src = src;
      lightboxImg.alt = alt || 'תמונה בהגדלה';
      lightbox.classList.add('is-open');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
      lightbox.classList.remove('is-open');
      lightbox.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      lightboxImg.src = '';
    }

    shots.forEach(shot => {
      shot.addEventListener('click', () => {
        const img = shot.querySelector('img');
        const highRes = shot.getAttribute('data-src') || (img ? img.src : '');
        if (highRes) {
          openLightbox(highRes, img ? img.alt : '');
        }
      });
    });

    if (lightboxClose) {
      lightboxClose.addEventListener('click', closeLightbox);
    }

    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) {
        closeLightbox();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && lightbox.classList.contains('is-open')) {
        closeLightbox();
      }
    });
  }
});
