import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import ProductTable from '@/components/products/table';
import { useAppContext } from '@/context/AppContext';

import { deleteProduct, fetchProducts } from './api';

function dedupeProducts(items) {
    const seenSku = new Set();
    const seenName = new Set();

    return items.filter((item) => {
        const skuKey = item?.sku ? String(item.sku).trim().toLowerCase() : '';
        const nameKey = item?.name ? String(item.name).trim().toLowerCase() : '';

        if (!skuKey && !nameKey) {
            return true;
        }

        if ((skuKey && seenSku.has(skuKey)) || (nameKey && seenName.has(nameKey))) {
            return false;
        }

        if (skuKey) {
            seenSku.add(skuKey);
        }

        if (nameKey) {
            seenName.add(nameKey);
        }

        return true;
    });
}

export default function Products() {
    const navigate = useNavigate();
    const { setPageTitle } = useAppContext();

    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const [deletingId, setDeletingId] = useState(null);
    const [productToDelete, setProductToDelete] = useState(null);

    useEffect(() => {
        setPageTitle('Products');
    }, [setPageTitle]);

    useEffect(() => {
        let ignore = false;

        async function loadProducts() {
            setIsLoading(true);
            setErrorMessage('');

            try {
                const data = await fetchProducts();
                if (!ignore) {
                    const rows = Array.isArray(data) ? data : [];
                    setProducts(dedupeProducts(rows));
                }
            } catch (error) {
                if (!ignore) {
                    setErrorMessage(error.message || 'Failed to load products.');
                }
            } finally {
                if (!ignore) {
                    setIsLoading(false);
                }
            }
        }

        loadProducts();

        return () => {
            ignore = true;
        };
    }, []);

    const handleConfirmDelete = async () => {
        if (!productToDelete) {
            return;
        }

        const id = productToDelete.id;
        setDeletingId(id);
        setErrorMessage('');

        try {
            await deleteProduct(id);
            setProducts((previous) => previous.filter((product) => product.id !== id));
            toast.success('Product deleted successfully', {
                style: {
                    color: '#16a34a',
                },
            });
            setProductToDelete(null);
        } catch (error) {
            const message = error.message || 'Failed to delete product.';
            setErrorMessage(message);
            toast.error(message, {
                style: {
                    color: '#dc2626',
                },
            });
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <>
            <div className="space-y-5">
                {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-1">
                    <ProductTable
                        products={products}
                        isLoading={isLoading}
                        deletingId={deletingId}
                        onAdd={() => navigate('/admin/products/add')}
                        onEdit={(id) => navigate(`/admin/products/${id}/edit`)}
                        onRequestDelete={setProductToDelete}
                    />
                </div>

                <AlertDialog
                    open={Boolean(productToDelete)}
                    onOpenChange={(open) => !open && setProductToDelete(null)}
                >
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete Product</AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure you want to delete <strong>{productToDelete?.name}</strong>? This action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel disabled={deletingId !== null}>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                variant="destructive"
                                disabled={deletingId !== null}
                                onClick={handleConfirmDelete}
                            >
                                {deletingId !== null ? 'Deleting...' : 'Delete'}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </>
    );
}
