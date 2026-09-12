import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { User, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

const tabs = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'security', label: 'Keamanan', icon: ShieldCheck },
];

export default function Edit({ mustVerifyEmail, status }) {
    const [activeTab, setActiveTab] = useState('profile');
    const { props } = usePage();
    const user = props.auth.user;

    const initials =
        user?.name
            ?.split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2) || 'U';

    return (
        <AuthenticatedLayout>
            <Head title="Profil" />

            <div className="mx-auto w-full max-w-3xl space-y-6">
                <Card>
                    <CardContent className="flex items-center gap-4 pt-6">
                        <Avatar className="h-12 w-12">
                            <AvatarFallback>{initials}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                            <p className="truncate font-semibold">{user?.name}</p>
                            <p className="truncate text-sm text-muted-foreground">
                                @{user?.username} • {user?.email}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex gap-1 rounded-lg bg-muted p-1">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const active = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    'flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                                    active
                                        ? 'bg-background text-foreground shadow-sm'
                                        : 'text-muted-foreground hover:text-foreground'
                                )}
                            >
                                <Icon className="h-4 w-4" />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {activeTab === 'profile' && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Informasi profil</CardTitle>
                            <CardDescription>Perbarui nama, username, dan email</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <UpdateProfileInformationForm
                                mustVerifyEmail={mustVerifyEmail}
                                status={status}
                            />
                        </CardContent>
                    </Card>
                )}

                {activeTab === 'security' && (
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Password</CardTitle>
                                <CardDescription>Ubah password secara berkala</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <UpdatePasswordForm />
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Hapus akun</CardTitle>
                                <CardDescription>Tindakan permanen dan tidak dapat dibatalkan</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <DeleteUserForm />
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
