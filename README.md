# De Naad — Florian Cascino

Een enkele pagina voor het TNO Traineeship. De pagina zit achter een QR-code op een PowerPoint-slide en laat zien hoe Florian werkt: op de naad tussen techniek, beleid en gedrag. Vier scènes uit zijn werk en onderzoek, rustig en eerlijk verteld.

---

## Wat Florian nog moet invullen

Alle tekst die hieronder staat moet door Florian zelf worden geschreven. De items staan in de HTML als `[PLACEHOLDER — ...]` blokken met een lichte achtergrond.

### Scene 1 — Bij de Deltawerken
1. Twee tot drie zinnen over het werk bij de Deltawerken (wat was de situatie, wat viel op, waar zat de naad).

### Scene 2 — Bij de Rabobank
2. Één zin over een keuze die Florian maakte bij de Rabobank (de "voor"-versie).
3. Één zin over hoe hij die keuze een jaar later zag (de "na"-versie).

### Scene 3 — Wat ik nu onderzoek
4. Korte alinea in gewoon Nederlands over het Honours-onderzoek naar twijfel in innovatiepraktijk.
5. Drie geanonimiseerde interviewcitaten.
6. Eén zin: de onderzoeksvraag die Florian zelf onderzoekt.

### Scene 4 — Wat ik bij TNO zoek
7. Eén zin: wat ik wil bijdragen.
8. Eén zin: wat ik wil leren.
9. Eén zin: de vraag die ik bij het gesprek wil stellen.

### Footer
10. LinkedIn-URL invullen (nu staat er "PLACEHOLDER").
11. Datum van laatste update controleren.

### TODO: schetsen
12. **Scene 1 SVG-schets**: vervang de placeholder-SVG in `index.html` door een eigen handtekening. Zie hieronder voor instructies.

---

## Lokaal draaien

Open `index.html` in een browser, of gebruik VS Code met de Live Server-extensie:

1. Installeer de extensie "Live Server" in VS Code.
2. Klik rechts op `index.html` en kies "Open with Live Server".

Er is geen build-stap nodig.

---

## Een placeholder-schets vervangen door een eigen tekening

### Optie A: SVG (aanbevolen)
1. Teken de schets op papier en scan of fotografeer deze.
2. Gebruik een tool als [SVGTrace](https://svgtrace.com) of Illustrator om er een SVG van te maken.
3. Zorg dat de SVG een `viewBox` heeft (bv. `viewBox="0 0 400 300"`).
4. Open `index.html` en zoek naar `<!-- TODO: Vervang deze placeholder-SVG -->`.
5. Vervang de hele `<svg class="sketch" ...>...</svg>` door de eigen SVG. Houd `class="sketch"` en het `role="img"` attribuut.
6. Pas de `aria-label` aan zodat deze beschrijft wat de tekening laat zien.

### Optie B: PNG/JPG
1. Scan de tekening op minimaal 800px breed.
2. Sla het bestand op als `delta-schets.png` in de root van het project.
3. Vervang de `<svg>` door: `<img src="delta-schets.png" alt="Schets van een waterkering in doorsnede." class="sketch">`.
4. Houd het bestand onder 200KB voor de totale pagina-grootte.

SVG heeft de voorkeur: schaalbaar, licht, en past bij de rest van de pagina.

---

## Beslissingen

Hieronder staan keuzes die gemaakt zijn. Pas ze aan als ze niet passen.

**Kleurenpalet**
- Dusty navy: `#3A5169` — hoofdkleur voor koppen, knoppen, en de tekening.
- Warm zand: `#C49A6C` — accentkleur voor randen en de slider-track. Niet gebruikt voor lopende tekst (te laag contrast).
- Donker: `#1D1D2B` — voor broodtekst.
- Achtergrond: `#F6F3EF` — warm wit.

**Typografie**
- Georgia voor de hero-zin en sectiekoppen.
- Inter (Google Fonts, 400 en 500) voor broodtekst.
- Fallback-stack voor beide.

**Hero-animatie**
- Drie wolken van kleine stippen op een canvas. Drijven langzaam in een lissajous-achtig patroon.
- Desktop: volgen de muis met traagheid. Mobiel: proberen device-orientation te gebruiken, anders alleen drift. Touch-input werkt ook.
- Bij `prefers-reduced-motion`: statische stippen, geen beweging.
- Easing: 0.018 per frame als inertiefactor. Voelt rustig, niet plakkerig.

**Slider (Scene 1)**
- De drie SVG-lagen verschuiven verticaal op basis van de slider-waarde. Midden (50) = uitgelijnde standaardpositie. Naar de randen toe drijven de lagen uit elkaar.
- Maximale verschuiving: 22px per laag.

**Cross-fade (Scene 2)**
- Wissel via CSS opacity + max-height. Geen JavaScript-animatiebibliotheek.
- Knoptekst wisselt mee: "en zo zag ik het een jaar later." ↔ "en zo zag ik het daarvoor."

**Scroll fade-in**
- IntersectionObserver met threshold 0.12. Eenmalig: zodra zichtbaar, blijft zichtbaar.
- Uitgeschakeld bij `prefers-reduced-motion`.

**Paginagewicht**
- HTML + CSS + JS samen onder 15KB. Inter font (woff2) rond 80KB. Totaal ruim onder 500KB.