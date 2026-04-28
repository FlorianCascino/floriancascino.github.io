(function () {
    'use strict';

    var buttons = Array.prototype.slice.call(document.querySelectorAll('[data-assumption-button]'));
    var progress = document.getElementById('assumption-progress');
    var liveRegion = document.getElementById('assumption-live');
    var inviteButton = document.getElementById('invite-button');
    var figuresSection = document.getElementById('vormeigenaren');
    var figureNodes = Array.prototype.slice.call(document.querySelectorAll('[data-figure]'));
    var echoLine = document.getElementById('kaart-echo');
    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var openedCount = 0;
    var figuresPlayed = false;

    function updateProgress() {
        if (!progress) {
            return;
        }

        progress.textContent = openedCount + ' van ' + buttons.length + ' aannames zichtbaar';
    }

    function showInviteButton() {
        if (!inviteButton || inviteButton.classList.contains('is-mounted')) {
            return;
        }

        inviteButton.classList.add('is-mounted');
        inviteButton.setAttribute('aria-hidden', 'false');

        if (reducedMotion) {
            inviteButton.classList.add('is-visible');
            return;
        }

        window.requestAnimationFrame(function () {
            inviteButton.classList.add('is-visible');
        });
    }

    function openAssumption(button) {
        var wrapper = button.closest('.assumption');
        var noteId = button.getAttribute('aria-controls');
        var note = noteId ? document.getElementById(noteId) : null;

        if (!wrapper || wrapper.classList.contains('is-open')) {
            return;
        }

        wrapper.classList.add('is-open');
        button.setAttribute('aria-expanded', 'true');

        if (note) {
            note.hidden = false;
            if (liveRegion) {
                liveRegion.textContent = note.textContent.replace(/\s+/g, ' ').trim();
            }
        }

        openedCount += 1;
        updateProgress();

        if (openedCount === buttons.length) {
            showInviteButton();
        }
    }

    function revealEchoLine(delay) {
        if (!echoLine) {
            return;
        }

        if (reducedMotion) {
            echoLine.classList.add('is-visible');
            return;
        }

        window.setTimeout(function () {
            echoLine.classList.add('is-visible');
        }, delay);
    }

    function revealFigures() {
        var totalDelay;

        if (figuresPlayed) {
            return;
        }

        figuresPlayed = true;

        if (reducedMotion) {
            figureNodes.forEach(function (node) {
                node.classList.add('is-visible');
            });
            revealEchoLine(0);
            return;
        }

        figureNodes.forEach(function (node, index) {
            window.setTimeout(function () {
                node.classList.add('is-visible');
            }, index * 600);
        });

        totalDelay = (figureNodes.length - 1) * 600 + 300;
        revealEchoLine(totalDelay);
    }

    function observeFigures() {
        var observer;

        if (!figuresSection) {
            return;
        }

        if (!('IntersectionObserver' in window)) {
            revealFigures();
            return;
        }

        observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) {
                    return;
                }

                revealFigures();
                observer.disconnect();
            });
        }, {
            threshold: 0.28
        });

        observer.observe(figuresSection);
    }

    buttons.forEach(function (button) {
        button.addEventListener('click', function () {
            openAssumption(button);
        });
    });

    if (inviteButton && figuresSection) {
        inviteButton.addEventListener('click', function () {
            figuresSection.scrollIntoView({
                behavior: reducedMotion ? 'auto' : 'smooth',
                block: 'start'
            });
        });
    }

    updateProgress();
    observeFigures();
})();