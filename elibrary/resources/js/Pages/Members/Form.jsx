import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save, Users } from 'lucide-react';
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

export default function MemberForm({ member }) {
  const isEdit = !!member;

  const { data, setData, post, put, errors, processing } = useForm({
    id_anggota: member?.id || '',
    nama: member?.name || '',
    jekel: member?.gender || '',
    kelas: member?.class || '',
  });

  const submit = (e) => {
    e.preventDefault();
    if (isEdit) {
      put(route('members.update', member.id));
    } else {
      post(route('members.store'));
    }
  };

  return (
    <AuthenticatedLayout>
      <Head title={isEdit ? 'Edit Anggota' : 'Tambah Anggota'} />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/25">
              <Users className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-heading text-2xl font-semibold tracking-tight">
                {isEdit ? 'Edit Anggota' : 'Tambah Anggota'}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {isEdit ? 'Ubah data anggota yang sudah ada' : 'Masukkan data anggota baru'}
              </p>
            </div>
          </div>
          <Button variant="outline" asChild>
            <Link href={route('members.index')}>
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
                <CardTitle>Data Anggota</CardTitle>
                <CardDescription>
                  Isi semua field yang diperlukan
                </CardDescription>
              </div>
              <Badge variant="outline" className="gap-1">
                <Users className="h-3 w-3" />
                {isEdit ? 'Ubah' : 'Baru'}
              </Badge>
            </CardHeader>
<CardContent className="space-y-4">

               {/* Nama */}
               <div className="space-y-2">
                 <Label htmlFor="nama">Nama</Label>
                 <Input
                   id="nama"
                   placeholder="Nama lengkap anggota"
                   value={data.nama}
                   onChange={(e) => setData('nama', e.target.value)}
                   aria-invalid={!!errors.nama || undefined}
                 />
                 {errors.nama && (
                   <p className="text-xs text-destructive">{errors.nama}</p>
                 )}
               </div>

               {/* Jenis Kelamin */}
               <div className="space-y-2">
                 <Label htmlFor="jekel">
                   Jenis Kelamin <span className="text-destructive">*</span>
                 </Label>
                 <Select
                   value={data.jekel}
                   onValueChange={(val) => setData('jekel', val)}
                 >
                   <SelectTrigger id="jekel" className="w-full" aria-invalid={!!errors.jekel || undefined}>
                     <SelectValue placeholder="Pilih jenis kelamin" />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                     <SelectItem value="Perempuan">Perempuan</SelectItem>
                   </SelectContent>
                 </Select>
                 {errors.jekel && (
                   <p className="text-xs text-destructive">{errors.jekel}</p>
                 )}
               </div>

               {/* Kelas */}
               <div className="space-y-2">
                 <Label htmlFor="kelas">Kelas</Label>
                 <Input
                   id="kelas"
                   placeholder="Contoh: X IPA 1"
                   value={data.kelas}
                   onChange={(e) => setData('kelas', e.target.value)}
                   aria-invalid={!!errors.kelas || undefined}
                 />
                 {errors.kelas && (
                   <p className="text-xs text-destructive">{errors.kelas}</p>
                 )}
               </div>

               {/* ID Anggota - only shown for create */}
               {!isEdit && (
                 <div className="space-y-2">
                   <Label htmlFor="id_anggota">
                     ID RFID <span className="text-destructive">*</span>
                   </Label>
                   <Input
                     id="id_anggota"
                     placeholder="Contoh: 548645146"
                     maxLength={50}
                     value={data.id_anggota}
                     onChange={(e) => setData('id_anggota', e.target.value)}
                     aria-invalid={!!errors.id_anggota || undefined}
                   />
                   {errors.id_anggota && (
                     <p className="text-xs text-destructive">{errors.id_anggota}</p>
                   )}
                 </div>
               )}
             </CardContent>
            <CardFooter className="flex justify-between border-t px-6 py-4">
              <Button variant="outline" type="button" asChild>
                <Link href={route('members.index')}>Batal</Link>
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
