# Florian Cascino, voor TNO.

Deze site is de verdieping achter de QR-code op Florians TNO-slide. De pagina herhaalt de slide niet, maar voert in kleine vorm uit waar zijn onderzoek naar twijfel in innovatiepraktijk over gaat: aannames zichtbaar maken, en mensen die die aannames erven uitnodigen om er hardop over te twijfelen.

## PLACEHOLDER

### Section 4, De twee directe antwoorden

- Hoe ik impact maak: `[PLACEHOLDER, Florian schrijft hier het impactantwoord uit de slide, in iets uitgebreidere vorm.]`
- Wat ik over mezelf wil leren: `[PLACEHOLDER, Florian schrijft hier het leerantwoord uit de slide, in iets uitgebreidere vorm.]`

### Footer

- LinkedIn-URL in `index.html`, de link staat nu op `https://www.linkedin.com/in/placeholder`

## TODO

### Section 2, De vormeigenaren

- Vervang `assets/figures/beleidsmaker-gemeente.svg` door een ingescande handtekening of definitieve lijntekening
- Vervang `assets/figures/netbeheerder.svg` door een ingescande handtekening of definitieve lijntekening
- Vervang `assets/figures/mkb-ondernemer.svg` door een ingescande handtekening of definitieve lijntekening
- Vervang `assets/figures/buurtbewoner.svg` door een ingescande handtekening of definitieve lijntekening

## EDITABLE

### Hero

- `Een korte verkenning, gebaseerd op mijn Honours-onderzoek naar twijfel in innovatiepraktijk.`

### Section 1, De aannamekaart

- Kop: `Lees deze projectomschrijving zoals een vormeigenaar dat doet.`
- Caption: `Vormeigenaren zijn de mensen die de aannames van een project erven, niet bedacht hebben. Bij TNO zijn dat vaak de mensen die later in een traject instromen. Specialisten, beleidsmakers, bewoners, klanten.`
- Projectzin: `We onderzoeken hoe een bedrijventerrein een lokale energiehub kan vormen, omdat het net vol zit en de ondernemers willen verduurzamen.`
- Reveal label `lokale`: `aanname: de schaal staat al vast.`
- Reveal label `net`: `aanname: één stem bepaalt wat 'vol' betekent.`
- Reveal label `ondernemers`: `aanname: deze rol vertegenwoordigt het terrein.`
- Reveal label `willen`: `aanname: deze richting is al gekozen.`
- Reveal label `energiehub`: `aanname: de oplossing zit al in de vraag.`
- Mechanisme `containment`: `Het mechanisme: containment. Twijfel verdwijnt vaak in de eis dat het al meetbaar moet zijn.`
- Mechanisme `legitimatie`: `Het mechanisme: legitimatie. Wiens twijfel telt als informatie, en wiens niet.`
- Mechanisme `lokalisatie van veiligheid`: `Het mechanisme: lokalisatie van veiligheid. Twijfel blijft in kleine kringen hangen.`
- Mechanisme `affectieve escalatie`: `Het mechanisme: affectieve escalatie. Hoe verder in een traject, hoe duurder twijfel persoonlijk wordt.`
- Mechanisme `gemiste reframing`: `Het mechanisme: gemiste reframing. De vraag is al beantwoord voordat ze gesteld is.`
- CTA-tekst: `Nodig de vormeigenaren uit om mee te twijfelen`

### Section 2, De vormeigenaren

- Kop: `Vier vormeigenaren betreden de tekening.`
- Caption: `Elk spreekt één twijfel uit, geformuleerd als een recht. De rechten komen uit een pamflet dat ik tijdens mijn onderzoek schreef voor mensen die werken binnen organisaties die al vorm hebben gekregen.`
- Speech `BELEIDSMAKER GEMEENTE`: `Ik mag hardop twijfelen of 'lokaal' onze grens is.`
- Speech `NETBEHEERDER`: `Ik mag niet weten of 'vol' over een jaar nog klopt.`
- Speech `MKB-ONDERNEMER`: `Ik mag vroeg twijfelen of 'verduurzamen' hier hetzelfde betekent als bij ons.`
- Speech `BUURTBEWONER`: `Ik mag vragen of de hub iemand vergeet die er ook woont.`
- Ochre regel: `De zin is een kaart geworden. Dit is het werk waar ik bij TNO aan wil bijdragen.`

### Section 3, Wat dit kleine ding net deed

- Kop: `Wat dit kleine ding net deed.`
- Paragraaf: `Bovenstaand is een werkdemo, geen presentatie. De woorden in een projectzin zijn aannames die ergens vandaan komen. Mijn werk is om die aannames zichtbaar te maken, en de mensen die ze erven uit te nodigen om er hardop over te twijfelen, in een ruimte die voor die twijfel ontworpen is. Dat is wat ik in een traineeship bij TNO verder wil leren ontwerpen.`

## Lokaal draaien

- Open `index.html` direct in een browser.
- Of start de map in VS Code met Live Server.

## SVG vervangen door handtekening

- De placeholderfiguren staan in `assets/figures/`.
- Houd voor een vervangende figuur bij voorkeur een `viewBox` van ongeveer `0 0 600 600` aan.
- Gebruik bij andere schetsen ongeveer `400 x 300` als uitgangspunt.
- SVG heeft de voorkeur boven PNG, omdat lijnwerk dan scherp blijft op mobiel en desktop.
- Als je een scan vervangt, behoud dan de bestandsnaam zodat `index.html` niet hoeft te veranderen.
- Als PNG toch nodig is, gebruik een transparante achtergrond en houd de beeldverhouding van het huidige bestand aan.

## Decisions

- Kleurenpalet: achtergrond `#F4F0E8`, tekst `#1A1A1A`, dusty navy `#1F2D44`, warm ochre `#B7763B`
- Gekozen TNO-domein in de werkzin: energie en materiaaltransities, uitgewerkt als lokale energiehub
- Easing en timing: 200ms `ease` voor link- en woordinteractie, 300ms `ease` voor figuur- en slotregels, 400ms `ease` voor de CTA-onthulling