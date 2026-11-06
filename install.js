// Registrace service workeru, automatická aktualizace, tlačítko „Přidat na plochu“, zobrazení verze.
(function () {
  const btn = document.getElementById("installBtn");
  const hint = document.getElementById("iosHint");
  const ver = document.getElementById("verze");

  if (ver && typeof APP_VERSION !== "undefined") {
    ver.textContent = "Verze " + APP_VERSION + " · aktualizace " + APP_DATE;
  }

  const installed =
    window.matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);

  let deferred = null;
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferred = e;
    if (btn && !installed) btn.hidden = false;
  });
  if (btn) {
    btn.addEventListener("click", async () => {
      if (!deferred) return;
      deferred.prompt();
      await deferred.userChoice;
      deferred = null;
      btn.hidden = true;
    });
  }
  window.addEventListener("appinstalled", () => { if (btn) btn.hidden = true; });

  // iOS Safari nemá beforeinstallprompt, ukážeme návod.
  if (isIOS && !installed && hint) hint.hidden = false;

  if (!("serviceWorker" in navigator)) return;

  // Automatická aktualizace bez zásahu uživatele:
  // 1) kontrola při startu, při návratu do aplikace, po obnovení připojení a každých 30 minut,
  // 2) nový worker převezme řízení a stránka se jednou sama obnoví (ne při první instalaci).
  const meloRizeni = !!navigator.serviceWorker.controller;
  let obnoveno = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (!meloRizeni || obnoveno) return;
    obnoveno = true;
    location.reload();
  });

  navigator.serviceWorker.register("sw.js", { updateViaCache: "none" }).then((reg) => {
    const zkontroluj = () => reg.update().catch(() => {});
    zkontroluj();
    document.addEventListener("visibilitychange", () => { if (!document.hidden) zkontroluj(); });
    window.addEventListener("online", zkontroluj);
    setInterval(zkontroluj, 30 * 60 * 1000);
  });
})();
