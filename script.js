document.addEventListener('DOMContentLoaded', () => {
  const shareBtn = document.getElementById('shareBtn');
  if (!shareBtn) return;

  shareBtn.addEventListener('click', async e => {
    e.preventDefault();
    if (navigator.share) {
      try {
        await navigator.share({
          title: document.title,
          text: 'Check this out',
          url: window.location.href
        });
      } catch (err) {
        // user canceled or error
      }
    } else {
      alert('שיתוף מובנה לא נתמך בדפדפן הזה');
    }
  });
});
