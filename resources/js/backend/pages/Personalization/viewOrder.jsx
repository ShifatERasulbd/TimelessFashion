import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppContext } from '@/context/AppContext';

import { fetchPersonalizationOrder } from './api';

function formatDate(value) {
    if (!value) return '-';

    try {
        return new Date(value).toLocaleString();
    } catch {
        return '-';
    }
}

function formatCurrency(value) {
    const numberValue = Number(value || 0);
    if (Number.isNaN(numberValue)) return '$0.00';
    return `$${numberValue.toFixed(2)}`;
}

export default function ViewPersonalizationOrder() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { setPageTitle } = useAppContext();

    const [order, setOrder] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        setPageTitle('View Personalization Order');
    }, [setPageTitle]);

    useEffect(() => {
        let ignore = false;

        async function loadOrder() {
            setIsLoading(true);
            setErrorMessage('');

            try {
                const data = await fetchPersonalizationOrder(id);
                if (!ignore) {
                    setOrder(data);
                }
            } catch (error) {
                if (!ignore) {
                    setErrorMessage(error.message || 'Failed to load order details.');
                }
            } finally {
                if (!ignore) {
                    setIsLoading(false);
                }
            }
        }

        loadOrder();

        return () => {
            ignore = true;
        };
    }, [id]);

    if (isLoading) {
        return <p className="text-sm text-muted-foreground">Loading order details...</p>;
    }

    const frontImageUrl = order?.front_image_url || order?.image_url || '';
    const backImageUrl = order?.back_image_url || order?.meta?.back_image_url || '';

    return (
        <div className="space-y-4">
            {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}

            {!order ? null : (
                <Card>
                    <CardHeader>
                        <CardTitle>Personalization Order #{order.id}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-5 lg:grid-cols-[minmax(0,560px)_minmax(0,1fr)]">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="rounded-xl border bg-muted/20 p-3">
                                    <p className="mb-2 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">Front</p>
                                    {frontImageUrl ? (
                                        <img src={frontImageUrl} alt={`${order.title || `Order ${order.id}`} front`} className="aspect-square w-full rounded-lg object-cover" />
                                    ) : (
                                        <div className="flex aspect-square w-full items-center justify-center rounded-lg bg-muted text-sm text-muted-foreground">
                                            No front image
                                        </div>
                                    )}
                                </div>

                                <div className="rounded-xl border bg-muted/20 p-3">
                                    <p className="mb-2 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">Back</p>
                                    {backImageUrl ? (
                                        <img src={backImageUrl} alt={`${order.title || `Order ${order.id}`} back`} className="aspect-square w-full rounded-lg object-cover" />
                                    ) : (
                                        <div className="flex aspect-square w-full items-center justify-center rounded-lg bg-muted text-sm text-muted-foreground">
                                            No back image
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Title</span>
                                    <span className="font-medium">{order.title || 'Untitled'}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Quantity</span>
                                    <span className="font-medium">{order.quantity ?? '-'}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Price</span>
                                    <span className="font-medium">{formatCurrency(order.unit_price)}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Total Price</span>
                                    <span className="font-medium">{formatCurrency(order.total_price)}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Order Status</span>
                                    <span className="font-medium capitalize">{order.order_status || 'pending'}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Created At</span>
                                    <span className="font-medium">{formatDate(order.created_at)}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Updated At</span>
                                    <span className="font-medium">{formatDate(order.updated_at)}</span>
                                </div>

                                <div className="flex flex-wrap gap-2 pt-2">
                                    <Button type="button" variant="outline" onClick={() => navigate('/admin/personalization/orders')}>
                                        Back
                                    </Button>
                                    <Button type="button" onClick={() => navigate(`/admin/personalization/orders/${order.id}/edit`)}>
                                        Edit Order
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
