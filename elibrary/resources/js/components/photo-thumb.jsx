import { useState } from 'react';
import { cn } from '@/lib/utils';

export default function PhotoThumb({ src, alt = '', icon: Icon, className }) {
    const [failed, setFailed] = useState(false);

    if (!src || failed) {
        return (
            <div
                className={cn(
                    'flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-muted',
                    className
                )}
            >
                {Icon && <Icon className="h-5 w-5 text-muted-foreground" />}
            </div>
        );
    }

    return (
        <img
            src={src}
            alt={alt}
            onError={() => setFailed(true)}
            className={cn('h-12 w-12 shrink-0 rounded-lg border object-cover', className)}
        />
    );
}
