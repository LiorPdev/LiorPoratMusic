// Service Worker delegation to root sw.js
try {
  importScripts('../sw.js');
} catch (e) {
  console.warn('[SW] Delegation to ../sw.js failed:', e);
}
