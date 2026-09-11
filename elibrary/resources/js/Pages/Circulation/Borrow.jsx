import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, BookX, ArrowLeftRight, Clock, User } from 'lucide-react';
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
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';

export default function Borrow({ books, members }) {
  const { data, setData, post, errors, processing } = useForm({
    id_buku: '',
    id_anggota: '',
    tgl_pinjam: new Date().toISOString().split('T')[0],
    jam_pinjam: new Date().toTimeString().slice(0, 5),
  });

  const submit = (e) => {
    e.preventDefault();
    post(route('circulation.store'));
  };

  return (
    <AuthenticatedLayout>
      <Head title="Pinjam Buku" />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/25">
              <ArrowLeftRight className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-heading text-2xl font-semibold tracking-tight">Pinjam Buku</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Catat peminjaman buku oleh anggota
              </p>
            </div>
          </div>
          <Button variant="outline" asChild>
            <Link href={route('circulation.index')}>
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
                <CardTitle>Data Peminjaman</CardTitle>
                <CardDescription>
                  Pilih buku dan anggota yang akan meminjam
                </CardDescription>
              </div>
              <Badge variant="outline" className="gap-1">
                <BookX className="h-3 w-3" />
                Baru
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Buku */}
              <div className="space-y-2">
                <Label htmlFor="id_buku">
                  Buku <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={data.id_buku}
                  onValueChange={(val) => setData('id_buku', val)}
                >
                  <SelectTrigger id="id_buku" className="w-full" aria-invalid={!!errors.id_buku || undefined}>
                    <SelectValue placeholder="Pilih buku" />
                  </SelectTrigger>
                  <SelectContent>
                    {books?.map((book) => (
                      <SelectItem key={book.id} value={book.id}>
                        {book.id} - {book.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.id_buku && (
                  <p className="text-xs text-destructive">{errors.id_buku}</p>
                )}
              </div>

              {/* Tanggal & Jam Pinjam (Otomatis) */}
              <div className="space-y-2">
                <Label htmlFor="tgl_pinjam">
                  Tanggal & Jam Pinjam <span className="text-destructive">*</span>
                </Label>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <Input
                      id="tgl_pinjam"
                      type="date"
                      value={data.tgl_pinjam}
                      onChange={(e) => setData('tgl_pinjam', e.target.value)}
                      readOnly
                      className="bg-muted"
                    />
                  </div>
                  <div className="flex-1">
                    <Input
                      id="jam_pinjam"
                      type="time"
                      value={data.jam_pinjam}
                      onChange={(e) => setData('jam_pinjam', e.target.value)}
                      readOnly
                      className="bg-muted"
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">Otomatis mengikuti waktu server saat ini</p>
              </div>

              {/* Anggota (RFID/Nama) */}
              <div className="space-y-2">
                <Label htmlFor="id_anggota">
                  Anggota / RFID <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={data.id_anggota}
                  onValueChange={(val) => setData('id_anggota', val)}
                >
                  <SelectTrigger id="id_anggota" className="w-full" aria-invalid={!!errors.id_anggota || undefined}>
                    <SelectValue placeholder="Pilih anggota / scan RFID" />
                  </SelectTrigger>
                  <SelectContent>
                    {members?.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.id} - {member.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.id_anggota && (
                  <p className="text-xs text-destructive">{errors.id_anggota}</p>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t px-6 py-4">
              <Button variant="outline" type="button" asChild>
                <Link href={route('circulation.index')}>Batal</Link>
              </Button>
              <Button type="submit" disabled={processing} className="shine-sweep">
                <BookX className="h-4 w-4" />
                {processing ? 'Menyimpan...' : 'Simpan Peminjaman'}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </AuthenticatedLayout>
  );
}
