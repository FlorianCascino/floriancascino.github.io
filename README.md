# Voorbij wat je weet

Een interactieve single-page website als aanvulling op de slide voor het TNO Traineeship. De pagina draait om een ervaringsboog met drie spanningen: de aantrekkingskracht van het bekende, de weerstand van de overgang, en de noodzaak van collectieve stabiliteit.

De site bestaat uit twee lagen:

- een full-screen canvaservaring met framing, fase-indicatoren en een zichtbaar spanningsveld rond de comfortzone
- een afsluitende sectie die pas beschikbaar wordt wanneer het netwerk zichzelf kan dragen

## Lokaal draaien

Open `index.html` direct in een browser, of start een eenvoudige lokale server. Er is geen build-stap en geen framework.

## Bestandsopzet

- `index.html`: paginastructuur, overlays voor fase en stabiliteit, en afsluitende sectie
- `style.css`: volledige visuele stijl, layout, state-based overlays en unlock states
- `script.js`: canvasanimatie, particle system, fase-aansturing en collectieve ontgrendeling

## Interactielogica

De animatie heeft nu vier explicietere fases:

1. Het bekende. Een centrale groep punten ademt rustig en reageert sterk zolang de cursor of vinger in de vertrouwde ruimte blijft.
2. De drempel. Richting de buitenrand neemt die directe respons af. Een spanningsveld en subtiele hint maken voelbaar dat uit het bekende treden weerstand kost.
3. De overgang. Wie lang genoeg in die weerstand blijft, laat punten loskomen uit het cluster. Sporen en veldlijnen maken zichtbaar dat er echt een transitie plaatsvindt.
4. Samen dragen. Vrijgekomen punten kunnen worden opgenomen in een netwerk, maar tellen pas echt mee als ze door meerdere verbindingen worden gedragen. Pas wanneer genoeg punten onderling stabiel zijn en er wederkerige structuren ontstaan, wordt de outro ontgrendeld.

## Belangrijkste parameters

Zoek in `script.js` naar deze variabelen als je het gedrag wilt bijstellen:

- `particleCount`: aantal punten in het systeem
- `dwellThreshold`: hoe lang iemand in de weerstand moet blijven voor de overgang start
- `collectiveTarget`: hoeveel dragende punten nodig zijn voor ontgrendeling
- `triangleTarget`: hoeveel wederkerige structuren minimaal moeten ontstaan
- `hintDelay`: wanneer de eerste subtiele hint verschijnt
- `interactiveRadius` en `voidRadius`: bepalen waar de comfortzone eindigt en waar de echte leegte begint

## Inhoud aanpassen

Zichtbare tekst staat op drie plekken:

- `index.html`: framingtekst, fasekoppen, afsluitende tekst en contactgegevens
- `script.js`: dynamische hintteksten, fase-ondertitels en unlock-zin
- `style.css`: alleen stijl, geen inhoud

## Open punt

De afsluitende sectie bevat nu alleen een e-mailadres en een korte profielregel. Als er nog een definitieve LinkedIn-url of andere contactregel moet worden toegevoegd, hoort die in `index.html`.