import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useAppContext } from '@/context/AppContext';

async function requestJson(url, options = {}) {
    const response = await fetch(url, {
        credentials: 'include',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            ...(options.headers || {}),
        },
        ...options,
    });

    const contentType = response.headers.get('content-type') || '';
    const payload = contentType.includes('application/json') ? await response.json() : null;

    if (!response.ok) {
        const error = new Error(payload?.message || 'Request failed');
        error.status = response.status;
        throw error;
    }

    return payload;
}

export default function ApiProducts() {
    const { setPageTitle } = useAppContext();
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');

    useEffect(() => {
        setPageTitle('API Products');
    }, [setPageTitle]);

    // Helper to remove duplicate SKUs
    function dedupeBySku(products) {
        const seen = new Set();
        return products.filter((p) => {
            if (!p.sku) return true;
            if (seen.has(p.sku)) return false;
            seen.add(p.sku);
            return true;
        });
    }

    function formatJsonList(value) {
        if (Array.isArray(value)) {
            return value.filter(Boolean).join(', ');
        }

        if (typeof value === 'string' && value.trim()) {
            try {
                const parsed = JSON.parse(value);
                if (Array.isArray(parsed)) {
                    return parsed.filter(Boolean).join(', ');
                }
            } catch {
                return value;
            }

            return value;
        }

        return '-';
    }

    const loadProducts = async () => {
        setIsLoading(true);
        setError('');
        try {
            const data = await requestJson('/api/api-products');
            const deduped = dedupeBySku(Array.isArray(data) ? data : []);
            setProducts(deduped);
        } catch (err) {
            setError(err.message || 'Failed to load products.');
        } finally {
            setIsLoading(false);
        }
    };

    // Sync products from API
    const handleSyncProducts = async () => {
        setIsLoading(true);
        setError('');
        try {
            const res = await requestJson('/api/api-products/sync', { method: 'POST' });
            toast.success(res.message || 'Products synced successfully.');
            await loadProducts();
        } catch (err) {
            setError(err.message || 'Failed to sync products.');
            toast.error(err.message || 'Failed to sync products.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadProducts();
    }, []);

    const filtered = products.filter((p) => {
        const q = search.trim().toLowerCase();
        if (!q) return true;
        return (
            p.name?.toLowerCase().includes(q) ||
            p.sku?.toLowerCase().includes(q) ||
            p.barcode?.toLowerCase().includes(q)
        );
    });

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between gap-2">
                <Input
                    placeholder="Search by name or SKU..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="max-w-xs"
                />
                <button
                    className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90 border border-primary disabled:opacity-60"
                    onClick={handleSyncProducts}
                    disabled={isLoading}
                    type="button"
                >
                    {isLoading ? 'Syncing...' : 'Sync Products'}
                </button>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Card>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[60px]">SL No</TableHead>
                            <TableHead className="w-[60px]">Image</TableHead>
                            <TableHead>Product Name</TableHead>
                            <TableHead>SKU</TableHead>
                            <TableHead>Color</TableHead>
                            <TableHead>Size</TableHead>
                            <TableHead className="text-right">Stock</TableHead>
                            <TableHead className="text-right">Price</TableHead>
                            <TableHead>Last Updated</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading && (
                            <TableRow>
                                <TableCell colSpan={9} className="text-center text-muted-foreground">
                                    Loading products...
                                </TableCell>
                            </TableRow>
                        )}

                        {!isLoading && filtered.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={9} className="text-center text-muted-foreground">
                                    {products.length === 0
                                        ? 'No products found yet. Products are imported automatically every 10 minutes.'
                                        : 'No products match your search.'}
                                </TableCell>
                            </TableRow>
                        )}

                        {!isLoading && filtered.map((product, index) => (
                            <TableRow key={product.id}>
                                <TableCell className="font-medium">{index + 1}</TableCell>
                                <TableCell>
                                    {product.cover_image
                                        ? (
                                            <img
                                                src={product.cover_image}
                                                alt={product.name}
                                                className="h-10 w-10 rounded object-cover"
                                            />
                                        )
                                        : <span className="text-muted-foreground">-</span>
                                    }
                                </TableCell>
                                <TableCell>{product.name}</TableCell>
                                <TableCell className="font-mono text-xs">{product.sku}</TableCell>
                                <TableCell>{formatJsonList(product.color)}</TableCell>
                                <TableCell>{formatJsonList(product.size)}</TableCell>
                                <TableCell className="text-right">{product.stock}</TableCell>
                                <TableCell className="text-right">
                                    {Number(product.price) > 0 ? `$${Number(product.price).toFixed(2)}` : '-'}
                                </TableCell>
                                <TableCell className="text-xs text-muted-foreground">
                                    {product.updated_at ? new Date(product.updated_at).toLocaleString() : '-'}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>
        </div>
    )};
