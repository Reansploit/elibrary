import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function BookForm({ book }) {
  const isEdit = !!book;

  const { data, setData, post, put, errors, processing } = useForm({
    id_buku: book?.id || '',
    judul_buku: book?.title || '',
    pengarang: book?.author || '',
    penerbit: book?.publisher || '',
    th_terbit: book?.year?.toString() || '',
  });

  const submit = (e) => {
    e.preventDefault();
    if (isEdit) {
      put(route('books.update', book.id));
    } else {
      post(route('books.store'));
    }
  };

  return (
    <AuthenticatedLayout>
      <Head title={isEdit ? 'Edit Buku' : 'Tambah Buku'} />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/25">
              <BookOpen className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-heading text-2xl font-semibold tracking-tight">
                {isEdit ? 'Edit Buku' : 'Tambah Buku'}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {isEdit ? 'Ubah data buku yang sudah ada' : 'Masukkan data buku baru'}
              </p>
            </div>
          </div>
          <Button variant="outline" asChild>
            <Link href={route('books.index')}>
              <ArrowLeft className="h-4 w-4" />
              Kembali
            </Link>
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={submit}>
          <Card className="card-lift">
            <CardHeader className="flex-row items-center justify-between">
              <div>
                <CardTitle>Data Buku</CardTitle>
                <CardDescription>
                  Isi semua field yang diperlukan
                </CardDescription>
              </div>
              <Badge variant="outline" className="gap-1">
                <BookOpen className="h-3 w-3" />
                {isEdit ? 'Ubah' : 'Baru'}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* ID Buku - only shown for create */}
              {!isEdit && (
                <div className="space-y-2">
                  <Label htmlFor="id_buku">
                    ID Buku <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="id_buku"
                    placeholder="Contoh: BK-001"
                    value={data.id_buku}
                    onChange={(e) => setData('id_buku', e.target.value)}
                    aria-invalid={!!errors.id_buku || undefined}
                  />
                  {errors.id_buku && (
                    <p className="text-xs text-destructive">{errors.id_buku}</p>
                  )}
                </div>
              )}

              {/* Judul Buku */}
              <div className="space-y-2">
                <Label htmlFor="judul_buku">Judul Buku</Label>
                <Input
                  id="judul_buku"
                  placeholder="Masukkan judul buku"
                  value={data.judul_buku}
                  onChange={(e) => setData('judul_buku', e.target.value)}
                  aria-invalid={!!errors.judul_buku || undefined}
                />
                {errors.judul_buku && (
                  <p className="text-xs text-destructive">{errors.judul_buku}</p>
                )}
              </div>

              {/* Pengarang */}
              <div className="space-y-2">
                <Label htmlFor="pengarang">Pengarang</Label>
                <Input
                  id="pengarang"
                  placeholder="Nama pengarang"
                  value={data.pengarang}
                  onChange={(e) => setData('pengarang', e.target.value)}
                  aria-invalid={!!errors.pengarang || undefined}
                />
                {errors.pengarang && (
                  <p className="text-xs text-destructive">{errors.pengarang}</p>
                )}
              </div>

              {/* Penerbit */}
              <div className="space-y-2">
                <Label htmlFor="penerbit">Penerbit</Label>
                <Input
                  id="penerbit"
                  placeholder="Nama penerbit"
                  value={data.penerbit}
                  onChange={(e) => setData('penerbit', e.target.value)}
                  aria-invalid={!!errors.penerbit || undefined}
                />
                {errors.penerbit && (
                  <p className="text-xs text-destructive">{errors.penerbit}</p>
                )}
              </div>

              {/* Tahun Terbit */}
              <div className="space-y-2">
                <Label htmlFor="th_terbit">
                  Tahun Terbit <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="th_terbit"
                  type="number"
                  placeholder="Contoh: 2024"
                  min={1900}
                  max={2027}
                  value={data.th_terbit}
                  onChange={(e) => setData('th_terbit', e.target.value)}
                  aria-invalid={!!errors.th_terbit || undefined}
                />
                {errors.th_terbit && (
                  <p className="text-xs text-destructive">{errors.th_terbit}</p>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t px-6 py-4">
              <Button variant="outline" type="button" asChild>
                <Link href={route('books.index')}>Batal</Link>
              </Button>
              <Button type="submit" disabled={processing} className="shine-sweep">
                <Save className="h-4 w-4" />
                {processing ? 'Menyimpan...' : isEdit ? 'Perbarui' : 'Simpan'}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </AuthenticatedLayout>
  );
}
