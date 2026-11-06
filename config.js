// Nastavení hry. Upravuje učitelka. Po každé změně je potřeba vydat novou verzi (verze.ps1 bump),
// jinak se změna k telefonům nedostane. Hodnoty označené DOPLNIT / ZMĚNIT jsou zástupné.
const CONFIG = {
  // Dosah (v metrech): střípek lze chytit, když vzdálenost minus započtená nepřesnost GPS (nejvýše PRAH_M) je do PRAH_M.
  // Nepřesná GPS (>PRAH_M) tedy cíl nezpřesní, nejhůř se chytí do 2×PRAH_M.
  PRAH_M: 15,
  // Střípek se objeví na radaru, když je hráč do RADAR_M metrů.
  RADAR_M: 150,

  // PIN do učitelského režimu. ZMĚNIT. POZOR: PIN není bezpečnost, je to jen ochrana před omylem
  // (žák, který otevře zdrojový kód aplikace, ho vidí). Ruční kód a odpovědi zde nechráníme.
  PIN_UCITEL: "0000",

  // Ruční kód, kterým učitel/ka odemkne stanoviště, když telefon nemá signál GPS. ZMĚNIT.
  RUCNI_KOD: "1717",

  // Čas návratu ve tvaru "HH:MM" (dnes). DOPLNIT. Když je prázdný nebo neplatný, odpočet běží
  // od stisku „Začít“ po dobu DELKA_MIN minut.
  CAS_NAVRATU: "DOPLNIT",
  DELKA_MIN: 220, // 3 h 40 min terénní expedice podle podkladu

  // Nouzový kontakt (zobrazí se hráčům i učiteli). DOPLNIT.
  NOUZOVY_KONTAKT: { jmeno: "DOPLNIT", telefon: "" },

  // Závěrečný číselný kód zámku truhly. V podkladu CHYBÍ, doplnit při přípravě hry a ověřit.
  KONECNY_KOD: "KOD_DOPLNIT",

  // Čtyři závěrečné otázky z podkladu. V podkladu CHYBÍ, doplnit.
  ZAVERECNE_OTAZKY: [
    "OTÁZKA 1 – DOPLNIT",
    "OTÁZKA 2 – DOPLNIT",
    "OTÁZKA 3 – DOPLNIT",
    "OTÁZKA 4 – DOPLNIT",
  ],

  // Role (jeden tým, 20 žáků). Po každých ROTACE_PO stanovištích se role vystřídají.
  ROTACE_PO: 4,
  ROLE: [
    { nazev: "Navigátoři", ikona: "kompas", pocet: 3, popis: "vedou skupinu podle mapy a šipky v aplikaci" },
    { nazev: "Pátrači", ikona: "lupa", pocet: 4, popis: "hledají schránku na místě" },
    { nazev: "Luštitelé", ikona: "klic", pocet: 5, popis: "řeší úkol ze schránky" },
    { nazev: "Archiváři", ikona: "kniha", pocet: 4, popis: "zapisují písmena a odpovědi na hlavní list" },
    { nazev: "Kontrolní tým", ikona: "stit", pocet: 4, popis: "hlídají čas, bezpečnost a počet lidí ve skupině" },
  ],

  // Sbírka symbolů 17. listopadu: karta se odemkne, až hráči chytí „od“ střípků (po každém čtvrtém, shoduje se s rotací rolí).
  // Texty (bez „plny“) NESMÍ obsahovat žádnou správnou odpověď (hráči mohou chytat střípky v libovolném pořadí); kontroluje to
  // bojovka-zdroj/tools/kontrola-prozrazeni.py. Varianta „plny“ se ukáže až po splnění všech stanovišť. Texty a zdroje jsou ověřené, drž je fakticky opatrné. Ikony jsou vlastní (sada v index.html).
  SYMBOLY: [
    { id: "v", foto: "img/symboly/symbol-v.jpg", fotoAlt: "Zvednuté ruce se znakem V v davu, Praha, listopad 1989", kredit: "Foto: RobbieIanMorrison, CC BY 4.0 (Wikimedia Commons)", od: 4, ikona: "gesto-v", barva: "c-indigo", nazev: "Gesto V",
      text: "Gesto V (z anglického victory, vítězství) ukazovali lidé na shromážděních v listopadu 1989. Patří k nejznámějším symbolům sametové revoluce a najdeš ho i na pomníčku Ruce v centru Prahy.",
      zdroj: "Pamětní deska „Ruce“ v Praze; Česká televize (edu.ceskatelevize.cz)",
      plny: { text: "Gesto V (z anglického victory, vítězství) ukazovali lidé na demonstracích v listopadu 1989. Patří k nejznámějším symbolům sametové revoluce a najdeš ho i na pomníčku Ruce na Národní třídě.", zdroj: "Pamětní deska „Ruce“ na Národní třídě; Česká televize (edu.ceskatelevize.cz)" } },
    { id: "klice", foto: "img/symbol-klice.jpg", fotoAlt: "Svazek klíčů, připomínka cinkání klíči při shromážděních", kredit: "Foto: dodáno školou; připomínka cinkání klíči (nedobový snímek), původ a licence neověřeny", od: 8, ikona: "klic", barva: "c-orange", nazev: "Zvonění klíči",
      text: "Na shromážděních lidé cinkali klíči. Zvonění klíči symbolizovalo odemknutí a rozloučení s vládou jedné strany a patří k nejznámějším zvukům sametové revoluce.",
      zdroj: "expats.cz: Unlocking freedom, the symbolism of jingling keys" },
    { id: "of", od: 12, ikona: "of", barva: "c-blue", nazev: "Smajlík listopadu 1989",
      text: "Hnutí, které v listopadu 1989 vyjednávalo se státní mocí, mělo jednoduché logo: smajlík s písmenem F. Nakreslil ho student Pavel Šťastný a vyjadřovalo nadšení a optimismus.",
      zdroj: "Česká televize ČT24 (článek o vzniku loga)",
      plny: { nazev: "Logo Občanského fóra", text: "Občanské fórum bylo hnutí, které v listopadu 1989 vyjednávalo se státní mocí. Jeho logo, jednoduchý smajlík s písmenem F, nakreslil student Pavel Šťastný a vyjadřovalo nadšení a optimismus.", zdroj: "Česká televize ČT24: Logo Občanského fóra vzniklo z legrace" } },
    { id: "modlitba", od: 16, ikona: "nota", barva: "c-red", nazev: "Modlitba pro Martu",
      text: "Píseň, kterou v roce 1968 nahrála Marta Kubišová, vychází z myšlenky Komenského. V listopadu 1989 zazněla z balkonu v centru Prahy a stala se symbolem naděje a vzdoru.",
      zdroj: "Český rozhlas (Radio Prague International); Deník",
      plny: { text: "Píseň, kterou v roce 1968 nahrála Marta Kubišová, vychází z myšlenky Jana Amose Komenského. V listopadu 1989 zazněla z balkonu na Václavském náměstí a stala se symbolem naděje a svobody." } },
    { id: "svicky", foto: "img/symboly/symbol-svicky.jpg", fotoAlt: "Svíčky a květiny u pamětní desky v Praze", kredit: "Foto: Aktron, CC BY 3.0 (Wikimedia Commons), pietní akce 17. 11. 2012", od: 20, ikona: "svicka", barva: "c-orange", nazev: "Svíčky a květiny",
      text: "Na místě v Praze, kde 17. listopadu 1989 zasáhla policie proti studentům, lidé každý rok zapalují svíčky a pokládají květiny u pomníčku. Je to tichá připomínka toho, co nebylo samozřejmé.",
      zdroj: "Advokátní deník (ČAK); Praha 1",
      plny: { text: "Na Národní třídě, kde 17. listopadu 1989 zasáhla policie proti studentům, lidé každý rok zapalují svíčky a pokládají květiny u pomníčku. Je to tichá připomínka toho, že svoboda není samozřejmost." } },
  ],

  DOPIS: "Mise splněna. Obnovili jste dokument, který byl rozdělen na dvacet částí. Každá část byla důležitá, " +
    "stejně jako každý člen vašeho týmu. Historie nám připomíná, že svoboda není samozřejmost. Je spojená " +
    "s odpovědností, odvahou a ochotou zajímat se o svět kolem sebe. Děkujeme, že jste spolupracovali, " +
    "přemýšleli a nenechali se odradit překážkami.",
};
