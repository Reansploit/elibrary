/**
 * Kompresi foto di browser sebelum upload.
 * Foto HP (3–10MB) diperkecil agar lolos limit upload server (2MB)
 * dan hemat storage. Kembalikan file asli bila tidak perlu / gagal.
 */
export async function compressImage(
    file,
    { maxDim = 1600, quality = 0.82, threshold = 1.5 * 1024 * 1024 } = {}
) {
    if (!file || !file.type?.startsWith('image/')) return file;
    if (file.size <= threshold) return file;

    try {
        const bitmap = await createImageBitmap(file);
        const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
        if (scale >= 1) {
            bitmap.close?.();
            return file;
        }

        const canvas = document.createElement('canvas');
        canvas.width = Math.round(bitmap.width * scale);
        canvas.height = Math.round(bitmap.height * scale);
        canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
        bitmap.close?.();

        const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality));
        if (!blob) return file;

        return new File([blob], file.name.replace(/\.\w+$/, '.jpg'), { type: 'image/jpeg' });
    } catch {
        return file;
    }
}
