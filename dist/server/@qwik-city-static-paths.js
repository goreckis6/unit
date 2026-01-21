const staticPaths = new Set(["/client/assets/CovML5Jb-bundle-graph.json","/client/assets/CrBEknML-style.css","/client/build/q-BedHIPOG.js","/client/build/q-DJzYeMzz.js","/client/build/q-Dje1XItA.js","/client/build/q-DoNi8vyY.js","/client/build/q-naDMFAHy.js","/client/favicon.svg","/client/manifest.json","/client/q-manifest.json","/client/robots.txt","/client/sitemap.xml","/server/@qwik-city-not-found-paths.js","/server/@qwik-city-static-paths.js","/server/entry.express.js","/server/package.json"]);
function isStaticPath(method, url) {
  if (method.toUpperCase() !== 'GET') {
    return false;
  }
  const p = url.pathname;
  if (p.startsWith("/build/")) {
    return true;
  }
  if (p.startsWith("/assets/")) {
    return true;
  }
  if (staticPaths.has(p)) {
    return true;
  }
  if (p.endsWith('/q-data.json')) {
    const pWithoutQdata = p.replace(/\/q-data.json$/, '');
    if (staticPaths.has(pWithoutQdata + '/')) {
      return true;
    }
    if (staticPaths.has(pWithoutQdata)) {
      return true;
    }
  }
  return false;
}
export { isStaticPath };