// Carregado no layout de todas as páginas.
declare global {
  interface Window { fbq: (...args: unknown[]) => void }
}

export function iniciarPixel(pixelId: string) {
  const s = document.createElement("script");
  s.async = true;
  s.src = "https://connect.facebook.net/en_US/fbevents.js";
  document.head.appendChild(s);
  window.fbq("init", pixelId);
  window.fbq("track", "PageView");
}
