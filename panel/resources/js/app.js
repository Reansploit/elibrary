

import Alpine from 'alpinejs';

window.Alpine = Alpine;

// Pagination + filter linimasa tanpa pindah halaman.
window.logPager = () => ({
    loading: false,
    async go(url) {
        if (!url || this.loading) return;
        this.loading = true;
        document.getElementById('logwrap')?.classList.add('opacity-50');
        try {
            const res = await fetch(url, {
                headers: { 'X-Requested-With': 'XMLHttpRequest', Accept: 'application/json' },
            });
            const data = await res.json();
            if (data.html) {
                document.getElementById('logwrap').innerHTML = data.html;
                const total = document.querySelector('[data-log-total]');
                if (total && data.total !== undefined) total.textContent = data.total;
                const params = new URL(url, location.origin).searchParams;
                const kind = params.get('jenis') || 'semua';
                const page = params.get('page') || '1';
                document.querySelectorAll('[data-loglink]').forEach((a) => {
                    const p = new URL(a.href, location.origin).searchParams;
                    const on = (p.get('jenis') || 'semua') === kind;
                    a.classList.toggle('bg-white', on);
                    a.classList.toggle('shadow-sm', on);
                    a.classList.toggle('text-stone-900', on);
                    a.classList.toggle('text-stone-500', !on);
                });
                history.replaceState(null, '', url.split('?')[0] + `?tab=aktivitas${kind !== 'semua' ? `&jenis=${kind}` : ''}${page !== '1' ? `&page=${page}` : ''}`);
            }
        } catch (e) {
            location.href = url;
        } finally {
            document.getElementById('logwrap')?.classList.remove('opacity-50');
            this.loading = false;
        }
    },
});

document.addEventListener('click', (e) => {
    const filterLink = e.target.closest('[data-loglink]');
    const pageLink = e.target.closest('#logwrap .log-pages a');
    const link = filterLink || pageLink;
    if (!link) return;
    const root = link.closest('[x-data]');
    if (!root || !root._x_dataStack) return;
    e.preventDefault();
    const comp = root._x_dataStack[0];
    if (comp && typeof comp.go === 'function') comp.go(link.href);
});

Alpine.start();
