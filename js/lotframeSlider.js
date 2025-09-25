(function lotframeSlider() {
    const sections = document.querySelectorAll('.nx-banner.nx-banner--lotframe');

    sections.forEach(section => {
        if (section.dataset.lotframeInit === "1") return;
        section.dataset.lotframeInit = "1";

        const slides = Array.from(section.children)
            .filter(el => el.classList && el.classList.contains('nx-banner__inner'));
        if (!slides.length) return;

        const bgwrap = document.createElement('div');
        bgwrap.className = 'nx-lotframe__bgwrap';
        const bgA = document.createElement('div');
        const bgB = document.createElement('div');
        bgA.className = 'nx-lotframe__bg is-front';
        bgB.className = 'nx-lotframe__bg';
        bgwrap.append(bgA, bgB);
        section.insertBefore(bgwrap, section.firstChild);

        const viewport = document.createElement('div');
        viewport.className = 'nx-lotframe__viewport';
        const track = document.createElement('div');
        track.className = 'nx-lotframe__track';

        const firstInner = slides[0];
        if (firstInner && firstInner.parentNode === section) {
            section.insertBefore(viewport, firstInner);
        } else {
            section.appendChild(viewport);
        }
        viewport.appendChild(track);

        slides.forEach(sl => { sl.classList.add('nx-lotframe__slide'); track.appendChild(sl); });

        const nav = document.createElement('div');
        nav.className = 'nx-banner-nav';
        nav.innerHTML = `
            <button class="nx-banner-nav__btn" data-dir="prev" aria-label="Previous">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                    stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
            </button>
            <button class="nx-banner-nav__btn" data-dir="next" aria-label="Next">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                    stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
            </button>`;
        section.appendChild(nav);

        function cssGapPx() {
            const cs = getComputedStyle(track);
            const g = parseFloat(cs.columnGap || cs.gap);
            return isNaN(g) ? 0 : g;
        }

        function lockHeight() {
            const maxH = Math.max(...slides.map(s => s.getBoundingClientRect().height));
            section.style.setProperty('--lotframe-minh', Math.max(120, Math.ceil(maxH)) + 'px');
        }

        const STG_SELECTORS = [
            '.nx-banner__eyebrow',
            '.nx-banner__title',
            '.nx-banner__subtitle',
            '.nx-banner__actions'
        ];

        function stgPrep(sl) {
            sl.classList.add('nx-stg');
            STG_SELECTORS.forEach(sel => {
                const el = sl.querySelector(sel);
                if (!el) return;
                el.setAttribute('data-st', '');
                el.classList.remove('is-in');
                el.style.transitionDelay = '0ms';
            });
        }
        function stgResetAll() { slides.forEach(stgPrep); }

        function stgPlay(sl) {
            let delay = 0;
            const step = 110;
            STG_SELECTORS.forEach(sel => {
                const el = sl.querySelector(sel);
                if (!el) return;
                el.style.transitionDelay = delay + 'ms';
                el.classList.add('is-in');
                delay += step;
            });
        }

        function stgRun(i) {
            stgResetAll();
            const target = slides[i];
            requestAnimationFrame(() => requestAnimationFrame(() => stgPlay(target)));
        }

        stgRun(0);

        let useA = true;
        function setBg(i) {
            const url = slides[i]?.getAttribute('data-bg') || '';
            const front = useA ? bgA : bgB;
            const back = useA ? bgB : bgA;
            back.style.setProperty('--bg', `url('${url}')`);
            front.classList.remove('is-front');
            back.classList.add('is-front');
            useA = !useA;
        }

        let index = 0, busy = false;
        function applyTransform() {
            const W = viewport.clientWidth;
            const G = cssGapPx();
            const x = -((W + G) * index);
            track.style.transform = `translate3d(${Math.round(x)}px,0,0)`;
        }

        function go(to) {
            if (busy) return;
            const n = slides.length;
            index = (to + n) % n;
            busy = true;
            applyTransform();
            setBg(index);
            stgRun(index);
            setTimeout(() => busy = false, 480);
        }

        lockHeight();
        setBg(0);
        applyTransform();

        nav.addEventListener('click', e => {
            const btn = e.target.closest('.nx-banner-nav__btn');
            if (!btn) return;
            go(index + (btn.dataset.dir === 'next' ? 1 : -1));
        });

        let rt;
        window.addEventListener('resize', () => {
            clearTimeout(rt);
            rt = setTimeout(() => { lockHeight(); applyTransform(); }, 120);
        });
    });
})();