import { useState } from 'react';
import { Pencil, Plus, Search, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
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

export default function ProductTable({
    products = [],
    isLoading,
    deletingId,
    onAdd,
    onEdit,
    onRequestDelete,
}) {
    const [search, setSearch] = useState('');

    const filtered = products.filter((product) => {
        const q = search.trim().toLowerCase();
        if (!q) return true;

        return (
            product.name?.toLowerCase().includes(q) ||
            product.sku?.toLowerCase().includes(q)
        );
    });

    return (
        <>
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="relative min-w-0 w-full md:max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search products..."
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        className="w-full pl-9"
                    />
                </div>
                <Button className="w-full gap-2 md:w-auto" onClick={onAdd}>
                    <Plus className="h-4 w-4" />
                    Add Product
                </Button>
            </div>

            <Card className="w-full overflow-hidden border border-border/80 shadow-sm">
                <div className="w-full overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/30 hover:bg-muted/30">
                                <TableHead className="w-[80px]">SL No</TableHead>
                                <TableHead className="w-[70px]">Image</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>SKU</TableHead>
                                <TableHead>Color</TableHead>
                                <TableHead>Size</TableHead>
                                <TableHead className="text-right">Stock</TableHead>
                                <TableHead className="text-right">Price</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading && (
                                <TableRow>
                                    <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                                        Loading products...
                                    </TableCell>
                                </TableRow>
                            )}

                            {!isLoading && products.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                                        No products found.
                                    </TableCell>
                                </TableRow>
                            )}

                            {!isLoading && filtered.length === 0 && products.length > 0 && (
                                <TableRow>
                                    <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                                        No products match your search.
                                    </TableCell>
                                </TableRow>
                            )}

                            {!isLoading &&
                                filtered.map((product, index) => (
                                    <TableRow key={product.id} className="hover:bg-muted/20">
                                        <TableCell className="font-medium text-muted-foreground">{index + 1}</TableCell>
                                        <TableCell>
                                            {product.cover_image ? (
                                                <img
                                                    src={product.cover_image}
                                                    alt={product.name}
                                                    className="h-10 w-10 rounded object-cover"
                                                />
                                            ) : (
                                                <span className="text-muted-foreground">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="font-medium">{product.name}</TableCell>
                                        <TableCell className="font-mono text-xs">{product.sku}</TableCell>
                                        <TableCell>{product.color || '-'}</TableCell>
                                        <TableCell>{product.size || '-'}</TableCell>
                                        <TableCell className="text-right">{product.stock ?? 0}</TableCell>
                                        <TableCell className="text-right">
                                            {Number(product.price || 0).toFixed(2)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    onClick={() => onEdit?.(product.id)}
                                                    aria-label={`Edit ${product.name}`}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    onClick={() => onRequestDelete?.(product)}
                                                    disabled={deletingId === product.id}
                                                    aria-label={`Delete ${product.name}`}
                                                >
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                        </TableBody>
                    </Table>
                </div>
            </Card>
        </>
    );
}
