import { usePage } from '@inertiajs/react';

/**
 * Cek permission user yang sedang login (dibagikan backend via auth.permissions).
 * Terima satu nama permission atau array (OR).
 *
 * Contoh: const can = useCan(); if (can(['view_books', 'manage_books'])) ...
 */
export function useCan() {
    const { props } = usePage();
    const permissions = props.auth?.permissions ?? [];

    return (needed) => {
        if (!needed) return true;
        const list = Array.isArray(needed) ? needed : [needed];
        return list.some((p) => permissions.includes(p));
    };
}
