import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, PackageCheck, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';

export default function ConfirmOrder() {
    const navigate = useNavigate();
    const location = useLocation();

    const [orderDetails, setOrderDetails] = useState(() => location.state?.orderDetails || null);

    useEffect(() => {
        if (orderDetails) return;

        const stored = sessionStorage.getItem('personalizer:pendingOrder');
        if (!stored) return;

        try {
            const parsed = JSON.parse(stored);
            setOrderDetails(parsed);
        } catch {
            setOrderDetails(null);
        }
    }, [orderDetails]);

    const formattedDate = useMemo(() => {
        if (!orderDetails?.createdAt) return '-';

        try {
            return new Date(orderDetails.createdAt).toLocaleString();
        } catch {
            return '-';
        }
    }, [orderDetails]);

    const handlePlaceOrder = () => {
        toast.success('Order confirmed. We will contact you soon.');
    };

    if (!orderDetails) {
        return (
            <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center gap-5 p-6 text-center">
                <PackageCheck className="size-10 text-zinc-500" />
                <h1 className="text-2xl font-semibold">No order details found</h1>
                <p className="text-sm text-zinc-500">Please return to the personalizer and create your order again.</p>
                <Button type="button" onClick={() => navigate('/personalizer/features')}>
                    Back to Personalizer
                </Button>
            </main>
        );
    }

    const frontImageUrl = orderDetails?.frontImageUrl || orderDetails?.imageUrl || '';
    const backImageUrl = orderDetails?.backImageUrl || '';

    return (
        <main className="min-h-screen bg-[#f7f5ef] p-4 sm:p-6">
            <div className="mx-auto max-w-3xl rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-7">
                <button
                    type="button"
                    className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-zinc-600 hover:text-zinc-950"
                    onClick={() => navigate('/personalizer/features')}
                >
                    <ArrowLeft className="size-4" />
                    Back to personalizer
                </button>

                <div className="mb-6 flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 size-6 text-emerald-600" />
                    <div>
                        <h1 className="text-2xl font-semibold">Confirm your order</h1>
                        <p className="mt-1 text-sm text-zinc-500">Review your customization details before placing the order.</p>
                    </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-[300px_minmax(0,1fr)]">
                    <div className="grid gap-3 sm:grid-cols-2 sm:gap-2 md:gap-3">
                        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3">
                            <p className="mb-2 text-xs font-medium uppercase tracking-[0.12em] text-zinc-500">Front</p>
                            {frontImageUrl ? (
                                <img src={frontImageUrl} alt="Front design preview" className="aspect-square w-full rounded-xl object-cover" />
                            ) : (
                                <div className="flex aspect-square w-full items-center justify-center rounded-xl bg-zinc-100 text-sm text-zinc-500">
                                    No front preview
                                </div>
                            )}
                        </div>

                        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3">
                            <p className="mb-2 text-xs font-medium uppercase tracking-[0.12em] text-zinc-500">Back</p>
                            {backImageUrl ? (
                                <img src={backImageUrl} alt="Back design preview" className="aspect-square w-full rounded-xl object-cover" />
                            ) : (
                                <div className="flex aspect-square w-full items-center justify-center rounded-xl bg-zinc-100 text-sm text-zinc-500">
                                    No back preview
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-3 rounded-2xl border border-zinc-200 p-4">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-zinc-500">Quantity</span>
                            <span className="font-semibold">{orderDetails.quantity}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-zinc-500">Unit price</span>
                            <span className="font-semibold">{orderDetails.unitPrice}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-zinc-500">Total</span>
                            <span className="text-base font-semibold">{orderDetails.totalPrice}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-zinc-500">Color</span>
                            <span className="font-semibold capitalize">{orderDetails.productColor}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-zinc-500">View</span>
                            <span className="font-semibold capitalize">{orderDetails.view}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-zinc-500">Saved at</span>
                            <span className="font-semibold">{formattedDate}</span>
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
                    <Button type="button" variant="outline" onClick={() => navigate('/personalizer/features')}>
                        Edit design
                    </Button>
                    <Button type="button" onClick={handlePlaceOrder}>
                        <ShoppingBag className="size-4" />
                        Place order
                    </Button>
                </div>
            </div>
        </main>
    );
}
