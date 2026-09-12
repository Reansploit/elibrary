import { useEffect, useMemo, useState } from 'react';

/**
 * Paginasi client-side (tanpa pindah/refresh halaman).
 * Reset otomatis ke halaman 1 saat daftar berubah (search/filter).
 */
export function usePagination(items, perPage = 20) {
    const [page, setPage] = useState(1);
    const list = items || [];
    const total = list.length;
    const totalPages = Math.max(1, Math.ceil(total / perPage));

    useEffect(() => {
        setPage(1);
    }, [items]);

    const safePage = Math.min(page, totalPages);

    const paged = useMemo(
        () => list.slice((safePage - 1) * perPage, safePage * perPage),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [items, safePage, perPage]
    );

    return { page: safePage, totalPages, setPage, paged, total, perPage };
}
