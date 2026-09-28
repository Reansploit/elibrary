export const readerDemoDocument = {
    version: '0.1.0',
    id: 'reader-demo',
    metadata: {
        title: 'Contoh dokumen untuk pengujian visual',
        language: 'id',
        sourceFormat: 'html',
    },
    children: [
        {
            type: 'chapter',
            id: 'demo-chapter',
            title: 'Memulai membaca',
            children: [
                {
                    type: 'paragraph',
                    id: 'demo-intro',
                    content: [
                        { type: 'text', text: 'Halaman ini adalah ' },
                        { type: 'text', text: 'preview engine', marks: ['bold'] },
                        { type: 'text', text: ' di dalam E-Library. Isinya masih contoh, bukan PDF yang sudah diunggah.' },
                    ],
                },
                {
                    type: 'heading',
                    id: 'demo-heading-1',
                    level: 2,
                    content: [{ type: 'text', text: 'Teks yang mudah dibaca' }],
                },
                {
                    type: 'paragraph',
                    id: 'demo-body-1',
                    content: [
                        { type: 'text', text: 'Tampilan baca harus tetap nyaman ketika layar berubah. Baris teks mengikuti lebar area baca, ukuran font dapat diubah, dan pilihan tema tidak mengubah urutan dokumen.' },
                    ],
                },
                {
                    type: 'quote',
                    id: 'demo-quote',
                    children: [
                        {
                            type: 'paragraph',
                            id: 'demo-quote-text',
                            content: [{ type: 'text', text: 'Dokumen menyesuaikan pembaca, bukan pembaca yang dipaksa mengikuti format asli.' }],
                        },
                    ],
                },
                {
                    type: 'heading',
                    id: 'demo-heading-2',
                    level: 2,
                    content: [{ type: 'text', text: 'Hal yang diuji' }],
                },
                {
                    type: 'list',
                    id: 'demo-list',
                    ordered: false,
                    items: [
                        {
                            id: 'demo-list-1',
                            content: [
                                {
                                    type: 'paragraph',
                                    id: 'demo-list-text-1',
                                    content: [{ type: 'text', text: 'Reflow saat ukuran layar berubah.' }],
                                },
                            ],
                        },
                        {
                            id: 'demo-list-2',
                            content: [
                                {
                                    type: 'paragraph',
                                    id: 'demo-list-text-2',
                                    content: [{ type: 'text', text: 'Kontras dan jarak baris pada tema terang serta gelap.' }],
                                },
                            ],
                        },
                        {
                            id: 'demo-list-3',
                            content: [
                                {
                                    type: 'paragraph',
                                    id: 'demo-list-text-3',
                                    content: [{ type: 'text', text: 'Struktur heading, kutipan, dan daftar tetap terbaca.' }],
                                },
                            ],
                        },
                    ],
                },
                {
                    type: 'paragraph',
                    id: 'demo-end',
                    content: [{ type: 'text', text: 'Setelah preview stabil, langkah berikutnya adalah menyambungkan file PDF ke route viewer yang sama.' }],
                },
            ],
        },
    ],
    assets: [],
};
