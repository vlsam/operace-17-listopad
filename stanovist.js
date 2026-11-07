// Generováno skriptem tools/build-data.py z trasa.json a zadání. Needitovat ručně.
// Odpovědi jsou jen jako SHA-256 z "<id>|<odpověď bez diakritiky, malými, jen a-z0-9>".
const TRASA_VERZE = "ostra-20"; // NEOVĚŘENO v terénu
const VETA_MEZERY = [7, 2, 11];
const STANOVISTE = [
 {
  "id": 1,
  "nazev": "Bod 1",
  "lat": 48.8617578,
  "lng": 17.1365667,
  "mistoPopis": "Souřadnice zadal uživatel. Přesné umístění schránky určí učitelka na místě.",
  "jistota": "zadáno uživatelem, neověřeno v terénu",
  "zadani": "Doplňte slovo do věty: „Možnost vyjadřovat názory a rozhodovat o svém životě nazýváme…“",
  "pismeno": "S",
  "napoveda": [
   "Odpověď má celkem 7 písmen.",
   "Odpověď začíná na „S“."
  ],
  "hash": [
   "3cc76e3d2b8615131d1e7e192c42d99a043d417a5cb291645b7a4773513f3e44"
  ]
 },
 {
  "id": 2,
  "nazev": "Bod 2",
  "lat": 48.8629506,
  "lng": 17.1416419,
  "mistoPopis": "Souřadnice zadal uživatel. Přesné umístění schránky určí učitelka na místě.",
  "jistota": "zadáno uživatelem, neověřeno v terénu",
  "zadani": "17. listopadu 1939 nacisté uzavřeli české ________. Doplňte dvě slova.",
  "pismeno": "V",
  "napoveda": [
   "Odpověď má celkem 11 písmen (bez mezer).",
   "Odpověď začíná na „V“."
  ],
  "hash": [
   "d9fcbda1d7a7b62f9a7ea3f1a121734a5c1c8031ad3a7293b4b5210ae6dfe3f7"
  ]
 },
 {
  "id": 3,
  "nazev": "Bod 3",
  "lat": 48.8635792,
  "lng": 17.1417208,
  "mistoPopis": "Souřadnice zadal uživatel. Přesné umístění schránky určí učitelka na místě.",
  "jistota": "zadáno uživatelem, neověřeno v terénu",
  "zadani": "Student medicíny, který byl postřelen při demonstraci 28. října 1939 a později zemřel, se jmenoval Jan ________.",
  "pismeno": "O",
  "napoveda": [
   "Odpověď má celkem 7 písmen.",
   "Odpověď začíná na „O“."
  ],
  "hash": [
   "040422e695df3911f28e19b4348d1d5afc291339a1def206fc3a2fa61cece39e",
   "7560440f6fd4aa5cf58b08f4eef9695b310d7e10e3a5a8ecc4a75e5ec43dc804"
  ]
 },
 {
  "id": 4,
  "nazev": "Bod 4",
  "lat": 48.8634939,
  "lng": 17.1433242,
  "mistoPopis": "Souřadnice zadal uživatel. Přesné umístění schránky určí učitelka na místě.",
  "jistota": "zadáno uživatelem, neověřeno v terénu",
  "zadani": "Které moravské město je spojeno s českými univerzitami a studentským životem? Nápověda: začíná na B.",
  "pismeno": "B",
  "napoveda": [
   "Odpověď má celkem 4 písmen.",
   "Odpověď začíná na „B“."
  ],
  "hash": [
   "0312e18c559d6e4065592c4405bd8de307e17efd241213443227e92b7c5e909a"
  ]
 },
 {
  "id": 5,
  "nazev": "Bod 5",
  "lat": 48.8621117,
  "lng": 17.1444936,
  "mistoPopis": "Souřadnice zadal uživatel. Přesné umístění schránky určí učitelka na místě.",
  "jistota": "zadáno uživatelem, neověřeno v terénu",
  "zadani": "Doplňte větu: „Studenti, herci i další ________ veřejně vyjadřovali nesouhlas s režimem.“",
  "pismeno": "O",
  "napoveda": [
   "Odpověď má celkem 6 písmen.",
   "Odpověď začíná na „O“."
  ],
  "hash": [
   "a2734844dcf60813c42237b5447e9eed2a16d7b6c14e6fbaa1962311e651069c"
  ]
 },
 {
  "id": 6,
  "nazev": "Bod 6",
  "lat": 48.8604881,
  "lng": 17.1434067,
  "mistoPopis": "Souřadnice zadal uživatel. Přesné umístění schránky určí učitelka na místě.",
  "jistota": "zadáno uživatelem, neověřeno v terénu",
  "zadani": "Jak se nazývá systém, v němž občané mohou volit své zástupce a svobodně kritizovat vládu?",
  "pismeno": "D",
  "napoveda": [
   "Odpověď má celkem 10 písmen.",
   "Odpověď začíná na „D“."
  ],
  "hash": [
   "9e8f2165904d9141ba9ef4d44483ba8c4e56e945ffd8e758c15b579a17b80d8e"
  ]
 },
 {
  "id": 7,
  "nazev": "Bod 7",
  "lat": 48.8559044,
  "lng": 17.1354281,
  "mistoPopis": "Souřadnice zadal uživatel. Přesné umístění schránky určí učitelka na místě.",
  "jistota": "zadáno uživatelem, neověřeno v terénu",
  "zadani": "Studentská vzpomínková akce 17. listopadu 1989 začala v Praze na místě, jehož název začíná písmenem A.",
  "pismeno": "A",
  "napoveda": [
   "Odpověď má celkem 8 písmen.",
   "Odpověď začíná na „A“."
  ],
  "hash": [
   "e4b3b870813d1fc19df4610ee7b4a4c3133ca821f498254c3a4744bb4a09b181"
  ]
 },
 {
  "id": 8,
  "nazev": "Bod 8",
  "lat": 48.8534283,
  "lng": 17.1358108,
  "mistoPopis": "Souřadnice zadal uživatel. Přesné umístění schránky určí učitelka na místě.",
  "jistota": "zadáno uživatelem, neověřeno v terénu",
  "zadani": "Doplňte křestní jméno studenta Opletala.",
  "pismeno": "J",
  "napoveda": [
   "Odpověď má celkem 3 písmen.",
   "Odpověď začíná na „J“."
  ],
  "hash": [
   "ce705ca5267b3dbe80b596dd9ffb3605d5b0ab21733991585e95cc22759e7863"
  ]
 },
 {
  "id": 9,
  "nazev": "Bod 9",
  "lat": 48.8508186,
  "lng": 17.1332544,
  "mistoPopis": "Souřadnice zadal uživatel. Přesné umístění schránky určí učitelka na místě.",
  "jistota": "zadáno uživatelem, neověřeno v terénu",
  "zadani": "Jak se nazývá soubor zásad, který pomáhá rozlišovat odpovědné a neodpovědné jednání? Nápověda: začíná na E.",
  "pismeno": "E",
  "napoveda": [
   "Odpověď má celkem 5 písmen.",
   "Odpověď začíná na „E“."
  ],
  "hash": [
   "ee1c3f1f8f8938d901c773107df2bb9b67f42aae615a6fd3019ce72445e0fe13"
  ]
 },
 {
  "id": 10,
  "nazev": "Bod 10",
  "lat": 48.8498572,
  "lng": 17.1300031,
  "mistoPopis": "Souřadnice zadal uživatel. Přesné umístění schránky určí učitelka na místě.",
  "jistota": "zadáno uživatelem, neověřeno v terénu",
  "zadani": "Doplňte pojem: „Aktivní a odpovědná ________ společnost.“ Nápověda: první slovo začíná na O.",
  "pismeno": "O",
  "napoveda": [
   "Odpověď má celkem 8 písmen.",
   "Odpověď začíná na „O“."
  ],
  "hash": [
   "9736f96c6586a93ba7b8a8a07a6e3fd589424564c936eed75eed0000d7b493c1"
  ]
 },
 {
  "id": 11,
  "nazev": "Bod 11",
  "lat": 48.8483672,
  "lng": 17.1282972,
  "mistoPopis": "Souřadnice zadal uživatel. Přesné umístění schránky určí učitelka na místě.",
  "jistota": "zadáno uživatelem, neověřeno v terénu",
  "zadani": "Jak se nazývá veřejné shromáždění, na kterém lidé vyjadřují své požadavky?",
  "pismeno": "D",
  "napoveda": [
   "Odpověď má celkem 11 písmen.",
   "Odpověď začíná na „D“."
  ],
  "hash": [
   "a1940cbe69c80d9b415e2b9f7b572f272c89622f9355e20c5cae9f9840baf59b"
  ]
 },
 {
  "id": 12,
  "nazev": "Bod 12",
  "lat": 48.8493469,
  "lng": 17.1282331,
  "mistoPopis": "Souřadnice zadal uživatel. Přesné umístění schránky určí učitelka na místě.",
  "jistota": "zadáno uživatelem, neověřeno v terénu",
  "zadani": "Jak se říká veřejným sdělením na papíře, která se vyvěšují na zdech a nástěnkách? Začíná na P.",
  "pismeno": "P",
  "napoveda": [
   "Odpověď má celkem 7 písmen.",
   "Odpověď začíná na „P“."
  ],
  "hash": [
   "b9a0d3e62d206916b03f8ad65dae76fb5efc19db965324ac4ead71875c3427e2",
   "de97855b7fbb0f4deea00ed60a94d29c04f37b06a3de272352e6135eb212fccb"
  ]
 },
 {
  "id": 13,
  "nazev": "Bod 13",
  "lat": 48.8514358,
  "lng": 17.1273747,
  "mistoPopis": "Souřadnice zadal uživatel. Přesné umístění schránky určí učitelka na místě.",
  "jistota": "zadáno uživatelem, neověřeno v terénu",
  "zadani": "V listopadu 1989 vzniklo hnutí s názvem Občanské ________.",
  "pismeno": "O",
  "napoveda": [
   "Odpověď má celkem 5 písmen.",
   "Odpověď začíná na „F“."
  ],
  "hash": [
   "134a006be5d0582e21a762d12950d24c2a692c5d2e592db8a2e865e1bb94e2f6",
   "b22b4c66bf2e9ff6f623e4350e0a3f1f7e8352ee827a9c4372297d24c3715a97"
  ]
 },
 {
  "id": 14,
  "nazev": "Bod 14",
  "lat": 48.8531067,
  "lng": 17.1262661,
  "mistoPopis": "Souřadnice zadal uživatel. Přesné umístění schránky určí učitelka na místě.",
  "jistota": "zadáno uživatelem, neověřeno v terénu",
  "zadani": "Dramatik a disident, který se stal prezidentem Československa, se jmenoval ________ Havel.",
  "pismeno": "V",
  "napoveda": [
   "Odpověď má celkem 6 písmen.",
   "Odpověď začíná na „V“."
  ],
  "hash": [
   "6bafe7faa11d3ecf9798a3160a8c2746f5f64554ccf655ff36f7f03b41d98b83",
   "a25fbd54a2a129d70b14babb8505d1c7220ede9994b6fbbf9d2d589cc125fee2"
  ]
 },
 {
  "id": 15,
  "nazev": "Bod 15",
  "lat": 48.8538217,
  "lng": 17.1256731,
  "mistoPopis": "Souřadnice zadal uživatel. Přesné umístění schránky určí učitelka na místě.",
  "jistota": "zadáno uživatelem, neověřeno v terénu",
  "zadani": "V závěrečné zprávě chybí slovo ODPOVĚDNOST. Které písmeno je v tomto slově šesté? (Počítejte: O-D-P-O-V-Ě…)",
  "pismeno": "Ě",
  "napoveda": [
   "Odpovědí je jedno písmeno.",
   "Počítejte písmena slova ODPOVĚDNOST: O (1), D (2), P (3), O (4), V (5)… a šesté je to, které následuje."
  ],
  "hash": [
   "2bfff3ec7b74b1c3553a07b58f3c5864ca1e9f1c0263c194a0068672f12c9540"
  ]
 },
 {
  "id": 16,
  "nazev": "Bod 16",
  "lat": 48.8556189,
  "lng": 17.1236881,
  "mistoPopis": "Souřadnice zadal uživatel. Přesné umístění schránky určí učitelka na místě.",
  "jistota": "zadáno uživatelem, neověřeno v terénu",
  "zadani": "Jak se nazývá člověk, který otevřeně vystupoval proti režimu? Začíná na D.",
  "pismeno": "D",
  "napoveda": [
   "Odpověď má celkem 8 písmen.",
   "Odpověď začíná na „D“."
  ],
  "hash": [
   "5c269ecdab533465aff1ab6ebeab3d2ef8a974c259e9bb8fc5f2a88cb7a11b07"
  ]
 },
 {
  "id": 17,
  "nazev": "Bod 17",
  "lat": 48.8569689,
  "lng": 17.1258189,
  "mistoPopis": "Souřadnice zadal uživatel. Přesné umístění schránky určí učitelka na místě.",
  "jistota": "zadáno uživatelem, neověřeno v terénu",
  "zadani": "Na které pražské ulici došlo 17. listopadu 1989 k policejnímu zásahu proti demonstrantům?",
  "pismeno": "N",
  "napoveda": [
   "Odpověď má celkem 12 písmen (bez mezer).",
   "Odpověď začíná na „N“."
  ],
  "hash": [
   "8a541707fcb9271dd011380879d5e3319ec59060660852d6fa0a98d038111da3",
   "95812a2aa01b16c58f403dfad8f88e5964dd3277e09e2ca84340665e8c663c1c",
   "c08517751ce2279917828fecab3329494c2322245d677dbb11921bae5e47ab43"
  ]
 },
 {
  "id": 18,
  "nazev": "Bod 18",
  "lat": 48.8574631,
  "lng": 17.1284283,
  "mistoPopis": "Souřadnice zadal uživatel. Přesné umístění schránky určí učitelka na místě.",
  "jistota": "zadáno uživatelem, neověřeno v terénu",
  "zadani": "Jak se nazývá schopnost jednat navzdory strachu a upozornit na nespravedlnost? Začíná na O.",
  "pismeno": "O",
  "napoveda": [
   "Odpověď má celkem 6 písmen.",
   "Odpověď začíná na „O“."
  ],
  "hash": [
   "11a61505eae2b3460d6662bc51c4a93ef7e0e617f0424c1b8627c62a55cf12e9"
  ]
 },
 {
  "id": 19,
  "nazev": "Bod 19",
  "lat": 48.8595478,
  "lng": 17.136165,
  "mistoPopis": "Souřadnice zadal uživatel. Přesné umístění schránky určí učitelka na místě.",
  "jistota": "zadáno uživatelem, neověřeno v terénu",
  "zadani": "Jak se nazývá organizované přerušení práce nebo studia na podporu požadavků?",
  "pismeno": "S",
  "napoveda": [
   "Odpověď má celkem 6 písmen.",
   "Odpověď začíná na „S“."
  ],
  "hash": [
   "c454efca84aec473781fbbd630b5114e0b9bd4935ec2acc9a8b6740d8014da5b"
  ]
 },
 {
  "id": 20,
  "nazev": "Bod 20",
  "lat": 48.8627392,
  "lng": 17.1366775,
  "mistoPopis": "Souřadnice zadal uživatel. Přesné umístění schránky určí učitelka na místě.",
  "jistota": "zadáno uživatelem, neověřeno v terénu",
  "zadani": "Jak se nazývá schopnost respektovat rozdílné názory a odlišnosti? Začíná na T.",
  "pismeno": "T",
  "napoveda": [
   "Odpověď má celkem 9 písmen.",
   "Odpověď začíná na „T“."
  ],
  "hash": [
   "188e62fea3ac34679170476904206f00f0ef94f8eff7dcddedc3340584e85299"
  ]
 }
];
