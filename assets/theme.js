// LeafGuard theme — global JS (cart logic is in theme.liquid)
document.addEventListener('DOMContentLoaded', function () {
  // Lazy-load images
  if ('IntersectionObserver' in window) {
    var lazyImgs = document.querySelectorAll('img[loading="lazy"]');
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { obs.unobserve(e.target); }
      });
    });
    lazyImgs.forEach(function (img) { obs.observe(img); });
  }
});
