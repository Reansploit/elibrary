import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import {
  Settings,
  UserPlus,
  Users,
  BookOpen,
  ShieldAlert,
  Save,
  Loader2,
  Edit,
  Trash2,
  Key,
  Plus,
} from 'lucide-react';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';

const tabs = [
  { id: 'general', label: 'Umum', icon: Settings },
  { id: 'loan', label: 'Peminjaman', icon: BookOpen },
  { id: 'penalty', label: 'Sanksi', icon: ShieldAlert },
  { id: 'users', label: 'Akun Pengguna', icon: Users },
  { id: 'roles', label: 'Role & Izin', icon: Key },
];

const emptyUserForm = {
  name: '',
  username: '',
  email: '',
  password: '',
  password_confirmation: '',
  role: '',
};

const emptyRoleForm = {
  name: '',
  permissions: [],
};

export default function SettingsIndex({ settings, users, roles, permissions }) {
  const [activeTab, setActiveTab] = useState('general');
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editingRole, setEditingRole] = useState(null);

  const safeSettings = settings ?? {
    loan: { max_loans_per_member: 3, loan_duration_days: 7 },
    penalty: { late_penalty_days: 3, penalty_enabled: true },
    general: { library_name: 'E-Library' },
  };
  const safeUsers = users ?? [];
  const safeRoles = roles ?? [];
  const safePermissions = permissions ?? [];
  const roleOptions = safeRoles.map((r) => r.name);

  const { data, setData, post, put, delete: destroy, processing, errors } = useForm({
    max_loans_per_member: safeSettings.loan.max_loans_per_member ?? 3,
    loan_duration_days: safeSettings.loan.loan_duration_days ?? 7,
    late_penalty_days: safeSettings.penalty.late_penalty_days ?? 3,
    penalty_enabled: safeSettings.penalty.penalty_enabled ?? true,
    library_name: safeSettings.general.library_name ?? 'E-Library',
    ...emptyUserForm,
    ...emptyRoleForm,
  });

  const openAddUser = () => {
    setEditingUser(null);
    setData((prev) => ({ ...emptyUserForm, ...prev }));
    setUserDialogOpen(true);
  };

  const openEditUser = (user) => {
    setEditingUser(user);
    setData({
      name: user.name ?? '',
      username: user.username ?? '',
      email: user.email ?? '',
      password: '',
      password_confirmation: '',
      role: user.role ?? '',
    });
    setUserDialogOpen(true);
  };

  const openAddRole = () => {
    setEditingRole(null);
    setData((prev) => ({ ...emptyRoleForm, ...prev }));
    setRoleDialogOpen(true);
  };

  const openEditRole = (role) => {
    setEditingRole(role);
    setData({
      name: role.name ?? '',
      permissions: role.permissions ?? [],
    });
    setRoleDialogOpen(true);
  };

  const handleUserSubmit = (e) => {
    e.preventDefault();
    const payload = {
      name: data.name,
      username: data.username,
      email: data.email,
      role: data.role,
    };

    if (!editingUser) {
      payload.password = data.password;
      payload.password_confirmation = data.password_confirmation;
      post(route('settings.users.store'), payload, {
        onSuccess: () => {
          setUserDialogOpen(false);
          setEditingUser(null);
        },
      });
      return;
    }

    put(route('settings.users.update', editingUser.id), payload, {
      onSuccess: () => {
        setUserDialogOpen(false);
        setEditingUser(null);
      },
    });
  };

  const handleRoleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      name: data.name,
      permissions: data.permissions,
    };

    if (!editingRole) {
      post(route('settings.roles.store'), payload, {
        onSuccess: () => {
          setRoleDialogOpen(false);
          setEditingRole(null);
        },
      });
      return;
    }

    put(route('settings.roles.update', editingRole.id), payload, {
      onSuccess: () => {
        setRoleDialogOpen(false);
        setEditingRole(null);
      },
    });
  };

  const handleSettingsSubmit = (e) => {
    e.preventDefault();
    post(route('settings.update'), {
      max_loans_per_member: data.max_loans_per_member,
      loan_duration_days: data.loan_duration_days,
      late_penalty_days: data.late_penalty_days,
      penalty_enabled: data.penalty_enabled,
      library_name: data.library_name,
    });
  };

  const handleDeleteUser = (id) => {
    if (window.confirm('Yakin ingin menghapus akun ini?')) {
      destroy(route('settings.users.destroy', id), {
        onSuccess: () => {},
      });
    }
  };

  const handleDeleteRole = (id) => {
    if (window.confirm('Yakin ingin menghapus role ini?')) {
      destroy(route('settings.roles.destroy', id), {
        onSuccess: () => {},
      });
    }
  };

  const togglePermission = (permissionName) => {
    const current = data.permissions || [];
    if (current.includes(permissionName)) {
      setData('permissions', current.filter((p) => p !== permissionName));
    } else {
      setData('permissions', [...current, permissionName]);
    }
  };

  const renderSettingsForm = (children) => (
    <Card className="card-lift">
      <form onSubmit={handleSettingsSubmit}>
        <CardContent className="space-y-4">{children}</CardContent>
        <CardFooter className="flex justify-end border-t px-6 py-4">
          <Button type="submit" disabled={processing} className="shine-sweep">
            <Save className="h-4 w-4" />
            {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Simpan'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );

  return (
    <AuthenticatedLayout>
      <Head title="Pengaturan" />

      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/25">
              <Settings className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-heading text-2xl font-semibold tracking-tight">Pengaturan</h1>
              <p className="mt-1 text-sm text-muted-foreground">Konfigurasi sistem perpustakaan</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 border-b">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <Button
                key={tab.id}
                type="button"
                variant={activeTab === tab.id ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab(tab.id)}
                className="gap-2 px-4 py-2"
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </Button>
            );
          })}
        </div>

        {activeTab === 'general' && (
          <Card className="card-lift">
            <CardHeader>
              <CardTitle>Pengaturan Umum</CardTitle>
              <CardDescription>Konfigurasi dasar aplikasi</CardDescription>
            </CardHeader>
            {renderSettingsForm(
              <div className="space-y-2">
                <Label htmlFor="library_name">Nama Perpustakaan</Label>
                <Input
                  id="library_name"
                  value={data.library_name}
                  onChange={(e) => setData('library_name', e.target.value)}
                  placeholder="E-Library"
                />
                {errors.library_name && <p className="text-xs text-destructive">{errors.library_name}</p>}
              </div>
            )}
          </Card>
        )}

        {activeTab === 'loan' && (
          <Card className="card-lift">
            <CardHeader>
              <CardTitle>Pengaturan Peminjaman</CardTitle>
              <CardDescription>Aturan dan batasan peminjaman buku</CardDescription>
            </CardHeader>
            {renderSettingsForm(
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="max_loans_per_member">Maks Pinjam per Anggota <span className="text-destructive">*</span></Label>
                  <Input
                    id="max_loans_per_member"
                    type="number"
                    min="1"
                    max="50"
                    value={data.max_loans_per_member}
                    onChange={(e) => setData('max_loans_per_member', e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">Maksimal buku yang bisa dipinjam sekaligus</p>
                  {errors.max_loans_per_member && <p className="text-xs text-destructive">{errors.max_loans_per_member}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="loan_duration_days">Lama Pinjam (Hari) <span className="text-destructive">*</span></Label>
                  <Input
                    id="loan_duration_days"
                    type="number"
                    min="1"
                    max="365"
                    value={data.loan_duration_days}
                    onChange={(e) => setData('loan_duration_days', e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">Jumlah hari sebelum buku harus dikembalikan</p>
                  {errors.loan_duration_days && <p className="text-xs text-destructive">{errors.loan_duration_days}</p>}
                </div>
              </div>
            )}
          </Card>
        )}

        {activeTab === 'penalty' && (
          <Card className="card-lift">
            <CardHeader>
              <CardTitle>Pengaturan Sanksi Keterlambatan</CardTitle>
              <CardDescription>Sistem sanksi untuk pengembalian buku terlambat</CardDescription>
            </CardHeader>
            {renderSettingsForm(
              <>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="penalty_enabled">Aktifkan Sanksi Keterlambatan</Label>
                    <p className="text-xs text-muted-foreground">Blokir peminjaman saat terlambat mengembalikan</p>
                  </div>
                  <input
                    id="penalty_enabled"
                    type="checkbox"
                    className="h-4 w-4 accent-primary"
                    checked={Boolean(data.penalty_enabled)}
                    onChange={(e) => setData('penalty_enabled', e.target.checked)}
                  />
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label htmlFor="late_penalty_days">Sanksi Keterlambatan (Hari) <span className="text-destructive">*</span></Label>
                  <Input
                    id="late_penalty_days"
                    type="number"
                    min="0"
                    max="365"
                    value={data.late_penalty_days}
                    onChange={(e) => setData('late_penalty_days', e.target.value)}
                    disabled={!Boolean(data.penalty_enabled)}
                  />
                  <p className="text-xs text-muted-foreground">
                    {data.penalty_enabled
                      ? 'Jumlah hari tidak boleh meminjam setelah keterlambatan pengembalian (0 = tidak ada sanksi)'
                      : 'Aktifkan sanksi untuk mengubah nilai ini'}
                  </p>
                  {errors.late_penalty_days && <p className="text-xs text-destructive">{errors.late_penalty_days}</p>}
                </div>
              </>
            )}
          </Card>
        )}

        {activeTab === 'users' && (
          <div className="space-y-4">
            <Card className="card-lift">
              <CardHeader className="flex-row items-center justify-between">
                <div>
                  <CardTitle>Kelola Akun Pengguna</CardTitle>
                  <CardDescription>Tambah, ubah, dan hapus akun petugas/admin</CardDescription>
                </div>
                <Button type="button" onClick={openAddUser} className="gap-1.5">
                  <UserPlus className="h-4 w-4" />
                  Tambah Akun
                </Button>
              </CardHeader>
              <CardContent>
                {safeUsers.length > 0 ? (
                  <div className="space-y-3">
                    {safeUsers.map((user) => (
                      <div key={user.id} className="flex flex-col gap-3 p-3 rounded-lg border sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            {(user.name ?? 'U').charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium truncate">{user.name}</p>
                            <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                            {user.username && <p className="text-xs text-muted-foreground truncate">@{user.username}</p>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={user.role === 'Administrator' ? 'default' : 'secondary'}>{user.role ?? 'Petugas'}</Badge>
                          <Button variant="ghost" size="icon" onClick={() => openEditUser(user)} title="Ubah akun">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDeleteUser(user.id)} title="Hapus akun">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">Belum ada akun pengguna</div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'roles' && (
          <div className="space-y-4">
            <Card className="card-lift">
              <CardHeader className="flex-row items-center justify-between">
                <div>
                  <CardTitle>Kelola Role & Izin</CardTitle>
                  <CardDescription>Atur peran dan izin akses untuk setiap role</CardDescription>
                </div>
                <Button type="button" onClick={openAddRole} className="gap-1.5">
                  <Plus className="h-4 w-4" />
                  Tambah Role
                </Button>
              </CardHeader>
              <CardContent>
                {safeRoles.length > 0 ? (
                  <div className="space-y-3">
                    {safeRoles.map((role) => (
                      <div key={role.id} className="flex flex-col gap-3 p-3 rounded-lg border sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <Key className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium truncate">{role.name}</p>
                            <p className="text-sm text-muted-foreground truncate">
                              {role.permissions.length > 0
                                ? `${role.permissions.length} izin`
                                : 'Tanpa izin'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" onClick={() => openEditRole(role)} title="Ubah role">
                            <Edit className="h-4 w-4" />
                          </Button>
                          {role.name !== 'Administrator' && role.name !== 'Petugas' && (
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDeleteRole(role.id)} title="Hapus role">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">Belum ada role</div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {userDialogOpen && (
          <Dialog open={userDialogOpen} onOpenChange={(open) => {
            setUserDialogOpen(open);
            if (!open) setEditingUser(null);
          }}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editingUser ? 'Edit Akun' : 'Tambah Akun Baru'}</DialogTitle>
                <DialogDescription>
                  {editingUser ? 'Perbarui informasi akun pengguna' : 'Buat akun baru untuk petugas atau administrator'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleUserSubmit}>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nama Lengkap</Label>
                    <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} placeholder="Nama lengkap" />
                    {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input id="username" value={data.username} onChange={(e) => setData('username', e.target.value)} placeholder="username" />
                    {errors.username && <p className="text-xs text-destructive">{errors.username}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} placeholder="email@domain.com" />
                    {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Peran</Label>
                    <select
                      id="role"
                      value={data.role}
                      onChange={(e) => setData('role', e.target.value)}
                      className="flex h-8 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="">Pilih Role</option>
                      {roleOptions.map((roleName) => (
                        <option key={roleName} value={roleName}>{roleName}</option>
                      ))}
                    </select>
                    {errors.role && <p className="text-xs text-destructive">{errors.role}</p>}
                  </div>
                  {!editingUser && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input id="password" type="password" value={data.password} onChange={(e) => setData('password', e.target.value)} placeholder="Minimal 8 karakter" />
                        {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password_confirmation">Konfirmasi Password</Label>
                        <Input id="password_confirmation" type="password" value={data.password_confirmation} onChange={(e) => setData('password_confirmation', e.target.value)} placeholder="Ulangi password" />
                        {errors.password_confirmation && <p className="text-xs text-destructive">{errors.password_confirmation}</p>}
                      </div>
                    </>
                  )}
                  {editingUser && <p className="text-xs text-muted-foreground">Kosongkan password jika tidak ingin mengubahnya</p>}
                </div>
                <DialogFooter>
                  <DialogClose asChild><Button type="button" variant="outline">Batal</Button></DialogClose>
                  <Button type="submit" disabled={processing} className="shine-sweep">
                    <Save className="h-4 w-4" />
                    {processing ? 'Menyimpan...' : editingUser ? 'Perbarui' : 'Simpan'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}

        {roleDialogOpen && (
          <Dialog open={roleDialogOpen} onOpenChange={(open) => {
            setRoleDialogOpen(open);
            if (!open) setEditingRole(null);
          }}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>{editingRole ? 'Edit Role' : 'Tambah Role Baru'}</DialogTitle>
                <DialogDescription>
                  {editingRole ? 'Perbarui role dan izin yang diberikan' : 'Buat role baru dan atur izin akses'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleRoleSubmit}>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nama Role</Label>
                    <Input
                      id="name"
                      value={data.name}
                      onChange={(e) => setData('name', e.target.value)}
                      placeholder="Misal: Petugas Khusus"
                    />
                    {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Izin</Label>
                    <div className="border rounded-lg p-3 max-h-60 overflow-y-auto space-y-2">
                      {safePermissions.length > 0 ? (
                        safePermissions.map((permissionName) => {
                          const checked = (data.permissions || []).includes(permissionName);
                          return (
                            <label key={permissionName} className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                className="h-4 w-4 accent-primary"
                                checked={checked}
                                onChange={(e) => togglePermission(permissionName)}
                              />
                              <span className="text-sm">{permissionName}</span>
                            </label>
                          );
                        })
                      ) : (
                        <p className="text-sm text-muted-foreground">Tidak ada izin tersedia</p>
                      )}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild><Button type="button" variant="outline">Batal</Button></DialogClose>
                  <Button type="submit" disabled={processing} className="shine-sweep">
                    <Save className="h-4 w-4" />
                    {processing ? 'Menyimpan...' : editingRole ? 'Perbarui' : 'Simpan'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </AuthenticatedLayout>
  );
}
