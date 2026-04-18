(function () {
    'use strict';

    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ======================================================================
       Hero canvas — drifting dot clouds
       ====================================================================== */

    var canvas = document.getElementById('hero-canvas');
    var ctx = canvas.getContext('2d');
    var width = 0;
    var height = 0;
    var mouseX = null;
    var mouseY = null;
    var hasPointer = false;
    var orientX = null;
    var orientY = null;
    var hasOrientation = false;
    var clouds = [];
    var animationId = null;
    var heroVisible = true;

    function gaussianRandom() {
        var u1 = Math.random();
        var u2 = Math.random();
        return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    }

    function createCloud(cx, cy, count, spread, opacity, radius) {
        var dots = [];
        for (var i = 0; i < count; i++) {
            dots.push({
                ox: gaussianRandom() * spread * 0.45,
                oy: gaussianRandom() * spread * 0.45
            });
        }
        return {
            baseX: cx,
            baseY: cy,
            x: cx,
            y: cy,
            dots: dots,
            spread: spread,
            opacity: opacity,
            radius: radius,
            phase: Math.random() * Math.PI * 2,
            speed: 0.00025 + Math.random() * 0.00015,
            drift: 25 + Math.random() * 20
        };
    }

    function initClouds() {
        clouds = [
            createCloud(width * 0.3, height * 0.4, 90, Math.min(width, height) * 0.28, 0.14, 1.8),
            createCloud(width * 0.65, height * 0.55, 80, Math.min(width, height) * 0.25, 0.11, 2.0),
            createCloud(width * 0.5, height * 0.35, 70, Math.min(width, height) * 0.22, 0.09, 1.6)
        ];
    }

    function resizeCanvas() {
        var dpr = window.devicePixelRatio || 1;
        var rect = canvas.getBoundingClientRect();
        width = rect.width;
        height = rect.height;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        initClouds();
    }

    function updateCloud(cloud, time) {
        var driftX = Math.cos(time * cloud.speed + cloud.phase) * cloud.drift;
        var driftY = Math.sin(time * cloud.speed * 0.7 + cloud.phase + 1) * cloud.drift;

        var goalX = cloud.baseX + driftX;
        var goalY = cloud.baseY + driftY;

        if (hasPointer && mouseX !== null) {
            goalX += (mouseX - goalX) * 0.12;
            goalY += (mouseY - goalY) * 0.12;
        } else if (hasOrientation && orientX !== null) {
            goalX += orientX * width * 0.15;
            goalY += orientY * height * 0.15;
        }

        cloud.x += (goalX - cloud.x) * 0.018;
        cloud.y += (goalY - cloud.y) * 0.018;
    }

    function drawCloud(cloud) {
        ctx.fillStyle = 'rgba(58, 81, 105, ' + cloud.opacity + ')';
        for (var i = 0; i < cloud.dots.length; i++) {
            var d = cloud.dots[i];
            ctx.beginPath();
            ctx.arc(cloud.x + d.ox, cloud.y + d.oy, cloud.radius, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function animate(time) {
        if (!heroVisible) {
            animationId = requestAnimationFrame(animate);
            return;
        }
        ctx.clearRect(0, 0, width, height);
        for (var i = 0; i < clouds.length; i++) {
            updateCloud(clouds[i], time);
            drawCloud(clouds[i]);
        }
        animationId = requestAnimationFrame(animate);
    }

    function drawStatic() {
        ctx.clearRect(0, 0, width, height);
        for (var i = 0; i < clouds.length; i++) {
            drawCloud(clouds[i]);
        }
    }

    function initHero() {
        resizeCanvas();

        if (reducedMotion) {
            drawStatic();
            return;
        }

        // Mouse tracking on hero
        var heroEl = document.getElementById('hero');
        heroEl.addEventListener('mousemove', function (e) {
            var rect = heroEl.getBoundingClientRect();
            mouseX = e.clientX - rect.left;
            mouseY = e.clientY - rect.top;
            hasPointer = true;
        });
        heroEl.addEventListener('mouseleave', function () {
            hasPointer = false;
        });

        // Touch tracking
        heroEl.addEventListener('touchmove', function (e) {
            var touch = e.touches[0];
            var rect = heroEl.getBoundingClientRect();
            mouseX = touch.clientX - rect.left;
            mouseY = touch.clientY - rect.top;
            hasPointer = true;
        }, { passive: true });
        heroEl.addEventListener('touchend', function () {
            hasPointer = false;
        });

        // Device orientation (mobile, if available)
        if (window.DeviceOrientationEvent) {
            if (typeof DeviceOrientationEvent.requestPermission !== 'function') {
                window.addEventListener('deviceorientation', function (e) {
                    if (e.gamma !== null && e.beta !== null) {
                        orientX = Math.max(-1, Math.min(1, e.gamma / 45));
                        orientY = Math.max(-1, Math.min(1, (e.beta - 45) / 45));
                        hasOrientation = true;
                    }
                });
            }
        }

        // Pause animation when hero is off-screen
        if ('IntersectionObserver' in window) {
            var obs = new IntersectionObserver(function (entries) {
                heroVisible = entries[0].isIntersecting;
            }, { threshold: 0 });
            obs.observe(heroEl);
        }

        window.addEventListener('resize', resizeCanvas);
        animationId = requestAnimationFrame(animate);
    }

    /* ======================================================================
       Scene 1 — Layer slider
       ====================================================================== */

    function initSlider() {
        var slider = document.getElementById('layer-slider');
        if (!slider) return;

        var layers = document.querySelectorAll('#delta-sketch .layer');
        var offsets = { beleid: -1, beton: 0, water: 1 };

        function update() {
            var val = (slider.value - 50) / 50; // -1 to 1
            layers.forEach(function (g) {
                var name = g.getAttribute('data-layer');
                var shift = (offsets[name] || 0) * val * 22;
                g.style.transform = 'translateY(' + shift + 'px)';
            });
        }

        slider.addEventListener('input', update);
        update();
    }

    /* ======================================================================
       Scene 2 — Rabobank text toggle
       ====================================================================== */

    function initRaboToggle() {
        var btn = document.getElementById('rabo-toggle');
        var before = document.getElementById('rabo-before');
        var after = document.getElementById('rabo-after');
        if (!btn || !before || !after) return;

        var showingAfter = false;

        btn.addEventListener('click', function () {
            showingAfter = !showingAfter;
            if (showingAfter) {
                before.classList.remove('active');
                after.classList.add('active');
                btn.textContent = 'en zo zag ik het daarvoor.';
            } else {
                after.classList.remove('active');
                before.classList.add('active');
                btn.textContent = 'en zo zag ik het een jaar later.';
            }
        });
    }

    /* ======================================================================
       Scroll fade-in
       ====================================================================== */

    function initFadeIn() {
        if (reducedMotion) return;

        var els = document.querySelectorAll('.fade-in');
        if (!els.length) return;

        if ('IntersectionObserver' in window) {
            var observer = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.12 });

            els.forEach(function (el) {
                observer.observe(el);
            });
        } else {
            // Fallback: show everything
            els.forEach(function (el) {
                el.classList.add('visible');
            });
        }
    }

    /* ======================================================================
       Init
       ====================================================================== */

    initHero();
    initSlider();
    initRaboToggle();
    initFadeIn();
})();
