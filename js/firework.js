(() => {
    const theme = getComputedStyle(document.documentElement).getPropertyValue("--theme").trim().replace(/^['"]|['"]$/g, "");
    if (theme !== "NewYear") return;

    const settings = {
        dprCap: 5,
        gravity: 0.05,
        friction: 0.985,
        autoSpawnMinMs: 600,
        autoSpawnMaxMs: 1800,
        maxParticlesDesktop: 1200,
        maxParticlesMobile: 800
    };

    const DPR = Math.min(window.devicePixelRatio || 1, settings.dprCap);
    const canvas = document.createElement("canvas");
    canvas.id = "ny-fireworks";
    Object.assign(canvas.style, {
        position: "fixed",
        inset: "0",
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: "900"
    });
    document.body.appendChild(canvas);
    const ctx = canvas.getContext("2d");

    let width, height;
    const resize = () => {
        width = canvas.width = Math.floor(innerWidth * DPR);
        height = canvas.height = Math.floor(innerHeight * DPR);
    };
    resize();
    addEventListener("resize", resize, { passive: true });

    const css = getComputedStyle(document.documentElement);
    const getVar = n => css.getPropertyValue(n).trim();
    const COLORS = [
        getVar("--ny-gold") || "#f9d97a",
        getVar("--ny-spark-blue") || "#67c6ff",
        getVar("--ny-fuchsia") || "#ff66d8",
        getVar("--ny-emerald") || "#79ffb1",
        getVar("--ny-champagne") || "#ffeab5",
        getVar("--ny-silver") || "#dfe6ff"
    ];

    const isMobile = innerWidth < 768;
    const MAX_PARTICLES = isMobile ? settings.maxParticlesMobile : settings.maxParticlesDesktop;
    const GRAV = settings.gravity * DPR;
    const FRIC = settings.friction;

    const particles = [];
    const rings = [];

    function burst(px, py, count = isMobile ? 48 : 72, power = isMobile ? 4 : 5.5) {
        const cx = px * DPR;
        const cy = py * DPR;
        const offset = 8 * DPR;

        for (let i = 0; i < count; i++) {
            const ang = Math.random() * Math.PI * 2;
            const speed = (Math.random() * power + 0.5 * power) * DPR;
            const r0 = offset * (0.8 + Math.random() * 0.6);

            particles.push({
                x: cx + Math.cos(ang) * r0,
                y: cy + Math.sin(ang) * r0,
                vx: Math.cos(ang) * speed * (0.6 + 0.4 * Math.random()),
                vy: Math.sin(ang) * speed * (0.6 + 0.4 * Math.random()),
                life: 1,
                decay: 0.007 + Math.random() * 0.012,
                size: 1 + Math.random() * 2,
                color: COLORS[(Math.random() * COLORS.length) | 0],
                blink: Math.random() < 0.22
            });
        }

        rings.push({
            x: cx,
            y: cy,
            r: 0,
            max: (28 + Math.random() * 60) * DPR,
            a: 0.7
        });
    }

    function drawSpark(scale, color) {
        ctx.beginPath();
        ctx.arc(0, 0, 0.7 * scale, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();

        ctx.beginPath();
        ctx.rect(-2 * scale, -0.5 * DPR, 4 * scale, 1 * DPR);
        ctx.rect(-0.5 * DPR, -2 * scale, 1 * DPR, 4 * scale);
        ctx.fillStyle = color;
        ctx.fill();
    }

    let nextSpawnAt = performance.now() + 800;
    let paused = false;

    function loop(t) {
        requestAnimationFrame(loop);
        if (document.hidden || paused) return;

        ctx.globalCompositeOperation = "source-over";
        ctx.clearRect(0, 0, width, height);

        ctx.globalCompositeOperation = "lighter";

        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.vx *= FRIC;
            p.vy = p.vy * FRIC + GRAV;
            p.x += p.vx;
            p.y += p.vy;
            p.life -= p.decay;

            if (p.life <= 0 || p.y > height + 40 * DPR || p.x < -40 || p.x > width + 40) {
                particles.splice(i, 1);
                continue;
            }

            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.globalAlpha = Math.pow(Math.max(0, p.life), 1.2) * (p.blink ? 0.2 + 0.8 * Math.random() : 1);
            drawSpark(p.size * DPR, p.color);
            ctx.restore();
        }

        for (let i = rings.length - 1; i >= 0; i--) {
            const r = rings[i];
            r.r += 2.0 * DPR;
            r.a = Math.max(0, r.a - 0.012);

            if (r.r >= r.max || r.a <= 0) {
                rings.splice(i, 1);
                continue;
            }

            ctx.beginPath();
            ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(255,255,255,${r.a})`;
            ctx.lineWidth = 1 * DPR;
            ctx.stroke();
        }

        if (t >= nextSpawnAt && particles.length < MAX_PARTICLES) {
            const bx = innerWidth * (0.05 + 0.9 * Math.random());
            const by = innerHeight * (0.15 + 0.45 * Math.random());
            burst(bx, by);
            nextSpawnAt = t + (settings.autoSpawnMinMs + Math.random() * (settings.autoSpawnMaxMs - settings.autoSpawnMinMs));
        }
    }

    requestAnimationFrame(loop);

    document.addEventListener("visibilitychange", () => {
        paused = document.hidden;
    });

    window.nxFireworks = {
        burst: (x, y) => burst(x, y),
        pause: () => (paused = true),
        resume: () => (paused = false),
        clear: () => { particles.length = 0; rings.length = 0; }
    };
})();
