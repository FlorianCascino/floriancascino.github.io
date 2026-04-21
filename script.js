(function () {
    'use strict';

    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var finePointer = window.matchMedia('(pointer: fine)').matches;

    var root = document.documentElement;
    var body = document.body;
    var stage = document.getElementById('experience');
    var canvas = document.getElementById('experience-canvas');
    var context = canvas ? canvas.getContext('2d') : null;
    var hint = document.getElementById('hint');
    var unlockCopy = document.getElementById('unlock-copy');
    var scrollCue = document.getElementById('scroll-cue');
    var outro = document.getElementById('outro');
    var cursor = document.getElementById('custom-cursor');
    var phaseLabel = document.getElementById('phase-label');
    var phaseCopy = document.getElementById('phase-copy');
    var supportCopy = document.getElementById('support-copy');
    var phaseSteps = Array.prototype.slice.call(document.querySelectorAll('.phase-step'));

    if (!stage || !canvas || !context) {
        return;
    }

    var pointer = {
        x: 0,
        y: 0,
        active: false,
        inside: false,
        moved: false,
        viewportX: 0,
        viewportY: 0
    };

    var width = 0;
    var height = 0;
    var dpi = 1;
    var center = { x: 0, y: 0 };
    var networkFocus = { x: 0, y: 0 };
    var clusterRadius = 0;
    var interactiveRadius = 0;
    var voidRadius = 0;
    var particles = [];
    var releaseQueue = [];
    var claimedParticles = [];
    var particleMap = {};
    var connections = [];
    var releasedCount = 0;
    var releaseMeter = 0;
    var outsideDuration = 0;
    var stableParticles = 0;
    var triangleCount = 0;
    var lastFrame = 0;
    var breathe = 0;
    var startedAt = performance.now();
    var disperseStarted = false;
    var unlocked = false;
    var networkHue = 204;
    var lastKnownPointerX = 0;
    var lastKnownPointerY = 0;
    var currentPhase = '';
    var currentSupportMessage = '';

    var sceneMetrics = {
        pointerDistance: Infinity,
        thresholdProgress: 0,
        thresholdPressure: 0,
        releaseProgress: 0,
        collectiveProgress: 0
    };

    var particleCount = finePointer ? 84 : 70;
    var dwellThreshold = finePointer ? 2500 : 1900;
    var collectiveTarget = finePointer ? 8 : 6;
    var triangleTarget = 2;
    var hintDelay = 4200;
    var goldenAngle = Math.PI * (3 - Math.sqrt(5));

    var phaseContent = {
        known: {
            label: 'het bekende',
            copy: 'hier trekt alles nog terug naar wat al vertrouwd is'
        },
        threshold: {
            label: 'de drempel',
            copy: 'aan de rand neemt de directe respons af en wordt weerstand voelbaar'
        },
        transition: {
            label: 'de overgang',
            copy: 'punten laten los, maar vormen nog geen dragende ordening'
        },
        together: {
            label: 'samen dragen',
            copy: 'pas als meerdere punten elkaar vasthouden, blijft de ruimte open'
        }
    };

    function clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }

    function lerp(start, end, amount) {
        return start + (end - start) * amount;
    }

    function distanceBetween(ax, ay, bx, by) {
        var dx = ax - bx;
        var dy = ay - by;
        return Math.sqrt(dx * dx + dy * dy);
    }

    function currentCursorHue() {
        if (!pointer.moved || width === 0 || height === 0) {
            return 204;
        }

        var xRatio = clamp(pointer.x / width, 0, 1);
        var yRatio = clamp(pointer.y / height, 0, 1);
        return Math.round(188 + xRatio * 74 + (1 - yRatio) * 18);
    }

    function setHint(message, visible) {
        if (!hint) {
            return;
        }

        if (typeof message === 'string' && hint.textContent !== message) {
            hint.textContent = message;
        }

        if (typeof visible === 'boolean') {
            hint.classList.toggle('visible', visible);
        }
    }

    function setPhase(phaseKey) {
        var content;

        if (!phaseContent[phaseKey] || currentPhase === phaseKey) {
            return;
        }

        content = phaseContent[phaseKey];
        currentPhase = phaseKey;
        body.setAttribute('data-phase', phaseKey);

        if (phaseLabel) {
            phaseLabel.textContent = content.label;
        }

        if (phaseCopy) {
            phaseCopy.textContent = content.copy;
        }

        for (var index = 0; index < phaseSteps.length; index += 1) {
            phaseSteps[index].classList.toggle('is-active', phaseSteps[index].getAttribute('data-step') === phaseKey);
        }
    }

    function setSupportMessage(message) {
        if (!supportCopy || currentSupportMessage === message) {
            return;
        }

        currentSupportMessage = message;
        supportCopy.textContent = message;
    }

    function updateCursorDisplay(energy) {
        if (!finePointer || !cursor) {
            return;
        }

        var hue = claimedParticles.length ? networkHue : currentCursorHue();
        root.style.setProperty('--cursor-hue', String(hue));
        root.style.setProperty('--cursor-energy', energy.toFixed(3));
        root.style.setProperty('--cursor-size', (4 + energy * 10).toFixed(2) + 'px');
        cursor.classList.toggle('visible', pointer.inside);
    }

    function setPointerPosition(clientX, clientY, keepActive) {
        var bounds = canvas.getBoundingClientRect();

        pointer.x = clientX - bounds.left;
        pointer.y = clientY - bounds.top;
        pointer.viewportX = clientX;
        pointer.viewportY = clientY;
        pointer.moved = true;
        pointer.inside = true;
        pointer.active = keepActive;
        lastKnownPointerX = pointer.x;
        lastKnownPointerY = pointer.y;
        networkFocus.x = pointer.x;
        networkFocus.y = pointer.y;

        if (finePointer && cursor) {
            cursor.style.transform = 'translate(' + clientX + 'px, ' + clientY + 'px) translate(-50%, -50%)';
        }
    }

    function assignClaimAnchor(particle, index) {
        var ring = Math.floor(index / 5);
        var slot = index % 5;
        particle.anchorAngle = index * goldenAngle;
        particle.anchorRadius = clusterRadius * (0.32 + ring * 0.15) + slot * 6;
    }

    function buildParticles() {
        particles = [];
        claimedParticles = [];
        connections = [];
        particleMap = {};
        releasedCount = 0;
        releaseMeter = 0;
        stableParticles = 0;
        triangleCount = 0;

        for (var index = 0; index < particleCount; index += 1) {
            var homeAngle = index * goldenAngle + Math.random() * 0.45;
            var homeSpread = Math.sqrt((index + 0.6) / particleCount);
            var particle = {
                id: 'particle-' + index,
                homeAngle: homeAngle,
                homeSpread: homeSpread,
                homeX: 0,
                homeY: 0,
                x: 0,
                y: 0,
                vx: 0,
                vy: 0,
                size: 1.8 + Math.random() * 2.1,
                seed: Math.random() * Math.PI * 2,
                baseHue: 188 + Math.random() * 54,
                baseLight: 68 + Math.random() * 14,
                alpha: 0.8,
                releaseRank: homeSpread + Math.random() * 0.28,
                released: false,
                claimed: false,
                supported: false,
                stability: 0,
                claimIndex: -1,
                anchorAngle: 0,
                anchorRadius: 0
            };

            particles.push(particle);
            particleMap[particle.id] = particle;
        }

        releaseQueue = particles.slice().sort(function (left, right) {
            return left.releaseRank - right.releaseRank;
        });

        refreshParticleHomes(true);
    }

    function refreshParticleHomes(resetPositions) {
        for (var index = 0; index < particles.length; index += 1) {
            var particle = particles[index];
            var radialDistance = clusterRadius * (0.12 + particle.homeSpread * 0.92);
            var homeX = center.x + Math.cos(particle.homeAngle) * radialDistance;
            var homeY = center.y + Math.sin(particle.homeAngle) * radialDistance * 0.82;

            particle.homeX = homeX;
            particle.homeY = homeY;

            if (resetPositions || (!particle.released && !particle.claimed)) {
                particle.x = homeX + (Math.random() - 0.5) * 18;
                particle.y = homeY + (Math.random() - 0.5) * 18;
                particle.vx = 0;
                particle.vy = 0;
            }
        }

        for (var claimIndex = 0; claimIndex < claimedParticles.length; claimIndex += 1) {
            assignClaimAnchor(claimedParticles[claimIndex], claimIndex);
        }
    }

    function resizeScene() {
        var bounds = stage.getBoundingClientRect();

        width = Math.round(bounds.width);
        height = Math.round(bounds.height);
        dpi = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.round(width * dpi);
        canvas.height = Math.round(height * dpi);
        context.setTransform(dpi, 0, 0, dpi, 0, 0);

        center.x = width * 0.5;
        center.y = height * 0.43;
        clusterRadius = clamp(Math.min(width, height) * 0.17, 92, 220);
        interactiveRadius = clusterRadius * 1.28;
        voidRadius = clusterRadius * 1.62;

        if (!particles.length) {
            buildParticles();
        } else {
            refreshParticleHomes(false);
        }

        if (!pointer.moved) {
            pointer.x = center.x;
            pointer.y = center.y;
            networkFocus.x = center.x;
            networkFocus.y = center.y;
            lastKnownPointerX = center.x;
            lastKnownPointerY = center.y;
        }
    }

    function addConnection(leftParticle, rightParticle) {
        var leftId;
        var rightId;

        if (!leftParticle || !rightParticle || leftParticle.id === rightParticle.id) {
            return;
        }

        leftId = leftParticle.id < rightParticle.id ? leftParticle.id : rightParticle.id;
        rightId = leftParticle.id < rightParticle.id ? rightParticle.id : leftParticle.id;

        for (var index = 0; index < connections.length; index += 1) {
            if (connections[index].left === leftId && connections[index].right === rightId) {
                return;
            }
        }

        connections.push({ left: leftId, right: rightId, alpha: 0 });
    }

    function countTriangles(adjacency) {
        var ids = [];
        var triangleTotal = 0;
        var i;
        var j;
        var k;

        for (i = 0; i < claimedParticles.length; i += 1) {
            ids.push(claimedParticles[i].id);
        }

        for (i = 0; i < ids.length; i += 1) {
            for (j = i + 1; j < ids.length; j += 1) {
                if (!adjacency[ids[i]][ids[j]]) {
                    continue;
                }

                for (k = j + 1; k < ids.length; k += 1) {
                    if (adjacency[ids[i]][ids[k]] && adjacency[ids[j]][ids[k]]) {
                        triangleTotal += 1;
                    }
                }
            }
        }

        return triangleTotal;
    }

    function updateNetworkState() {
        var degrees = {};
        var adjacency = {};
        var index;
        var particle;
        var requiredConnections = collectiveTarget + 3;

        for (index = 0; index < claimedParticles.length; index += 1) {
            particle = claimedParticles[index];
            degrees[particle.id] = 0;
            adjacency[particle.id] = {};
        }

        for (index = 0; index < connections.length; index += 1) {
            var connection = connections[index];
            if (degrees[connection.left] === undefined || degrees[connection.right] === undefined) {
                continue;
            }

            degrees[connection.left] += 1;
            degrees[connection.right] += 1;
            adjacency[connection.left][connection.right] = true;
            adjacency[connection.right][connection.left] = true;
        }

        stableParticles = 0;

        for (index = 0; index < claimedParticles.length; index += 1) {
            particle = claimedParticles[index];
            particle.supported = degrees[particle.id] >= 2;
            if (particle.supported) {
                stableParticles += 1;
            }
        }

        triangleCount = countTriangles(adjacency);

        if (!unlocked && stableParticles >= collectiveTarget && triangleCount >= triangleTarget && connections.length >= requiredConnections) {
            unlockExperience();
        }
    }

    function unlockExperience() {
        if (unlocked) {
            return;
        }

        unlocked = true;
        setPhase('together');
        setSupportMessage('de configuratie houdt zichzelf nu open');
        setHint('', false);
        unlockCopy.textContent = 'Pas wanneer meerdere punten elkaar dragen, opent de ruimte.';
        unlockCopy.classList.add('visible');
        scrollCue.classList.add('visible');
        scrollCue.setAttribute('aria-hidden', 'false');
        scrollCue.tabIndex = 0;
        outro.setAttribute('aria-hidden', 'false');
        body.classList.remove('locked');
        body.classList.add('unlocked');
    }

    function claimParticle(particle) {
        var others;

        if (particle.claimed) {
            return;
        }

        particle.claimed = true;
        particle.released = true;
        particle.claimIndex = claimedParticles.length;

        if (!claimedParticles.length) {
            networkHue = currentCursorHue();
        }

        assignClaimAnchor(particle, particle.claimIndex);
        claimedParticles.push(particle);

        if (claimedParticles.length > 1) {
            others = claimedParticles.slice(0, -1).sort(function (left, right) {
                return distanceBetween(left.x, left.y, particle.x, particle.y) - distanceBetween(right.x, right.y, particle.x, particle.y);
            });

            if (others[0]) {
                addConnection(others[0], particle);
            }

            if (others[1]) {
                addConnection(others[1], particle);
            }

            if (claimedParticles.length > 4 && claimedParticles.length % 3 === 0 && others[2]) {
                addConnection(others[2], particle);
            }
        }

        updateNetworkState();
    }

    function beginDisperse() {
        if (disperseStarted) {
            return;
        }

        disperseStarted = true;
    }

    function derivePhase(thresholdProgress) {
        if (unlocked || stableParticles >= 3) {
            return 'together';
        }

        if (disperseStarted) {
            return 'transition';
        }

        if (thresholdProgress > 0.08 || outsideDuration > 180) {
            return 'threshold';
        }

        return 'known';
    }

    function updateInterface(now, pointerDistance, thresholdProgress) {
        var thresholdPressure = clamp(outsideDuration / dwellThreshold, 0, 1);
        var releaseProgress = releaseQueue.length ? releasedCount / releaseQueue.length : 0;
        var collectiveProgress = clamp(stableParticles / collectiveTarget, 0, 1);
        var fieldShift = clamp(thresholdProgress * 0.42 + thresholdPressure * 0.26 + releaseProgress * 0.18 + collectiveProgress * 0.58, 0, 1);

        sceneMetrics.pointerDistance = pointerDistance;
        sceneMetrics.thresholdProgress = thresholdProgress;
        sceneMetrics.thresholdPressure = thresholdPressure;
        sceneMetrics.releaseProgress = releaseProgress;
        sceneMetrics.collectiveProgress = collectiveProgress;

        setPhase(derivePhase(thresholdProgress));
        root.style.setProperty('--field-shift', fieldShift.toFixed(3));
        root.style.setProperty('--support-progress', collectiveProgress.toFixed(3));

        if (!disperseStarted) {
            setSupportMessage('een enkel punt kan bewegen, maar houdt niets open');
        } else if (claimedParticles.length < 3) {
            setSupportMessage('een nieuw punt telt pas mee zodra andere punten het ook kunnen dragen');
        } else if (stableParticles < collectiveTarget) {
            setSupportMessage(stableParticles + ' van ' + collectiveTarget + ' punten worden nu door het netwerk gedragen');
        } else if (triangleCount < triangleTarget) {
            setSupportMessage('de verbindingen zijn er, maar de configuratie zoekt nog wederkerigheid');
        } else if (!unlocked) {
            setSupportMessage('het netwerk draagt zichzelf bijna; nog een paar wederzijdse verbindingen');
        }

        if (unlocked) {
            setHint('', false);
        } else if (disperseStarted) {
            setHint('loslaten is nog niet genoeg; de punten moeten elkaar nu ook dragen', true);
        } else if (thresholdProgress > 0.34 || thresholdPressure > 0.24) {
            setHint('blijf even in de weerstand; hier verandert niets direct', true);
        } else if (now - startedAt >= hintDelay) {
            setHint('verken het scherm, ook waar het leeg lijkt', true);
        }
    }

    function updateParticles(delta) {
        var frame = Math.min(2.2, delta / 16.6667 || 1);
        var now = performance.now();
        var pointerDistance = pointer.active ? distanceBetween(pointer.x, pointer.y, center.x, center.y) : Infinity;
        var nearCluster = pointer.active && pointerDistance <= interactiveRadius;
        var inVoid = pointer.active && pointerDistance >= voidRadius;
        var thresholdProgress = pointer.active ? clamp((pointerDistance - interactiveRadius) / Math.max(1, voidRadius - interactiveRadius), 0, 1) : 0;
        var engagement = nearCluster ? 1 - pointerDistance / interactiveRadius : 0;

        breathe += delta * (reducedMotion ? 0.00045 : 0.00095);

        if (pointer.active && inVoid && !unlocked) {
            outsideDuration += delta;
        } else {
            outsideDuration = Math.max(0, outsideDuration - delta * 1.35);
        }

        if (!disperseStarted && outsideDuration >= dwellThreshold) {
            beginDisperse();
        }

        if (disperseStarted && releasedCount < releaseQueue.length) {
            releaseMeter += delta * (reducedMotion ? 0.0038 : 0.0055);

            while (releaseMeter >= 1 && releasedCount < releaseQueue.length) {
                releaseQueue[releasedCount].released = true;
                releasedCount += 1;
                releaseMeter -= 1;
            }
        }

        if (!pointer.active) {
            networkFocus.x = lastKnownPointerX || center.x;
            networkFocus.y = lastKnownPointerY || center.y;
        }

        for (var particleIndex = 0; particleIndex < particles.length; particleIndex += 1) {
            var particle = particles[particleIndex];
            var targetX = particle.homeX;
            var targetY = particle.homeY;
            var spring = 0.028;
            var damping = 0.9;

            if (particle.claimed) {
                var anchorWobble = particle.supported ? 1.6 : 12 + Math.sin(breathe * 1.6 + particle.seed) * 5;
                var anchorDrift = particle.supported ? 0.16 : 0.42;
                targetX = networkFocus.x + Math.cos(particle.anchorAngle + breathe * anchorDrift + particle.seed * 0.18) * (particle.anchorRadius + anchorWobble);
                targetY = networkFocus.y + Math.sin(particle.anchorAngle + breathe * anchorDrift + particle.seed * 0.18) * (particle.anchorRadius + anchorWobble) * 0.74;
                spring = particle.supported ? (reducedMotion ? 0.024 : 0.04) : (reducedMotion ? 0.018 : 0.026);
                damping = particle.supported ? 0.87 : 0.8;
                particle.alpha = lerp(particle.alpha, particle.supported ? 1 : 0.76, 0.08);
            } else if (particle.released) {
                if (pointer.active) {
                    targetX = pointer.x + Math.cos(particle.seed + breathe) * 12;
                    targetY = pointer.y + Math.sin(particle.seed + breathe * 1.2) * 12;
                } else {
                    targetX = center.x + Math.cos(particle.homeAngle) * clusterRadius * 1.8;
                    targetY = center.y + Math.sin(particle.homeAngle) * clusterRadius * 1.4;
                }

                spring = reducedMotion ? 0.017 : 0.024;
                damping = 0.88;
                particle.alpha = lerp(particle.alpha, 0.92, 0.05);

                if (pointer.active && distanceBetween(particle.x, particle.y, pointer.x, pointer.y) <= (finePointer ? 20 : 26)) {
                    claimParticle(particle);
                }
            } else {
                var resistance = clamp(thresholdProgress * 0.82 + (outsideDuration / dwellThreshold) * 0.18, 0, 1);
                targetX = particle.homeX + Math.cos(breathe + particle.seed) * (reducedMotion ? 2.2 : 5.5);
                targetY = particle.homeY + Math.sin(breathe * 1.08 + particle.seed) * (reducedMotion ? 1.8 : 4.5);
                spring = lerp(0.028, 0.013, resistance);
                damping = lerp(0.91, 0.83, resistance);

                if (nearCluster) {
                    var dx = pointer.x - particle.x;
                    var dy = pointer.y - particle.y;
                    var distance = Math.max(1, Math.sqrt(dx * dx + dy * dy));
                    var influence = Math.max(0, 1 - distance / (clusterRadius * 1.15));
                    particle.vx += dx * 0.0018 * influence * frame + Math.cos(particle.seed + breathe * 1.4) * 0.09 * influence * frame;
                    particle.vy += dy * 0.0018 * influence * frame + Math.sin(particle.seed + breathe * 1.1) * 0.09 * influence * frame;
                }

                if (pointer.active && thresholdProgress > 0.12) {
                    var centerInfluence = Math.max(0, 1 - distanceBetween(particle.x, particle.y, center.x, center.y) / (clusterRadius * 1.22));
                    particle.vx += (center.x - particle.x) * 0.0011 * thresholdProgress * centerInfluence * frame;
                    particle.vy += (center.y - particle.y) * 0.0011 * thresholdProgress * centerInfluence * frame;
                }

                particle.alpha = lerp(particle.alpha, inVoid ? 0.34 : 0.88, 0.05);
            }

            particle.stability = lerp(particle.stability, particle.supported ? 1 : 0, particle.supported ? 0.08 : 0.06);
            particle.vx += (targetX - particle.x) * spring * frame;
            particle.vy += (targetY - particle.y) * spring * frame;
            particle.vx *= Math.pow(damping, frame);
            particle.vy *= Math.pow(damping, frame);
            particle.x += particle.vx;
            particle.y += particle.vy;
        }

        for (var connectionIndex = 0; connectionIndex < connections.length; connectionIndex += 1) {
            connections[connectionIndex].alpha = Math.min(1, connections[connectionIndex].alpha + delta * 0.0016);
        }

        updateInterface(now, pointerDistance, thresholdProgress);

        var energy = unlocked
            ? 0.88
            : clamp(0.24 + engagement * 0.54 - thresholdProgress * 0.16 + sceneMetrics.collectiveProgress * 0.26 + sceneMetrics.releaseProgress * 0.12, 0.14, 0.78);

        updateCursorDisplay(energy);
    }

    function drawHalo() {
        var haloStrength = 0.08 + sceneMetrics.collectiveProgress * 0.08 + sceneMetrics.releaseProgress * 0.04;
        var haloCompression = 1.36 - sceneMetrics.releaseProgress * 0.24;
        var radius = clusterRadius * haloCompression;
        var halo = context.createRadialGradient(center.x, center.y, 0, center.x, center.y, radius);

        halo.addColorStop(0, 'rgba(134, 162, 188, ' + haloStrength.toFixed(3) + ')');
        halo.addColorStop(0.55, 'rgba(170, 182, 205, ' + (haloStrength * 0.48).toFixed(3) + ')');
        halo.addColorStop(1, 'rgba(255, 255, 255, 0)');

        context.fillStyle = halo;
        context.beginPath();
        context.arc(center.x, center.y, radius, 0, Math.PI * 2);
        context.fill();
    }

    function drawThresholdField() {
        var bandOpacity = sceneMetrics.thresholdProgress * 0.22 + sceneMetrics.thresholdPressure * 0.18;
        var pulse = 1 + Math.sin(breathe * 1.8) * 0.015;
        var field;

        if (bandOpacity <= 0.01 && sceneMetrics.releaseProgress <= 0.01) {
            return;
        }

        field = context.createRadialGradient(center.x, center.y, interactiveRadius * 0.92, center.x, center.y, voidRadius * 1.08);
        field.addColorStop(0, 'rgba(255, 255, 255, 0)');
        field.addColorStop(0.32, 'rgba(156, 176, 198, ' + (bandOpacity * 0.44).toFixed(3) + ')');
        field.addColorStop(0.7, 'rgba(129, 150, 173, ' + (bandOpacity * 0.36).toFixed(3) + ')');
        field.addColorStop(1, 'rgba(255, 255, 255, 0)');

        context.fillStyle = field;
        context.beginPath();
        context.arc(center.x, center.y, voidRadius * 1.12, 0, Math.PI * 2);
        context.fill();

        context.save();
        context.setLineDash([6, 10]);
        context.lineWidth = 1;
        context.strokeStyle = 'rgba(25, 38, 58, ' + (0.08 + bandOpacity * 0.35).toFixed(3) + ')';
        context.beginPath();
        context.arc(center.x, center.y, interactiveRadius * pulse, 0, Math.PI * 2);
        context.stroke();

        context.setLineDash([3, 14]);
        context.strokeStyle = 'rgba(25, 38, 58, ' + (0.06 + bandOpacity * 0.28 + sceneMetrics.releaseProgress * 0.08).toFixed(3) + ')';
        context.beginPath();
        context.arc(center.x, center.y, voidRadius, 0, Math.PI * 2);
        context.stroke();
        context.restore();
    }

    function drawTransitionTrails() {
        context.save();
        context.lineCap = 'round';

        for (var index = 0; index < particles.length; index += 1) {
            var particle = particles[index];
            var displacement = distanceBetween(particle.homeX, particle.homeY, particle.x, particle.y);
            var alpha;

            if ((!particle.released && !particle.claimed) || displacement < 18) {
                continue;
            }

            alpha = particle.claimed
                ? 0.06 + particle.stability * 0.18
                : 0.04 + sceneMetrics.releaseProgress * 0.08;

            context.lineWidth = particle.claimed ? 1.1 + particle.stability * 0.4 : 0.8;
            context.strokeStyle = particle.claimed
                ? 'hsla(' + networkHue + ', 78%, 54%, ' + alpha.toFixed(3) + ')'
                : 'hsla(' + particle.baseHue + ', 32%, ' + particle.baseLight + '%, ' + alpha.toFixed(3) + ')';
            context.beginPath();
            context.moveTo(particle.homeX, particle.homeY);
            context.lineTo(particle.x, particle.y);
            context.stroke();
        }

        context.restore();
    }

    function drawConnections() {
        context.save();
        context.lineCap = 'round';

        for (var index = 0; index < connections.length; index += 1) {
            var connection = connections[index];
            var left = particleMap[connection.left];
            var right = particleMap[connection.right];
            var supportBoost;

            if (!left || !right) {
                continue;
            }

            supportBoost = Math.min(left.stability, right.stability);
            context.lineWidth = 1.05 + supportBoost * 0.5;
            context.strokeStyle = 'hsla(' + networkHue + ', 78%, 54%, ' + (0.08 + connection.alpha * (0.24 + supportBoost * 0.24)).toFixed(3) + ')';
            context.beginPath();
            context.moveTo(left.x, left.y);
            context.lineTo(right.x, right.y);
            context.stroke();
        }

        context.restore();
    }

    function drawParticles() {
        for (var index = 0; index < particles.length; index += 1) {
            var particle = particles[index];
            var fill = '';

            if (particle.claimed) {
                fill = 'hsla(' + networkHue + ', ' + (66 + particle.stability * 18).toFixed(2) + '%, ' + (56 + particle.stability * 4).toFixed(2) + '%, ' + particle.alpha.toFixed(3) + ')';
                context.shadowBlur = 6 + particle.stability * 10;
                context.shadowColor = 'hsla(' + networkHue + ', 84%, 56%, ' + (0.16 + particle.stability * 0.24).toFixed(3) + ')';
            } else if (particle.released) {
                fill = 'hsla(' + particle.baseHue + ', 44%, ' + particle.baseLight + '%, ' + particle.alpha.toFixed(3) + ')';
                context.shadowBlur = 0;
            } else {
                var saturation = lerp(disperseStarted ? 38 : 58, 20, sceneMetrics.thresholdProgress);
                fill = 'hsla(' + particle.baseHue + ', ' + saturation.toFixed(2) + '%, ' + particle.baseLight + '%, ' + particle.alpha.toFixed(3) + ')';
                context.shadowBlur = 0;
            }

            context.fillStyle = fill;
            context.beginPath();
            context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            context.fill();
        }

        context.shadowBlur = 0;
    }

    function drawPointerGlow() {
        var hue;
        var energy;
        var radius;
        var glow;

        if (!pointer.moved) {
            return;
        }

        hue = claimedParticles.length ? networkHue : currentCursorHue();
        energy = unlocked
            ? 0.88
            : clamp(0.18 + sceneMetrics.releaseProgress * 0.28 + sceneMetrics.collectiveProgress * 0.24 - sceneMetrics.thresholdProgress * 0.08, 0.12, 0.76);
        radius = finePointer ? 26 + energy * 18 : 18 + energy * 22;
        glow = context.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, radius);

        glow.addColorStop(0, 'hsla(' + hue + ', 86%, 60%, ' + (energy * 0.26).toFixed(3) + ')');
        glow.addColorStop(0.45, 'hsla(' + hue + ', 86%, 60%, ' + (energy * 0.12).toFixed(3) + ')');
        glow.addColorStop(1, 'hsla(' + hue + ', 86%, 60%, 0)');

        context.fillStyle = glow;
        context.beginPath();
        context.arc(pointer.x, pointer.y, radius, 0, Math.PI * 2);
        context.fill();
    }

    function render() {
        context.clearRect(0, 0, width, height);
        drawHalo();
        drawThresholdField();
        drawTransitionTrails();
        drawConnections();
        drawParticles();
        drawPointerGlow();
    }

    function animate(timestamp) {
        var delta;

        if (!lastFrame) {
            lastFrame = timestamp;
        }

        delta = Math.min(32, timestamp - lastFrame || 16.6667);
        lastFrame = timestamp;

        updateParticles(delta);
        render();
        window.requestAnimationFrame(animate);
    }

    stage.addEventListener('mousemove', function (event) {
        setPointerPosition(event.clientX, event.clientY, true);
    });

    stage.addEventListener('mouseenter', function (event) {
        setPointerPosition(event.clientX, event.clientY, true);
    });

    stage.addEventListener('mouseleave', function () {
        pointer.active = false;
        pointer.inside = false;
        if (cursor) {
            cursor.classList.remove('visible');
        }
    });

    stage.addEventListener('touchstart', function (event) {
        var touch = event.touches[0];
        setPointerPosition(touch.clientX, touch.clientY, true);
    }, { passive: true });

    stage.addEventListener('touchmove', function (event) {
        var touch = event.touches[0];
        setPointerPosition(touch.clientX, touch.clientY, true);
        event.preventDefault();
    }, { passive: false });

    stage.addEventListener('touchend', function () {
        pointer.active = false;
        pointer.inside = false;
    });

    scrollCue.addEventListener('click', function (event) {
        if (!unlocked) {
            event.preventDefault();
            return;
        }

        event.preventDefault();
        outro.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
    });

    window.addEventListener('resize', resizeScene);

    setPhase('known');
    setSupportMessage('een enkel punt kan bewegen, maar houdt niets open');
    resizeScene();
    window.requestAnimationFrame(animate);
})();
