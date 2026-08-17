import {
    CheckCircle2,
    GripVertical,
    ImagePlus,
    LoaderCircle,
    Plus,
    Save,
    Trash2,
    WandSparkles,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { useAppContext } from '@/context/AppContext';
import { createFeature, deleteFeature, fetchFeatures, updateFeature } from '../Features/api';
import { createHero, fetchHeroes, updateHero } from '../Hero/api';
import {
    createShopByIndustryItem,
    deleteShopByIndustryItem,
    fetchShopByIndustry,
    updateShopByIndustryItem,
    updateShopByIndustrySection,
} from './shopbyeventApi.js';
import { homePageSections } from '../../../frontend/pages/HomePage.jsx';

const defaultHeroForm = {
    title: '',
    ticker_text: '',
    sub_title: '',
    description: '',
    button_enabled: false,
    button_text: '',
};

function toSlideItem(slide, index) {
    return {
        key: `existing-${slide.id}`,
        type: 'existing',
        id: slide.id,
        image_url: slide.image_url,
        sort_order: index + 1,
    };
}

function normalizeSlides(list = []) {
    return list.map((slide, index) => ({
        ...slide,
        sort_order: index + 1,
    }));
}

function normalizeFeatures(list = []) {
    return list.map((item, index) => ({
        ...item,
        sort_order: index + 1,
    }));
}

function toFeatureItem(feature, index) {
    return {
        key: `existing-feature-${feature.id}`,
        id: feature.id,
        title: feature.title || '',
        description: feature.description || '',
        icon_url: feature.icon_url || null,
        iconFile: null,
        sort_order: index + 1,
    };
}

function normalizeIndustryItems(list = []) {
    return list.map((item, index) => ({
        ...item,
        sort_order: index + 1,
    }));
}

function toIndustryItem(item, index) {
    return {
        key: `existing-industry-${item.id}`,
        id: item.id,
        title: item.title || '',
        image_url: item.image_url || null,
        imageFile: null,
        sort_order: index + 1,
    };
}

export default function HomePageBuilder() {
    const { setPageTitle } = useAppContext();

    const previewFrameRef = useRef(null);

    const [previewKey, setPreviewKey] = useState(0);
    const [pendingScrollSection, setPendingScrollSection] = useState(null);

    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [activeEditor, setActiveEditor] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    const [isLoadingHero, setIsLoadingHero] = useState(false);
    const [heroId, setHeroId] = useState(null);
    const [heroForm, setHeroForm] = useState(defaultHeroForm);
    const [slides, setSlides] = useState([]);
    const [draggedHeroSlideKey, setDraggedHeroSlideKey] = useState(null);

    const [isLoadingFeatures, setIsLoadingFeatures] = useState(false);
    const [featureItems, setFeatureItems] = useState([]);
    const [removedFeatureIds, setRemovedFeatureIds] = useState([]);
    const [draggedFeatureKey, setDraggedFeatureKey] = useState(null);

    const [isLoadingIndustry, setIsLoadingIndustry] = useState(false);
    const [industryForm, setIndustryForm] = useState({ title: '', subtitle: '' });
    const [industryItems, setIndustryItems] = useState([]);
    const [removedIndustryItemIds, setRemovedIndustryItemIds] = useState([]);
    const [draggedIndustryKey, setDraggedIndustryKey] = useState(null);

    useEffect(() => {
        setPageTitle('Home Page Builder');
    }, [setPageTitle]);

    const activeSection = useMemo(
        () => homePageSections.find((section) => section.id === activeEditor),
        [activeEditor]
    );

    function getPreviewSectionId(sectionId) {
        if (sectionId === 'hero') {
            return 'home-hero-section';
        }

        if (sectionId === 'features') {
            return 'home-features-section';
        }

        if (sectionId === 'shop-by-event') {
            return 'home-shop-by-industry-section';
        }

        return null;
    }

    function scrollPreviewToSection(sectionId) {
        const previewSectionId = getPreviewSectionId(sectionId);
        if (!previewSectionId) {
            return;
        }

        const frame = previewFrameRef.current;
        const documentRef = frame?.contentWindow?.document;
        const target = documentRef?.getElementById(previewSectionId);

        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            setPendingScrollSection(null);
        } else {
            setPendingScrollSection(sectionId);
        }
    }

    async function loadHeroForEditor() {
        setIsLoadingHero(true);

        try {
            const heroes = await fetchHeroes();
            const latestHero = Array.isArray(heroes) && heroes.length > 0 ? heroes[0] : null;

            if (!latestHero) {
                setHeroId(null);
                setHeroForm(defaultHeroForm);
                setSlides([]);
                return;
            }

            setHeroId(latestHero.id);
            setHeroForm({
                title: latestHero.title || '',
                ticker_text: latestHero.ticker_text || '',
                sub_title: latestHero.sub_title || '',
                description: latestHero.description || '',
                button_enabled:
                    typeof latestHero.button_enabled === 'boolean'
                        ? latestHero.button_enabled
                        : defaultHeroForm.button_enabled,
                button_text: latestHero.button_text || '',
            });

            const mappedSlides = (latestHero.slides || []).map((slide, index) =>
                toSlideItem(slide, index)
            );
            setSlides(mappedSlides);
        } catch (error) {
            toast.error(error.message || 'Failed to load hero section.');
        } finally {
            setIsLoadingHero(false);
        }
    }

    async function loadFeaturesForEditor() {
        setIsLoadingFeatures(true);

        try {
            const records = await fetchFeatures();
            const mapped = (Array.isArray(records) ? records : []).map((feature, index) =>
                toFeatureItem(feature, index)
            );
            setFeatureItems(mapped);
            setRemovedFeatureIds([]);
        } catch (error) {
            toast.error(error.message || 'Failed to load features section.');
        } finally {
            setIsLoadingFeatures(false);
        }
    }

    async function loadShopByIndustryForEditor() {
        setIsLoadingIndustry(true);

        try {
            const payload = await fetchShopByIndustry();
            setIndustryForm({
                title: payload?.title || '',
                subtitle: payload?.subtitle || '',
            });

            const mapped = (Array.isArray(payload?.items) ? payload.items : []).map((item, index) =>
                toIndustryItem(item, index)
            );
            setIndustryItems(mapped);
            setRemovedIndustryItemIds([]);
        } catch (error) {
            toast.error(error.message || 'Failed to load shop by industry section.');
        } finally {
            setIsLoadingIndustry(false);
        }
    }

    async function openEditor(editorType) {
        setActiveEditor(editorType);
        setIsDrawerOpen(true);

        if (editorType === 'hero') {
            await loadHeroForEditor();
        }

        if (editorType === 'features') {
            await loadFeaturesForEditor();
        }

        if (editorType === 'shop-by-event') {
            await loadShopByIndustryForEditor();
        }
    }

    function handleSectionClick(sectionId) {
        scrollPreviewToSection(sectionId);

        if (sectionId === 'hero') {
            openEditor('hero');
            return;
        }

        if (sectionId === 'features') {
            openEditor('features');
            return;
        }

        if (sectionId === 'shop-by-event') {
            openEditor('shop-by-event');
            return;
        }

        toast.info('Editor for this section will be added soon.');
    }

    function handleHeroFieldChange(event) {
        const { name, value } = event.target;
        setHeroForm((previous) => ({ ...previous, [name]: value }));
    }

    function handleHeroSlideUpload(event) {
        const files = Array.from(event.target.files || []);
        if (!files.length) {
            return;
        }

        const createdSlides = files.map((file, index) => ({
            key: `new-${Date.now()}-${index}`,
            type: 'new',
            file,
            image_url: URL.createObjectURL(file),
        }));

        setSlides((previous) => normalizeSlides([...previous, ...createdSlides]));
        event.target.value = '';
    }

    function removeHeroSlide(slideKey) {
        setSlides((previous) => {
            const removed = previous.find((slide) => slide.key === slideKey);
            if (removed?.type === 'new' && removed.image_url?.startsWith('blob:')) {
                URL.revokeObjectURL(removed.image_url);
            }

            return normalizeSlides(previous.filter((slide) => slide.key !== slideKey));
        });
    }

    function handleHeroSlideDrop(targetKey) {
        if (!draggedHeroSlideKey || draggedHeroSlideKey === targetKey) {
            return;
        }

        setSlides((previous) => {
            const next = [...previous];
            const draggedIndex = next.findIndex((item) => item.key === draggedHeroSlideKey);
            const targetIndex = next.findIndex((item) => item.key === targetKey);

            if (draggedIndex < 0 || targetIndex < 0) {
                return previous;
            }

            const [moved] = next.splice(draggedIndex, 1);
            next.splice(targetIndex, 0, moved);

            return normalizeSlides(next);
        });

        setDraggedHeroSlideKey(null);
    }

    function addFeatureItem() {
        const key = `new-feature-${Date.now()}`;
        setFeatureItems((previous) =>
            normalizeFeatures([
                ...previous,
                {
                    key,
                    id: null,
                    title: '',
                    description: '',
                    icon_url: null,
                    iconFile: null,
                },
            ])
        );
    }

    function handleFeatureFieldChange(itemKey, field, value) {
        setFeatureItems((previous) =>
            previous.map((item) =>
                item.key === itemKey ? { ...item, [field]: value } : item
            )
        );
    }

    function handleFeatureIconChange(itemKey, file) {
        if (!file) {
            return;
        }

        setFeatureItems((previous) =>
            previous.map((item) => {
                if (item.key !== itemKey) {
                    return item;
                }

                const oldPreview = item.icon_url;
                if (oldPreview && oldPreview.startsWith('blob:')) {
                    URL.revokeObjectURL(oldPreview);
                }

                return {
                    ...item,
                    iconFile: file,
                    icon_url: URL.createObjectURL(file),
                };
            })
        );
    }

    function removeFeatureItem(itemKey) {
        setFeatureItems((previous) => {
            const item = previous.find((entry) => entry.key === itemKey);

            if (item?.id) {
                setRemovedFeatureIds((ids) => [...ids, item.id]);
            }

            if (item?.icon_url && item.icon_url.startsWith('blob:')) {
                URL.revokeObjectURL(item.icon_url);
            }

            return normalizeFeatures(previous.filter((entry) => entry.key !== itemKey));
        });
    }

    function handleFeatureDrop(targetKey) {
        if (!draggedFeatureKey || draggedFeatureKey === targetKey) {
            return;
        }

        setFeatureItems((previous) => {
            const next = [...previous];
            const draggedIndex = next.findIndex((item) => item.key === draggedFeatureKey);
            const targetIndex = next.findIndex((item) => item.key === targetKey);

            if (draggedIndex < 0 || targetIndex < 0) {
                return previous;
            }

            const [moved] = next.splice(draggedIndex, 1);
            next.splice(targetIndex, 0, moved);

            return normalizeFeatures(next);
        });

        setDraggedFeatureKey(null);
    }

    function addIndustryItem() {
        const key = `new-industry-${Date.now()}`;
        setIndustryItems((previous) =>
            normalizeIndustryItems([
                ...previous,
                {
                    key,
                    id: null,
                    title: '',
                    image_url: null,
                    imageFile: null,
                },
            ])
        );
    }

    function handleIndustryFieldChange(itemKey, field, value) {
        setIndustryItems((previous) =>
            previous.map((item) =>
                item.key === itemKey ? { ...item, [field]: value } : item
            )
        );
    }

    function handleIndustryImageChange(itemKey, file) {
        if (!file) {
            return;
        }

        setIndustryItems((previous) =>
            previous.map((item) => {
                if (item.key !== itemKey) {
                    return item;
                }

                const oldPreview = item.image_url;
                if (oldPreview && oldPreview.startsWith('blob:')) {
                    URL.revokeObjectURL(oldPreview);
                }

                return {
                    ...item,
                    imageFile: file,
                    image_url: URL.createObjectURL(file),
                };
            })
        );
    }

    function removeIndustryItem(itemKey) {
        setIndustryItems((previous) => {
            const item = previous.find((entry) => entry.key === itemKey);

            if (item?.id) {
                setRemovedIndustryItemIds((ids) => [...ids, item.id]);
            }

            if (item?.image_url && item.image_url.startsWith('blob:')) {
                URL.revokeObjectURL(item.image_url);
            }

            return normalizeIndustryItems(previous.filter((entry) => entry.key !== itemKey));
        });
    }

    function handleIndustryDrop(targetKey) {
        if (!draggedIndustryKey || draggedIndustryKey === targetKey) {
            return;
        }

        setIndustryItems((previous) => {
            const next = [...previous];
            const draggedIndex = next.findIndex((item) => item.key === draggedIndustryKey);
            const targetIndex = next.findIndex((item) => item.key === targetKey);

            if (draggedIndex < 0 || targetIndex < 0) {
                return previous;
            }

            const [moved] = next.splice(draggedIndex, 1);
            next.splice(targetIndex, 0, moved);

            return normalizeIndustryItems(next);
        });

        setDraggedIndustryKey(null);
    }

    async function handleSaveHero(event) {
        event.preventDefault();
        setIsSaving(true);

        try {
            const existingSlides = slides
                .filter((slide) => slide.type === 'existing' && slide.id)
                .map((slide, index) => ({ id: slide.id, sort_order: index + 1 }));

            const newSlides = slides
                .filter((slide) => slide.type === 'new' && slide.file instanceof File)
                .map((slide, index) => ({ file: slide.file, sort_order: index + 1 }));

            const payload = {
                title: heroForm.title || '',
                description: heroForm.description || '',
                ticker_text: heroForm.ticker_text || '',
                sub_title: heroForm.sub_title || '',
                button_enabled: Boolean(heroForm.button_enabled),
                button_text: heroForm.button_text || '',
                existingSlides,
                newSlides,
            };

            let saved;
            if (heroId) {
                saved = await updateHero(heroId, payload);
            } else {
                saved = await createHero(payload);
            }

            setHeroId(saved?.id || heroId);
            setSlides((saved?.slides || []).map((slide, index) => toSlideItem(slide, index)));
            setPreviewKey((previous) => previous + 1);
            toast.success('Hero section updated successfully.');
        } catch (error) {
            toast.error(error.message || 'Failed to save hero section.');
        } finally {
            setIsSaving(false);
        }
    }

    async function handleSaveFeatures(event) {
        event.preventDefault();
        setIsSaving(true);

        try {
            if (removedFeatureIds.length > 0) {
                await Promise.all(removedFeatureIds.map((id) => deleteFeature(id)));
            }

            for (let index = 0; index < featureItems.length; index += 1) {
                const item = featureItems[index];
                const payload = {
                    title: item.title || '',
                    description: item.description || '',
                    icon: item.iconFile instanceof File ? item.iconFile : null,
                    sort_order: index + 1,
                };

                if (item.id) {
                    await updateFeature(item.id, payload);
                } else {
                    await createFeature(payload);
                }
            }

            await loadFeaturesForEditor();
            setPreviewKey((previous) => previous + 1);
            toast.success('Features section updated successfully.');
        } catch (error) {
            toast.error(error.message || 'Failed to save features section.');
        } finally {
            setIsSaving(false);
        }
    }

    async function handleSaveShopByIndustry(event) {
        event.preventDefault();
        setIsSaving(true);

        try {
            await updateShopByIndustrySection({
                title: industryForm.title || '',
                subtitle: industryForm.subtitle || '',
            });

            if (removedIndustryItemIds.length > 0) {
                await Promise.all(removedIndustryItemIds.map((id) => deleteShopByIndustryItem(id)));
            }

            for (let index = 0; index < industryItems.length; index += 1) {
                const item = industryItems[index];
                const payload = {
                    title: item.title || '',
                    image: item.imageFile instanceof File ? item.imageFile : null,
                    sort_order: index + 1,
                };

                if (item.id) {
                    await updateShopByIndustryItem(item.id, payload);
                } else {
                    await createShopByIndustryItem(payload);
                }
            }

            await loadShopByIndustryForEditor();
            setPreviewKey((previous) => previous + 1);
            toast.success('Shop By Industry section updated successfully.');
        } catch (error) {
            toast.error(error.message || 'Failed to save shop by industry section.');
        } finally {
            setIsSaving(false);
        }
    }

    function renderHeroEditor() {
        return (
            <form onSubmit={handleSaveHero} className="flex min-h-0 flex-1 flex-col">
                <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-4 py-4">
                    {isLoadingHero ? (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <LoaderCircle className="size-4 animate-spin" />
                            Loading hero data...
                        </div>
                    ) : (
                        <>
                            <div className="space-y-2">
                                <Label htmlFor="hero-title">Hero title</Label>
                                <Input
                                    id="hero-title"
                                    name="title"
                                    value={heroForm.title}
                                    onChange={handleHeroFieldChange}
                                    placeholder="Enter hero title"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="ticker-text">Ticker text</Label>
                                <Input
                                    id="ticker-text"
                                    name="ticker_text"
                                    value={heroForm.ticker_text}
                                    onChange={handleHeroFieldChange}
                                    placeholder="Top announcement text"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="sub-title">Sub title</Label>
                                <Input
                                    id="sub-title"
                                    name="sub_title"
                                    value={heroForm.sub_title}
                                    onChange={handleHeroFieldChange}
                                    placeholder="Pill subtitle"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Description</Label>
                                <RichTextEditor
                                    value={heroForm.description}
                                    onChange={(value) =>
                                        setHeroForm((previous) => ({
                                            ...previous,
                                            description: value,
                                        }))
                                    }
                                    placeholder="Describe your hero section"
                                    className="relative"
                                />
                            </div>

                            <div className="space-y-3 rounded-lg border border-border p-3">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="button-enabled">Show button</Label>
                                    <Checkbox
                                        id="button-enabled"
                                        checked={heroForm.button_enabled}
                                        onCheckedChange={(checked) =>
                                            setHeroForm((previous) => ({
                                                ...previous,
                                                button_enabled: Boolean(checked),
                                            }))
                                        }
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="button-text">Button text</Label>
                                    <Input
                                        id="button-text"
                                        name="button_text"
                                        value={heroForm.button_text}
                                        onChange={handleHeroFieldChange}
                                        placeholder="CTA button text"
                                        disabled={!heroForm.button_enabled}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="hero-slides" className="inline-flex items-center gap-2">
                                    <ImagePlus className="size-4" />
                                    Repeater images
                                </Label>
                                <Input
                                    id="hero-slides"
                                    type="file"
                                    accept="image/jpeg,image/png,image/gif,image/webp"
                                    multiple
                                    onChange={handleHeroSlideUpload}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Upload multiple images. Drag and drop cards below to reorder.
                                </p>
                            </div>

                            <div className="space-y-2">
                                {slides.length === 0 ? (
                                    <div className="rounded-md border border-dashed border-border p-3 text-xs text-muted-foreground">
                                        No repeater images yet.
                                    </div>
                                ) : (
                                    slides.map((slide, index) => (
                                        <div
                                            key={slide.key}
                                            draggable
                                            onDragStart={() => setDraggedHeroSlideKey(slide.key)}
                                            onDragOver={(event) => event.preventDefault()}
                                            onDrop={() => handleHeroSlideDrop(slide.key)}
                                            className="flex items-center gap-3 rounded-lg border border-border bg-card p-2"
                                        >
                                            <button
                                                type="button"
                                                className="cursor-grab text-muted-foreground active:cursor-grabbing"
                                                aria-label="Drag to reorder slide"
                                            >
                                                <GripVertical className="size-4" />
                                            </button>

                                            <img
                                                src={slide.image_url}
                                                alt={`Hero slide ${index + 1}`}
                                                className="h-16 w-24 rounded object-cover"
                                            />

                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-xs font-medium text-foreground">
                                                    {slide.type === 'existing' ? 'Existing image' : slide.file?.name}
                                                </p>
                                                <p className="text-[11px] text-muted-foreground">
                                                    Position: {index + 1}
                                                </p>
                                            </div>

                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon-sm"
                                                onClick={() => removeHeroSlide(slide.key)}
                                                aria-label="Remove slide"
                                            >
                                                <Trash2 className="size-4 text-rose-600" />
                                            </Button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </>
                    )}
                </div>

                <SheetFooter className="border-t">
                    <Button type="submit" disabled={isSaving || isLoadingHero} className="w-full">
                        {isSaving ? (
                            <>
                                <LoaderCircle className="size-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="size-4" />
                                Save Hero
                            </>
                        )}
                    </Button>
                </SheetFooter>
            </form>
        );
    }

    function renderFeaturesEditor() {
        return (
            <form onSubmit={handleSaveFeatures} className="flex min-h-0 flex-1 flex-col">
                <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-4 py-4">
                    {isLoadingFeatures ? (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <LoaderCircle className="size-4 animate-spin" />
                            Loading features data...
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center justify-between">
                                <p className="text-xs text-muted-foreground">
                                    Reorder cards by dragging. Each card supports title, description, and icon.
                                </p>
                                <Button type="button" size="sm" onClick={addFeatureItem}>
                                    <Plus className="size-4" />
                                    Add item
                                </Button>
                            </div>

                            <div className="space-y-3">
                                {featureItems.length === 0 ? (
                                    <div className="rounded-md border border-dashed border-border p-3 text-xs text-muted-foreground">
                                        No feature items yet. Click Add item.
                                    </div>
                                ) : (
                                    featureItems.map((item, index) => (
                                        <div
                                            key={item.key}
                                            draggable
                                            onDragStart={() => setDraggedFeatureKey(item.key)}
                                            onDragOver={(event) => event.preventDefault()}
                                            onDrop={() => handleFeatureDrop(item.key)}
                                            className="space-y-3 rounded-lg border border-border bg-card p-3"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="inline-flex items-center gap-2 text-sm font-semibold">
                                                    <GripVertical className="size-4 text-muted-foreground" />
                                                    Item {index + 1}
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon-sm"
                                                    onClick={() => removeFeatureItem(item.key)}
                                                    aria-label="Remove feature item"
                                                >
                                                    <Trash2 className="size-4 text-rose-600" />
                                                </Button>
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Title</Label>
                                                <Input
                                                    value={item.title}
                                                    onChange={(event) =>
                                                        handleFeatureFieldChange(item.key, 'title', event.target.value)
                                                    }
                                                    placeholder="Feature title"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Description</Label>
                                                <Input
                                                    value={item.description}
                                                    onChange={(event) =>
                                                        handleFeatureFieldChange(
                                                            item.key,
                                                            'description',
                                                            event.target.value
                                                        )
                                                    }
                                                    placeholder="Feature description"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Icon</Label>
                                                <Input
                                                    type="file"
                                                    accept="image/jpeg,image/png,image/gif,image/webp"
                                                    onChange={(event) =>
                                                        handleFeatureIconChange(
                                                            item.key,
                                                            event.target.files?.[0]
                                                        )
                                                    }
                                                />
                                                {item.icon_url ? (
                                                    <img
                                                        src={item.icon_url}
                                                        alt={item.title || 'Feature icon'}
                                                        className="h-10 w-10 rounded object-contain"
                                                    />
                                                ) : null}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </>
                    )}
                </div>

                <SheetFooter className="border-t">
                    <Button type="submit" disabled={isSaving || isLoadingFeatures} className="w-full">
                        {isSaving ? (
                            <>
                                <LoaderCircle className="size-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="size-4" />
                                Save Features
                            </>
                        )}
                    </Button>
                </SheetFooter>
            </form>
        );
    }

    function renderShopByIndustryEditor() {
        return (
            <form onSubmit={handleSaveShopByIndustry} className="flex min-h-0 flex-1 flex-col">
                <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-4 py-4">
                    {isLoadingIndustry ? (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <LoaderCircle className="size-4 animate-spin" />
                            Loading shop by industry data...
                        </div>
                    ) : (
                        <>
                            <div className="space-y-2">
                                <Label htmlFor="industry-section-title">Section title</Label>
                                <Input
                                    id="industry-section-title"
                                    value={industryForm.title}
                                    onChange={(event) =>
                                        setIndustryForm((previous) => ({
                                            ...previous,
                                            title: event.target.value,
                                        }))
                                    }
                                    placeholder="e.g. Shop By Industry"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="industry-section-subtitle">Section subtitle</Label>
                                <Input
                                    id="industry-section-subtitle"
                                    value={industryForm.subtitle}
                                    onChange={(event) =>
                                        setIndustryForm((previous) => ({
                                            ...previous,
                                            subtitle: event.target.value,
                                        }))
                                    }
                                    placeholder="e.g. Top picks loved for their comfort..."
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <p className="text-xs text-muted-foreground">
                                    Reorder cards by dragging. Each item has image + title.
                                </p>
                                <Button type="button" size="sm" onClick={addIndustryItem}>
                                    <Plus className="size-4" />
                                    Add item
                                </Button>
                            </div>

                            <div className="space-y-3">
                                {industryItems.length === 0 ? (
                                    <div className="rounded-md border border-dashed border-border p-3 text-xs text-muted-foreground">
                                        No industry items yet. Click Add item.
                                    </div>
                                ) : (
                                    industryItems.map((item, index) => (
                                        <div
                                            key={item.key}
                                            draggable
                                            onDragStart={() => setDraggedIndustryKey(item.key)}
                                            onDragOver={(event) => event.preventDefault()}
                                            onDrop={() => handleIndustryDrop(item.key)}
                                            className="space-y-3 rounded-lg border border-border bg-card p-3"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="inline-flex items-center gap-2 text-sm font-semibold">
                                                    <GripVertical className="size-4 text-muted-foreground" />
                                                    Item {index + 1}
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon-sm"
                                                    onClick={() => removeIndustryItem(item.key)}
                                                    aria-label="Remove industry item"
                                                >
                                                    <Trash2 className="size-4 text-rose-600" />
                                                </Button>
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Card title</Label>
                                                <Input
                                                    value={item.title}
                                                    onChange={(event) =>
                                                        handleIndustryFieldChange(
                                                            item.key,
                                                            'title',
                                                            event.target.value
                                                        )
                                                    }
                                                    placeholder="e.g. Uniforms & Sports Event"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Card image</Label>
                                                <Input
                                                    type="file"
                                                    accept="image/jpeg,image/png,image/gif,image/webp"
                                                    onChange={(event) =>
                                                        handleIndustryImageChange(
                                                            item.key,
                                                            event.target.files?.[0]
                                                        )
                                                    }
                                                />
                                                {item.image_url ? (
                                                    <img
                                                        src={item.image_url}
                                                        alt={item.title || 'Industry item'}
                                                        className="h-24 w-full rounded object-cover"
                                                    />
                                                ) : null}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </>
                    )}
                </div>

                <SheetFooter className="border-t">
                    <Button type="submit" disabled={isSaving || isLoadingIndustry} className="w-full">
                        {isSaving ? (
                            <>
                                <LoaderCircle className="size-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="size-4" />
                                Save Shop By Industry
                            </>
                        )}
                    </Button>
                </SheetFooter>
            </form>
        );
    }

    return (
        <>
            <section className="space-y-3">
                <p className="text-sm text-muted-foreground">
                    Live preview of the full frontend home page used by your page builder.
                </p>

                <div className="grid grid-cols-1 gap-4 xl:grid-cols-[260px_minmax(0,1fr)]">
                    <aside className="rounded-xl border border-border bg-card p-4 shadow-sm">
                        <h2 className="mb-3 text-sm font-semibold text-foreground">Home Page </h2>
                        <div className="space-y-2">
                            {homePageSections.map((section, index) => (
                                <button
                                    key={section.id}
                                    type="button"
                                    onClick={() => handleSectionClick(section.id)}
                                    className="flex w-full items-center justify-between rounded-lg border border-border bg-background px-3 py-2 text-left transition hover:border-zinc-300"
                                >
                                    <span className="inline-flex items-center gap-2 text-sm text-foreground">
                                        <GripVertical className="size-4 text-muted-foreground" />
                                        <span className="font-medium">
                                            {index + 1}. {section.name}
                                        </span>
                                    </span>
                                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                                        <CheckCircle2 className="size-3.5" />
                                        Active
                                    </span>
                                </button>
                            ))}
                        </div>
                    </aside>

                    <div className="rounded-xl border border-border bg-card p-3 shadow-sm">
                        <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
                            <iframe
                                ref={previewFrameRef}
                                key={previewKey}
                                title="Home page live preview"
                                src="/"
                                onLoad={() => {
                                    if (pendingScrollSection) {
                                        scrollPreviewToSection(pendingScrollSection);
                                    }
                                }}
                                className="h-[72vh] min-h-[560px] w-full"
                            />
                        </div>
                    </div>
                </div>
            </section>

            <Sheet
                open={isDrawerOpen}
                onOpenChange={(open) => {
                    setIsDrawerOpen(open);
                    if (!open) {
                        setActiveEditor(null);
                    }
                }}
            >
                <SheetContent side="right" className="w-full gap-0 border-l bg-background p-0 sm:max-w-[430px]">
                    <SheetHeader className="border-b pb-3">
                        <SheetTitle className="inline-flex items-center gap-2">
                            <WandSparkles className="size-4" />
                            {activeSection?.name || 'Section'} Component Editor
                        </SheetTitle>
                        <SheetDescription>
                            {activeEditor === 'features'
                                ? 'Manage feature repeater items with title, description, icon, and drag-drop order.'
                                : activeEditor === 'shop-by-event'
                                    ? 'Manage section title, subtitle, and repeater cards with image + title ordering.'
                                    : 'Update hero content and media repeater.'}
                        </SheetDescription>
                    </SheetHeader>

                    {activeEditor === 'features'
                        ? renderFeaturesEditor()
                        : activeEditor === 'shop-by-event'
                            ? renderShopByIndustryEditor()
                            : renderHeroEditor()}
                </SheetContent>
            </Sheet>
        </>
    );
}
