// pages/_document.tsx
import Document, { Html, Head, Main, NextScript } from 'next/document'

/**
 * Inline script sets theme before hydration and exposes a stable global variable
 * so the client app can read it without flicker. This improves persistence across reloads.
 */
class MyDocument extends Document {
  render() {
    const setTheme = `
(function() {
  try {
    var t = null;
    try { t = localStorage.getItem('shortflix-theme'); } catch(e) {}
    if (t === 'light' || t === 'dark') {
      document.documentElement.setAttribute('data-theme', t);
      window.__SHORTFLIX_THEME = t;
      return;
    }
    var prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
    var chosen = prefersLight ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', chosen);
    window.__SHORTFLIX_THEME = chosen;
  } catch (e) {
    document.documentElement.setAttribute('data-theme', 'dark');
    window.__SHORTFLIX_THEME = 'dark';
  }
})();
`
    return (
      <Html>
        <Head />
        <body>
          <script dangerouslySetInnerHTML={{ __html: setTheme }} />
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default MyDocument
