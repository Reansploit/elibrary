import { cn } from '@/lib/utils';

export default function PageHeader({ title, description, icon: Icon, actions, className }) {
    return (
        <div className={cn('flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between', className)}>
            <div className="flex items-center gap-3">
                {Icon && (
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border bg-card">
                        <Icon className="h-5 w-5" />
                    </div>
                )}
                <div>
                    <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
                    {description && (
                        <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
                    )}
                </div>
            </div>
            {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </div>
    );
}
