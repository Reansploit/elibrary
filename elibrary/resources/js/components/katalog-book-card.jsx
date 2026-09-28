import { BookOpen } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import PhotoThumb from '@/components/photo-thumb';

export function AvailabilityBadge({ book }) {
    if (book.jenis === 'ebook') {
        return <Badge variant="secondary">Koleksi digital</Badge>;
    }
    if (!book.remaining || book.remaining <= 0) {
        return <Badge variant="destructive">Habis dipinjam</Badge>;
    }
    if (book.remaining < (book.stock ?? 0)) {
        return <Badge variant="secondary">Tersedia • sisa {book.remaining}</Badge>;
    }
    return <Badge variant="outline">Tersedia</Badge>;
}

export default function KatalogBookCard({ book }) {
    return (
        <Card className="overflow-hidden">
            {book.photo ? (
                <img src={book.photo} alt={book.title} className="h-40 w-full object-cover" />
            ) : (
                <div className="flex h-40 w-full items-center justify-center bg-muted">
                    <BookOpen className="h-10 w-10 text-muted-foreground" />
                </div>
            )}
            <CardContent className="space-y-1 pt-4">
                <p className="truncate text-sm font-semibold">{book.title}</p>
                <p className="truncate text-xs text-muted-foreground">
                    <span className="font-mono">{book.id}</span>
                    {book.author ? ` • ${book.author}` : ''}
                </p>
                <div className="pt-1">
                    <Badge variant={book.jenis === 'ebook' ? 'secondary' : 'outline'}>
                        {book.jenis === 'ebook' ? 'Ebook' : 'Buku'}
                    </Badge>
                </div>
                {book.location && (
                    <p className="truncate text-xs text-muted-foreground">
                        Lokasi: {book.location}
                    </p>
                )}
                {book.category && (
                    <p className="truncate text-xs text-muted-foreground">
                        Kategori: {book.category}
                    </p>
                )}
                <div className="pt-1">
                    <AvailabilityBadge book={book} />
                </div>
            </CardContent>
        </Card>
    );
}
