# Florian Cascino, voor TNO.

Een interactieve single-page website als aanvulling op de motivatiebrief voor het TNO Traineeship. De pagina laat via drie acts zien hoe Florian werkt, in plaats van erover te vertellen. De bezoeker ervaart het, en leest daarna de reflectie.

---

## Lokaal draaien

Open `index.html` in een browser, of gebruik VS Code met Live Server:

1. Installeer de extensie "Live Server" in VS Code.
2. Rechtsklik op `index.html`, kies "Open with Live Server".

Geen build-stap nodig. Alle code staat in drie bestanden: `index.html`, `style.css`, `script.js`.

---

## Overrulen van stijl of tekst

### Kleuren
Alle kleuren staan bovenaan `style.css` in CSS custom properties:
```css
--ink: #1a2d4a;    /* inktblauw, koppen en accenten */
--beige: #d6c4a8;  /* warm-beige, lijnen en subtiele accenten */
--dark: #1c1c1c;   /* warm-zwart, lopende tekst */
--bg: #faf8f4;     /* achtergrond */
```
Pas deze vier waardes aan om het hele palet te wijzigen.

### Typografie
Koppen gebruiken Georgia (systeemfont). Broodtekst gebruikt Inter via Google Fonts. Om Inter te vervangen: pas de `<link>` in `index.html` aan en wijzig `--font-body` in `style.css`.

### Tekst op de pagina
Alle zichtbare Nederlandse tekst staat letterlijk in `index.html` (HTML) en `script.js` (de act-1 zinnen, act-2 ranges, en act-3 observaties). Zoek op de tekst en vervang.

---

## Wat nog PLACEHOLDER is

- LinkedIn-URL in de signoff-sectie (staat nu op `https://linkedin.com/in/PLACEHOLDER`).
- Datum laatste update (staat op "april 2026").

---

## Decisions

Keuzes die gemaakt zijn en die Florian kan willen aanpassen.

### Kleurenpalet
Het voorgestelde palet uit het prompt is ongewijzigd overgenomen: inktblauw `#1a2d4a`, warm-beige `#d6c4a8`, warm-zwart `#1c1c1c`, achtergrond `#faf8f4`. Contrast van `--dark` op `--bg` is ruim boven WCAG AA (>12:1). `--ink` op `--bg` haalt 9.4:1. `--beige` op `--bg` is 2.3:1, daarom alleen gebruikt voor decoratieve lijnen, nooit voor tekst.

### Hero-lijn
Een SVG-pad dat zichzelf tekent via `stroke-dasharray`/`stroke-dashoffset` over 4.5 seconden met ease-in-out. De lijn heeft een knik op 48% van de breedte (10% omhoog). Adembeweging: sinusgolf met amplitude 3px en frequentie ~0.015 rad/frame. Desktop: snelle muisbewegingen verhogen `fragmentation` (0 tot 1), wat de lijn in streepjes opbreekt. Stilstand heelt met factor 0.96/frame. Deze waardes staan bovenaan de hero-sectie in `script.js`.

### Custom cursor
Open cirkel van 8px, groeit naar 14px op interactieve elementen. Alleen op apparaten met `pointer: fine`. Op touch-apparaten: standaard systeemcursor plus een subtiele opacity-pulse bij tap (CSS `@keyframes tap-pulse`). De groei-transitie is 200ms ease.

### Act 1 state machine
Vijf zinnen op een schaal van breed naar scherp, index 0 tot 4. Startindex 2. De knoppen "breder" en "scherper" worden visueel uitgeschakeld (`opacity: 0.25`) aan de randen. Cross-fade is 400ms totaal (200ms fade-out, tekst wissel, 200ms fade-in). De labels van "wiens vraag" zijn absoluut gepositioneerd rond de hoofdzin met vaste offsets per label.

### Act 2 slider
Het "ik"-streepje staat vast op `left: 65%` en beweegt niet met de slider-thumb. Dat is bewust: de reflectietekst eronder verwijst naar "iets voorbij het midden". De tekst-fade is 250ms (125ms uit, 125ms in). De vijf tekstranges zijn hard gecodeerd in `script.js` als `act2Ranges`.

### Act 3 spring physics
Parameters:
- `SPRING_K = 0.003` (veerstijfheid tussen verbonden nodes)
- `REST_K = 0.02` (terugkeer naar rustpositie)
- `DAMPING = 0.88` (snelheidsdemping per frame)
- `COLLINEAR_K = 0.015` (anti-collineaire kracht, duwt nodes uit lijn als ze te recht staan)
- Drempel voor anti-collineaire kracht: 40px loodrechte afstand.
- Nodes zijn beperkt tot 30 tot 370 horizontaal, 30 tot 330 verticaal (binnen de SVG viewBox van 400x360).

De physics-loop pauzeert via IntersectionObserver wanneer Act 3 buiten beeld is. Bij `prefers-reduced-motion`: geen physics, statische posities, observaties direct zichtbaar bij focus.

Drag werkt via `mousedown`/`touchstart` op de node-groepen. Tijdens drag is de node vast en worden de andere nodes nog steeds door veren getrokken. Bij loslaten begint de terugkeer naar de rustpositie.

Hit-areas voor de lijnen zijn onzichtbare paden met `stroke-width: 24` achter de zichtbare lijnen.

### Paginagewicht
HTML + CSS + JS samen rond 25KB. Inter font (woff2) rond 80KB. Totaal ruim onder 500KB.