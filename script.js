(function () {
    'use strict';

    var SVG_NS = 'http://www.w3.org/2000/svg';
    var XLINK_NS = 'http://www.w3.org/1999/xlink';
    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var desktopMedia = window.matchMedia('(min-width: 900px)');
    var stage = document.getElementById('demo-stage');
    var tabButtons = Array.prototype.slice.call(document.querySelectorAll('.demo-tab'));
    var activeIndex = 0;
    var isTransitioning = false;
    var touchState = null;
    var scenarioStates;
    var scenarios;
    var previewConfig = parsePreviewConfig();

    if (!stage || !tabButtons.length) {
        return;
    }

    scenarios = [
        {
            id: 'warmtetransitie',
            lead: 'Als ik morgen aan dit vraagstuk zou beginnen, zijn dit de woorden waar ik zelf als eerste bij zou doorvragen.',
            segments: [
                { text: 'We onderzoeken hoe een naoorlogse wijk ' },
                { passage: 'collectief' },
                { text: ' op een lokaal warmtenet, zodat we de ' },
                { passage: 'klimaatdoelen' },
                { text: ' van 2030 halen en de ' },
                { passage: 'infrastructuur' },
                { text: ' ' },
                { passage: 'efficient' },
                { text: '.' }
            ],
            passages: [
                {
                    key: 'collectief',
                    visible: 'collectief kan overstappen',
                    aria: 'collectief kan overstappen',
                    question: 'Gaan we hier uit van een bereidheid tot samenwerken die we buiten deze vergaderkamer nog niet in de praktijk hebben getoetst?',
                    role: 'woningcorporatie',
                    speech: 'Mijn handtekening onder een technische belofte is nog geen garantie dat mijn huurders straks ook de deur opendoen.',
                    variant: 'a',
                    pathVariant: 0
                },
                {
                    key: 'klimaatdoelen',
                    visible: 'klimaatdoelen',
                    aria: 'klimaatdoelen',
                    question: 'Dwingt deze stip op de horizon ons nu al tot keuzes waar we straks te diep in zitten om nog de koers te verleggen?',
                    role: 'lokale aannemer',
                    speech: 'Het strakke tempo van de gemeente houdt helaas geen rekening met de schaarste aan vakmensen in mijn eigen agenda.',
                    variant: 'b',
                    pathVariant: 1
                },
                {
                    key: 'infrastructuur',
                    visible: 'infrastructuur',
                    aria: 'infrastructuur',
                    question: 'Vragen we hier al om een strakke technische blauwdruk, terwijl we de sociale impact achter de voordeur nog niet in kaart hebben?',
                    role: 'netbeheerder',
                    speech: 'De ondergrond op deze tekentafel is een stuk overzichtelijker dan de oude kabels en leidingen die we buiten in de wijk tegenkomen.',
                    variant: 'c',
                    pathVariant: 2
                },
                {
                    key: 'efficient',
                    visible: 'efficiënt benutten',
                    aria: 'efficiënt benutten',
                    question: 'Wiens nuchtere blik op de haalbaarheid wordt hier overstemd door de wens om een perfect sluitende businesscase te presenteren?',
                    role: 'huurder',
                    speech: 'Ik hoor pas over deze plannen op het moment dat de oplossingsrichting voor mijn straat al onomkeerbaar lijkt.',
                    variant: 'd',
                    pathVariant: 3
                }
            ]
        },
        {
            id: 'netcongestie',
            lead: 'Als ik morgen aan dit vraagstuk zou beginnen, zijn dit de woorden waar ik zelf als eerste bij zou doorvragen.',
            segments: [
                { text: 'We ontwerpen een ' },
                { passage: 'lokaal' },
                { text: ' voor een bedrijventerrein, zodat ' },
                { passage: 'ondernemers' },
                { text: ' ' },
                { passage: 'uitwisselen' },
                { text: ' en we de ' },
                { passage: 'overbelasting' },
                { text: ' van het elektriciteitsnet oplossen.' }
            ],
            passages: [
                {
                    key: 'lokaal',
                    visible: 'lokaal energiesysteem',
                    aria: 'lokaal energiesysteem',
                    question: 'Vangen we het vraagstuk hier te vroeg in een technisch model, terwijl de voorwaarden om lokaal te willen delen nog ontbreken?',
                    role: 'ondernemersvereniging',
                    speech: 'We overschatten in deze eerste ontwerpfase de vertrouwensband die nodig is om elkaars productiegegevens zomaar in te zien.',
                    variant: 'a',
                    pathVariant: 1
                },
                {
                    key: 'ondernemers',
                    visible: 'ondernemers',
                    aria: 'ondernemers',
                    question: 'Wiens bezwaren over het opgeven van onafhankelijkheid worden hier niet gehoord in de drang naar een snelle collectieve oplossing?',
                    role: 'fabrieksdirecteur',
                    speech: 'Het ritme en de leveringszekerheid van mijn productielijn maak ik liever niet afhankelijk van de piekbelasting van mijn buren.',
                    variant: 'b',
                    pathVariant: 2
                },
                {
                    key: 'uitwisselen',
                    visible: 'stroom kunnen uitwisselen',
                    aria: 'stroom kunnen uitwisselen',
                    question: 'Welke risico\'s bespreken we wel intern als projectteam, maar hebben we nog niet gecommuniceerd naar de bedrijven die straks data moeten overdragen?',
                    role: 'jurist',
                    speech: 'We moeten de verantwoordelijkheden bij een storing eerst dichttimmeren voordat we dit gedeelde systeem activeren.',
                    variant: 'c',
                    pathVariant: 3
                },
                {
                    key: 'overbelasting',
                    visible: 'overbelasting',
                    aria: 'overbelasting',
                    question: 'Houden we het proces lang genoeg open om te zien of de oplossing wel in een nieuw net zit, en niet in het aanpassen van productieprocessen?',
                    role: 'netbeheerder',
                    speech: 'De huidige wet- en regelgeving is niet geschreven voor de operationele experimenten die hier worden voorgesteld.',
                    variant: 'd',
                    pathVariant: 0
                }
            ]
        },
        {
            id: 'circulaire-bouw',
            lead: 'Als ik morgen aan dit vraagstuk zou beginnen, zijn dit de woorden waar ik zelf als eerste bij zou doorvragen.',
            segments: [
                { text: 'We ontwikkelen een ' },
                { passage: 'paspoort' },
                { text: ' voor de bouwsector, zodat ' },
                { passage: 'ketenpartners' },
                { text: ' afgedankte grondstoffen ' },
                { passage: 'hergebruiken' },
                { text: ' en we ' },
                { passage: 'materiaalstromen' },
                { text: '.' }
            ],
            passages: [
                {
                    key: 'paspoort',
                    visible: 'digitaal materiaalpaspoort',
                    aria: 'digitaal materiaalpaspoort',
                    question: 'Persen we de onvoorspelbare toekomstige staat van een materiaal hier in een format dat is gebouwd op absolute data-zekerheid?',
                    role: 'circulaire sloper',
                    speech: 'Een dataset op een scherm bepaalt voor mij nog niet de werkelijke constructieve waarde van de stalen spant die ik net uit een muur heb gehaald.',
                    variant: 'a',
                    pathVariant: 2
                },
                {
                    key: 'ketenpartners',
                    visible: 'ketenpartners',
                    aria: 'ketenpartners',
                    question: 'Nemen we binnen onze eigen kantoormuren een bereidheid tot transparantie aan die we in gesprekken met de markt nog nergens zien?',
                    choiceOptions: [
                        {
                            key: 'architect',
                            label: 'architect',
                            speech: 'Mijn ontwerpvrijheid verandert zodra we met onzekere voorraad gaan plannen, en dat vraagt om een ander gesprek met mijn opdrachtgever.',
                            variant: 'd'
                        },
                        {
                            key: 'verzekeraar',
                            label: 'verzekeraar',
                            speech: 'Ik kan geen polis afgeven op constructieve elementen waarvan de testgeschiedenis ontbreekt of niet eenduidig is.',
                            variant: 'b'
                        },
                        {
                            key: 'beleidsmaker',
                            label: 'beleidsmaker',
                            speech: 'Onze bestaande, risicomijdende aanbestedingsregels zijn niet ingericht op trajecten waar de exacte materiaalkeuze tot op het laatste moment open blijft.',
                            variant: 'a'
                        }
                    ],
                    variant: 'd',
                    pathVariant: 0
                },
                {
                    key: 'hergebruiken',
                    visible: 'hoogwaardig kunnen hergebruiken',
                    aria: 'hoogwaardig kunnen hergebruiken',
                    question: 'Kaarten we de praktische logistiek hiervan vandaag aan, of wachten we tot de aanbesteding loopt en we niet meer terug kunnen?',
                    role: 'projectontwikkelaar',
                    speech: 'Mijn opdrachtgever is zelden bereid de bouwplanning te pauzeren wanneer tweedehands componenten te laat of in een afwijkende maat aankomen.',
                    variant: 'b',
                    pathVariant: 1
                },
                {
                    key: 'materiaalstromen',
                    visible: 'materiaalstromen sluiten',
                    aria: 'materiaalstromen sluiten',
                    question: 'Wie ziet de obstakels in de uitvoering, maar zwijgt omdat de opdracht een perfect en frictieloos ideaalbeeld nastreeft?',
                    role: 'materialen-onderzoeker',
                    speech: 'We kunnen niet zomaar dezelfde harde veiligheidsgaranties afgeven voor elementen die al dertig jaar ongedocumenteerd dienst doen.',
                    variant: 'c',
                    pathVariant: 3
                }
            ]
        }
    ];

    scenarioStates = scenarios.map(function (scenario, index) {
        return renderScenario(scenario, index);
    });

    bindTabs();
    bindSwipe();
    bindResizeHandlers();
    stage.style.height = scenarioStates[0].panel.offsetHeight + 'px';
    applyPreviewConfig();
    scheduleSync(scenarioStates[activeIndex]);

    window.addEventListener('load', function () {
        scheduleSync(scenarioStates[activeIndex]);
    });

    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(function () {
            scheduleSync(scenarioStates[activeIndex]);
        });
    }

    function renderScenario(scenario, index) {
        var panel = document.createElement('article');
        var layout = document.createElement('div');
        var lines = createSvgElement('svg');
        var main = document.createElement('div');
        var margin = document.createElement('div');
        var lead = document.createElement('p');
        var sentence = document.createElement('p');
        var notes = document.createElement('div');
        var state = {
            scenario: scenario,
            index: index,
            panel: panel,
            layout: layout,
            lines: lines,
            main: main,
            lead: lead,
            sentence: sentence,
            notes: notes,
            passages: {},
            syncFrame: 0
        };

        panel.id = 'panel-' + scenario.id;
        panel.className = 'scenario-panel' + (index === 0 ? ' is-active' : '');
        panel.setAttribute('role', 'tabpanel');
        panel.setAttribute('aria-labelledby', 'tab-' + scenario.id);
        panel.setAttribute('aria-hidden', index === 0 ? 'false' : 'true');
        panel.hidden = index !== 0;

        layout.className = 'scenario-layout';
        lines.classList.add('scenario-lines');
        lines.setAttribute('aria-hidden', 'true');
        main.className = 'scenario-main';
        margin.className = 'scenario-margin';
        lead.className = 'scenario-lead';
        lead.textContent = scenario.lead;
        sentence.className = 'scenario-sentence';
        notes.className = 'scenario-notes';
        notes.setAttribute('aria-live', 'polite');

        buildSentence(state);

        main.appendChild(lead);
        main.appendChild(sentence);
        margin.appendChild(notes);
        layout.appendChild(lines);
        layout.appendChild(main);
        layout.appendChild(margin);
        panel.appendChild(layout);
        stage.appendChild(panel);

        return state;
    }

    function parsePreviewConfig() {
        var params = new URLSearchParams(window.location.search);
        var tab = params.get('tab');
        var open = params.get('open');
        var entries = [];

        if (!tab && !open) {
            return null;
        }

        if (open) {
            open.split(',').forEach(function (entry) {
                var parts = entry.split(':');
                var level = Number(parts[1]);

                if (!parts[0] || !level) {
                    return;
                }

                entries.push({
                    key: parts[0],
                    level: level,
                    choice: parts[2] || null
                });
            });
        }

        return {
            tab: tab,
            entries: entries,
            mode: params.get('preview')
        };
    }

    function applyPreviewConfig() {
        var targetIndex;
        var targetState;

        if (!previewConfig) {
            return;
        }

        if (previewConfig.mode === 'demo') {
            document.body.classList.add('preview-demo');
        }

        targetIndex = findScenarioIndex(previewConfig.tab);

        if (targetIndex > -1) {
            activateScenarioImmediately(targetIndex);
        }

        targetState = scenarioStates[activeIndex];
        previewConfig.entries.forEach(function (entry) {
            var passageState = targetState.passages[entry.key];
            var option;

            if (!passageState) {
                return;
            }

            if (passageState.phase === 0) {
                openPassage(targetState, passageState);
            }

            if ((entry.level > 1 || entry.choice) && passageState.phase === 1) {
                expandPassage(targetState, passageState);
            }

            if (entry.choice && passageState.meta.choiceOptions && !passageState.choice) {
                option = passageState.meta.choiceOptions.filter(function (choiceOption) {
                    return choiceOption.key === entry.choice;
                })[0];

                if (option) {
                    lockChoice(targetState, passageState, option);
                }
            }
        });

        scheduleSync(targetState);
    }

    function activateScenarioImmediately(index) {
        scenarioStates.forEach(function (state, stateIndex) {
            var isActive = stateIndex === index;

            state.panel.hidden = !isActive;
            state.panel.classList.toggle('is-active', isActive);
            state.panel.classList.remove('is-entering', 'is-exiting');
            state.panel.style.removeProperty('opacity');
            state.panel.setAttribute('aria-hidden', isActive ? 'false' : 'true');
        });

        activeIndex = index;
        updateTabs(index);
        stage.style.height = scenarioStates[index].panel.offsetHeight + 'px';
    }

    function findScenarioIndex(tab) {
        var matchIndex = -1;

        if (!tab) {
            return -1;
        }

        scenarioStates.forEach(function (state, index) {
            if (state.scenario.id === tab) {
                matchIndex = index;
            }
        });

        return matchIndex;
    }

    function buildSentence(state) {
        state.scenario.passages.forEach(function (passage, passageIndex) {
            state.passages[passage.key] = {
                meta: passage,
                noteSlot: typeof passage.noteSlot === 'number' ? passage.noteSlot : passageIndex,
                phase: 0,
                choice: null,
                wrapper: null,
                button: null,
                underline: null,
                underlinePath: null,
                connector: null,
                note: null,
                hint: null,
                detail: null,
                choiceSlot: null,
                choiceInvite: null,
                choiceButtons: null,
                choiceSelection: null,
                revealButton: null,
                closeButton: null,
                dragX: 0,
                dragY: 0,
                needsUnderlineAnimation: false,
                needsConnectorAnimation: false
            };
        });

        state.scenario.segments.forEach(function (segment) {
            if (segment.text) {
                state.sentence.appendChild(document.createTextNode(segment.text));
                return;
            }

            var passageState = state.passages[segment.passage];
            var noteId = 'note-' + state.scenario.id + '-' + passageState.meta.key;
            var wrapper = document.createElement('span');
            var button = document.createElement('button');
            var underline = createSvgElement('svg');

            wrapper.className = 'passage';

            button.type = 'button';
            button.className = 'passage-button';
            button.textContent = passageState.meta.visible;
            button.setAttribute('aria-label', "klik om door te vragen op de woorden '" + passageState.meta.aria + "'");
            button.setAttribute('aria-controls', noteId);
            button.setAttribute('aria-expanded', 'false');
            button.addEventListener('click', function () {
                handlePassageClick(state, passageState.meta.key);
            });

            underline.classList.add('hand-underline');
            underline.setAttribute('aria-hidden', 'true');
            underline.hidden = true;

            wrapper.appendChild(button);
            wrapper.appendChild(underline);
            state.sentence.appendChild(wrapper);

            passageState.wrapper = wrapper;
            passageState.button = button;
            passageState.underline = underline;
        });
    }

    function handlePassageClick(state, key) {
        var passageState = state.passages[key];

        if (!passageState || passageState.phase !== 0) {
            return;
        }

        openPassage(state, passageState);
    }

    function openPassage(state, passageState) {
        var note = document.createElement('div');
        var question = document.createElement('p');
        var connector = createSvgElement('path');
        var revealButton = document.createElement('button');
        var closeButton = document.createElement('button');

        passageState.phase = 1;
        passageState.needsUnderlineAnimation = true;
        passageState.needsConnectorAnimation = true;
        passageState.wrapper.classList.add('is-open');
        passageState.button.setAttribute('aria-expanded', 'true');
        passageState.underline.hidden = false;

        if (!passageState.underlinePath) {
            passageState.underlinePath = createSvgElement('path');
            passageState.underlinePath.classList.add('hand-stroke');
            passageState.underline.appendChild(passageState.underlinePath);
        }

        note.id = 'note-' + state.scenario.id + '-' + passageState.meta.key;
        note.className = 'note-block';
        note.dataset.slot = String(passageState.noteSlot);
        note.dataset.phase = 'question';

        question.className = 'note-question';
        question.textContent = passageState.meta.question;

        revealButton.type = 'button';
        revealButton.className = 'note-reveal';
        revealButton.textContent = getRevealButtonText(passageState);
        revealButton.addEventListener('click', function () {
            expandPassage(state, passageState);
        });

        closeButton.type = 'button';
        closeButton.className = 'note-close';
        closeButton.textContent = 'sluit';
        closeButton.setAttribute('aria-label', 'sluit notitie');
        closeButton.addEventListener('click', function () {
            closePassage(state, passageState.meta.key);
        });

        connector.classList.add('connector-stroke');

        note.appendChild(closeButton);
        note.appendChild(question);
        note.appendChild(revealButton);
        state.notes.appendChild(note);
        state.lines.appendChild(connector);

        passageState.note = note;
        passageState.detail = null;
        passageState.connector = connector;
        passageState.revealButton = revealButton;
        passageState.closeButton = closeButton;
        passageState.dragX = 0;
        passageState.dragY = 0;

        bindNoteInteractions(state, passageState);

        scheduleSync(state);
    }

    function expandPassage(state, passageState) {
        var detail = document.createElement('div');

        if (!passageState.note || passageState.phase !== 1) {
            return;
        }

        passageState.phase = 2;
        detail.className = 'note-detail';

        if (passageState.meta.choiceOptions) {
            detail.appendChild(buildChoiceSlot(state, passageState));
        } else {
            detail.appendChild(buildOwnerFigure(passageState.meta.role, passageState.meta.speech, passageState.meta.variant, state.scenario.id + '-' + passageState.meta.key));
        }

        if (passageState.revealButton) {
            passageState.revealButton.hidden = true;
            passageState.revealButton.disabled = true;
        }

        passageState.note.dataset.phase = 'detail';
        passageState.note.classList.add('is-revealed');
        passageState.note.appendChild(detail);
        passageState.detail = detail;

        window.requestAnimationFrame(function () {
            detail.classList.add('is-visible');
            scheduleSync(state);
        });

        if (!reducedMotion) {
            window.setTimeout(function () {
                scheduleSync(state);
            }, 520);
        }
    }

    function closePassage(state, key) {
        var passageState = state.passages[key];

        if (!passageState || passageState.phase === 0) {
            return;
        }

        if (passageState.note && passageState.note.parentNode) {
            passageState.note.parentNode.removeChild(passageState.note);
        }

        if (passageState.connector && passageState.connector.parentNode) {
            passageState.connector.parentNode.removeChild(passageState.connector);
        }

        passageState.phase = 0;
        passageState.choice = null;
        passageState.wrapper.classList.remove('is-open');
        passageState.button.setAttribute('aria-expanded', 'false');
        passageState.underline.hidden = true;
        passageState.note = null;
        passageState.detail = null;
        passageState.connector = null;
        passageState.revealButton = null;
        passageState.closeButton = null;
        passageState.choiceSlot = null;
        passageState.choiceInvite = null;
        passageState.choiceButtons = null;
        passageState.choiceSelection = null;
        passageState.dragX = 0;
        passageState.dragY = 0;

        scheduleSync(state);
    }

    function getRevealButtonText(passageState) {
        if (passageState.meta.choiceOptions) {
            return 'welke stem ontbreekt hier nog?';
        }

        return 'welke stem zit achter deze vraag?';
    }

    function bindNoteInteractions(state, passageState) {
        var note = passageState.note;

        if (!note) {
            return;
        }

        note.addEventListener('pointerdown', function (event) {
            if (!desktopMedia.matches) {
                return;
            }

            if (event.button && event.button !== 0) {
                return;
            }

            if (event.target.closest('button')) {
                return;
            }

            startNoteDrag(state, passageState, event);
        });
    }

    function startNoteDrag(state, passageState, event) {
        var note = passageState.note;
        var originX = passageState.dragX || 0;
        var originY = passageState.dragY || 0;
        var startX = event.clientX;
        var startY = event.clientY;

        if (!note) {
            return;
        }

        event.preventDefault();
        note.classList.add('is-dragging');

        if (note.setPointerCapture) {
            note.setPointerCapture(event.pointerId);
        }

        note.addEventListener('pointermove', handleMove);
        note.addEventListener('pointerup', handleEnd);
        note.addEventListener('pointercancel', handleEnd);

        function handleMove(moveEvent) {
            passageState.dragX = originX + (moveEvent.clientX - startX);
            passageState.dragY = originY + (moveEvent.clientY - startY);
            note.style.setProperty('--drag-x', passageState.dragX + 'px');
            note.style.setProperty('--drag-y', passageState.dragY + 'px');
            scheduleSync(state);
        }

        function handleEnd(endEvent) {
            note.classList.remove('is-dragging');

            if (note.releasePointerCapture && note.hasPointerCapture && note.hasPointerCapture(endEvent.pointerId)) {
                note.releasePointerCapture(endEvent.pointerId);
            }

            note.removeEventListener('pointermove', handleMove);
            note.removeEventListener('pointerup', handleEnd);
            note.removeEventListener('pointercancel', handleEnd);
            scheduleSync(state);
        }
    }

    function buildChoiceSlot(state, passageState) {
        var slot = document.createElement('div');
        var placeholder = document.createElement('div');
        var invite = document.createElement('p');
        var buttons = document.createElement('div');
        var selection = document.createElement('div');

        slot.className = 'choice-slot';
        placeholder.className = 'choice-placeholder';
        placeholder.appendChild(buildPlaceholderFigure(state.scenario.id + '-' + passageState.meta.key + '-placeholder'));

        invite.className = 'choice-invite';
        invite.textContent = 'welke stem mist hier nog?';

        buttons.className = 'choice-buttons';
        passageState.meta.choiceOptions.forEach(function (option) {
            var button = document.createElement('button');

            button.type = 'button';
            button.className = 'choice-button';
            button.textContent = option.label;
            button.addEventListener('click', function () {
                lockChoice(state, passageState, option);
            });
            buttons.appendChild(button);
        });

        selection.className = 'choice-selection';
        selection.hidden = true;

        slot.appendChild(placeholder);
        slot.appendChild(invite);
        slot.appendChild(buttons);
        slot.appendChild(selection);

        passageState.choiceSlot = slot;
        passageState.choiceInvite = invite;
        passageState.choiceButtons = buttons;
        passageState.choiceSelection = selection;

        return slot;
    }

    function lockChoice(state, passageState, option) {
        var choiceButtons;

        if (passageState.choice) {
            return;
        }

        passageState.choice = option.key;
        passageState.choiceSlot.classList.add('is-locked');
        choiceButtons = Array.prototype.slice.call(passageState.choiceButtons.querySelectorAll('button'));

        choiceButtons.forEach(function (button) {
            button.disabled = true;
        });

        passageState.choiceSelection.hidden = false;
        passageState.choiceSelection.appendChild(buildOwnerFigure(option.label, option.speech, option.variant, state.scenario.id + '-' + passageState.meta.key + '-' + option.key));

        window.requestAnimationFrame(function () {
            passageState.choiceSelection.classList.add('is-visible');
            scheduleSync(state);
        });

        window.setTimeout(function () {
            if (passageState.choiceInvite) {
                passageState.choiceInvite.hidden = true;
            }

            if (passageState.choiceButtons) {
                passageState.choiceButtons.hidden = true;
            }

            scheduleSync(state);
        }, reducedMotion ? 0 : 300);

        if (!reducedMotion) {
            window.setTimeout(function () {
                scheduleSync(state);
            }, 520);
        }
    }

    function buildOwnerFigure(role, speech, variant, idBase) {
        var figure = document.createElement('figure');
        var caption = document.createElement('figcaption');
        var roleLabel = document.createElement('p');
        var speechLine = document.createElement('p');

        figure.className = 'owner-figure';
        caption.className = 'owner-caption';
        roleLabel.className = 'owner-role';
        speechLine.className = 'owner-speech';

        roleLabel.textContent = role;
        speechLine.textContent = speech;

        caption.appendChild(roleLabel);
        caption.appendChild(speechLine);
        figure.appendChild(buildIllustration(variant, idBase, false, role));
        figure.appendChild(caption);

        return figure;
    }

    function buildPlaceholderFigure(idBase) {
        var wrapper = document.createElement('div');

        wrapper.className = 'owner-figure';
        wrapper.appendChild(buildIllustration('d', idBase, true, 'open silhouet'));

        return wrapper;
    }

    function buildIllustration(variant, idBase, placeholder, titleText) {
        var svg = createSvgElement('svg');
        var title = createSvgElement('title');
        var use = createSvgElement('use');
        var titleId = 'figure-title-' + idBase;

        svg.classList.add('owner-illustration');
        svg.setAttribute('viewBox', '0 0 600 600');
        svg.setAttribute('role', 'img');
        svg.setAttribute('aria-labelledby', titleId);

        title.id = titleId;
        title.textContent = 'lijntekening van ' + titleText;
        setUseHref(use, '#figure-' + variant);

        if (placeholder) {
            use.classList.add('placeholder-use');
        }

        svg.appendChild(title);
        svg.appendChild(use);

        return svg;
    }

    function bindTabs() {
        tabButtons.forEach(function (button) {
            button.addEventListener('click', function () {
                switchScenario(Number(button.getAttribute('data-tab-index')));
            });

            button.addEventListener('keydown', function (event) {
                var currentIndex = Number(button.getAttribute('data-tab-index'));
                var nextIndex = null;

                if (event.key === 'ArrowRight') {
                    nextIndex = (currentIndex + 1) % tabButtons.length;
                } else if (event.key === 'ArrowLeft') {
                    nextIndex = (currentIndex - 1 + tabButtons.length) % tabButtons.length;
                } else if (event.key === 'Home') {
                    nextIndex = 0;
                } else if (event.key === 'End') {
                    nextIndex = tabButtons.length - 1;
                }

                if (nextIndex === null) {
                    return;
                }

                event.preventDefault();
                switchScenario(nextIndex);
                tabButtons[nextIndex].focus();
            });
        });
    }

    function bindSwipe() {
        stage.addEventListener('touchstart', function (event) {
            if (!event.touches || event.touches.length !== 1) {
                touchState = null;
                return;
            }

            touchState = {
                x: event.touches[0].clientX,
                y: event.touches[0].clientY
            };
        }, { passive: true });

        stage.addEventListener('touchend', function (event) {
            var deltaX;
            var deltaY;
            var nextIndex;

            if (!touchState || isTransitioning || !event.changedTouches || !event.changedTouches.length) {
                touchState = null;
                return;
            }

            deltaX = event.changedTouches[0].clientX - touchState.x;
            deltaY = event.changedTouches[0].clientY - touchState.y;
            touchState = null;

            if (Math.abs(deltaX) < 40 || Math.abs(deltaX) <= Math.abs(deltaY)) {
                return;
            }

            nextIndex = deltaX < 0 ? activeIndex + 1 : activeIndex - 1;

            if (nextIndex < 0 || nextIndex >= scenarioStates.length) {
                return;
            }

            switchScenario(nextIndex);
        }, { passive: true });
    }

    function bindResizeHandlers() {
        window.addEventListener('resize', function () {
            scheduleSync(scenarioStates[activeIndex]);
        });

        if (desktopMedia.addEventListener) {
            desktopMedia.addEventListener('change', function () {
                scheduleSync(scenarioStates[activeIndex]);
            });
            return;
        }

        if (desktopMedia.addListener) {
            desktopMedia.addListener(function () {
                scheduleSync(scenarioStates[activeIndex]);
            });
        }
    }

    function switchScenario(nextIndex) {
        var currentState;
        var nextState;
        var currentHeight;
        var nextHeight;

        if (nextIndex === activeIndex || isTransitioning) {
            updateTabs(nextIndex);
            return;
        }

        currentState = scenarioStates[activeIndex];
        nextState = scenarioStates[nextIndex];
        currentHeight = currentState.panel.offsetHeight;

        isTransitioning = true;
        updateTabs(nextIndex);

        nextState.panel.hidden = false;
        nextState.panel.setAttribute('aria-hidden', 'false');
        nextState.panel.classList.add('is-entering');
        nextState.panel.style.opacity = '0';
        nextHeight = nextState.panel.offsetHeight;
        stage.style.height = Math.max(currentHeight, nextHeight) + 'px';

        window.requestAnimationFrame(function () {
            currentState.panel.classList.add('is-exiting');
            nextState.panel.classList.add('is-active');
            nextState.panel.style.removeProperty('opacity');
            scheduleSync(nextState);

            window.setTimeout(function () {
                currentState.panel.classList.remove('is-active', 'is-exiting');
                currentState.panel.setAttribute('aria-hidden', 'true');
                currentState.panel.hidden = true;
                nextState.panel.classList.remove('is-entering');
                nextState.panel.style.removeProperty('opacity');
                activeIndex = nextIndex;
                isTransitioning = false;
                stage.style.height = nextState.panel.offsetHeight + 'px';
                scheduleSync(nextState);
            }, reducedMotion ? 0 : 200);
        });
    }

    function updateTabs(nextIndex) {
        tabButtons.forEach(function (button, index) {
            var isActive = index === nextIndex;

            button.classList.toggle('is-active', isActive);
            button.setAttribute('aria-selected', isActive ? 'true' : 'false');
            button.tabIndex = isActive ? 0 : -1;
        });
    }

    function scheduleSync(state) {
        if (!state) {
            return;
        }

        if (state.syncFrame) {
            window.cancelAnimationFrame(state.syncFrame);
        }

        state.syncFrame = window.requestAnimationFrame(function () {
            state.syncFrame = 0;
            syncScenarioLayout(state);
        });
    }

    function syncScenarioLayout(state) {
        var layoutRect;
        var mainRect;
        var requiredHeight;
        var sentenceRect;
        var width;
        var height;

        if (!state || state.panel.hidden) {
            return;
        }

        if (desktopMedia.matches) {
            state.layout.style.removeProperty('min-height');
        }

        layoutRect = state.layout.getBoundingClientRect();

        if (desktopMedia.matches) {
            requiredHeight = getRequiredLayoutHeight(state, layoutRect);

            if (requiredHeight > layoutRect.height) {
                state.layout.style.minHeight = requiredHeight + 'px';
                layoutRect = state.layout.getBoundingClientRect();
            }
        } else {
            state.layout.style.removeProperty('min-height');
        }

        width = Math.max(1, Math.round(layoutRect.width));
        height = Math.max(1, Math.round(layoutRect.height));

        if (state.main) {
            mainRect = state.main.getBoundingClientRect();
            sentenceRect = state.sentence.getBoundingClientRect();
            state.main.style.setProperty('--sentence-row', window.getComputedStyle(state.sentence).lineHeight);
            state.main.style.setProperty('--sentence-start', Math.max(0, Math.round(sentenceRect.top - mainRect.top)) + 'px');
        }

        state.lines.setAttribute('viewBox', '0 0 ' + width + ' ' + height);
        state.lines.setAttribute('width', String(width));
        state.lines.setAttribute('height', String(height));

        Object.keys(state.passages).forEach(function (key) {
            var passageState = state.passages[key];

            if (passageState.phase === 0) {
                return;
            }

            updateUnderlineGeometry(passageState);
            updateConnectorGeometry(state, passageState, layoutRect);
        });

        if (state === scenarioStates[activeIndex] && !isTransitioning) {
            stage.style.height = state.panel.offsetHeight + 'px';
        }
    }

    function getRequiredLayoutHeight(state, layoutRect) {
        var bottom = state.main.getBoundingClientRect().bottom - layoutRect.top + 24;

        Object.keys(state.passages).forEach(function (key) {
            var note = state.passages[key].note;

            if (!note) {
                return;
            }

            bottom = Math.max(bottom, note.getBoundingClientRect().bottom - layoutRect.top + 20);
        });

        return Math.ceil(bottom);
    }

    function updateUnderlineGeometry(passageState) {
        var width;
        var length;

        if (!passageState.underlinePath) {
            return;
        }

        width = Math.max(32, Math.ceil(passageState.button.getBoundingClientRect().width + 8));
        passageState.underline.setAttribute('viewBox', '0 0 ' + width + ' 10');
        passageState.underline.setAttribute('width', String(width));
        passageState.underline.setAttribute('height', '10');
        passageState.underlinePath.setAttribute('d', getUnderlinePath(width, passageState.meta.pathVariant));

        length = passageState.underlinePath.getTotalLength();
        passageState.underlinePath.style.setProperty('--len', String(length));

        if (passageState.needsUnderlineAnimation) {
            playStrokeAnimation(passageState.underlinePath);
            passageState.needsUnderlineAnimation = false;
            return;
        }

        settleStroke(passageState.underlinePath, length);
    }

    function updateConnectorGeometry(state, passageState, layoutRect) {
        var buttonRect;
        var connectorPoints;
        var noteRect;
        var startX;
        var startY;
        var endX;
        var endY;
        var length;
        var desktop = desktopMedia.matches;

        if (!passageState.connector || !passageState.note) {
            return;
        }

        buttonRect = passageState.button.getBoundingClientRect();
        noteRect = passageState.note.getBoundingClientRect();

        if (desktop) {
            connectorPoints = getDesktopConnectorPoints(buttonRect, noteRect, layoutRect);
            startX = connectorPoints.startX;
            startY = connectorPoints.startY;
            endX = connectorPoints.endX;
            endY = connectorPoints.endY;
        } else {
            startX = buttonRect.left - layoutRect.left + (buttonRect.width * 0.64);
            startY = buttonRect.bottom - layoutRect.top + 6;
            endX = noteRect.left - layoutRect.left + Math.min(noteRect.width * 0.34, 44);
            endY = noteRect.top - layoutRect.top + 14;
        }

        passageState.connector.setAttribute('d', getConnectorPath(startX, startY, endX, endY, passageState.meta.pathVariant, desktop));
        length = passageState.connector.getTotalLength();
        passageState.connector.style.setProperty('--len', String(length));

        if (passageState.needsConnectorAnimation) {
            playStrokeAnimation(passageState.connector);
            passageState.needsConnectorAnimation = false;
            return;
        }

        settleStroke(passageState.connector, length);
    }

    function getDesktopConnectorPoints(buttonRect, noteRect, layoutRect) {
        var bestDistance = Infinity;
        var bestPair = null;
        var endCandidates;
        var startCandidates;

        startCandidates = [
            {
                x: buttonRect.left - layoutRect.left + 10,
                y: buttonRect.bottom - layoutRect.top + 6
            },
            {
                x: buttonRect.right - layoutRect.left - 10,
                y: buttonRect.bottom - layoutRect.top + 6
            },
            {
                x: buttonRect.left - layoutRect.left + (buttonRect.width * 0.5),
                y: buttonRect.bottom - layoutRect.top + 8
            }
        ];

        endCandidates = [
            {
                x: noteRect.left - layoutRect.left + 18,
                y: noteRect.top - layoutRect.top + Math.min(noteRect.height * 0.34, 44)
            },
            {
                x: noteRect.right - layoutRect.left - 18,
                y: noteRect.top - layoutRect.top + Math.min(noteRect.height * 0.34, 44)
            },
            {
                x: noteRect.left - layoutRect.left + (noteRect.width * 0.5),
                y: noteRect.top - layoutRect.top + 18
            },
            {
                x: noteRect.left - layoutRect.left + (noteRect.width * 0.5),
                y: noteRect.bottom - layoutRect.top - 18
            }
        ];

        startCandidates.forEach(function (startPoint) {
            endCandidates.forEach(function (endPoint) {
                var deltaX = endPoint.x - startPoint.x;
                var deltaY = endPoint.y - startPoint.y;
                var distance = (deltaX * deltaX) + (deltaY * deltaY);

                if (distance < bestDistance) {
                    bestDistance = distance;
                    bestPair = {
                        startX: startPoint.x,
                        startY: startPoint.y,
                        endX: endPoint.x,
                        endY: endPoint.y
                    };
                }
            });
        });

        return bestPair;
    }

    function playStrokeAnimation(path) {
        var length = path.getTotalLength();

        if (reducedMotion) {
            settleStroke(path, length);
            return;
        }

        path.classList.remove('drawing');
        void path.getBoundingClientRect();
        path.style.setProperty('--len', String(length));
        path.classList.add('drawing');
        path.addEventListener('animationend', function handleAnimationEnd() {
            settleStroke(path, length);
        }, { once: true });
    }

    function settleStroke(path, length) {
        path.classList.remove('drawing');
        path.style.strokeDasharray = String(length);
        path.style.strokeDashoffset = '0';
    }

    function getUnderlinePath(width, variantIndex) {
        var end = width - 2;

        switch (variantIndex % 4) {
            case 0:
                return 'M 1 6 Q ' + round(width * 0.26) + ' 3 ' + round(width * 0.5) + ' 6 T ' + end + ' 5';
            case 1:
                return 'M 1 5 Q ' + round(width * 0.22) + ' 8 ' + round(width * 0.5) + ' 5 T ' + end + ' 6';
            case 2:
                return 'M 1 6 Q ' + round(width * 0.28) + ' 2 ' + round(width * 0.53) + ' 6 T ' + end + ' 4';
            default:
                return 'M 1 5 Q ' + round(width * 0.24) + ' 4 ' + round(width * 0.5) + ' 7 T ' + end + ' 5';
        }
    }

    function getConnectorPath(startX, startY, endX, endY, variantIndex, desktop) {
        var control1X;
        var control1Y;
        var control2X;
        var control2Y;
        var deltaX = endX - startX;
        var deltaY = endY - startY;
        var variantOffset = ((variantIndex % 4) - 1.5) * 5;

        if (desktop) {
            control1X = startX + (deltaX * 0.24);
            control1Y = startY + Math.max(-18, Math.min(32, deltaY * 0.18)) + variantOffset;
            control2X = endX - (deltaX * 0.24);
            control2Y = endY - Math.max(-22, Math.min(36, deltaY * 0.2)) - variantOffset;
        } else {
            switch (variantIndex % 4) {
                case 0:
                    control1X = startX + 2;
                    control1Y = startY + (deltaY * 0.32);
                    control2X = endX - 10;
                    control2Y = endY - 18;
                    break;
                case 1:
                    control1X = startX + 10;
                    control1Y = startY + (deltaY * 0.24);
                    control2X = endX - 4;
                    control2Y = endY - 20;
                    break;
                case 2:
                    control1X = startX - 4;
                    control1Y = startY + (deltaY * 0.28);
                    control2X = endX + 8;
                    control2Y = endY - 22;
                    break;
                default:
                    control1X = startX + 6;
                    control1Y = startY + (deltaY * 0.26);
                    control2X = endX - 8;
                    control2Y = endY - 16;
                    break;
            }
        }

        return 'M ' + round(startX) + ' ' + round(startY) + ' C ' + round(control1X) + ' ' + round(control1Y) + ' ' + round(control2X) + ' ' + round(control2Y) + ' ' + round(endX) + ' ' + round(endY);
    }

    function createSvgElement(name) {
        return document.createElementNS(SVG_NS, name);
    }

    function setUseHref(node, value) {
        node.setAttribute('href', value);
        node.setAttributeNS(XLINK_NS, 'xlink:href', value);
    }

    function round(value) {
        return Math.round(value * 10) / 10;
    }
})();