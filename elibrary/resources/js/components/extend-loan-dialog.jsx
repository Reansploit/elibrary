import { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { CalendarPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
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

export default function ExtendLoanDialog({ loan, open, onOpenChange, defaultDays = 7 }) {
    const { data, setData, post, processing, errors } = useForm({ hari: defaultDays });

    useEffect(() => {
        if (open) setData('hari', defaultDays);
    }, [open, defaultDays]);

    const submit = (e) => {
        e.preventDefault();
        if (!loan) return;
        post(route('circulation.extend', loan.id), {
            onSuccess: () => onOpenChange(false),
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle>Perpanjang pinjaman</DialogTitle>
                    <DialogDescription>
                        Tambah masa pinjam{' '}
                        <span className="font-medium text-foreground">{loan?.book}</span> oleh{' '}
                        <span className="font-medium text-foreground">{loan?.member}</span>.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={submit}>
                    <div className="space-y-2 py-4">
                        <Label htmlFor="extend-hari">
                            Tambah hari <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="extend-hari"
                            type="number"
                            min={1}
                            max={60}
                            value={data.hari}
                            onChange={(e) => setData('hari', e.target.value)}
                            aria-invalid={!!errors.hari || undefined}
                        />
                        {errors.hari && <p className="text-xs text-destructive">{errors.hari}</p>}
                    </div>
                    <DialogFooter>
                        <DialogClose render={<Button type="button" variant="outline" />}>
                            Batal
                        </DialogClose>
                        <Button type="submit" disabled={processing}>
                            <CalendarPlus className="h-4 w-4" />
                            {processing ? 'Menyimpan...' : 'Perpanjang'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
