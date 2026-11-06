// Operace 17. listopad – aplikace hry. Data: stanovist.js (generuje bojovka-zdroj/tools/build-data.py), nastavení: config.js.
(function () {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const POHLED_KEY = "bojovka.pohled", TEMA_KEY = "bojovka.tema", REZIM_KEY = "bojovka.rezim";
  const DATA_VERZE = 1; // verze struktury uložených dat; při změně struktury doplň migraci v migruj()
  const VSECH = STANOVISTE.length;
  const SVG = (n) => '<svg class="ic" aria-hidden="true"><use href="#i-' + n + '"/></svg>';
  const vib = (p) => { try { if (navigator.vibrate) navigator.vibrate(p); } catch (e) { /* nic */ } };
  const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const lsGet = (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const lsSet = (k, v) => { try { localStorage.setItem(k, v); } catch (e) { /* plné úložiště */ } };

  // ---------- režim: ostrá hra / cvičná hra se 2 stanovišti (oddělený stav i přepsané souřadnice) ----------
  let cvic = lsGet(REZIM_KEY) === "cvicna";
  const kStav = () => (cvic ? "bojovka.stav.cvicna" : "bojovka.stav");
  const kPrepis = () => (cvic ? "bojovka.prepis.cvicna" : "bojovka.prepis");

  // ---------- stav hry (localStorage, přežije aktualizaci aplikace) ----------
  function novyStav() {
    const st = {};
    STANOVISTE.forEach((s) => { st[s.id] = { stav: "locked", napovedi: 0, pokusy: 0 }; });
    return { verzeDat: DATA_VERZE, zacatek: null, konec: null, stanoviste: st, reveal: null, finale: false };
  }
  function migruj(s) {
    // Verze dat 1 je první. Budoucí změny struktury sem přidej jako: if (s.verzeDat < 2) { ...; s.verzeDat = 2; }
    if (!s.verzeDat) s.verzeDat = 1;
    s.stanoviste = Object.assign(novyStav().stanoviste, s.stanoviste || {});
    s.verzeDat = DATA_VERZE;
    return s;
  }
  function nacti() {
    const t = lsGet(kStav());
    try { return t ? migruj(JSON.parse(t)) : novyStav(); } catch (e) {
      if (t) lsSet(kStav() + ".poskozeno", t);
      return novyStav();
    }
  }
  function nactiPrepis() { try { return JSON.parse(lsGet(kPrepis()) || "{}") || {}; } catch (e) { return {}; } }
  let stav = nacti();
  let prepis = nactiPrepis(); // { id: { lat, lng, acc, cas } } souřadnice nastavené učitelem v terénu
  const uloz = () => lsSet(kStav(), JSON.stringify(stav));
  const ulozPrepis = () => lsSet(kPrepis(), JSON.stringify(prepis));

  const hotove = (s) => s.stav === "solved" || s.stav === "skipped";
  const ef = (s) => (prepis[s.id] ? Object.assign({}, s, { lat: prepis[s.id].lat, lng: prepis[s.id].lng, prepsano: true }) : s);
  const CVIC_N = CONFIG.CVICNA_STANOVISTE.length;
  // základ stanoviště: ve cvičné hře úkol z podkladu, ale název a souřadnice z config.js (CVICNA_STANOVISTE)
  const zaklad = (s) => { const cv = cvic && CONFIG.CVICNA_STANOVISTE.find((x) => x.id === s.id); return cv ? Object.assign({}, s, { nazev: cv.nazev, lat: cv.lat, lng: cv.lng }) : s; };
  const sts = () => (cvic ? STANOVISTE.slice(0, CVIC_N) : STANOVISTE).map((s) => ef(zaklad(s)));
  const pocet = () => (cvic ? CVIC_N : VSECH);
  const radarM = () => (cvic ? (+lsGet("bojovka.cvicRadar") || CONFIG.RADAR_CVIC_M) : CONFIG.RADAR_M);
  const dej = (id) => { const s = STANOVISTE.find((x) => x.id === id); return s ? ef(zaklad(s)) : null; };
  const nehotove = () => sts().filter((s) => !hotove(stav.stanoviste[s.id]));
  const aktualni = () => nehotove()[0] || null; // doporučené (další v trase)
  const aktivni = () => sts().find((s) => stav.stanoviste[s.id].stav === "unlocked") || null; // odemčené = otevřený úkol
  const pocetHotovych = () => sts().filter((s) => hotove(stav.stanoviste[s.id])).length;

  // ---------- pomocné ----------
  const pad = (n) => String(n).padStart(2, "0");
  function hms(ms) {
    const s = Math.max(0, Math.floor(ms / 1000));
    return Math.floor(s / 3600) + ":" + pad(Math.floor(s / 60) % 60) + ":" + pad(s % 60);
  }
  const hm = (d) => pad(d.getHours()) + ":" + pad(d.getMinutes());
  const fmtSour = (s) => s.lat.toFixed(6) + ", " + s.lng.toFixed(6);
  function norm(t) { // stejná normalizace jako tools/build-data.py
    return String(t).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");
  }
  async function sha256(t) {
    const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(t));
    return Array.from(new Uint8Array(b)).map((x) => x.toString(16).padStart(2, "0")).join("");
  }
  const jeZastupne = (v) => /DOPLNIT/.test(String(v));
  const kodNorm = (t) => String(t).trim().replace(/\s+/g, "").toUpperCase();

  // ---------- vzhled: automaticky podle systému + ruční přepínač (slunce / měsíc) ----------
  let temaVolba = "auto";
  const tmavy = () => window.matchMedia("(prefers-color-scheme: dark)").matches;
  function pouzijTema() {
    const e = temaVolba === "auto" ? (tmavy() ? "dark" : "light") : temaVolba;
    document.documentElement.dataset.theme = e;
    const b = $("tema");
    b.innerHTML = SVG(e === "dark" ? "slunce" : "mesic"); // ikona = na co se přepne
    b.setAttribute("aria-label", e === "dark" ? "Přepnout na světlý režim" : "Přepnout na tmavý režim");
    document.querySelector('meta[name="theme-color"]').content = e === "dark" ? "#000000" : "#F2F2F7";
    document.querySelectorAll("[data-tema]").forEach((x) => x.setAttribute("aria-checked", String(x.dataset.tema === temaVolba)));
  }
  function nastavTema(t) {
    temaVolba = t;
    try { if (t === "auto") localStorage.removeItem(TEMA_KEY); else localStorage.setItem(TEMA_KEY, t); } catch (e) { /* nic */ }
    pouzijTema();
  }
  { const t = lsGet(TEMA_KEY); if (t === "light" || t === "dark") temaVolba = t; }
  pouzijTema();
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", pouzijTema);
  $("tema").addEventListener("click", () => nastavTema(document.documentElement.dataset.theme === "dark" ? "light" : "dark"));
  document.querySelectorAll("[data-tema]").forEach((b) => b.addEventListener("click", () => nastavTema(b.dataset.tema)));
  document.querySelectorAll(".verze-kopie").forEach((e) => { e.textContent = $("verze").textContent; });

  // ---------- pohledy ----------
  const TITULY = { hra: "Hra", cesta: "Cesta", sbirka: "Sbírka", tym: "Tým", ucitel: "Učitel", pin: "Učitel" };
  let pohled = "home";
  function ukaz(p) {
    if (p === "ucitel" && sessionStorage.getItem("bojovka.ucitel") !== "1") p = "pin";
    pohled = p;
    const jeHome = p === "home";
    $("v-home").hidden = !jeHome; $("app").hidden = jeHome;
    ["hra", "cesta", "sbirka", "tym", "pin", "ucitel"].forEach((n) => { $("v-" + n).hidden = n !== p; });
    document.querySelectorAll(".tabbar button").forEach((b) => {
      const akt = b.dataset.tab === p || (p === "pin" && b.dataset.tab === "ucitel");
      if (akt) b.setAttribute("aria-current", "page"); else b.removeAttribute("aria-current");
    });
    lsSet(POHLED_KEY, ["hra", "cesta", "sbirka", "tym"].includes(p) ? p : "home");
    $("navT").textContent = TITULY[p] || "";
    $("cvicBanner").hidden = !cvic || jeHome;
    if (jeHome) $("btnZacit").textContent = stav.zacatek ? "Pokračovat ve hře" : "Začít";
    if (p === "hra") { spustGps(); spustKompas(false); renderHra(); } else setSheet(null);
    if (p === "cesta") renderCesta();
    if (p === "sbirka") renderSbirka();
    if (p === "tym") renderTym();
    if (p === "ucitel") renderUcitel();
    if (p === "pin") { $("iPin").value = ""; $("pinChyba").hidden = true; }
    window.scrollTo(0, 0); naScroll();
  }
  function naScroll() {
    const y = window.scrollY;
    $("nav").classList.toggle("scroll", y > 24);
    const l = document.querySelector(".pohled:not([hidden]) .large");
    if (l) { const k = Math.min(1, y / 70); l.style.opacity = String(1 - k * 0.85); l.style.transform = "scale(" + (1 - k * 0.12) + ")"; }
  }
  window.addEventListener("scroll", naScroll, { passive: true });

  // ---------- bottom sheet ----------
  let zobrazena = null, sheetZavren = false;
  function setSheet(id) {
    if (id === zobrazena) return;
    const stara = zobrazena; zobrazena = id;
    const sc = $("scrim");
    if (stara) {
      const el = $(stara); el.classList.remove("otevrena");
      setTimeout(() => { if (zobrazena !== stara) el.hidden = true; }, 500);
    }
    if (id) {
      const el = $(id); el.hidden = false; void el.offsetWidth;
      requestAnimationFrame(() => el.classList.add("otevrena"));
      sc.hidden = false; requestAnimationFrame(() => sc.classList.add("otevrena"));
      document.body.style.overflow = "hidden";
    } else {
      sc.classList.remove("otevrena");
      setTimeout(() => { if (!zobrazena) sc.hidden = true; }, 350);
      document.body.style.overflow = "";
    }
  }
  function zavriUkol() { sheetZavren = true; renderHra(); }
  $("scrim").addEventListener("click", () => { if (zobrazena === "pUkol") zavriUkol(); });
  (function tazeni() { // tažný úchyt: stažením dolů se úkol schová
    const g = $("grab"), sh = $("pUkol"); let y0 = null, dy = 0;
    g.addEventListener("pointerdown", (e) => { y0 = e.clientY; dy = 0; g.setPointerCapture(e.pointerId); sh.classList.add("tazeni"); });
    g.addEventListener("pointermove", (e) => { if (y0 === null) return; dy = Math.max(0, e.clientY - y0); sh.style.transform = "translateY(" + dy + "px)"; });
    const konec = () => { if (y0 === null) return; y0 = null; sh.classList.remove("tazeni"); sh.style.transform = ""; if (dy > 90) zavriUkol(); };
    g.addEventListener("pointerup", konec); g.addEventListener("pointercancel", konec);
  })();

  // ---------- poloha a kompas ----------
  const gps = { pos: null, chyba: null, watch: null, heading: null, kompasBezi: false, denied: false };
  function spustGps() {
    if (gps.watch !== null) return;
    if (!navigator.geolocation) { gps.chyba = "Toto zařízení nemá polohové služby. Použijte „Nemám signál GPS“."; gps.denied = true; return; }
    gps.watch = navigator.geolocation.watchPosition(
      (p) => { gps.pos = { lat: p.coords.latitude, lng: p.coords.longitude, acc: p.coords.accuracy, t: Date.now() }; gps.chyba = null; gps.denied = false; aktualizujHru(); },
      (e) => {
        if (e.code === 1) { // odepřené oprávnění: nabídneme ruční kód
          gps.chyba = "Poloha není povolena. Povolte ji v nastavení prohlížeče, nebo odemkněte kódem od učitele.";
          gps.denied = true; gps.watch = null; // umožní zkusit znovu
        } else gps.chyba = "Signál GPS není k dispozici. Vyjděte na otevřené místo, nebo použijte „Nemám signál GPS“.";
        aktualizujHru();
      },
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 30000 });
  }
  function spustKompas(zGestu) {
    const D = window.DeviceOrientationEvent;
    if (!D || gps.kompasBezi) return;
    const h = (e) => {
      let v = null;
      if (typeof e.webkitCompassHeading === "number") v = e.webkitCompassHeading;
      else if (e.absolute && e.alpha !== null && e.alpha !== undefined) v = (360 - e.alpha) % 360;
      if (v !== null) { gps.heading = v; planujKresleni(); }
    };
    const pripoj = () => {
      gps.kompasBezi = true;
      window.addEventListener("deviceorientationabsolute", h, true);
      window.addEventListener("deviceorientation", h, true);
      $("btnKompas").hidden = true;
    };
    if (typeof D.requestPermission === "function") { // iOS: povolení jen z klepnutí
      if (!zGestu) { $("btnKompas").hidden = false; return; }
      D.requestPermission().then((r) => { if (r === "granted") pripoj(); }).catch(() => {});
    } else pripoj();
  }
  function vzdalenost(a, b) { // haversine, metry
    const R = 6371000, r = Math.PI / 180;
    const dLat = (b.lat - a.lat) * r, dLng = (b.lng - a.lng) * r;
    const x = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(x));
  }
  function azimut(a, b) {
    const r = Math.PI / 180, dLng = (b.lng - a.lng) * r;
    const y = Math.sin(dLng) * Math.cos(b.lat * r);
    const x = Math.cos(a.lat * r) * Math.sin(b.lat * r) - Math.sin(a.lat * r) * Math.cos(b.lat * r) * Math.cos(dLng);
    return (Math.atan2(y, x) / r + 360) % 360;
  }
  const SVETOVE = ["sever", "severovýchod", "východ", "jihovýchod", "jih", "jihozápad", "západ", "severozápad"];
  const strany = (az) => SVETOVE[Math.round(az / 45) % 8];
  const fmtVzd = (m) => (m < 1000 ? Math.round(m) + " m" : (m / 1000).toFixed(2).replace(".", ",") + " km");
  // Dosah: vzdálenost mínus započtená nepřesnost GPS (nejvýše PRAH_M) musí být do PRAH_M.
  // Nejhůř se tedy střípek chytí do 2×PRAH_M a velmi nepřesná GPS (>PRAH_M) cíl nezpřesní.
  const vDosahu = (d, acc) => d - Math.min(acc || 0, CONFIG.PRAH_M) <= CONFIG.PRAH_M;

  // ---------- radar (bez mapových dlaždic, funguje offline) ----------
  let kresliPlan = false;
  function planujKresleni() { if (kresliPlan) return; kresliPlan = true; requestAnimationFrame(() => { kresliPlan = false; aktualizujSipku(); kresliRadar(); }); }
  // Cíl navigace: vždy NEJBLIŽŠÍ dosud nechycené stanoviště (pořadí je volné). Hystereze: cíl se přepne,
  // až když je jiné stanoviště o víc než 15 m blíž než dosavadní cíl (bez poskakování mezi dvěma stejně vzdálenými).
  let cilId = null;
  function cilNavigace() {
    const zbyva = nehotove();
    if (!zbyva.length) { cilId = null; return null; }
    if (!gps.pos) return zbyva.find((s) => s.id === cilId) || zbyva[0];
    let nej = null;
    zbyva.forEach((s) => { const d = vzdalenost(gps.pos, s); if (!nej || d < nej.d) nej = { s, d }; });
    const stary = zbyva.find((s) => s.id === cilId);
    if (stary && nej.s.id !== stary.id && vzdalenost(gps.pos, stary) - nej.d <= 15) return stary;
    cilId = nej.s.id;
    return nej.s;
  }
  const popisCile = (s) => "Stanoviště " + s.id + (cvic ? ": " + s.nazev : ""); // názvy míst jen ve cvičné hře (v ostré hře by mohly prozradit odpověď)
  function nastavCil(s) {
    const lab = encodeURIComponent("Stanoviště " + s.id);
    $("nNadpis").textContent = "Nejbližší střípek: " + popisCile(s);
    $("nZbyva").textContent = "Nejbližší z " + nehotove().length + " zbývajících.";
    $("nSour").textContent = fmtSour(s);
    $("nMapy").href = "https://www.google.com/maps/dir/?api=1&destination=" + s.lat + "," + s.lng + "&travelmode=walking";
    $("nGeo").href = "geo:" + s.lat + "," + s.lng + "?q=" + s.lat + "," + s.lng + "(" + lab + ")";
  }
  function aktualizujSipku() {
    const cil = cilNavigace();
    if (pohled !== "hra" || !cil || !gps.pos) return;
    const az = azimut(gps.pos, cil);
    $("nSipka").style.transform = "rotate(" + (az - (gps.heading || 0)) + "deg)"; // šipka míří nahoru = 0°
    $("nSmer").textContent = "Směr: " + strany(az) + " (" + Math.round(az) + "°)" +
      (gps.heading === null ? ". Bez kompasu: nahoře = sever." : "");
  }
  const STRIPEK = "M0 -11L8 -3 5 11-6 8-8-4Z";
  function kresliRadar() {
    const svg = $("radarSvg");
    if (pohled !== "hra" || $("pNav").hidden) return;
    const R = 100, rr = (m) => R * Math.sqrt(Math.min(m, radarM()) / radarM());
    const rot = gps.heading !== null ? -gps.heading : 0, cil = cilNavigace();
    let h = '<defs><radialGradient id="rdBg" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#16367F"/><stop offset="1" stop-color="#0A1B45"/></radialGradient>' +
      '<radialGradient id="rdZar" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#FFE066" stop-opacity=".95"/><stop offset="1" stop-color="#FF9F0A" stop-opacity="0"/></radialGradient></defs>' +
      '<circle r="' + R + '" fill="url(#rdBg)"/>';
    h += '<g class="rd-kruhy"><circle r="' + rr(CONFIG.PRAH_M).toFixed(1) + '" class="rd-dosah"/><circle r="' + rr(50).toFixed(1) + '"/><circle r="' + R + '"/></g>';
    h += '<g transform="rotate(' + rot.toFixed(1) + ')"><text y="-' + (R - 6) + '" class="rd-sever" text-anchor="middle">S</text>';
    if (gps.pos) {
      nehotove().forEach((s) => {
        const d = vzdalenost(gps.pos, s);
        if (d > radarM()) return;
        const th = Math.atan2((s.lng - gps.pos.lng) * Math.cos(gps.pos.lat * Math.PI / 180), s.lat - gps.pos.lat);
        const r = rr(d), x = r * Math.sin(th), y = -r * Math.cos(th);
        const v = vDosahu(d, gps.pos.acc);
        h += '<g transform="translate(' + x.toFixed(1) + " " + y.toFixed(1) + ')" class="stripek' + (d < 50 ? " pulz" : "") + (v ? " dosah" : "") + (cil && cil.id === s.id ? " dop" : "") + '" data-id="' + s.id + '">' +
          '<circle r="15" fill="url(#rdZar)" class="s-zar"/><path d="' + STRIPEK + '" class="s-tvar"/>' +
          '<text y="-17" text-anchor="middle" class="s-cislo" transform="rotate(' + (-rot).toFixed(1) + ')">' + s.id + "</text></g>";
      });
    }
    if (gps.pos && cil && vzdalenost(gps.pos, cil) > radarM()) { // nejbližší je za okrajem radaru: šipka na okraji
      const th = azimut(gps.pos, cil);
      h += '<g transform="rotate(' + th.toFixed(1) + ') translate(0 -' + (R - 2) + ')" class="rd-okraj"><path d="M-8 8L0 -6 8 8Z"/><text y="22" text-anchor="middle" transform="rotate(' + (-th - rot).toFixed(1) + ' 0 22)">' + cil.id + "</text></g>";
    }
    h += "</g>";
    h += '<path d="M0 -14L-9 8 0 3 9 8Z" class="rd-ja"/><circle r="4.5" class="rd-bod"/>';
    svg.innerHTML = h;
  }

  function aktualizujHru() {
    if (pohled !== "hra" || aktivni()) return;
    const cil = cilNavigace();
    if (!cil) return;
    $("nStav").textContent = gps.chyba || (gps.pos ? "" : "Zjišťuji polohu…");
    $("btnGps").hidden = gps.watch !== null;
    if (gps.denied) $("fKod").hidden = false;
    nastavCil(cil);
    let nej = null;
    if (gps.pos) {
      const acc = gps.pos.acc, d = vzdalenost(gps.pos, cil);
      $("nVzd").textContent = fmtVzd(d);
      $("nPresnost").textContent = "GPS přesnost: ±" + Math.round(acc) + " m" + (acc > CONFIG.PRAH_M ? ". Vyjdi na otevřené místo, ať se signál zpřesní." : "");
      nehotove().forEach((s) => {
        const dd = vzdalenost(gps.pos, s);
        if (vDosahu(dd, acc) && (!nej || dd < nej.d)) nej = { s, d: dd };
      });
      const n = nehotove().filter((s) => vzdalenost(gps.pos, s) <= radarM()).length;
      $("rdPozn").textContent = n ? "V okolí " + radarM() + " m: " + n + (n === 1 ? " střípek" : n < 5 ? " střípky" : " střípků") : "V okolí " + radarM() + " m nic není";
    } else { $("rdPozn").textContent = "Radar čeká na polohu"; $("nPresnost").textContent = ""; }
    const b = $("btnChytit"), nove = nej && b.dataset.id !== String(nej.s.id);
    if (nej) { b.hidden = false; b.dataset.id = String(nej.s.id); b.textContent = "Chytit střípek " + nej.s.id; if (nove) vib([80, 60, 80]); }
    else { b.hidden = true; delete b.dataset.id; }
    aktualizujSipku();
    planujKresleni();
  }

  let animOdemk = false;
  function odemkni(id, zpusob) {
    const s = stav.stanoviste[id];
    if (s.stav !== "locked") return;
    animOdemk = true; sheetZavren = false;
    s.stav = "unlocked"; s.odemceno = Date.now(); s.zpusob = zpusob;
    uloz(); vib([120, 60, 120]);
    if (pohled === "hra") renderHra();
    if (pohled === "ucitel") renderUcitel();
  }

  // ---------- odpočet ----------
  function casNavratu() {
    const m = /^(\d{1,2}):(\d{2})$/.exec(String(CONFIG.CAS_NAVRATU).trim());
    if (m && +m[1] < 24 && +m[2] < 60) { const d = new Date(); d.setHours(+m[1], +m[2], 0, 0); return d; }
    return stav.zacatek ? new Date(stav.zacatek + CONFIG.DELKA_MIN * 60000) : null;
  }
  function textZbyva() {
    const n = casNavratu();
    if (!n) return "–";
    const z = n - Date.now();
    return z > 0 ? hms(z) : "čas návratu uplynul";
  }
  function tik() {
    const n = casNavratu();
    $("hCas").textContent = n && !cvic ? "Zbývá " + textZbyva() : "";
    if (pohled === "ucitel") $("tZbyva").textContent = textZbyva();
  }
  setInterval(tik, 1000);

  // ---------- role (rotují po každých ROTACE_PO chycených střípcích, pořadí chytání je volné) ----------
  const ROLE_BARVA = { kompas: "c-blue", lupa: "c-orange", klic: "c-indigo", kniha: "c-green", stit: "c-red" };
  function blokRoli(n) {
    const od = Math.floor(n / CONFIG.ROTACE_PO) * CONFIG.ROTACE_PO + 1;
    const doo = Math.min(pocet(), od + CONFIG.ROTACE_PO - 1);
    return { nadpis: "Role pro střípky " + od + "–" + doo,
      html: '<div class="skup">' + CONFIG.ROLE.map((r) =>
        '<div class="rad"><span class="dlazdice ' + (ROLE_BARVA[r.ikona] || "c-gray") + '">' + SVG(r.ikona) + '</span>' +
        '<div class="rad-t"><b>' + r.nazev + '</b><small>' + r.popis + '</small></div><span class="rad-v">' + r.pocet + "</span></div>").join("") + "</div>" };
  }

  // ---------- obraz ze střípků (5×4, vlastní SVG #obraz v index.html) ----------
  function kresliObraz(el, pref, novy) {
    const hot = new Set(STANOVISTE.filter((s) => hotove(stav.stanoviste[s.id])).map((s) => s.id));
    const vse = !cvic && hot.size === VSECH;
    let mask = "", sil = "", cis = "";
    STANOVISTE.forEach((s) => {
      const x = ((s.id - 1) % 5) * 100, y = Math.floor((s.id - 1) / 5) * 100, ok = hot.has(s.id);
      mask += '<rect x="' + x + '" y="' + y + '" width="100" height="100" fill="' + (ok ? "#fff" : "#000") + '"' + (ok && novy === s.id ? ' class="m-nove"' : "") + "/>";
      if (!ok) cis += '<text x="' + (x + 50) + '" y="' + (y + 60) + '" class="o-cislo" text-anchor="middle">' + s.id + "</text>";
    });
    let mriz = "";
    for (let i = 1; i < 5; i++) mriz += "M" + i * 100 + " 0V400";
    for (let i = 1; i < 4; i++) mriz += "M0 " + i * 100 + "H500";
    el.innerHTML = '<svg viewBox="0 0 500 400" class="obraz' + (vse ? " slozeno" : "") + '" role="img" aria-label="Obraz 17. listopadu, odhaleno ' + hot.size + " z " + pocet() + ' střípků">' +
      '<defs><mask id="' + pref + 'Mask" maskUnits="userSpaceOnUse" x="0" y="0" width="500" height="400">' + mask + "</mask></defs>" +
      '<rect width="500" height="400" class="o-bg"/>' + sil + cis +
      '<g mask="url(#' + pref + 'Mask)"><use href="#obraz" width="500" height="400"/></g>' +
      (vse ? "" : '<path d="' + mriz + '" class="o-mriz"/>') + "</svg>";
  }

  // ---------- Sbírka symbolů 17. listopadu (karta po každých ROTACE_PO chycených střípcích) ----------
  const symbolOdemcen = (s) => pocetHotovych() >= s.od;
  const vsechnoHotovo = () => pocetHotovych() >= pocet();
  const symPlny = (s) => (vsechnoHotovo() && s.plny ? Object.assign({}, s, s.plny) : s); // plné znění (s názvy) až na konci, aby neprozradilo odpovědi
  const dlazdice = (s, velka, zamcene) =>
    '<span class="dlazdice ' + (velka ? "velka-dl " : "") + (zamcene ? "zamcene" : s.barva) + '">' + SVG(zamcene ? "zamek" : s.ikona) + "</span>";
  function renderSbirka(novy) {
    const n = pocetHotovych();
    kresliObraz($("sObraz"), "sb", novy);
    $("sObrazPopis").textContent = "Odhaleno " + n + " z " + pocet() + " střípků obrazu. Každý chycený střípek se objeví na svém místě.";
    const ns = CONFIG.SYMBOLY.filter(symbolOdemcen).length;
    $("sPopis").textContent = "Odemčeno " + ns + " z " + CONFIG.SYMBOLY.length + ". Nový symbol získáte po každém čtvrtém střípku.";
    const el = $("sSeznam"); el.textContent = "";
    CONFIG.SYMBOLY.map(symPlny).forEach((s) => {
      const ok = symbolOdemcen(s), k = document.createElement("article");
      k.className = "symbol-karta" + (ok ? "" : " zamcena") + (ok && n === s.od && stav.reveal ? " nova" : "");
      k.dataset.symbol = s.id;
      const foto = !ok ? "" : s.foto
        ? '<figure class="symbol-foto"><img src="' + s.foto + '" alt="' + s.fotoAlt + '" loading="lazy" data-barva="' + s.barva + '" data-ikona="' + s.ikona + '"></figure><p class="foto-kredit">' + s.kredit + "</p>"
        : '<div class="symbol-foto zastupne ' + s.barva + '" role="img" aria-label="Místo pro fotografii">' + SVG(s.ikona) + "<span>Fotografie bude doplněna</span></div>";
      k.innerHTML = (ok ? foto : "") + '<div class="symbol-hlava">' + dlazdice(s, true, !ok) + "<h2>" + (ok ? s.nazev : "Zatím skryto") + "</h2></div>" +
        (ok ? "<p>" + s.text + '</p><p class="symbol-zdroj">Zdroj: ' + s.zdroj + "</p>"
            : '<p class="popis">Odemkne se po ' + s.od + ". střípku.</p>");
      k.querySelectorAll("figure.symbol-foto img").forEach((im) => { // chybějící soubor fotografie: zástupný gradient místo rozbitého obrázku
        const nahrad = () => {
          const f = im.parentNode, ph = document.createElement("div");
          ph.className = "symbol-foto zastupne " + im.dataset.barva; ph.setAttribute("role", "img"); ph.setAttribute("aria-label", "Místo pro fotografii");
          ph.innerHTML = SVG(im.dataset.ikona) + "<span>Fotografie bude doplněna</span>";
          f.replaceWith(ph);
          const kr = k.querySelector(".foto-kredit"); if (kr) kr.remove();
        };
        im.addEventListener("error", nahrad);
        if (im.complete && im.naturalWidth === 0) nahrad();
      });
      el.appendChild(k);
    });
  }
  function renderSbirkaFinale() {
    kresliObraz($("fObraz"), "fn", null);
    const el = $("fSbirka"); el.textContent = "";
    CONFIG.SYMBOLY.map(symPlny).forEach((s) => {
      const r = document.createElement("div"); r.className = "rad";
      r.innerHTML = dlazdice(s, false, !symbolOdemcen(s)) + '<div class="rad-t"><b>' + s.nazev + "</b></div>" + (symbolOdemcen(s) ? SVG("ok") : "");
      el.appendChild(r);
    });
  }

  // ---------- Hra ----------
  function vykresliVetu() {
    const el = $("hVeta"); el.textContent = "";
    let i = 0;
    const slova = [];
    VETA_MEZERY.forEach((n) => {
      const w = document.createElement("span"); w.className = "slovo";
      for (let k = 0; k < n; k++, i++) {
        const s = STANOVISTE[i], p = document.createElement("span"); p.className = "p";
        const st = stav.stanoviste[s.id];
        if (hotove(st)) { // písmeno patří k číslu stanoviště, takže se doplní na své místo při libovolném pořadí
          p.textContent = s.pismeno;
          if (st.stav === "skipped") p.classList.add("pre");
          if (stav.reveal === s.id) p.classList.add("nove");
        } else { p.textContent = "_"; p.classList.add("prazdne"); }
        w.appendChild(p);
      }
      el.appendChild(w);
      slova.push(Array.from(w.children).map((c) => c.textContent).join(""));
    });
    el.setAttribute("aria-label", "Věta: " + slova.join(" "));
  }
  function renderHra() {
    const cur = aktualni(), akt = aktivni();
    ["pNav", "pTeaser", "pFinale", "pDopis", "pSbirkaFinale", "pCvicHotovo"].forEach((i) => { $(i).hidden = true; });
    $("hStanoviste").textContent = "Splněno " + pocetHotovych() + " z " + pocet();
    $("hProg").style.width = (pocetHotovych() / pocet() * 100) + "%";
    const titul = !cur ? (cvic ? "Cvičení hotovo" : stav.finale ? "Mise splněna" : "Finále") : "Hra";
    $("hTitul").textContent = titul; if (pohled === "hra") $("navT").textContent = titul;
    $("hVetaNadpis").hidden = $("hVeta").hidden = cvic;
    if (!cvic) vykresliVetu();
    tik();

    if (stav.reveal) { if (zobrazena !== "pReveal") renderReveal(stav.reveal); setSheet("pReveal"); return; }
    if (!cur) {
      setSheet(null);
      if (cvic) { $("pCvicHotovo").hidden = false; return; }
      $("pSbirkaFinale").hidden = false; renderSbirkaFinale();
      return stav.finale ? renderDopis() : renderFinale();
    }
    if (akt) {
      if (sheetZavren) { setSheet(null); $("pTeaser").hidden = false; return; }
      if (zobrazena !== "pUkol") renderUkol(akt, stav.stanoviste[akt.id]);
      setSheet("pUkol"); return;
    }
    setSheet(null);
    renderNav();
  }
  function renderNav() {
    $("pNav").hidden = false;
    const cil = cilNavigace();
    nastavCil(cil);
    $("nVzd").textContent = "–"; $("nSmer").textContent = ""; $("nPresnost").textContent = "";
    $("fKod").hidden = true; $("nKodChyba").hidden = true; $("btnChytit").hidden = true; delete $("btnChytit").dataset.id;
    aktualizujHru(); kresliRadar();
  }
  function renderUkol(cur, st) {
    $("uNadpis").textContent = "Stanoviště " + cur.id;
    $("uZadani").textContent = cur.zadani;
    $("uOdemk").hidden = !animOdemk; animOdemk = false;
    $("iOdp").value = ""; $("uChyba").hidden = true;
    renderNapovedy(cur, st);
  }
  function renderNapovedy(cur, st) {
    const ul = $("uNapovedy"); ul.textContent = "";
    for (let i = 0; i < st.napovedi; i++) { const li = document.createElement("li"); li.textContent = cur.napoveda[i]; ul.appendChild(li); }
    const max = Math.min(2, cur.napoveda.length), b = $("btnNapoveda");
    b.innerHTML = SVG("zarovka") + " Nápověda (použito " + st.napovedi + " z " + max + ")";
    b.disabled = st.napovedi >= max;
  }
  function renderReveal(id) {
    const s = dej(id), st = stav.stanoviste[id], dalsi = aktualni();
    $("rNadpis").textContent = st.stav === "skipped" ? "Stanoviště " + id + " přeskočeno učitelem" : "Střípek " + id + " je váš!";
    $("rPismeno").textContent = s.pismeno;
    const k = $("rKlavesa"); k.style.animation = "none"; void k.offsetWidth; k.style.animation = "";
    $("rDalsi").hidden = !dalsi;
    if (dalsi) { $("rDalsiCislo").textContent = dalsi.id; $("rSour").textContent = fmtSour(dalsi); }
    const n = pocetHotovych();
    const sym = cvic ? null : CONFIG.SYMBOLY.find((x) => x.od === n), rs = $("rSymbol");
    rs.hidden = !sym;
    if (sym) { $("rSymDl").className = "dlazdice velka-dl " + sym.barva; $("rSymDl").innerHTML = SVG(sym.ikona); $("rSymNazev").textContent = sym.nazev; }
    const rot = $("rRole");
    if (dalsi && !cvic && n % CONFIG.ROTACE_PO === 0) {
      const b = blokRoli(n);
      rot.hidden = false;
      rot.innerHTML = "<h3>Vystřídejte role!</h3><p class=\"popis\">" + b.nadpis + "</p>" + b.html;
    } else rot.hidden = true;
    $("btnPokracovat").textContent = dalsi ? "Do sbírky a dál" : (cvic ? "Dokončit cvičení" : "Složit obraz a do finále");
    $("pReveal").scrollTop = 0;
  }
  function renderFinale() {
    $("pFinale").hidden = false;
    const ol = $("fOtazky"); ol.textContent = "";
    CONFIG.ZAVERECNE_OTAZKY.forEach((q) => { const li = document.createElement("li"); li.textContent = q; ol.appendChild(li); });
    const v = $("fVarovani");
    const chybi = jeZastupne(CONFIG.KONECNY_KOD) || CONFIG.ZAVERECNE_OTAZKY.some(jeZastupne);
    v.hidden = !chybi;
    v.textContent = "DOPLNIT: závěrečný kód zámku nebo závěrečné otázky nejsou v podkladu a v config.js jsou zástupné.";
    $("btnObejit").hidden = !chybi;
    $("iKonec").value = ""; $("fChyba").hidden = true;
  }
  function renderDopis() {
    $("pDopis").hidden = false;
    $("dText").textContent = CONFIG.DOPIS;
    $("dCas").textContent = stav.zacatek && stav.konec ? "Celkový čas mise: " + hms(stav.konec - stav.zacatek) : "";
  }

  // ---------- Cesta a Tým ----------
  const STAV_TEXT = { locked: "čeká", unlocked: "odemčeno", solved: "splněno", skipped: "přeskočeno" };
  function renderCesta() {
    $("cPopis").textContent = "Splněno " + pocetHotovych() + " z " + pocet() + " stanovišť. Střípky můžete chytat v libovolném pořadí, navigace míří k nejbližšímu.";
    const cur = cilNavigace(), el = $("cSeznam"); el.textContent = "";
    for (let od = 1; od <= pocet(); od += CONFIG.ROTACE_PO) {
      const doo = Math.min(pocet(), od + CONFIG.ROTACE_PO - 1);
      const h = document.createElement("h2"); h.className = "sekce"; h.textContent = "Stanoviště " + od + "–" + doo;
      const g = document.createElement("div"); g.className = "skup";
      for (let id = od; id <= doo; id++) {
        const s = dej(id), st = stav.stanoviste[id], r = document.createElement("div"); r.className = "rad";
        const dl = document.createElement("span"); dl.className = "cislo-dl";
        if (hotove(st)) { dl.classList.add(st.stav === "skipped" ? "pre" : "hotovo"); dl.innerHTML = SVG("ok"); }
        else { dl.textContent = String(id); if (cur && cur.id === id) dl.classList.add("ted"); }
        const t = document.createElement("div"); t.className = "rad-t";
        t.innerHTML = "<b>Stanoviště " + id + "</b><small>" + (cur && cur.id === id && !hotove(st) ? (st.stav === "unlocked" ? "odemčeno" : "nejbližší") : STAV_TEXT[st.stav]) + "</small>";
        r.append(dl, t);
        if (hotove(st)) { const p = document.createElement("span"); p.className = "pismeno-dl"; p.textContent = s.pismeno; r.appendChild(p); }
        g.appendChild(r);
      }
      el.append(h, g);
    }
  }
  function renderTym() {
    const b = blokRoli(pocetHotovych());
    $("hRoleNadpis").textContent = b.nadpis; $("hRoleTelo").innerHTML = b.html;
    const k = CONFIG.NOUZOVY_KONTAKT, a = $("hNouze");
    $("hNouzeText").textContent = k.jmeno + (k.telefon ? " " + k.telefon : "");
    if (k.telefon) a.href = "tel:" + k.telefon.replace(/\s+/g, ""); else a.removeAttribute("href");
  }

  // ---------- události hráče ----------
  $("btnZacit").addEventListener("click", () => {
    if (!stav.zacatek) { stav.zacatek = Date.now(); uloz(); }
    spustGps(); spustKompas(true);
    ukaz("hra");
  });
  $("btnUcitel").addEventListener("click", () => ukaz("ucitel"));
  $("btnDomu").addEventListener("click", () => ukaz("home"));
  $("logoNav").addEventListener("click", () => ukaz("home")); // postup se neresetuje, jen úvod
  $("logoHome").addEventListener("click", () => ukaz("home"));
  document.querySelectorAll(".tabbar button").forEach((b) => b.addEventListener("click", () => ukaz(b.dataset.tab)));
  $("btnKompas").addEventListener("click", () => spustKompas(true));
  $("btnGps").addEventListener("click", () => { gps.chyba = null; spustGps(); aktualizujHru(); });
  $("btnBezGps").addEventListener("click", () => { $("fKod").hidden = false; $("iKod").focus(); });
  $("btnOtevritUkol").addEventListener("click", () => { sheetZavren = false; renderHra(); });
  $("btnChytit").addEventListener("click", () => { const id = +$("btnChytit").dataset.id; if (id) odemkni(id, "gps"); });
  $("fKod").addEventListener("submit", (e) => {
    e.preventDefault();
    const cur = cilNavigace();
    if (cur && kodNorm($("iKod").value) === kodNorm(CONFIG.RUCNI_KOD)) { $("iKod").value = ""; odemkni(cur.id, "kod"); }
    else { $("nKodChyba").hidden = false; vib(200); }
  });
  $("btnNapoveda").addEventListener("click", () => {
    const akt = aktivni(); if (!akt) return;
    const st = stav.stanoviste[akt.id];
    if (st.napovedi < Math.min(2, akt.napoveda.length)) { st.napovedi++; uloz(); renderNapovedy(akt, st); }
  });
  $("fOdp").addEventListener("submit", async (e) => {
    e.preventDefault();
    const akt = aktivni(); if (!akt) return;
    const st = stav.stanoviste[akt.id];
    if (!(window.crypto && crypto.subtle)) { $("uChyba").textContent = "Kontrola odpovědi vyžaduje zabezpečené spojení (HTTPS)."; $("uChyba").hidden = false; return; }
    const h = await sha256(akt.id + "|" + norm($("iOdp").value));
    if (norm($("iOdp").value) && akt.hash.includes(h)) {
      st.stav = "solved"; st.vyreseno = Date.now(); stav.reveal = akt.id; sheetZavren = false;
      uloz(); vib([60, 40, 60, 40, 120]); renderHra();
    } else {
      st.pokusy++; uloz(); vib(200);
      $("uChyba").textContent = "Zatím ne. Zkuste to znovu."; $("uChyba").hidden = false;
    }
  });
  // střípek „vletí“ do záložky Sbírka
  function leti() {
    const z = $("rKlavesa"), cil = document.querySelector('.tabbar [data-tab="sbirka"] .ic');
    if (reduced() || !z || !cil || !z.animate) return;
    const a = z.getBoundingClientRect(), b = cil.getBoundingClientRect();
    const f = document.createElement("div"); f.className = "leti";
    f.style.cssText = "left:" + (a.left + a.width / 2 - 24) + "px;top:" + (a.top + a.height / 2 - 24) + "px";
    f.innerHTML = '<svg viewBox="-12 -14 24 28"><path d="' + STRIPEK + '"/></svg>';
    document.body.appendChild(f);
    const dx = b.left + b.width / 2 - (a.left + a.width / 2), dy = b.top + b.height / 2 - (a.top + a.height / 2);
    const an = f.animate([{ transform: "translate(0,0) scale(1.4)", opacity: 1 }, { transform: "translate(" + dx + "px," + dy + "px) scale(.35)", opacity: .9 }],
      { duration: 700, easing: "cubic-bezier(.5,0,.8,.4)" });
    an.onfinish = () => { f.remove(); const t = document.querySelector('.tabbar [data-tab="sbirka"]'); t.classList.remove("pulz-tab"); void t.offsetWidth; t.classList.add("pulz-tab"); };
  }
  $("btnPokracovat").addEventListener("click", () => {
    const id = stav.reveal; leti();
    stav.reveal = null; uloz(); window.scrollTo(0, 0);
    novyStripek = id; renderHra(); novyStripek = null;
  });
  let novyStripek = null;
  $("fKonec").addEventListener("submit", (e) => {
    e.preventDefault();
    if (kodNorm($("iKonec").value) === kodNorm(CONFIG.KONECNY_KOD)) dokonci();
    else $("fChyba").hidden = false;
  });
  $("btnObejit").addEventListener("click", () => {
    if (prompt("PIN učitele:") === CONFIG.PIN_UCITEL) dokonci();
  });
  function dokonci() { stav.finale = true; stav.konec = Date.now(); uloz(); renderHra(); konfety(); vib([100, 50, 100, 50, 300]); }
  function konfety() {
    if (reduced()) return; // bez pohybu: jen statický dopis
    const cv = $("konfety"), c = cv.getContext("2d");
    cv.width = innerWidth; cv.height = innerHeight; cv.style.display = "block";
    const barvy = ["#0A84FF", "#FF453A", "#ffffff", "#FFD60A", "#30D158", "#5E5CE6"];
    const cast = Array.from({ length: 150 }, () => ({ x: Math.random() * cv.width, y: -Math.random() * cv.height * 0.6,
      w: 6 + Math.random() * 8, h: 8 + Math.random() * 10, vy: 2 + Math.random() * 3.5, vx: -1 + Math.random() * 2,
      r: Math.random() * 6, vr: -0.2 + Math.random() * 0.4, b: barvy[Math.floor(Math.random() * barvy.length)] }));
    const konec = Date.now() + 5000;
    (function krok() {
      c.clearRect(0, 0, cv.width, cv.height);
      cast.forEach((p) => {
        p.x += p.vx; p.y += p.vy; p.r += p.vr;
        c.save(); c.translate(p.x, p.y); c.rotate(p.r); c.fillStyle = p.b;
        c.beginPath(); c.roundRect(-p.w / 2, -p.h / 2, p.w, p.h, 2); c.fill(); c.restore();
      });
      if (Date.now() < konec) requestAnimationFrame(krok);
      else { c.clearRect(0, 0, cv.width, cv.height); cv.style.display = "none"; }
    })();
  }
  $("btnKonfety").addEventListener("click", konfety);

  // ---------- režim cvičné hry ----------
  function prepniRezim(zapnout) {
    cvic = zapnout; lsSet(REZIM_KEY, cvic ? "cvicna" : "ostra");
    stav = nacti(); prepis = nactiPrepis(); sheetZavren = false; novyStripek = null;
    setSheet(null); $("btnChytit").hidden = true; delete $("btnChytit").dataset.id;
    $("cvicBanner").hidden = !cvic;
    if (pohled === "ucitel") renderUcitel(); else ukaz(pohled === "home" ? "home" : pohled);
  }
  $("btnCvicKonec").addEventListener("click", () => { prepniRezim(false); ukaz("hra"); });
  $("btnCvicna").addEventListener("click", () => prepniRezim(!cvic));
  $("btnCvicDosah").addEventListener("click", () => { // dosah radaru cvičné hry: 150 → 400 → 800 → 150 m
    const d = [150, 400, 800], i = d.indexOf(radarM());
    lsSet("bojovka.cvicRadar", String(d[(i + 1) % d.length])); renderUcitel();
  });

  // ---------- učitel ----------
  $("fPin").addEventListener("submit", (e) => {
    e.preventDefault();
    if ($("iPin").value === CONFIG.PIN_UCITEL) { sessionStorage.setItem("bojovka.ucitel", "1"); ukaz("ucitel"); }
    else $("pinChyba").hidden = false;
  });
  const otevrene = new Set(), zpravy = {};
  function nastavPolohou(s) {
    const uloz2 = (lat, lng, acc) => {
      if (acc > 20 && !confirm("Přesnost GPS je jen ±" + Math.round(acc) + " m (doporučeno do 20 m). Počkejte venku na zpřesnění. Přesto uložit?")) {
        zpravy[s.id] = "Uložení zrušeno (přesnost ±" + Math.round(acc) + " m)."; return renderUcitel();
      }
      prepis[s.id] = { lat: lat, lng: lng, acc: acc, cas: Date.now() };
      ulozPrepis();
      zpravy[s.id] = "Uloženo: " + lat.toFixed(6) + ", " + lng.toFixed(6) + " (přesnost ±" + Math.round(acc) + " m)" + (acc > 20 ? ". POZOR: nepřesné." : ".");
      renderUcitel();
    };
    if (gps.pos && Date.now() - gps.pos.t < 30000) return uloz2(gps.pos.lat, gps.pos.lng, gps.pos.acc); // čerstvá poloha z běžícího sledování
    if (!navigator.geolocation) { zpravy[s.id] = "Toto zařízení nemá polohové služby."; return renderUcitel(); }
    zpravy[s.id] = "Zjišťuji polohu…"; renderUcitel();
    navigator.geolocation.getCurrentPosition((p) => uloz2(p.coords.latitude, p.coords.longitude, p.coords.accuracy),
      (e) => { zpravy[s.id] = e.code === 1 ? "Poloha není povolena v prohlížeči." : "Polohu se nepodařilo zjistit, zkuste to venku."; renderUcitel(); },
      { enableHighAccuracy: true, timeout: 25000, maximumAge: 0 });
  }
  function renderUcitel() {
    const varov = [];
    if (CONFIG.PIN_UCITEL === "0000") varov.push("PIN je výchozí 0000 – ZMĚNIT v config.js.");
    if (CONFIG.RUCNI_KOD === "1717") varov.push("Ruční kód je výchozí 1717 – ZMĚNIT v config.js.");
    if (jeZastupne(CONFIG.CAS_NAVRATU)) varov.push("Čas návratu není nastaven (DOPLNIT), odpočet jde od stisku Začít.");
    if (jeZastupne(CONFIG.NOUZOVY_KONTAKT.jmeno)) varov.push("Nouzový kontakt není vyplněn (DOPLNIT).");
    if (jeZastupne(CONFIG.KONECNY_KOD)) varov.push("Závěrečný kód zámku není nastaven (KOD_DOPLNIT).");
    if (CONFIG.ZAVERECNE_OTAZKY.some(jeZastupne)) varov.push("Závěrečné otázky nejsou vyplněny (DOPLNIT).");
    varov.push("Souřadnice (" + TRASA_VERZE + ") jsou NEOVĚŘENÉ v terénu.");
    const v = $("uVarovani"); v.hidden = false; v.textContent = "";
    const ul = document.createElement("ul");
    varov.forEach((t) => { const li = document.createElement("li"); li.textContent = t; ul.appendChild(li); });
    v.appendChild(ul);

    $("cvicBanner").hidden = !cvic; $("btnCvicDosah").hidden = !cvic;
    $("cvicDosah").textContent = radarM() + " m (klepnutím změníte: 150 / 400 / 800)";
    $("cvicStav").textContent = cvic ? "zapnuto (" + CVIC_N + " stanovišť, vlastní stav a souřadnice, radar " + radarM() + " m)" : "vypnuto (ostrá hra)";
    $("tZacatek").textContent = stav.zacatek ? new Date(stav.zacatek).toLocaleString("cs-CZ") : "ještě nezačalo";
    const n = casNavratu();
    $("tNavrat").textContent = n ? hm(n) : "–";
    $("tZbyva").textContent = textZbyva();
    const k = CONFIG.NOUZOVY_KONTAKT;
    $("tKontakt").textContent = k.jmeno + (k.telefon ? " " + k.telefon : "");
    $("tKod").textContent = CONFIG.RUCNI_KOD;

    const cur = aktualni();
    $("aInfo").textContent = cur ? "Doporučené: stanoviště " + cur.id + " (" + STAV_TEXT[stav.stanoviste[cur.id].stav] + "): " + cur.nazev : "Všech " + pocet() + " stanovišť je hotovo.";
    $("btnUOdemknout").hidden = !cur || stav.stanoviste[cur.id].stav !== "locked";
    $("btnUPreskocit").hidden = !cur;

    const us = $("uSbirka"); us.textContent = "";
    CONFIG.SYMBOLY.forEach((s) => {
      const ok = symbolOdemcen(s), r = document.createElement("div"); r.className = "rad";
      r.innerHTML = dlazdice(s, false, !ok) + '<div class="rad-t"><b>' + s.nazev + "</b><small>" + (ok ? "získáno" : "čeká na " + s.od + ". střípek") + "</small></div>";
      us.appendChild(r);
    });
    const sez = $("uSeznam"); sez.textContent = "";
    sts().forEach((s) => {
      const st = stav.stanoviste[s.id];
      const d = document.createElement("details"); d.className = "stanoviste-radek"; d.dataset.id = s.id;
      d.open = otevrene.has(s.id);
      d.addEventListener("toggle", () => { if (d.open) otevrene.add(s.id); else otevrene.delete(s.id); });
      const sm = document.createElement("summary");
      sm.textContent = s.id + ". " + s.nazev + " – " + STAV_TEXT[st.stav] + (hotove(st) ? " (" + s.pismeno + ")" : "") + (s.prepsano ? " [přepsáno]" : "");
      const p = document.createElement("div"); p.className = "stanoviste-telo";
      const orig = zaklad(STANOVISTE.find((x) => x.id === s.id));
      [
        "Souřadnice: " + fmtSour(s) + (s.prepsano ? " (GPS ±" + Math.round(prepis[s.id].acc) + " m); původní " + fmtSour(orig) : " (jistota místa: " + s.jistota + ")"),
        "Místo schránky: " + s.mistoPopis,
        "Písmeno: " + s.pismeno + ", nápovědy použito: " + st.napovedi + ", chybných pokusů: " + st.pokusy,
      ].forEach((r) => { const dv = document.createElement("div"); dv.textContent = r; p.appendChild(dv); });
      const a = document.createElement("a"); a.href = "https://www.google.com/maps/search/?api=1&query=" + s.lat + "," + s.lng;
      a.target = "_blank"; a.rel = "noopener"; a.textContent = "Otevřít v Mapách";
      p.appendChild(a);
      const b1 = document.createElement("button"); b1.type = "button"; b1.className = "btn sek"; b1.textContent = "Nastavit na moji aktuální polohu";
      b1.addEventListener("click", () => { otevrene.add(s.id); nastavPolohou(s); });
      p.appendChild(b1);
      if (s.prepsano) {
        const b2 = document.createElement("button"); b2.type = "button"; b2.className = "btn sek"; b2.textContent = "Vrátit původní souřadnice";
        b2.addEventListener("click", () => { delete prepis[s.id]; ulozPrepis(); zpravy[s.id] = "Vráceno na původní souřadnice."; otevrene.add(s.id); renderUcitel(); });
        p.appendChild(b2);
      }
      if (zpravy[s.id]) { const z = document.createElement("div"); z.className = "prepis-zprava"; z.textContent = zpravy[s.id]; z.setAttribute("role", "status"); p.appendChild(z); }
      d.append(sm, p); sez.appendChild(d);
    });
  }
  $("btnUOdemknout").addEventListener("click", () => { const c = aktualni(); if (c) odemkni(c.id, "ucitel"); });
  $("btnUPreskocit").addEventListener("click", () => {
    const c = aktualni();
    if (!c || !confirm("Přeskočit stanoviště " + c.id + "? Písmeno " + c.pismeno + " se hráčům odhalí.")) return;
    const st = stav.stanoviste[c.id]; st.stav = "skipped"; st.vyreseno = Date.now(); stav.reveal = c.id;
    uloz(); renderUcitel();
  });
  $("btnReset").addEventListener("click", () => {
    if (!confirm("Opravdu smazat postup " + (cvic ? "CVIČNÉ" : "OSTRÉ") + " hry na tomto telefonu?")) return;
    stav = novyStav(); sheetZavren = false; uloz(); renderUcitel();
  });
  function stahni(text, jmeno) {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([text], { type: "application/json" }));
    a.download = jmeno;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  }
  const razitko = () => { const d = new Date(); return d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()) + "-" + pad(d.getHours()) + pad(d.getMinutes()); };
  $("btnExport").addEventListener("click", () => {
    const data = {
      aplikace: "Operace 17. listopad", verze: typeof APP_VERSION !== "undefined" ? APP_VERSION : null, rezim: cvic ? "cvicna" : "ostra",
      exportovano: new Date().toISOString(), zacatek: stav.zacatek ? new Date(stav.zacatek).toISOString() : null,
      konec: stav.konec ? new Date(stav.konec).toISOString() : null, hotovo: pocetHotovych(),
      stanoviste: sts().map((s) => {
        const st = stav.stanoviste[s.id];
        return { id: s.id, stav: st.stav, zpusobOdemceni: st.zpusob || null, napovedi: st.napovedi, chybnePokusy: st.pokusy,
          odemceno: st.odemceno ? new Date(st.odemceno).toISOString() : null, vyreseno: st.vyreseno ? new Date(st.vyreseno).toISOString() : null };
      }),
    };
    const text = JSON.stringify(data, null, 2);
    $("uExport").hidden = false; $("uExport").value = text;
    stahni(text, "bojovka-postup-" + razitko() + ".json");
  });
  // export souřadnic ve tvaru trasa.json (vloží se do bojovka-zdroj/trasa.json, pak build-data.py a bump)
  $("btnExportSour").addEventListener("click", () => {
    const data = {
      verze: "prepis-" + razitko(),
      poznamka: "Souřadnice upravené v aplikaci (GPS telefonu, učitelský režim)" + (cvic ? " – CVIČNÁ hra, jen stanoviště 1–" + CVIC_N + "" : "") + ". mistoPopis je zkrácený. Vložte do bojovka-zdroj/trasa.json a spusťte tools/build-data.py.",
      stanoviste: sts().map((s) => ({ id: s.id, nazev: s.nazev, lat: +(+s.lat).toFixed(6), lng: +(+s.lng).toFixed(6), mistoPopis: s.mistoPopis,
        zdroj: s.prepsano ? "GPS telefonu, přesnost ±" + Math.round(prepis[s.id].acc) + " m, " + new Date(prepis[s.id].cas).toISOString() : "trasa.json (beze změny)",
        jistota: s.prepsano ? "vysoká (změřeno)" : s.jistota })),
    };
    const text = JSON.stringify(data, null, 2);
    $("uExport").hidden = false; $("uExport").value = text;
    stahni(text, "trasa-export-" + razitko() + ".json");
  });

  // ---------- start ----------
  let p0 = "home";
  { const x = lsGet(POHLED_KEY); p0 = ["hra", "cesta", "sbirka", "tym"].includes(x) ? x : "home"; }
  ukaz(p0);
  tik();
})();
