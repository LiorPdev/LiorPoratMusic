document.addEventListener('DOMContentLoaded', () => {
  const shareBtn = document.getElementById('shareBtn');
  if (!shareBtn) return;

  const payload = {
    title: document.title || 'Share',
    text: '',
    url: window.location.href
  };

  function fallbackCopy() {
    const url = window.location.href;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url)
        .then(() => alert('הקישור הועתק'))
        .catch(() => prompt('העתיקו את הקישור', url));
    } else {
      prompt('העתיקו את הקישור', url);
    }
  }

  function doShare() {
    if (navigator.share && (!navigator.canShare || navigator.canShare(payload))) {
      navigator.share(payload).catch(() => {
      });
    } else {
      fallbackCopy();
    }
  }

  shareBtn.addEventListener('click', (e) => {
    e.preventDefault();
    doShare();
  });
});
