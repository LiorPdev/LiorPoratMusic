// Microsoft Clarity
(function (c, l, a, r, i, t, y) {
  c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
  t = l.createElement(r);
  t.async = 1;
  t.src = "https://www.clarity.ms/tag/" + i;
  y = l.getElementsByTagName(r)[0];
  y.parentNode.insertBefore(t, y);
})(window, document, "clarity", "script", "tqmhdyey6p");

// Share button logic
document.addEventListener('DOMContentLoaded', () => {
  const shareBtn = document.getElementById('shareBtn');
  if (!shareBtn) return;

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
    const payload = {
      title: document.title || 'Share',
      text: '',
      url: window.location.href
    };
    if (navigator.share && navigator.canShare && navigator.canShare(payload)) {
      navigator.share(payload).catch(() => { });
    } else {
      fallbackCopy();
    }
  }

  shareBtn.addEventListener('click', (e) => {
    e.preventDefault();
    doShare();
  });
});
