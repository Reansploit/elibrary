import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Settings, UserPlus, Users, BookOpen, Save, Pencil, Trash2, Key, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
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
import PageHeader from '@/components/page-header';
import EmptyState from '@/components/empty-state';
import Pagination from '@/components/pagination';
import ConfirmDialog from '@/components/confirm-dialog';
import { useCan } from '@/hooks/useCan';
import { usePagination } from '@/hooks/usePagination';

const tabs = [
    { id: 'general', label: 'Umum', icon: Settings },
    { id: 'loan', label: 'Peminjaman', icon: BookOpen },
    { id: 'users', label: 'Pengguna', icon: Users, permission: ['manage_users'] },
    { id: 'roles', label: 'Role', icon: Key, permission: ['manage_roles'] },
];

const PERMISSION_LABELS = {
    view_dashboard: 'Lihat dashboard',
    view_books: 'Lihat buku',
    create_books: 'Tambah buku',
    edit_books: 'Ubah buku',
    delete_books: 'Hapus buku',
    manage_books: 'Kelola buku (akses penuh)',
    view_members: 'Lihat anggota',
    create_members: 'Tambah anggota',
    edit_members: 'Ubah anggota',
    delete_members: 'Hapus anggota',
    manage_members: 'Kelola anggota (akses penuh)',
    view_circulation: 'Lihat sirkulasi',
    borrow_books: 'Pinjam buku',
    return_books: 'Kembalikan buku',
    view_reservations: 'Lihat reservasi',
    manage_reservations: 'Kelola reservasi',
    view_logs: 'Lihat riwayat',
    view_reports: 'Lihat laporan',
    manage_users: 'Kelola akun pengguna',
    manage_roles: 'Kelola role & izin',
    manage_settings: 'Kelola pengaturan',
};

const permissionLabel = (name) => PERMISSION_LABELS[name] ?? name;

const emptyUserForm = { name: '', username: '', password: '', password_confirmation: '', role: '' };
const emptyRoleForm = { name: '', permissions: [] };

export default function SettingsIndex({ settings, users, roles, permissions }) {
    const can = useCan();
    const [activeTab, setActiveTab] = useState('general');
    const [userDialogOpen, setUserDialogOpen] = useState(false);
    const [roleDialogOpen, setRoleDialogOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [editingRole, setEditingRole] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);

    const safeSettings = settings ?? {
        loan: { max_loans_per_member: 3, loan_duration_days: 7, reservation_hold_days: 3 },
        penalty: { late_penalty_days: 3, penalty_enabled: true },
        general: { library_name: 'Perpustakaan WBS' },
    };
    const safeUsers = users ?? [];
    const safeRoles = roles ?? [];
    const safePermissions = permissions ?? [];
    const roleOptions = safeRoles.map((r) => r.name);
    const usersPaging = usePagination(safeUsers);
    const rolesPaging = usePagination(safeRoles);

    const { data, setData, post, put, delete: destroy, processing, errors } = useForm({
        max_loans_per_member: safeSettings.loan.max_loans_per_member ?? 3,
        loan_duration_days: safeSettings.loan.loan_duration_days ?? 7,
        reservation_hold_days: safeSettings.loan.reservation_hold_days ?? 3,
        library_name: safeSettings.general.library_name ?? 'Perpustakaan WBS',
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
        setData({ name: role.name ?? '', permissions: role.permissions ?? [] });
        setRoleDialogOpen(true);
    };

    const handleUserSubmit = (e) => {
        e.preventDefault();
        const payload = { name: data.name, username: data.username, role: data.role };
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
        const payload = { name: data.name, permissions: data.permissions };
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
            library_name: data.library_name,
        });
    };

    const handleDeleteUser = (user) => {
        setDeleteTarget({ type: 'user', id: user.id, name: user.name });
    };

    const handleDeleteRole = (role) => {
        setDeleteTarget({ type: 'role', id: role.id, name: role.name });
    };

    const confirmDelete = () => {
        if (!deleteTarget) return;
        const routeName =
            deleteTarget.type === 'user' ? 'settings.users.destroy' : 'settings.roles.destroy';
        destroy(route(routeName, deleteTarget.id), {
            onSuccess: () => setDeleteTarget(null),
        });
    };

    const togglePermission = (permissionName) => {
        const current = data.permissions || [];
        if (current.includes(permissionName)) {
            setData('permissions', current.filter((p) => p !== permissionName));
        } else {
            setData('permissions', [...current, permissionName]);
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Pengaturan" />

            <div className="space-y-6">
                <PageHeader title="Pengaturan" description="Konfigurasi sistem perpustakaan" icon={Settings} />

                <div className="flex gap-1 overflow-x-auto rounded-lg bg-muted p-1">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const active = activeTab === tab.id;
                        const locked = tab.permission && !can(tab.permission);
                        return (
                            <button
                                key={tab.id}
                                type="button"
                                disabled={locked}
                                title={locked ? `${tab.label} (tidak punya akses)` : undefined}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                                    active
                                        ? 'bg-background text-foreground shadow-sm'
                                        : locked
                                          ? 'cursor-not-allowed text-muted-foreground opacity-40'
                                          : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                <Icon className="h-4 w-4" />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {activeTab === 'general' && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Umum</CardTitle>
                            <CardDescription>Konfigurasi dasar aplikasi</CardDescription>
                        </CardHeader>
                        <form onSubmit={handleSettingsSubmit}>
                            <CardContent className="space-y-2">
                                <Label htmlFor="library_name">Nama perpustakaan</Label>
                                <Input
                                    id="library_name"
                                    value={data.library_name}
                                    onChange={(e) => setData('library_name', e.target.value)}
                                    placeholder="Perpustakaan WBS"
                                />
                                {errors.library_name && (
                                    <p className="text-xs text-destructive">{errors.library_name}</p>
                                )}
                            </CardContent>
                            <CardFooter className="flex justify-end">
                                <Button type="submit" disabled={processing}>
                                    <Save className="h-4 w-4" />
                                    {processing ? 'Menyimpan...' : 'Simpan'}
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                )}

                {activeTab === 'loan' && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Peminjaman</CardTitle>
                            <CardDescription>Aturan dan batas peminjaman</CardDescription>
                        </CardHeader>
                        <form onSubmit={handleSettingsSubmit}>
                            <CardContent className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="max_loans_per_member">Maks pinjam per anggota</Label>
                                    <Input
                                        id="max_loans_per_member"
                                        type="number"
                                        min="1"
                                        max="50"
                                        value={data.max_loans_per_member}
                                        onChange={(e) => setData('max_loans_per_member', e.target.value)}
                                    />
                                    {errors.max_loans_per_member && (
                                        <p className="text-xs text-destructive">{errors.max_loans_per_member}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="loan_duration_days">Lama pinjam (hari)</Label>
                                    <Input
                                        id="loan_duration_days"
                                        type="number"
                                        min="1"
                                        max="365"
                                        value={data.loan_duration_days}
                                        onChange={(e) => setData('loan_duration_days', e.target.value)}
                                    />
                                    {errors.loan_duration_days && (
                                        <p className="text-xs text-destructive">{errors.loan_duration_days}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="reservation_hold_days">Batas ambil reservasi (hari)</Label>
                                    <Input
                                        id="reservation_hold_days"
                                        type="number"
                                        min="1"
                                        max="30"
                                        value={data.reservation_hold_days}
                                        onChange={(e) => setData('reservation_hold_days', e.target.value)}
                                    />
                                    {errors.reservation_hold_days && (
                                        <p className="text-xs text-destructive">{errors.reservation_hold_days}</p>
                                    )}
                                    <p className="text-xs text-muted-foreground">
                                        Antrean siap diambil yang lewat batas otomatis batal.
                                    </p>
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-end">
                                <Button type="submit" disabled={processing}>
                                    <Save className="h-4 w-4" />
                                    {processing ? 'Menyimpan...' : 'Simpan'}
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                )}

                {activeTab === 'users' && (
                    <Card>
                        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <CardTitle>Pengguna</CardTitle>
                                <CardDescription>Kelola akun petugas dan admin</CardDescription>
                            </div>
                            <Button type="button" onClick={openAddUser}>
                                <UserPlus className="h-4 w-4" />
                                Tambah akun
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {safeUsers.length > 0 ? (
                                <div className="divide-y rounded-lg border">
                                    {usersPaging.paged.map((user) => (
                                        <div
                                            key={user.id}
                                            className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between"
                                        >
                                            <div className="min-w-0">
                                                <p className="truncate font-medium">{user.name}</p>
                                                <p className="truncate text-sm text-muted-foreground">
                                                    @{user.username}
                                                    {user.email ? ` • ${user.email}` : ''}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge variant={user.role === 'Administrator' ? 'default' : 'secondary'}>
                                                    {user.role ?? 'Petugas'}
                                                </Badge>
                                                <Button variant="ghost" size="icon" onClick={() => openEditUser(user)}>
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-destructive hover:text-destructive"
                                                    onClick={() => handleDeleteUser(user)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <EmptyState icon={Users} title="Belum ada akun" description="Tambah akun baru untuk mulai." />
                            )}
                            {safeUsers.length > 0 && <Pagination pagination={usersPaging} />}
                        </CardContent>
                    </Card>
                )}

                {activeTab === 'roles' && (
                    <Card>
                        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <CardTitle>Role & izin</CardTitle>
                                <CardDescription>Atur peran dan hak akses</CardDescription>
                            </div>
                            <Button type="button" onClick={openAddRole}>
                                <Plus className="h-4 w-4" />
                                Tambah role
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {safeRoles.length > 0 ? (
                                <div className="divide-y rounded-lg border">
                                    {rolesPaging.paged.map((role) => (
                                        <div
                                            key={role.id}
                                            className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between"
                                        >
                                            <div className="min-w-0">
                                                <p className="truncate font-medium">{role.name}</p>
                                                <p className="truncate text-sm text-muted-foreground">
                                                    {role.permissions.length > 0
                                                        ? `${role.permissions.length} izin`
                                                        : 'Tanpa izin'}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button variant="ghost" size="icon" onClick={() => openEditRole(role)}>
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                {role.name !== 'Administrator' && role.name !== 'Petugas' && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-destructive hover:text-destructive"
                                                        onClick={() => handleDeleteRole(role)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <EmptyState icon={Key} title="Belum ada role" description="Tambah role baru untuk mulai." />
                            )}
                            {safeRoles.length > 0 && <Pagination pagination={rolesPaging} />}
                        </CardContent>
                    </Card>
                )}
            </div>

            <Dialog
                open={userDialogOpen}
                onOpenChange={(open) => {
                    setUserDialogOpen(open);
                    if (!open) setEditingUser(null);
                }}
            >
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>{editingUser ? 'Edit akun' : 'Tambah akun'}</DialogTitle>
                        <DialogDescription>
                            {editingUser ? 'Perbarui informasi akun' : 'Buat akun petugas atau admin'}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleUserSubmit}>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nama</Label>
                                <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} placeholder="Nama lengkap" />
                                {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="username">Username</Label>
                                <Input id="username" value={data.username} onChange={(e) => setData('username', e.target.value)} placeholder="username" />
                                {errors.username && <p className="text-xs text-destructive">{errors.username}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="role">Peran</Label>
                                <select
                                    id="role"
                                    value={data.role}
                                    onChange={(e) => setData('role', e.target.value)}
                                    className="flex h-9 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none"
                                >
                                    <option value="">Pilih role</option>
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
                                        <Label htmlFor="password_confirmation">Konfirmasi password</Label>
                                        <Input id="password_confirmation" type="password" value={data.password_confirmation} onChange={(e) => setData('password_confirmation', e.target.value)} placeholder="Ulangi password" />
                                        {errors.password_confirmation && <p className="text-xs text-destructive">{errors.password_confirmation}</p>}
                                    </div>
                                </>
                            )}
                        </div>
                        <DialogFooter>
                            <DialogClose render={<Button type="button" variant="outline" />}>Batal</DialogClose>
                            <Button type="submit" disabled={processing}>
                                <Save className="h-4 w-4" />
                                {processing ? 'Menyimpan...' : editingUser ? 'Perbarui' : 'Simpan'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog
                open={roleDialogOpen}
                onOpenChange={(open) => {
                    setRoleDialogOpen(open);
                    if (!open) setEditingRole(null);
                }}
            >
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{editingRole ? 'Edit role' : 'Tambah role'}</DialogTitle>
                        <DialogDescription>Atur nama role dan izin akses</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleRoleSubmit}>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="role-name">Nama role</Label>
                                <Input id="role-name" value={data.name} onChange={(e) => setData('name', e.target.value)} placeholder="Misal: Petugas Khusus" />
                                {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label>Izin</Label>
                                <div className="max-h-60 space-y-2 overflow-y-auto rounded-lg border p-3">
                                    {safePermissions.length > 0 ? (
                                        safePermissions.map((permissionName) => (
                                            <label key={permissionName} className="flex cursor-pointer items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    className="h-4 w-4 accent-primary"
                                                    checked={(data.permissions || []).includes(permissionName)}
                                                    onChange={() => togglePermission(permissionName)}
                                                />
                                                <span className="text-sm">{permissionLabel(permissionName)}</span>
                                            </label>
                                        ))
                                    ) : (
                                        <p className="text-sm text-muted-foreground">Tidak ada izin tersedia</p>
                                    )}
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <DialogClose render={<Button type="button" variant="outline" />}>Batal</DialogClose>
                            <Button type="submit" disabled={processing}>
                                <Save className="h-4 w-4" />
                                {processing ? 'Menyimpan...' : editingRole ? 'Perbarui' : 'Simpan'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <ConfirmDialog
                open={!!deleteTarget}
                onOpenChange={(open) => {
                    if (!open) setDeleteTarget(null);
                }}
                title={deleteTarget?.type === 'user' ? 'Hapus akun' : 'Hapus role'}
                description={
                    <>
                        Hapus {deleteTarget?.type === 'user' ? 'akun' : 'role'}{' '}
                        <span className="font-medium text-foreground">{deleteTarget?.name}</span>?
                        Tindakan ini tidak dapat dibatalkan.
                    </>
                }
                confirmLabel="Hapus"
                onConfirm={confirmDelete}
                processing={processing}
            />
        </AuthenticatedLayout>
    );
}
