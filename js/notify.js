(function () {
    const NX_I18N = {
        toast_locked: { en: 'This button is locked', th: 'ปุ่มถูกล็อก' }
    };

    function nxGetLang() {
        let lang =
            (window.NX_SETTINGS && window.NX_SETTINGS.lang) ||
            document.documentElement.getAttribute('lang') ||
            localStorage.getItem('nx_lang') ||
            localStorage.getItem('lang') || 'en';
        lang = String(lang).toLowerCase();
        return lang.startsWith('th') ? 'th' : 'en';
    }

    function nxT(key, fallback) {
        const table = NX_I18N[key];
        if (table) return table[nxGetLang()] || table.en || fallback || key;
        return fallback || key;
    }

    function showToast(messageKeyOrText, timeout) {
        const area = document.getElementById('nx-toast-area');
        if (!area) return;

        const toast = document.createElement('div');
        toast.className = 'nx-toast';
        toast.setAttribute('role', 'alert');

        const bar = document.createElement('span');
        bar.className = 'nx-toast__bar';

        const text = document.createElement('div');
        text.className = 'nx-toast__text';

        const resolved = typeof messageKeyOrText === 'string'
            ? nxT(messageKeyOrText, messageKeyOrText)
            : nxT('toast_locked', 'This button is locked');

        text.textContent = resolved;

        toast.appendChild(bar);
        toast.appendChild(text);
        area.appendChild(toast);

        let hideTimer = setTimeout(close, timeout ?? 2400);
        toast.addEventListener('mouseenter', () => { clearTimeout(hideTimer); });
        toast.addEventListener('mouseleave', () => { hideTimer = setTimeout(close, 900); });
        toast.addEventListener('click', close);

        function close() {
            toast.classList.add('nx-toast--closing');
            toast.addEventListener('animationend', () => toast.remove(), { once: true });
        }
    }

    document.addEventListener('click', function (e) {
        const btn = e.target.closest('.nx-btn--ghost');
        if (!btn) return;
        e.preventDefault();
        showToast('toast_locked');
    }, { passive: false });
})();