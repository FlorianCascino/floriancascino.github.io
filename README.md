# Florian Cascino, voor TNO.

Deze site is de verdieping achter de QR-code op Florians slide voor het TNO Traineeship. De pagina blijft sober aan de oppervlakte en laat de bezoeker pas na een klik zien hoe één projectzin uit elkaar kan vallen in doorvragen, rollen en praktische frictie.

## TODO

### Blok 3, demo

- Controleer de drie projectzinnen in [script.js](/Users/floriancascino/Documents/GitHub/floriancascino.github.io/script.js) en pas ze aan als de formulering op de slide nog verschuift.
- Controleer alle doorvragen in [script.js](/Users/floriancascino/Documents/GitHub/floriancascino.github.io/script.js) op ritme en lengte.
- Controleer alle spreekzinnen in [script.js](/Users/floriancascino/Documents/GitHub/floriancascino.github.io/script.js) op geloofwaardigheid per rol.

### Footer

- Vervang de LinkedIn-placeholder in [index.html](/Users/floriancascino/Documents/GitHub/floriancascino.github.io/index.html) door de echte URL. Nu staat daar `https://www.linkedin.com/in/placeholder`.

### Figuren

- Vervang [assets/figures/variant-a.svg](/Users/floriancascino/Documents/GitHub/floriancascino.github.io/assets/figures/variant-a.svg) door een eigen scan of lijntekening.
- Vervang [assets/figures/variant-b.svg](/Users/floriancascino/Documents/GitHub/floriancascino.github.io/assets/figures/variant-b.svg) door een eigen scan of lijntekening.
- Vervang [assets/figures/variant-c.svg](/Users/floriancascino/Documents/GitHub/floriancascino.github.io/assets/figures/variant-c.svg) door een eigen scan of lijntekening.
- Vervang [assets/figures/variant-d.svg](/Users/floriancascino/Documents/GitHub/floriancascino.github.io/assets/figures/variant-d.svg) door een eigen scan of lijntekening.

## Lokaal draaien

- Open [index.html](/Users/floriancascino/Documents/GitHub/floriancascino.github.io/index.html) direct in een browser.
- Of start de map in VS Code met Live Server.

## Placeholder-SVG vervangen

- Bewerk het passende bestand in [assets/figures](/Users/floriancascino/Documents/GitHub/floriancascino.github.io/assets/figures).
- Houd bij voorkeur `viewBox="0 0 600 600"` aan.
- SVG heeft de voorkeur boven PNG. Lijnwerk blijft dan scherp.
- De pagina gebruikt dezelfde vier varianten ook als inline symbolen onderaan [index.html](/Users/floriancascino/Documents/GitHub/floriancascino.github.io/index.html). Werk die symbolen mee bij als je de assetbestanden vervangt.

## Beslissingen

- Palet: `#F4F0E8` als achtergrond, `#1A1A1A` als tekst, `#1F2D44` als dragende lijnkleur, `#B7763B` als accent en `#5C6779` als gedempte UI-kleur.
- Drie vraagstukken: warmtetransitie, netcongestie en circulaire bouw. Die combinatie laat sociale, bestuurlijke en logistieke frictie naast elkaar zien.
- Easing en timing: `200ms cubic-bezier(0.32, 0.72, 0, 1)` voor tabwissels, `300ms cubic-bezier(0.22, 1, 0.36, 1)` voor notitieblokken, `500ms cubic-bezier(0.22, 1, 0.36, 1)` voor de tweede laag, `700ms ease-out` voor de handgetekende underline en `760ms ease-out` voor de verbindingslijn.
- Underline-varianten: vier `Q`-curves met lichte verschuiving in de middenpunten. De set wisselt tussen `26/50/5`, `22/50/6`, `28/53/4` en `24/50/5` als grove verdeling over de breedte.
- Verbindingslijnen: vier cubic Bezier-varianten. Op desktop loopt de boog met control points tussen ongeveer `18%` en `72%` van de horizontale afstand. Op mobiel verschuift de boog naar kortere, meer verticale curves met kleine x-afwijking.