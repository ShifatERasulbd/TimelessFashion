import { useEffect, useRef, useState } from 'react';
import { Canvas, FabricImage, IText } from 'fabric';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const CANVAS_WIDTH = 540;
const CANVAS_HEIGHT = 640;

const PRODUCT_VIEWS = [
    {
        id: 'front',
        label: 'Front Image',
        url: '/storage/product_personalization/product_1/front.jpeg',
    },
    {
        id: 'back',
        label: 'Back Image',
        url: '/storage/product_personalization/product_1/back.jpeg',
    },
];

async function ensureCsrfCookie() {
    await fetch('/sanctum/csrf-cookie', {
        credentials: 'include',
        headers: {
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
        },
    });
}

export default function Features() {
    const canvasRef = useRef(null);
    const fabricRef = useRef(null);
    const productRef = useRef(null);
    const uploadedDesignsRef = useRef([]);
    const textObjectMapRef = useRef({});
    const activeViewRef = useRef('front');

    const [isReady, setIsReady] = useState(false);
    const [activeView, setActiveView] = useState('front');
    const [text, setText] = useState('THE UNKNOWN');
    const [fontSize, setFontSize] = useState(34);
    const [textColor, setTextColor] = useState('#ffffff');
    const [uploadedDesigns, setUploadedDesigns] = useState([]);
    const [selectedDesignId, setSelectedDesignId] = useState(null);
    const [textLayers, setTextLayers] = useState([]);
    const [isSaving, setIsSaving] = useState(false);
    const [savedUrl, setSavedUrl] = useState('');

    useEffect(() => {
        const canvas = new Canvas(canvasRef.current, {
            width: CANVAS_WIDTH,
            height: CANVAS_HEIGHT,
            backgroundColor: '#ececec',
            selection: true,
            preserveObjectStacking: true,
        });

        const handleKeyDown = (e) => {
            if ((e.key === 'Delete' || e.key === 'Backspace') && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
                const active = canvas.getActiveObject();
                if (!active) return;
                canvas.remove(active);
                canvas.discardActiveObject();
                canvas.renderAll();

                const textId = Object.keys(textObjectMapRef.current).find(
                    (id) => textObjectMapRef.current[id] === active
                );
                if (textId) {
                    delete textObjectMapRef.current[textId];
                    setTextLayers((prev) => prev.filter((t) => t.id !== textId));
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        fabricRef.current = canvas;
        setIsReady(true);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            canvas.dispose();
            fabricRef.current = null;
            productRef.current = null;
        };
    }, []);

    useEffect(() => {
        if (isReady) {
            loadProductBase(PRODUCT_VIEWS[0].url);
        }
    }, [isReady]);

    useEffect(() => {
        uploadedDesignsRef.current = uploadedDesigns;
    }, [uploadedDesigns]);

    useEffect(() => {
        return () => {
            uploadedDesignsRef.current.forEach((item) => URL.revokeObjectURL(item.url));
        };
    }, []);

    const applyViewVisibility = (viewId) => {
        const canvas = fabricRef.current;
        if (!canvas) return;

        const active = canvas.getActiveObject();
        if (active && active !== productRef.current && active.get?.('viewId') !== viewId) {
            canvas.discardActiveObject();
        }

        canvas.getObjects().forEach((obj) => {
            if (obj === productRef.current) return;
            if (!obj.get) return;
            obj.set('visible', obj.get('viewId') === viewId);
        });

        canvas.renderAll();
    };

    const loadProductBase = async (imageUrl) => {
        const canvas = fabricRef.current;
        if (!canvas) return;

        const image = await FabricImage.fromURL(imageUrl);
        const scaleX = CANVAS_WIDTH / image.width;
        const scaleY = CANVAS_HEIGHT / image.height;
        const scale = Math.max(scaleX, scaleY);
        const scaledWidth = image.width * scale;
        const scaledHeight = image.height * scale;
        const left = (CANVAS_WIDTH - scaledWidth) / 2;
        const top = (CANVAS_HEIGHT - scaledHeight) / 2;

        image.set({
            left,
            top,
            scaleX: scale,
            scaleY: scale,
            selectable: false,
            evented: false,
            originX: 'left',
            originY: 'top',
        });

        if (productRef.current) {
            canvas.remove(productRef.current);
        }

        productRef.current = image;
        canvas.add(image);
        canvas.sendObjectToBack(image);
        canvas.renderAll();
    };

    const handleSwitchView = async (view) => {
        setActiveView(view.id);
        activeViewRef.current = view.id;
        await loadProductBase(view.url);
        applyViewVisibility(view.id);
    };

    const addImageToCanvas = async (imageUrl, designId = null) => {
        if (!fabricRef.current) return;

        const image = await FabricImage.fromURL(imageUrl);

        image.set({
            left: 170,
            top: 220,
            selectable: true,
            evented: true,
            hasControls: true,
            hasBorders: true,
            lockMovementX: false,
            lockMovementY: false,
            cornerStyle: 'circle',
            borderColor: '#2563eb',
            cornerColor: '#2563eb',
            transparentCorners: false,
        });

        image.set('designId', designId);
        image.set('viewId', activeViewRef.current);

        image.scaleToWidth(200);

        const canvas = fabricRef.current;
        canvas.add(image);
        canvas.setActiveObject(image);
        canvas.renderAll();
    };

    const handleDesignUpload = async (event) => {
        const files = Array.from(event.target.files || []);
        if (files.length === 0) return;

        const designs = files.map((file) => ({
            id: crypto.randomUUID(),
            name: file.name,
            url: URL.createObjectURL(file),
        }));

        setUploadedDesigns((previous) => [...previous, ...designs]);

        const first = designs[0];
        setSelectedDesignId(first.id);
        await addImageToCanvas(first.url, first.id);

        event.target.value = '';
    };

    const handleUseUploadedDesign = async (design) => {
        setSelectedDesignId(design.id);
        await addImageToCanvas(design.url, design.id);
    };

    const removeDesignFromCanvas = (designId) => {
        const canvas = fabricRef.current;
        if (!canvas) return;

        const toRemove = canvas
            .getObjects()
            .filter((obj) => obj !== productRef.current && obj.get && obj.get('designId') === designId);

        if (toRemove.length > 0) {
            toRemove.forEach((obj) => canvas.remove(obj));
            canvas.discardActiveObject();
            canvas.renderAll();
        }
    };

    const handleRemoveUploadedDesign = (designId) => {
        setUploadedDesigns((previous) => {
            const target = previous.find((item) => item.id === designId);
            if (target?.url) {
                URL.revokeObjectURL(target.url);
            }
            return previous.filter((item) => item.id !== designId);
        });

        if (selectedDesignId === designId) {
            setSelectedDesignId(null);
        }

        removeDesignFromCanvas(designId);
    };

    const handleClearUploadedDesigns = () => {
        uploadedDesigns.forEach((design) => {
            URL.revokeObjectURL(design.url);
            removeDesignFromCanvas(design.id);
        });

        setUploadedDesigns([]);
        setSelectedDesignId(null);
    };

    const handleAddText = () => {
        if (!fabricRef.current || !text.trim()) return;

        const id = crypto.randomUUID();
        const viewId = activeViewRef.current;
        const textObj = new IText(text, {
            left: 170,
            top: 180,
            fill: textColor,
            fontSize,
            fontWeight: '700',
            fontFamily: 'Arial',
            selectable: true,
            evented: true,
            hasControls: true,
            hasBorders: true,
            borderColor: '#2563eb',
            cornerColor: '#2563eb',
            transparentCorners: false,
        });
        textObj.set('textLayerId', id);
        textObj.set('viewId', viewId);

        textObjectMapRef.current[id] = textObj;
        setTextLayers((prev) => [...prev, { id, label: text, viewId }]);

        const canvas = fabricRef.current;
        canvas.add(textObj);
        canvas.setActiveObject(textObj);
        canvas.renderAll();
    };

    const handleRemoveTextLayer = (id) => {
        const canvas = fabricRef.current;
        const textObj = textObjectMapRef.current[id];
        if (canvas && textObj) {
            canvas.remove(textObj);
            canvas.discardActiveObject();
            canvas.renderAll();
        }
        delete textObjectMapRef.current[id];
        setTextLayers((prev) => prev.filter((t) => t.id !== id));
    };

    const handleDeleteSelected = () => {
        const canvas = fabricRef.current;
        if (!canvas) return;

        const selected = canvas.getActiveObject();
        if (!selected || selected === productRef.current) return;

        const textId = Object.keys(textObjectMapRef.current).find(
            (id) => textObjectMapRef.current[id] === selected
        );
        if (textId) {
            delete textObjectMapRef.current[textId];
            setTextLayers((prev) => prev.filter((t) => t.id !== textId));
        }

        canvas.remove(selected);
        canvas.discardActiveObject();
        canvas.renderAll();
    };

    const renderViewDataUrl = async (view) => {
        const sourceCanvas = fabricRef.current;
        if (!sourceCanvas) return null;

        const tempEl = document.createElement('canvas');
        const tempCanvas = new Canvas(tempEl, {
            width: CANVAS_WIDTH,
            height: CANVAS_HEIGHT,
            backgroundColor: '#ececec',
            selection: false,
            preserveObjectStacking: true,
        });

        const base = await FabricImage.fromURL(view.url);
        const scaleX = CANVAS_WIDTH / base.width;
        const scaleY = CANVAS_HEIGHT / base.height;
        const scale = Math.max(scaleX, scaleY);
        const scaledWidth = base.width * scale;
        const scaledHeight = base.height * scale;

        base.set({
            left: (CANVAS_WIDTH - scaledWidth) / 2,
            top: (CANVAS_HEIGHT - scaledHeight) / 2,
            scaleX: scale,
            scaleY: scale,
            selectable: false,
            evented: false,
            originX: 'left',
            originY: 'top',
        });

        tempCanvas.add(base);
        tempCanvas.sendObjectToBack(base);

        const overlays = sourceCanvas
            .getObjects()
            .filter((obj) => obj !== productRef.current && obj.get?.('viewId') === view.id);

        for (const obj of overlays) {
            const cloned = await obj.clone();
            tempCanvas.add(cloned);
        }

        tempCanvas.renderAll();
        const dataUrl = tempCanvas.toDataURL({
            format: 'png',
            multiplier: 2,
        });
        tempCanvas.dispose();

        return dataUrl;
    };

    const triggerDownload = (url, fileName) => {
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = fileName;
        anchor.click();
    };

    const handleDownloadBoth = async () => {
        if (!fabricRef.current) return;

        try {
            for (const view of PRODUCT_VIEWS) {
                const dataUrl = await renderViewDataUrl(view);
                if (!dataUrl) continue;
                triggerDownload(dataUrl, `design-${view.id}-${Date.now()}.png`);
            }
        } catch {
            toast.error('Failed to download front and back designs.', {
                style: { color: '#dc2626' },
            });
        }
    };

    const handleSaveOrderDesign = async () => {
        if (!fabricRef.current) return;

        setIsSaving(true);
        try {
            await ensureCsrfCookie();

            const imageData = fabricRef.current.toDataURL({
                format: 'png',
                multiplier: 2,
            });

            const response = await fetch('/api/personalizations', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify({
                    image: imageData,
                    title: 'Customized Product Design',
                }),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data?.message || 'Failed to save design.');
            }

            setSavedUrl(data?.data?.image_url || '');
            toast.success('Design saved for order successfully.', {
                style: { color: '#16a34a' },
            });
        } catch (error) {
            toast.error(error.message || 'Unable to save design.', {
                style: { color: '#dc2626' },
            });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,420px)]">
            <Card className="overflow-hidden">
                <CardHeader>
                    <CardTitle>Product Personalization</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="w-full bg-slate-100">
                        <canvas ref={canvasRef} style={{ display: 'block', width: '100%', aspectRatio: `${CANVAS_WIDTH} / ${CANVAS_HEIGHT}` }} />
                    </div>
                    <div className="flex gap-4 p-4">
                        {PRODUCT_VIEWS.map((view) => (
                            <button
                                key={view.id}
                                type="button"
                                onClick={() => handleSwitchView(view)}
                                className={`flex flex-col items-center gap-1 rounded-lg border-2 p-1 transition-colors ${
                                    activeView === view.id
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-muted hover:border-slate-400'
                                }`}
                            >
                                <img
                                    src={view.url}
                                    alt={view.label}
                                    className="h-16 w-16 rounded object-cover"
                                />
                                <span className="text-xs font-medium">{view.label}</span>
                            </button>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Customize Panel</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                    <div className="space-y-2">
                        <Label htmlFor="design-image">Upload logo/design image</Label>
                        <Input
                            id="design-image"
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleDesignUpload}
                        />
                        <p className="text-xs text-muted-foreground">
                            Upload multiple images. Click "Use" to place any uploaded image on canvas.
                        </p>
                    </div>

                    {uploadedDesigns.length > 0 && (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between gap-2">
                                <Label>Uploaded images</Label>
                                <Button type="button" variant="outline" size="sm" onClick={handleClearUploadedDesigns}>
                                    Clear all
                                </Button>
                            </div>
                            <div className="max-h-56 space-y-2 overflow-auto rounded-md border p-2">
                                {uploadedDesigns.map((design) => (
                                    <div
                                        key={design.id}
                                        className={`flex items-center gap-3 rounded-md border p-2 ${
                                            selectedDesignId === design.id ? 'border-blue-500 bg-blue-50' : ''
                                        }`}
                                    >
                                        <img
                                            src={design.url}
                                            alt={design.name}
                                            className="h-12 w-12 rounded object-cover"
                                        />
                                        <p className="flex-1 truncate text-xs">{design.name}</p>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleUseUploadedDesign(design)}
                                        >
                                            Use
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleRemoveUploadedDesign(design.id)}
                                        >
                                            Remove
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="design-text">Text</Label>
                        <Input
                            id="design-text"
                            value={text}
                            onChange={(event) => setText(event.target.value)}
                            placeholder="Write text for product"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <Label htmlFor="font-size">Font size</Label>
                            <Input
                                id="font-size"
                                type="number"
                                min={10}
                                max={120}
                                value={fontSize}
                                onChange={(event) => setFontSize(Number(event.target.value || 24))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="text-color">Text color</Label>
                            <Input
                                id="text-color"
                                type="color"
                                value={textColor}
                                onChange={(event) => setTextColor(event.target.value)}
                                className="h-10"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <Button type="button" onClick={handleAddText} disabled={!isReady}>
                            Add Text
                        </Button>
                        <Button type="button" variant="outline" onClick={handleDeleteSelected}>
                            Delete Selected
                        </Button>
                    </div>

                    {textLayers.length > 0 && (
                        <div className="space-y-2">
                            <Label>Added text layers</Label>
                            <div className="max-h-44 space-y-2 overflow-auto rounded-md border p-2">
                                {textLayers.filter((layer) => layer.viewId === activeView).map((layer) => (
                                    <div key={layer.id} className="flex items-center gap-3 rounded-md border p-2">
                                        <p className="flex-1 truncate text-xs font-medium">{layer.label}</p>
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => handleRemoveTextLayer(layer.id)}
                                        >
                                            Remove
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                        <Button type="button" variant="outline" onClick={handleDownloadBoth}>
                            Download Front + Back
                        </Button>
                        <Button type="button" onClick={handleSaveOrderDesign} disabled={isSaving}>
                            {isSaving ? 'Saving...' : 'Save as Order Design'}
                        </Button>
                    </div>

                    <p className="text-xs text-muted-foreground">
                        Designing {activeView}. Uploaded images and text are saved separately for front and back.
                    </p>

                    {savedUrl && (
                        <a
                            href={savedUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="block text-sm text-blue-600 underline"
                        >
                            View last saved design image
                        </a>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}