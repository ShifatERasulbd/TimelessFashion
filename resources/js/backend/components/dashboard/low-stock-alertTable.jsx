import { useEffect, useState } from 'react';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Card } from '@/components/ui/card';

export function LowStockAlertTable() {
    const [stocks, setStocks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let ignore = false;

        async function loadStocks() {
            setLoading(true);
            setError('');

            try {
                const response = await fetch('/api/inventory/canada-warehouse-stocks', {
                    credentials: 'include',
                    headers: {
                        Accept: 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                });

                const payload = await response.json();

                if (!response.ok) {
                    throw new Error(payload?.message || 'Failed to fetch stock data.');
                }

                if (!ignore) {
                    const rows = Array.isArray(payload?.data)
                        ? payload.data
                        : (Array.isArray(payload) ? payload : []);
                    setStocks(rows);
                }
            } catch (fetchError) {
                if (!ignore) {
                    setError(fetchError.message || 'Failed to fetch stock data.');
                }
            } finally {
                if (!ignore) {
                    setLoading(false);
                }
            }
        }

        loadStocks();

        return () => {
            ignore = true;
        };
    }, []);

    return (
        <Card className="p-4">
            <h3 className="mb-3 font-semibold">Canada Warehouse Stock</h3>

            {error && <p className="mb-3 text-sm text-destructive">{error}</p>}

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[70px]">SL No</TableHead>
                        <TableHead className="w-[60px]">Image</TableHead>
                        <TableHead>Product</TableHead>
                        <TableHead>SKU</TableHead>
                        <TableHead>Warehouse</TableHead>
                        <TableHead className="text-right">Quantity</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {loading && (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center text-muted-foreground">
                                Loading stock data...
                            </TableCell>
                        </TableRow>
                    )}

                    {!loading && stocks.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center text-muted-foreground">
                                No stock data found for Canada warehouse.
                            </TableCell>
                        </TableRow>
                    )}

                    {!loading && stocks.map((stock, index) => (
                        <TableRow key={stock.id ?? `${stock.product_id}-${index}`}>
                            <TableCell className="font-medium">{index + 1}</TableCell>
                            <TableCell>
                                {stock.cover_image_url
                                    ? <img src={stock.cover_image_url} alt={stock.product_name || 'product'} className="h-10 w-10 rounded object-cover" />
                                    : <span className="text-muted-foreground">-</span>
                                }
                            </TableCell>
                            <TableCell>{stock.product_name || stock.product?.name || '-'}</TableCell>
                            <TableCell>{ stock.product?.sku || '-'}</TableCell>
                            <TableCell>{stock.warehouse_name || stock.warehouse?.name || '-'}</TableCell>
                            <TableCell className="text-right">{stock.stocks ?? stock.quantity ?? 0}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Card>
    );
}