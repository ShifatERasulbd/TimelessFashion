import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import EditForm from '@/components/subcategory/editForm';
import { useAppContext } from '@/context/AppContext';

import { fetchSubCategory, fetchCategoriesForDropdown, updateSubCategory } from './api';

const initialForm = {
    name: '',
    slug: '',
    category_id: '',
};

function slugify(value = '') {
    return value
        .toString()
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
}

export default function EditSubCategory() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { setPageTitle } = useAppContext();

    const [form, setForm] = useState(initialForm);
    const [isSlugDirty, setIsSlugDirty] = useState(false);
    const [categories, setCategories] = useState([]);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState('');

    useEffect(() => {
        setPageTitle('Edit SubCategory');
    }, [setPageTitle]);

    useEffect(() => {
        let ignore = false;

        async function loadData() {
            setIsLoading(true);
            setLoadError('');

            try {
                const [data, categoryData] = await Promise.all([
                    fetchSubCategory(id),
                    fetchCategoriesForDropdown(),
                ]);

                if (!ignore) {
                    setForm({
                        name: data?.name || '',
                        slug: data?.slug || '',
                        category_id: data?.category_id || '',
                    });
                    setIsSlugDirty(false);
                    setCategories(Array.isArray(categoryData) ? categoryData : []);
                }
            } catch (error) {
                if (!ignore) {
                    setLoadError(error.message || 'Failed to load Subcategory.');
                }
            } finally {
                if (!ignore) {
                    setIsLoading(false);
                }
            }
        }

        loadData();

        return () => {
            ignore = true;
        };
    }, [id]);

    const handleChange = (event) => {
        const { name, value } = event.target;

        if (name === 'name') {
            setForm((previous) => ({
                ...previous,
                name: value,
                slug: isSlugDirty ? previous.slug : slugify(value),
            }));
        } else if (name === 'slug') {
            setIsSlugDirty(true);
            setForm((previous) => ({ ...previous, slug: value }));
        } else {
            setForm((previous) => ({ ...previous, [name]: value }));
        }

        setErrors((previous) => {
            if (name === 'name' && !previous.name && !previous.slug) {
                return previous;
            }

            if (name !== 'name' && !previous[name]) {
                return previous;
            }

            const next = { ...previous };

            if (name === 'name') {
                delete next.name;
                delete next.slug;
            } else {
                delete next[name];
            }

            return next;
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!form.name.trim()) {
            setErrors({ name: ['The name field is required.'] });
            return;
        }

        if (!form.slug.trim()) {
            setErrors({ slug: ['The slug field is required.'] });
            return;
        }

        if (!form.category_id.trim()) {
            setErrors({ category_id: ['The category field is required.'] });
            return;
        }

        setIsSubmitting(true);
        setErrors({});
        setLoadError('');

        try {
            await updateSubCategory(id, {
                name: form.name.trim(),
                slug: form.slug.trim(),
                category_id: form.category_id.trim(),
            });

            toast.success('SubCategory updated successfully.', {
                style: { color: '#16a34a' },
            });
            navigate('/admin/sub-category');
        } catch (error) {
            setErrors(error.payload?.errors || {});
            if (!error.payload?.errors) {
                const message = error.message || 'Failed to update subcategory.';
                setLoadError(message);
                toast.error(message, { style: { color: '#dc2626' } });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return <p className="text-sm text-muted-foreground">Loading subcategory...</p>;
    }

    return (
        <div className="space-y-4">
            {loadError && <p className="text-sm text-destructive">{loadError}</p>}

            <EditForm
                form={form}
                categories={categories}
                onChange={handleChange}
                onSubmit={handleSubmit}
                onCancel={() => navigate('/admin/sub-category')}
                isSubmitting={isSubmitting}
                errors={errors}
                submitLabel="Update SubCategory"
                submittingLabel="Updating..."
            />
        </div>
    );
}

