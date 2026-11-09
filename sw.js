// EasyPDF instalado como app: guarda a página neste aparelho para abrir sem internet.
// VERSAO é trocada pelo construir-web.mjs; mudar de versão faz o aparelho buscar a nova.
const VERSAO = "2026-11-09 16:14";
const CACHE = `easypdf-${VERSAO}`;
const FICHEIROS = ["./", "./manifest.webmanifest", "./icone-192.png", "./icone-512.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FICHEIROS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys()
    .then((nomes) => Promise.all(nomes.filter((n) => n.startsWith("easypdf-") && n !== CACHE).map((n) => caches.delete(n))))
    .then(() => self.clients.claim()));
});

self.addEventListener("fetch", (e) => {
  const pedido = e.request;
  if (pedido.method !== "GET" || new URL(pedido.url).origin !== self.location.origin) return;
  // A página: primeiro a versão nova da internet; sem rede, a guardada.
  if (pedido.mode === "navigate") {
    e.respondWith(fetch(pedido)
      .then((r) => { const copia = r.clone(); caches.open(CACHE).then((c) => c.put("./", copia)); return r; })
      .catch(() => caches.match("./")));
    return;
  }
  e.respondWith(caches.match(pedido, { ignoreSearch: true }).then((r) => r || fetch(pedido)));
});
