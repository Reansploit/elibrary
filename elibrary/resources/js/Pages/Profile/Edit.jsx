import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback } from '@/Components/ui/avatar';
import { Card, CardContent } from '@/Components/ui/card';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import {
    BookOpen,
    Clock,
    AlertCircle,
    User,
    ShieldCheck,
} from 'lucide-react';

const tabs = [
    { id: 'profile', label: 'Informasi Profil', icon: User },
    { id: 'security', label: 'Keamanan', icon: ShieldCheck },
];

const stats = [
    {
        label: 'Buku Dipinjam',
        value: 0,
        icon: BookOpen,
        color: 'text-blue-500',
        bg: 'bg-blue-50 dark:bg-blue-950/20',
    },
    {
        label: 'Riwayat',
        value: 0,
        icon: Clock,
        color: 'text-emerald-500',
        bg: 'bg-emerald-50 dark:bg-emerald-950/20',
    },
    {
        label: 'Denda',
        value: 0,
        icon: AlertCircle,
        color: 'text-amber-500',
        bg: 'bg-amber-50 dark:bg-amber-950/20',
    },
];

export default function Edit({ mustVerifyEmail, status }) {
    const [activeTab, setActiveTab] = useState('profile');
    const { props } = usePage();
    const user = props.auth.user;

    const initials = user?.name
        ?.split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    // Profile completion percentage (based on filled fields)
    const fields = ['name', 'username', 'email'];
    const filled = fields.filter(
        (f) => user[f] && String(user[f]).length > 0,
    ).length;
    const completion = Math.round((filled / fields.length) * 100);

    return (
        <AuthenticatedLayout>
            <Head title="Profile" />

            <div className="mx-auto max-w-5xl space-y-6">
                {/* Profile Header */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center gap-4 rounded-xl bg-gradient-to-br from-primary/5 via-primary/[0.02] to-background p-6 ring-1 ring-foreground/10 sm:flex-row sm:gap-6"
                >
                    {/* Avatar */}
                    <div className="relative shrink-0">
                        <Avatar
                            size="lg"
                            className="size-16 ring-2 ring-primary/20"
                        >
                            <AvatarFallback className="text-lg">
                                {initials || 'U'}
                            </AvatarFallback>
                        </Avatar>
                    </div>

                    <div className="flex-1 text-center sm:text-left">
                        <h1 className="text-xl font-semibold tracking-tight">
                            {user?.name || 'Pengguna'}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            @{user?.username || 'username'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            {user?.email}
                        </p>
                    </div>

                    {/* Completion Ring */}
                    <div className="relative flex shrink-0 items-center justify-center">
                        <svg
                            className="h-16 w-16 -rotate-90"
                            viewBox="0 0 36 36"
                        >
                            {/* Background circle */}
                            <circle
                                cx="18"
                                cy="18"
                                r="15.5"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                className="text-border"
                            />
                            {/* Progress arc */}
                            <motion.circle
                                cx="18"
                                cy="18"
                                r="15.5"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeDasharray={Math.PI * 31}
                                initial={{ strokeDashoffset: Math.PI * 31 }}
                                animate={{
                                    strokeDashoffset:
                                        Math.PI * 31 * (1 - completion / 100),
                                }}
                                transition={{ duration: 1, ease: 'easeOut' }}
                                className="text-primary"
                            />
                        </svg>
                        <span className="absolute text-xs font-semibold">
                            {completion}%
                        </span>
                    </div>
                </motion.div>

                {/* Stats Cards */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    className="grid grid-cols-1 gap-4 sm:grid-cols-3"
                >
                    {stats.map((stat) => (
                        <Card key={stat.label} size="sm">
                            <CardContent className="flex items-center gap-3 py-4">
                                <div
                                    className={`flex size-10 items-center justify-center rounded-lg ${stat.bg}`}
                                >
                                    <stat.icon
                                        className={`size-5 ${stat.color}`}
                                    />
                                </div>
                                <div>
                                    <p className="text-2xl font-semibold tracking-tight">
                                        {stat.value}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {stat.label}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </motion.div>

                {/* Tabs */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex gap-1 rounded-lg bg-muted p-1"
                >
                    {tabs.map((tab) => {
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all ${
                                    isActive
                                        ? 'bg-background text-foreground shadow-sm'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                <tab.icon className="size-4" />
                                {tab.label}
                            </button>
                        );
                    })}
                </motion.div>

                {/* Tab Content */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.15 }}
                    >
                        {activeTab === 'profile' && (
                            <Card>
                                <CardContent className="pt-6">
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
                                    <CardContent className="pt-6">
                                        <UpdatePasswordForm />
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="pt-6">
                                        <DeleteUserForm />
                                    </CardContent>
                                </Card>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </AuthenticatedLayout>
    );
}
