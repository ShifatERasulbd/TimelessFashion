import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, Circle, FabricImage, IText, Rect } from 'fabric';
import {
    AlignCenter,
    AlignLeft,
    AlignRight,
    ArrowLeft,
    BringToFront,
    Check,
    Eye,
    EyeOff,
    ImagePlus,
    Italic,
    Layers3,
    RotateCcw,
    RotateCw,
    SendToBack,
    Share2,
    Shapes,
    Square,
    Type,
    Underline,
    Upload,
    Download,
    ShoppingCart,
    Trash2,
    Bold,
    Circle as CircleIcon,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

const CANVAS_WIDTH = 760;
const CANVAS_HEIGHT = 760;
const PRODUCT_PRICE = '$49.99';
const HISTORY_LIMIT = 40;
const SERIALIZED_PROPS = ['objectId', 'viewId', 'layerType', 'layerName', 'designId', 'sourceName', 'shapeKind', 'isBaseImage', 'hiddenByUser'];

const FONT_OPTIONS = ['Bebas Neue', 'Montserrat', 'Oswald', 'Poppins', 'Georgia', 'Arial'];

const PRODUCT_COLORS = [
    { id: 'black', label: 'Black', value: '#111111' },
    { id: 'navy', label: 'Navy', value: '#17336f' },
    { id: 'red', label: 'Red', value: '#c91d3b' },
    { id: 'gray', label: 'Gray', value: '#c7c7cc' },
    { id: 'white', label: 'White', value: '#ffffff' },
];

const PRODUCT_VIEWS = [
    {
        id: 'front',
        label: 'Front',
        url: '/storage/product_personalization/product_1/front.jpeg',
    },
    {
        id: 'back',
        label: 'Back',
        url: '/storage/product_personalization/product_1/back.jpeg',
    },
];

const TOOL_ITEMS = [
    { id: 'upload', label: 'Upload', icon: Upload },
    { id: 'text', label: 'Text', icon: Type },
    { id: 'images', label: 'Images', icon: ImagePlus },
    { id: 'shapes', label: 'Shapes', icon: Shapes },
    { id: 'undo', label: 'Undo', icon: RotateCcw, action: true },
    { id: 'redo', label: 'Redo', icon: RotateCw, action: true },
    { id: 'layers', label: 'Layers', icon: Layers3 },
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

function isTextObject(object) {
    return object?.type === 'i-text' || object?.type === 'text';
}

function getLayerType(object) {
    if (isTextObject(object)) return 'text';
    if (object?.type === 'image') return 'image';
    return 'shape';
}

function getLayerLabel(object) {
    if (isTextObject(object)) {
        return object.text || 'Text layer';
    }

    if (object?.type === 'image') {
        return object.get?.('sourceName') || 'Image layer';
    }

    if (object?.type === 'circle') {
        return 'Circle';
    }

    if (object?.type === 'rect') {
        return 'Rectangle';
    }

    return object?.get?.('layerName') || 'Shape';
}

function ToolbarButton({ active, icon: Icon, label, onClick, disabled = false }) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className={cn(
                'group flex min-w-[58px] flex-col items-center gap-2 rounded-2xl border px-2 py-3 text-[11px] font-medium transition-colors',
                active
                    ? 'border-zinc-900 bg-zinc-900 text-white shadow-sm'
                    : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:text-zinc-900',
                disabled && 'cursor-not-allowed opacity-50'
            )}
            aria-label={label}
        >
            <Icon className="size-4" />
            <span>{label}</span>
        </button>
    );
}

export default function Features() {
    const canvasRef = useRef(null);
    const fabricRef = useRef(null);
    const productRef = useRef(null);
    const fileInputRef = useRef(null);
    const activeViewRef = useRef('front');
    const historyRef = useRef([]);
    const redoRef = useRef([]);
    const isRestoringRef = useRef(false);

    const [isReady, setIsReady] = useState(false);
    const [activeTool, setActiveTool] = useState('upload');
    const [activeView, setActiveView] = useState('front');
    const [productColor, setProductColor] = useState('black');
    const [draftText, setDraftText] = useState('THE UNKNOWN');
    const [draftFontFamily, setDraftFontFamily] = useState('Montserrat');
    const [draftFontSize, setDraftFontSize] = useState(34);
    const [draftTextColor, setDraftTextColor] = useState('#ffffff');
    const [uploadedDesigns, setUploadedDesigns] = useState([]);
    const [selectedDesignId, setSelectedDesignId] = useState(null);
    const [layers, setLayers] = useState([]);
    const [selectedObjectId, setSelectedObjectId] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [savedUrl, setSavedUrl] = useState('');
    const [canUndo, setCanUndo] = useState(false);
    const [canRedo, setCanRedo] = useState(false);

    const activeTextLayers = useMemo(
        () => layers.filter((layer) => layer.type === 'text'),
        [layers]
    );

    const updateHistoryFlags = () => {
        setCanUndo(historyRef.current.length > 1);
        setCanRedo(redoRef.current.length > 0);
    };

    const getCanvas = () => fabricRef.current;

    const getAllDesignObjects = () => {
        const canvas = getCanvas();
        if (!canvas) return [];

        return canvas
            .getObjects()
            .filter((object) => !object.get?.('isBaseImage'));
    };

    const getViewObjects = (viewId = activeViewRef.current) => {
        return getAllDesignObjects().filter((object) => object.get?.('viewId') === viewId);
    };

    const getObjectById = (objectId) => {
        if (!objectId) return null;

        return getAllDesignObjects().find((object) => object.get?.('objectId') === objectId) || null;
    };

    const serializeCanvasState = () => {
        const canvas = getCanvas();
        if (!canvas) return null;

        return JSON.stringify({
            activeView: activeViewRef.current,
            productColor,
            canvas: canvas.toJSON(SERIALIZED_PROPS),
        });
    };

    const recordHistory = () => {
        if (isRestoringRef.current) return;

        const snapshot = serializeCanvasState();
        if (!snapshot) return;

        const currentHistory = historyRef.current;
        if (currentHistory[currentHistory.length - 1] === snapshot) return;

        currentHistory.push(snapshot);
        if (currentHistory.length > HISTORY_LIMIT) {
            currentHistory.shift();
        }

        redoRef.current = [];
        updateHistoryFlags();
    };

    const syncSelectionState = () => {
        const canvas = getCanvas();
        const activeObject = canvas?.getActiveObject() || null;
        const activeObjectId = activeObject?.get?.('objectId') || null;

        setSelectedObjectId(activeObjectId);

        if (activeObject && isTextObject(activeObject)) {
            setActiveTool('text');
        }
    };

    const refreshLayers = (viewId = activeViewRef.current) => {
        const canvas = getCanvas();
        if (!canvas) return;

        const activeObjectId = canvas.getActiveObject()?.get?.('objectId') || null;

        const nextLayers = getViewObjects(viewId)
            .slice()
            .reverse()
            .map((object) => ({
                id: object.get?.('objectId'),
                type: getLayerType(object),
                label: getLayerLabel(object),
                visible: object.visible !== false,
                selected: object.get?.('objectId') === activeObjectId,
                text: object.text || '',
                fontFamily: object.fontFamily || 'Montserrat',
                fontSize: Number(object.fontSize || 24),
                fill: object.fill || '#111111',
                fontWeight: object.fontWeight || '400',
                fontStyle: object.fontStyle || 'normal',
                underline: Boolean(object.underline),
                textAlign: object.textAlign || 'center',
            }));

        setLayers(nextLayers);
        setSelectedObjectId(activeObjectId);
    };

    const applyViewVisibility = (viewId) => {
        const canvas = getCanvas();
        if (!canvas) return;

        const activeObject = canvas.getActiveObject();
        if (activeObject && activeObject.get?.('viewId') !== viewId) {
            canvas.discardActiveObject();
        }

        getAllDesignObjects().forEach((object) => {
            object.set('visible', object.get?.('viewId') === viewId && object.get('hiddenByUser') !== true);
        });

        canvas.renderAll();
        syncSelectionState();
        refreshLayers(viewId);
    };

    const loadProductBase = async (view, options = {}) => {
        const canvas = getCanvas();
        if (!canvas) return;

        canvas.getObjects()
            .filter((object) => object.get?.('isBaseImage'))
            .forEach((object) => canvas.remove(object));

        const image = await FabricImage.fromURL(view.url);
        const scale = Math.min(CANVAS_WIDTH / image.width, CANVAS_HEIGHT / image.height);
        const scaledWidth = image.width * scale;
        const scaledHeight = image.height * scale;

        image.set({
            left: (CANVAS_WIDTH - scaledWidth) / 2,
            top: (CANVAS_HEIGHT - scaledHeight) / 2,
            scaleX: scale,
            scaleY: scale,
            selectable: false,
            evented: false,
            originX: 'left',
            originY: 'top',
            isBaseImage: true,
        });

        productRef.current = image;
        canvas.add(image);
        canvas.sendObjectToBack(image);
        canvas.renderAll();

        if (options.resetHistory) {
            historyRef.current = [serializeCanvasState()].filter(Boolean);
            redoRef.current = [];
            updateHistoryFlags();
        }
    };

    const restoreHistorySnapshot = async (snapshot) => {
        const canvas = getCanvas();
        if (!canvas || !snapshot) return;

        const parsed = JSON.parse(snapshot);
        const view = PRODUCT_VIEWS.find((item) => item.id === parsed.activeView) || PRODUCT_VIEWS[0];

        isRestoringRef.current = true;
        canvas.discardActiveObject();
        await canvas.loadFromJSON(parsed.canvas);

        setProductColor(parsed.productColor || 'black');
        activeViewRef.current = view.id;
        setActiveView(view.id);

        await loadProductBase(view);
        applyViewVisibility(view.id);
        canvas.renderAll();

        isRestoringRef.current = false;
        syncSelectionState();
        refreshLayers(view.id);
        updateHistoryFlags();
    };

    useEffect(() => {
        const canvas = new Canvas(canvasRef.current, {
            width: CANVAS_WIDTH,
            height: CANVAS_HEIGHT,
            backgroundColor: '#f6f3ee',
            selection: true,
            preserveObjectStacking: true,
        });

        const handleKeyDown = (event) => {
            if ((event.key === 'Delete' || event.key === 'Backspace') && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
                const activeObject = canvas.getActiveObject();
                if (!activeObject || activeObject.get?.('isBaseImage')) return;

                canvas.remove(activeObject);
                canvas.discardActiveObject();
                canvas.renderAll();
                refreshLayers();
                syncSelectionState();
                recordHistory();
            }
        };

        const handleSelectionChange = () => {
            syncSelectionState();
            refreshLayers();
        };

        const handleObjectModified = () => {
            refreshLayers();
            syncSelectionState();
            recordHistory();
        };

        canvas.on('selection:created', handleSelectionChange);
        canvas.on('selection:updated', handleSelectionChange);
        canvas.on('selection:cleared', handleSelectionChange);
        canvas.on('object:modified', handleObjectModified);

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
        if (!isReady) return;

        const initialize = async () => {
            await loadProductBase(PRODUCT_VIEWS[0], { resetHistory: true });
            applyViewVisibility(PRODUCT_VIEWS[0].id);
        };

        initialize();
    }, [isReady]);

    useEffect(() => {
        return () => {
            uploadedDesigns.forEach((design) => URL.revokeObjectURL(design.url));
        };
    }, [uploadedDesigns]);

    const selectObject = (objectId) => {
        const canvas = getCanvas();
        const object = getObjectById(objectId);
        if (!canvas || !object) return;

        canvas.setActiveObject(object);
        canvas.renderAll();
        syncSelectionState();
        refreshLayers();
    };

    const handleSwitchView = async (view) => {
        activeViewRef.current = view.id;
        setActiveView(view.id);
        await loadProductBase(view);
        applyViewVisibility(view.id);
    };

    const addImageToCanvas = async (imageUrl, designId = null, sourceName = 'Uploaded image') => {
        const canvas = getCanvas();
        if (!canvas) return;

        const image = await FabricImage.fromURL(imageUrl);
        const objectId = crypto.randomUUID();

        image.set({
            left: CANVAS_WIDTH / 2 - 110,
            top: CANVAS_HEIGHT / 2 - 80,
            selectable: true,
            evented: true,
            hasControls: true,
            hasBorders: true,
            cornerStyle: 'circle',
            borderColor: '#2563eb',
            cornerColor: '#2563eb',
            transparentCorners: false,
            objectId,
            designId,
            sourceName,
            viewId: activeViewRef.current,
            layerType: 'image',
            layerName: sourceName,
        });

        image.scaleToWidth(240);

        canvas.add(image);
        canvas.setActiveObject(image);
        canvas.renderAll();

        setActiveTool('images');
        syncSelectionState();
        refreshLayers();
        recordHistory();
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

        const firstDesign = designs[0];
        setSelectedDesignId(firstDesign.id);
        await addImageToCanvas(firstDesign.url, firstDesign.id, firstDesign.name);

        event.target.value = '';
    };

    const handleUseUploadedDesign = async (design) => {
        setSelectedDesignId(design.id);
        await addImageToCanvas(design.url, design.id, design.name);
    };

    const handleRemoveUploadedDesign = (designId) => {
        const canvas = getCanvas();
        const objectMatches = getAllDesignObjects().filter((object) => object.get?.('designId') === designId);

        if (canvas) {
            objectMatches.forEach((object) => canvas.remove(object));
            canvas.discardActiveObject();
            canvas.renderAll();
        }

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

        syncSelectionState();
        refreshLayers();
        recordHistory();
    };

    const handleClearUploadedDesigns = () => {
        uploadedDesigns.forEach((design) => {
            URL.revokeObjectURL(design.url);
        });

        const canvas = getCanvas();
        if (canvas) {
            getAllDesignObjects()
                .filter((object) => object.get?.('layerType') === 'image')
                .forEach((object) => canvas.remove(object));

            canvas.discardActiveObject();
            canvas.renderAll();
        }

        setUploadedDesigns([]);
        setSelectedDesignId(null);
        refreshLayers();
        syncSelectionState();
        recordHistory();
    };

    const handleAddText = () => {
        const canvas = getCanvas();
        if (!canvas || !draftText.trim()) return;

        const textObject = new IText(draftText.trim(), {
            left: CANVAS_WIDTH / 2 - 100,
            top: CANVAS_HEIGHT / 2 - 40,
            fill: draftTextColor,
            fontSize: draftFontSize,
            fontWeight: '700',
            fontFamily: draftFontFamily,
            textAlign: 'center',
            selectable: true,
            evented: true,
            hasControls: true,
            hasBorders: true,
            borderColor: '#2563eb',
            cornerColor: '#2563eb',
            transparentCorners: false,
        });

        textObject.set({
            objectId: crypto.randomUUID(),
            layerType: 'text',
            layerName: draftText.trim(),
            viewId: activeViewRef.current,
        });

        canvas.add(textObject);
        canvas.setActiveObject(textObject);
        canvas.renderAll();

        setActiveTool('text');
        syncSelectionState();
        refreshLayers();
        recordHistory();
    };

    const addShape = (shapeKind) => {
        const canvas = getCanvas();
        if (!canvas) return;

        const commonProps = {
            left: CANVAS_WIDTH / 2 - 70,
            top: CANVAS_HEIGHT / 2 - 70,
            fill: 'rgba(255,255,255,0.18)',
            stroke: '#111111',
            strokeWidth: 2,
            selectable: true,
            evented: true,
            objectId: crypto.randomUUID(),
            layerType: 'shape',
            layerName: shapeKind === 'circle' ? 'Circle' : 'Rectangle',
            shapeKind,
            viewId: activeViewRef.current,
        };

        const shape = shapeKind === 'circle'
            ? new Circle({ ...commonProps, radius: 60 })
            : new Rect({ ...commonProps, width: 140, height: 140, rx: 24, ry: 24 });

        canvas.add(shape);
        canvas.setActiveObject(shape);
        canvas.renderAll();

        setActiveTool('shapes');
        syncSelectionState();
        refreshLayers();
        recordHistory();
    };

    const updateTextLayer = (layerId, updates, shouldRecord = true) => {
        const canvas = getCanvas();
        const object = getObjectById(layerId);
        if (!canvas || !object || !isTextObject(object)) return;

        object.set({
            ...updates,
            layerName: updates.text || object.text || object.get?.('layerName'),
        });

        if (typeof updates.text === 'string') {
            object.set('text', updates.text);
        }

        canvas.renderAll();
        refreshLayers();

        if (shouldRecord) {
            recordHistory();
        }
    };

    const toggleLayerVisibility = (layerId) => {
        const canvas = getCanvas();
        const object = getObjectById(layerId);
        if (!canvas || !object) return;

        const nextVisible = object.visible === false;
        object.set('visible', nextVisible);
        object.set('hiddenByUser', !nextVisible);

        if (!nextVisible && canvas.getActiveObject() === object) {
            canvas.discardActiveObject();
        }

        canvas.renderAll();
        syncSelectionState();
        refreshLayers();
        recordHistory();
    };

    const handleBringForward = () => {
        const canvas = getCanvas();
        const activeObject = canvas?.getActiveObject();
        if (!canvas || !activeObject) return;

        if (typeof canvas.bringObjectForward === 'function') {
            canvas.bringObjectForward(activeObject);
        } else if (typeof activeObject.bringForward === 'function') {
            activeObject.bringForward();
        }

        canvas.renderAll();
        refreshLayers();
        recordHistory();
    };

    const handleSendBackward = () => {
        const canvas = getCanvas();
        const activeObject = canvas?.getActiveObject();
        if (!canvas || !activeObject) return;

        if (typeof canvas.sendObjectBackwards === 'function') {
            canvas.sendObjectBackwards(activeObject);
        } else if (typeof activeObject.sendBackwards === 'function') {
            activeObject.sendBackwards();
        }

        if (productRef.current) {
            canvas.sendObjectToBack(productRef.current);
        }

        canvas.renderAll();
        refreshLayers();
        recordHistory();
    };

    const handleDeleteSelected = () => {
        const canvas = getCanvas();
        const activeObject = canvas?.getActiveObject();
        if (!canvas || !activeObject || activeObject.get?.('isBaseImage')) return;

        canvas.remove(activeObject);
        canvas.discardActiveObject();
        canvas.renderAll();

        syncSelectionState();
        refreshLayers();
        recordHistory();
    };

    const renderViewDataUrl = async (view) => {
        const sourceCanvas = getCanvas();
        if (!sourceCanvas) return null;

        const tempCanvasElement = document.createElement('canvas');
        const tempCanvas = new Canvas(tempCanvasElement, {
            width: CANVAS_WIDTH,
            height: CANVAS_HEIGHT,
            backgroundColor: '#f6f3ee',
            selection: false,
            preserveObjectStacking: true,
        });

        const baseImage = await FabricImage.fromURL(view.url);
        const scale = Math.min(CANVAS_WIDTH / baseImage.width, CANVAS_HEIGHT / baseImage.height);
        const scaledWidth = baseImage.width * scale;
        const scaledHeight = baseImage.height * scale;

        baseImage.set({
            left: (CANVAS_WIDTH - scaledWidth) / 2,
            top: (CANVAS_HEIGHT - scaledHeight) / 2,
            scaleX: scale,
            scaleY: scale,
            selectable: false,
            evented: false,
            originX: 'left',
            originY: 'top',
        });

        tempCanvas.add(baseImage);
        tempCanvas.sendObjectToBack(baseImage);

        const overlays = sourceCanvas
            .getObjects()
            .filter((object) => !object.get?.('isBaseImage') && object.get?.('viewId') === view.id && object.get?.('hiddenByUser') !== true);

        for (const object of overlays) {
            const cloned = await object.clone();
            cloned.set('visible', true);
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

    const handleDownloadBoth = async () => {
        try {
            for (const view of PRODUCT_VIEWS) {
                const dataUrl = await renderViewDataUrl(view);
                if (!dataUrl) continue;

                const anchor = document.createElement('a');
                anchor.href = dataUrl;
                anchor.download = `design-${view.id}-${Date.now()}.png`;
                anchor.click();
            }
        } catch {
            toast.error('Failed to download the design files.');
        }
    };

    const handleSaveOrderDesign = async () => {
        const canvas = getCanvas();
        if (!canvas) return;

        setIsSaving(true);
        try {
            await ensureCsrfCookie();

            const imageData = canvas.toDataURL({
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
            toast.success('Design saved successfully.');
        } catch (error) {
            toast.error(error.message || 'Unable to save design.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleShare = async () => {
        try {
            if (navigator.share) {
                await navigator.share({
                    title: 'Personalizer',
                    url: window.location.href,
                });
                return;
            }

            await navigator.clipboard.writeText(savedUrl || window.location.href);
            toast.success('Link copied to clipboard.');
        } catch {
            toast.error('Unable to share this design right now.');
        }
    };

    const handleUndo = async () => {
        if (historyRef.current.length <= 1) return;

        const current = historyRef.current.pop();
        redoRef.current.push(current);
        await restoreHistorySnapshot(historyRef.current[historyRef.current.length - 1]);
    };

    const handleRedo = async () => {
        if (redoRef.current.length === 0) return;

        const snapshot = redoRef.current.pop();
        historyRef.current.push(snapshot);
        await restoreHistorySnapshot(snapshot);
    };

    const handleToolbarSelect = async (toolId) => {
        if (toolId === 'undo') {
            await handleUndo();
            return;
        }

        if (toolId === 'redo') {
            await handleRedo();
            return;
        }

        setActiveTool(toolId);

        if (toolId === 'upload' || toolId === 'images') {
            fileInputRef.current?.click();
        }
    };

    const selectedColor = PRODUCT_COLORS.find((color) => color.id === productColor);

    return (
        <div className="min-h-screen bg-[#f7f5ef] text-zinc-950">
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleDesignUpload}
            />

            <div className="mx-auto flex min-h-screen max-w-[1600px] flex-col px-4 py-4 lg:px-6 xl:px-8">
                <header className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-zinc-200/80 bg-white/90 px-4 py-3 shadow-sm backdrop-blur">
                    <a href="/" className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-950">
                        <ArrowLeft className="size-4" />
                        <span>Back to shop</span>
                    </a>

                    <div className="flex items-center gap-2">
                        <Button type="button" variant="outline" onClick={handleSaveOrderDesign} disabled={isSaving}>
                            {isSaving ? 'Saving...' : 'Save design'}
                        </Button>
                        <Button type="button" variant="outline" onClick={handleShare}>
                            <Share2 className="size-4" />
                            Share
                        </Button>
                    </div>
                </header>

                <div className="grid flex-1 gap-4 xl:grid-cols-[88px_minmax(0,1.45fr)_380px_220px]">
                    <aside className="rounded-[28px] border border-zinc-200 bg-white p-3 shadow-sm xl:sticky xl:top-6 xl:h-fit">
                        <div className="grid grid-cols-4 gap-2 sm:grid-cols-7 xl:grid-cols-1">
                            {TOOL_ITEMS.map((tool) => (
                                <ToolbarButton
                                    key={tool.id}
                                    icon={tool.icon}
                                    label={tool.label}
                                    active={activeTool === tool.id && !tool.action}
                                    disabled={(tool.id === 'undo' && !canUndo) || (tool.id === 'redo' && !canRedo)}
                                    onClick={() => handleToolbarSelect(tool.id)}
                                />
                            ))}
                        </div>
                    </aside>

                    <section className="overflow-hidden rounded-[32px] border border-zinc-200 bg-white shadow-sm">
                        <div className="flex h-full flex-col">
                            <div className="flex-1 bg-[radial-gradient(circle_at_top,#ffffff,transparent_45%),linear-gradient(180deg,#f7f6f2_0%,#f2f0ea_100%)] p-4 sm:p-6">
                                <div className="mx-auto flex h-full max-w-[860px] items-center justify-center rounded-[30px] border border-zinc-200/60 bg-white shadow-inner">
                                    <canvas
                                        ref={canvasRef}
                                        className="block max-h-full max-w-full rounded-[28px]"
                                        style={{ width: '100%', height: 'auto', aspectRatio: `${CANVAS_WIDTH} / ${CANVAS_HEIGHT}` }}
                                    />
                                </div>
                            </div>

                            <div className="border-t border-zinc-200 bg-white px-4 py-4 sm:px-6">
                                <div className="flex flex-wrap gap-3">
                                    {PRODUCT_VIEWS.map((view) => (
                                        <button
                                            key={view.id}
                                            type="button"
                                            onClick={() => handleSwitchView(view)}
                                            className={cn(
                                                'rounded-2xl border p-2 transition-colors',
                                                activeView === view.id
                                                    ? 'border-zinc-950 shadow-sm'
                                                    : 'border-zinc-200 hover:border-zinc-400'
                                            )}
                                        >
                                            <img src={view.url} alt={view.label} className="h-20 w-16 rounded-xl object-cover" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="rounded-[32px] border border-zinc-200 bg-white p-5 shadow-sm">
                        <div className="flex h-full flex-col gap-6">
                            <div>
                                <h1 className="text-2xl font-semibold tracking-tight">Customize your sweatshirt</h1>
                                <p className="mt-1 text-sm text-zinc-500">Create something timeless.</p>
                            </div>

                            <div className={cn('space-y-3 rounded-3xl border p-4', activeTool === 'upload' && 'border-zinc-950 bg-zinc-50')}>
                                <div>
                                    <Label className="text-sm font-semibold text-zinc-800">Product color</Label>
                                    <p className="mt-1 text-xs text-zinc-500">Selected: {selectedColor?.label}</p>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    {PRODUCT_COLORS.map((color) => (
                                        <button
                                            key={color.id}
                                            type="button"
                                            onClick={() => setProductColor(color.id)}
                                            className={cn(
                                                'flex size-10 items-center justify-center rounded-full border shadow-sm transition-transform hover:scale-105',
                                                color.id === 'white' ? 'border-zinc-300' : 'border-transparent',
                                                productColor === color.id && 'ring-2 ring-zinc-950 ring-offset-2'
                                            )}
                                            style={{ backgroundColor: color.value }}
                                            aria-label={color.label}
                                        >
                                            {productColor === color.id && (
                                                <Check className={cn('size-4', color.id === 'white' ? 'text-zinc-950' : 'text-white')} />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className={cn('space-y-3 rounded-3xl border p-4', activeTool === 'images' && 'border-zinc-950 bg-zinc-50')}>
                                <div>
                                    <Label className="text-sm font-semibold text-zinc-800">Add your design</Label>
                                </div>
                                <Button type="button" className="w-full rounded-2xl bg-zinc-950 text-white hover:bg-zinc-800" onClick={() => fileInputRef.current?.click()}>
                                    <Upload className="size-4" />
                                    Upload image or logo
                                </Button>
                                <p className="text-xs text-zinc-500">JPG, PNG, SVG up to 10MB</p>

                                {uploadedDesigns.length > 0 && (
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-xs uppercase tracking-[0.2em] text-zinc-500">Images</Label>
                                            <Button type="button" variant="ghost" size="sm" onClick={handleClearUploadedDesigns}>
                                                Clear
                                            </Button>
                                        </div>
                                        <div className="space-y-2">
                                            {uploadedDesigns.map((design) => (
                                                <div key={design.id} className={cn('flex items-center gap-3 rounded-2xl border p-2', selectedDesignId === design.id && 'border-zinc-950 bg-white')}>
                                                    <img src={design.url} alt={design.name} className="h-14 w-14 rounded-xl object-cover" />
                                                    <div className="min-w-0 flex-1">
                                                        <p className="truncate text-sm font-medium">{design.name}</p>
                                                    </div>
                                                    <Button type="button" variant="outline" size="sm" onClick={() => handleUseUploadedDesign(design)}>
                                                        Use
                                                    </Button>
                                                    <Button type="button" variant="ghost" size="icon-sm" onClick={() => handleRemoveUploadedDesign(design.id)}>
                                                        <Trash2 className="size-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className={cn('space-y-3 rounded-3xl border p-4', activeTool === 'text' && 'border-zinc-950 bg-zinc-50')}>
                                <div>
                                    <Label className="text-sm font-semibold text-zinc-800">Add text</Label>
                                </div>

                                <div className="space-y-3 rounded-2xl bg-zinc-50 p-3">
                                    <Input
                                        value={draftText}
                                        onChange={(event) => setDraftText(event.target.value)}
                                        placeholder="Write something bold"
                                        className="h-11 rounded-xl bg-white"
                                    />
                                    <div className="grid grid-cols-[minmax(0,1fr)_90px_52px] gap-2">
                                        <Select value={draftFontFamily} onValueChange={setDraftFontFamily}>
                                            <SelectTrigger className="h-11 w-full rounded-xl bg-white">
                                                <SelectValue placeholder="Font" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {FONT_OPTIONS.map((font) => (
                                                    <SelectItem key={font} value={font}>{font}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <Input
                                            type="number"
                                            min={10}
                                            max={120}
                                            value={draftFontSize}
                                            onChange={(event) => setDraftFontSize(Number(event.target.value || 24))}
                                            className="h-11 rounded-xl bg-white text-center"
                                        />
                                        <Input
                                            type="color"
                                            value={draftTextColor}
                                            onChange={(event) => setDraftTextColor(event.target.value)}
                                            className="h-11 rounded-xl bg-white p-1"
                                        />
                                    </div>
                                    <Button type="button" className="w-full rounded-xl" onClick={handleAddText} disabled={!draftText.trim()}>
                                        <Type className="size-4" />
                                        Add text layer
                                    </Button>
                                </div>

                                {activeTextLayers.length > 0 && (
                                    <div className="space-y-3">
                                        {activeTextLayers.map((layer) => (
                                            <div
                                                key={layer.id}
                                                className={cn(
                                                    'space-y-3 rounded-2xl border bg-white p-3 transition-colors',
                                                    selectedObjectId === layer.id && 'border-zinc-950 shadow-sm'
                                                )}
                                                onClick={() => selectObject(layer.id)}
                                            >
                                                <Input
                                                    value={layer.text}
                                                    onFocus={() => selectObject(layer.id)}
                                                    onChange={(event) => updateTextLayer(layer.id, { text: event.target.value }, false)}
                                                    onBlur={(event) => updateTextLayer(layer.id, { text: event.target.value })}
                                                    className="h-10 rounded-xl"
                                                />
                                                <div className="grid grid-cols-[minmax(0,1fr)_80px_52px] gap-2">
                                                    <Select value={layer.fontFamily} onValueChange={(value) => updateTextLayer(layer.id, { fontFamily: value })}>
                                                        <SelectTrigger className="h-10 w-full rounded-xl">
                                                            <SelectValue placeholder="Font" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {FONT_OPTIONS.map((font) => (
                                                                <SelectItem key={font} value={font}>{font}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <Input
                                                        type="number"
                                                        min={10}
                                                        max={120}
                                                        value={layer.fontSize}
                                                        onFocus={() => selectObject(layer.id)}
                                                        onChange={(event) => updateTextLayer(layer.id, { fontSize: Number(event.target.value || 24) })}
                                                        className="h-10 rounded-xl text-center"
                                                    />
                                                    <Input
                                                        type="color"
                                                        value={layer.fill}
                                                        onFocus={() => selectObject(layer.id)}
                                                        onChange={(event) => updateTextLayer(layer.id, { fill: event.target.value })}
                                                        className="h-10 rounded-xl p-1"
                                                    />
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    <Button
                                                        type="button"
                                                        variant={layer.fontWeight === '700' ? 'default' : 'outline'}
                                                        size="icon-sm"
                                                        onClick={() => updateTextLayer(layer.id, { fontWeight: layer.fontWeight === '700' ? '400' : '700' })}
                                                    >
                                                        <Bold className="size-4" />
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant={layer.fontStyle === 'italic' ? 'default' : 'outline'}
                                                        size="icon-sm"
                                                        onClick={() => updateTextLayer(layer.id, { fontStyle: layer.fontStyle === 'italic' ? 'normal' : 'italic' })}
                                                    >
                                                        <Italic className="size-4" />
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant={layer.underline ? 'default' : 'outline'}
                                                        size="icon-sm"
                                                        onClick={() => updateTextLayer(layer.id, { underline: !layer.underline })}
                                                    >
                                                        <Underline className="size-4" />
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant={layer.textAlign === 'left' ? 'default' : 'outline'}
                                                        size="icon-sm"
                                                        onClick={() => updateTextLayer(layer.id, { textAlign: 'left' })}
                                                    >
                                                        <AlignLeft className="size-4" />
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant={layer.textAlign === 'center' ? 'default' : 'outline'}
                                                        size="icon-sm"
                                                        onClick={() => updateTextLayer(layer.id, { textAlign: 'center' })}
                                                    >
                                                        <AlignCenter className="size-4" />
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant={layer.textAlign === 'right' ? 'default' : 'outline'}
                                                        size="icon-sm"
                                                        onClick={() => updateTextLayer(layer.id, { textAlign: 'right' })}
                                                    >
                                                        <AlignRight className="size-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className={cn('space-y-3 rounded-3xl border p-4', activeTool === 'shapes' && 'border-zinc-950 bg-zinc-50')}>
                                <div>
                                    <Label className="text-sm font-semibold text-zinc-800">Shapes</Label>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <Button type="button" variant="outline" className="rounded-2xl" onClick={() => addShape('rect')}>
                                        <Square className="size-4" />
                                        Rectangle
                                    </Button>
                                    <Button type="button" variant="outline" className="rounded-2xl" onClick={() => addShape('circle')}>
                                        <CircleIcon className="size-4" />
                                        Circle
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-3 rounded-3xl border p-4">
                                <div>
                                    <Label className="text-sm font-semibold text-zinc-800">Arrange</Label>
                                    <p className="mt-1 text-xs text-zinc-500">Drag and drop on the canvas, then refine the stack here.</p>
                                </div>
                                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                    <Button type="button" variant="outline" className="h-auto whitespace-normal rounded-2xl justify-start py-2 text-left leading-tight" onClick={handleBringForward}>
                                        <BringToFront className="size-4" />
                                        Bring forward
                                    </Button>
                                    <Button type="button" variant="outline" className="h-auto whitespace-normal rounded-2xl justify-start py-2 text-left leading-tight" onClick={handleSendBackward}>
                                        <SendToBack className="size-4" />
                                        Send backward
                                    </Button>
                                    <Button type="button" variant="outline" className="h-auto whitespace-normal rounded-2xl justify-start py-2 text-left leading-tight" onClick={handleDeleteSelected}>
                                        <Trash2 className="size-4" />
                                        Delete
                                    </Button>
                                </div>
                            </div>

                            <div className="mt-auto space-y-3 rounded-3xl border border-zinc-200 bg-zinc-50 p-4">
                                <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
                                    <Button type="button" variant="outline" className="h-12 rounded-2xl" onClick={handleDownloadBoth}>
                                        <Download className="size-4" />
                                        Download design
                                    </Button>
                                    <Button type="button" className="h-12 rounded-2xl bg-zinc-950 text-white hover:bg-zinc-800" onClick={handleSaveOrderDesign} disabled={isSaving}>
                                        <ShoppingCart className="size-4" />
                                        <span className="truncate">Add to cart</span>
                                        <span>{PRODUCT_PRICE}</span>
                                    </Button>
                                </div>
                                <p className="text-center text-xs text-zinc-500">Secure checkout. Free returns.</p>
                                {savedUrl && (
                                    <a href={savedUrl} target="_blank" rel="noreferrer" className="block text-center text-sm font-medium text-zinc-700 underline-offset-4 hover:underline">
                                        View last saved design image
                                    </a>
                                )}
                            </div>
                        </div>
                    </section>

                    <aside className={cn('rounded-[32px] border border-zinc-200 bg-white p-4 shadow-sm', activeTool === 'layers' && 'border-zinc-950')}>
                        <div className="flex h-full flex-col">
                            <div className="mb-4 flex items-center justify-between gap-3">
                                <div>
                                    <h2 className="text-base font-semibold">Layers</h2>
                                    <p className="text-xs text-zinc-500">{activeView === 'front' ? 'Front view' : 'Back view'} stack</p>
                                </div>
                                <Layers3 className="size-4 text-zinc-400" />
                            </div>

                            <div className="space-y-2">
                                {layers.length === 0 ? (
                                    <div className="rounded-2xl border border-dashed border-zinc-300 px-4 py-6 text-center text-sm text-zinc-500">
                                        Add text, images, or shapes to build your design.
                                    </div>
                                ) : (
                                    layers.map((layer) => (
                                        <button
                                            key={layer.id}
                                            type="button"
                                            onClick={() => selectObject(layer.id)}
                                            className={cn(
                                                'flex w-full items-center gap-3 rounded-2xl border px-3 py-3 text-left transition-colors',
                                                layer.selected ? 'border-zinc-950 bg-zinc-50' : 'border-zinc-200 hover:border-zinc-400'
                                            )}
                                        >
                                            <div className="flex size-9 items-center justify-center rounded-xl bg-zinc-100 text-zinc-700">
                                                {layer.type === 'text' ? <Type className="size-4" /> : layer.type === 'image' ? <ImagePlus className="size-4" /> : <Shapes className="size-4" />}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium">{layer.label}</p>
                                            </div>
                                            <button
                                                type="button"
                                                className="text-zinc-500 transition-colors hover:text-zinc-950"
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    toggleLayerVisibility(layer.id);
                                                }}
                                                aria-label={layer.visible ? 'Hide layer' : 'Show layer'}
                                            >
                                                {layer.visible ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                                            </button>
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}
