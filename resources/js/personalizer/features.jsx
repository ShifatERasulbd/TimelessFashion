import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Canvas, Circle, FabricImage, IText, Rect } from 'fabric';
import { toast } from 'sonner';

import CanvasStage from './components/CanvasStage';
import CustomizePanel from './components/CustomizePanel';
import LeftToolbar from './components/LeftToolbar';
import PageHeader from './components/PageHeader';
import {
    CANVAS_HEIGHT,
    CANVAS_WIDTH,
    DESIGN_AREAS,
    FONT_OPTIONS,
    HISTORY_LIMIT,
    PRODUCT_COLORS,
    PRODUCT_PRICE,
    PRODUCT_VIEWS,
    SERIALIZED_PROPS,
} from './config';

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

export default function Features() {
    const navigate = useNavigate();
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
    const [usedDesignIds, setUsedDesignIds] = useState(new Set());
    const [selectedObjectId, setSelectedObjectId] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [savedUrl, setSavedUrl] = useState('');
    const [orderQuantity, setOrderQuantity] = useState(1);
    const [canUndo, setCanUndo] = useState(false);
    const [canRedo, setCanRedo] = useState(false);

    const activeTextLayers = useMemo(
        () => layers.filter((layer) => layer.type === 'text'),
        [layers]
    );

    const activeImageLayers = useMemo(
        () => layers.filter((layer) => layer.type === 'image'),
        [layers]
    );

    const selectedTextLayer = useMemo(
        () => activeTextLayers.find((layer) => layer.id === selectedObjectId) || null,
        [activeTextLayers, selectedObjectId]
    );

    useEffect(() => {
        if (!selectedTextLayer) return;

        setDraftText(selectedTextLayer.text || '');
        setDraftFontFamily(selectedTextLayer.fontFamily || 'Montserrat');
        setDraftFontSize(Number(selectedTextLayer.fontSize || 24));
        setDraftTextColor(selectedTextLayer.fill || '#111111');
    }, [selectedTextLayer]);

    const updateHistoryFlags = () => {
        setCanUndo(historyRef.current.length > 1);
        setCanRedo(redoRef.current.length > 0);
    };

    const getCanvas = () => fabricRef.current;

    const getDesignArea = (viewId = activeViewRef.current) => {
        const area = DESIGN_AREAS[viewId];
        if (!area) {
            return {
                left: 0,
                top: 0,
                width: CANVAS_WIDTH,
                height: CANVAS_HEIGHT,
            };
        }

        return {
            left: area.left * CANVAS_WIDTH,
            top: area.top * CANVAS_HEIGHT,
            width: area.width * CANVAS_WIDTH,
            height: area.height * CANVAS_HEIGHT,
        };
    };

    const getDesignAreaCenter = (viewId = activeViewRef.current) => {
        const area = getDesignArea(viewId);
        if (!area) {
            return { left: CANVAS_WIDTH / 2, top: CANVAS_HEIGHT / 2 };
        }

        return {
            left: area.left + area.width / 2,
            top: area.top + area.height / 2,
        };
    };

    const fitObjectToArea = (object, viewId = activeViewRef.current) => {
        if (!object || object.get?.('isBaseImage')) return;

        const area = getDesignArea(viewId);
        if (!area) return;

        const padding = 0;
        const maxWidth = Math.max(24, area.width - padding * 2);
        const maxHeight = Math.max(24, area.height - padding * 2);
        const scaledWidth = object.getScaledWidth?.() || object.getBoundingRect().width;
        const scaledHeight = object.getScaledHeight?.() || object.getBoundingRect().height;

        if (!scaledWidth || !scaledHeight) return;

        const ratio = Math.min(maxWidth / scaledWidth, maxHeight / scaledHeight, 1);
        if (ratio < 0.9999) {
            object.scaleX = (object.scaleX || 1) * ratio;
            object.scaleY = (object.scaleY || 1) * ratio;
            object.setCoords();
        }
    };
    const clampObjectToArea = (object, options = {}) => {
        const { shouldFit = false } = options;
        if (!object || object.get?.('isBaseImage')) return;

        const viewId = object.get?.('viewId') || activeViewRef.current;

        if (shouldFit) {
            fitObjectToArea(object, viewId);
        }

        const area = getDesignArea(viewId);
        if (!area) return;

        object.setCoords();
        const coords = object.getCoords?.();
        if (!coords || coords.length === 0) return;

        const xs = coords.map((point) => point.x);
        const ys = coords.map((point) => point.y);
        const left = Math.min(...xs);
        const right = Math.max(...xs);
        const top = Math.min(...ys);
        const bottom = Math.max(...ys);

        let deltaX = 0;
        let deltaY = 0;

        if (left < area.left) {
            deltaX = area.left - left;
        } else if (right > area.left + area.width) {
            deltaX = area.left + area.width - right;
        }

        if (top < area.top) {
            deltaY = area.top - top;
        } else if (bottom > area.top + area.height) {
            deltaY = area.top + area.height - bottom;
        }

        if (deltaX || deltaY) {
            object.left += deltaX;
            object.top += deltaY;
            object.setCoords();
        }
    };

    const isObjectInsideArea = (object, viewId = activeViewRef.current) => {
        const area = getDesignArea(viewId);
        if (!object || !area) return true;

        object.setCoords();
        const coords = object.getCoords?.();
        if (!coords || coords.length === 0) return true;

        const xs = coords.map((point) => point.x);
        const ys = coords.map((point) => point.y);
        const left = Math.min(...xs);
        const right = Math.max(...xs);
        const top = Math.min(...ys);
        const bottom = Math.max(...ys);

        return left >= area.left
            && right <= area.left + area.width
            && top >= area.top
            && bottom <= area.top + area.height;
    };

    const updateImageVisibilityByArea = (object, viewId = activeViewRef.current) => {
        if (!object || object.get?.('layerType') !== 'image') return;

        const inArea = isObjectInsideArea(object, viewId);
        const manuallyHidden = object.get?.('hiddenByUser') === true;

        object.set('outOfBounds', !inArea);
        object.set('visible', !manuallyHidden);
        object.set('opacity', inArea ? 1 : 0);
    };

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
        const designArea = getDesignArea(viewId);

        const nextLayers = getViewObjects(viewId)
            .slice()
            .reverse()
            .map((object) => {
                const currentLeft = Number(object.left || 0);
                const currentTop = Number(object.top || 0);
                const scaleX = Number(object.scaleX || 1);
                const scaleY = Number(object.scaleY || 1);
                const baseWidth = Number(object.width || 0);
                const baseHeight = Number(object.height || 0);

                return {
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
                    left: Number(currentLeft.toFixed(2)),
                    top: Number(currentTop.toFixed(2)),
                    leftPercent: designArea?.width
                        ? Number((((currentLeft - designArea.left) / designArea.width) * 100).toFixed(2))
                        : 0,
                    topPercent: designArea?.height
                        ? Number((((currentTop - designArea.top) / designArea.height) * 100).toFixed(2))
                        : 0,
                    angle: Number(Number(object.angle || 0).toFixed(2)),
                    scalePercent: Number((((scaleX + scaleY) / 2) * 100).toFixed(2)),
                    width: Number((baseWidth * scaleX).toFixed(2)),
                    height: Number((baseHeight * scaleY).toFixed(2)),
                };
            });

        setLayers(nextLayers);
        setSelectedObjectId(activeObjectId);

        const presentDesignIds = new Set(
            getAllDesignObjects()
                .map((object) => object.get?.('designId'))
                .filter(Boolean)
        );
        setUsedDesignIds(presentDesignIds);
    };

    const applyViewVisibility = (viewId) => {
        const canvas = getCanvas();
        if (!canvas) return;

        const activeObject = canvas.getActiveObject();
        if (activeObject && activeObject.get?.('viewId') !== viewId) {
            canvas.discardActiveObject();
        }

        getAllDesignObjects().forEach((object) => {
            const isActiveView = object.get?.('viewId') === viewId;
            const manuallyHidden = object.get('hiddenByUser') === true;

            if (!isActiveView || manuallyHidden) {
                object.set('visible', false);
                return;
            }

            object.set('visible', true);

            if (object.get?.('layerType') === 'image') {
                updateImageVisibilityByArea(object, viewId);
            } else {
                object.set('opacity', 1);
            }
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
        getAllDesignObjects().forEach((object) => {
            if (object.get?.('layerType') === 'image') {
                updateImageVisibilityByArea(object, view.id);
            } else {
                clampObjectToArea(object, { shouldFit: true });
            }
        });
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

        const handleObjectTransforming = (event) => {
            const target = event?.target;
            if (!target || target.get?.('isBaseImage')) return;

            if (target.get?.('layerType') === 'image') {
                updateImageVisibilityByArea(target);
            } else {
                const action = event?.transform?.action;
                const shouldFit = action === 'scale' || action === 'scaleX' || action === 'scaleY';
                clampObjectToArea(target, { shouldFit });
            }
            canvas.renderAll();
        };

        const handleObjectModified = (event) => {
            const activeObject = event?.target || canvas.getActiveObject();
            if (activeObject) {
                if (activeObject.get?.('layerType') === 'image') {
                    updateImageVisibilityByArea(activeObject);
                } else {
                    const action = event?.transform?.action;
                    const shouldFit = action === 'scale' || action === 'scaleX' || action === 'scaleY';
                    clampObjectToArea(activeObject, { shouldFit });
                }
            }

            refreshLayers();
            syncSelectionState();
            recordHistory();
        };

        canvas.on('selection:created', handleSelectionChange);
        canvas.on('selection:updated', handleSelectionChange);
        canvas.on('selection:cleared', handleSelectionChange);
        canvas.on('object:moving', handleObjectTransforming);
        canvas.on('object:scaling', handleObjectTransforming);
        canvas.on('object:rotating', handleObjectTransforming);
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
        getAllDesignObjects().forEach((object) => {
            if (object.get?.('layerType') === 'image') {
                updateImageVisibilityByArea(object, view.id);
            } else {
                clampObjectToArea(object, { shouldFit: true });
            }
        });
    };

   const addImageToCanvas = async (
    imageUrl,
    designId = null,
    sourceName = 'Uploaded image'
) => {
    const canvas = getCanvas();

    if (!canvas) return;

    const image = await FabricImage.fromURL(imageUrl);

    const objectId = crypto.randomUUID();

    const area = getDesignArea(activeViewRef.current);

    const center = getDesignAreaCenter();

    /**
     * DESIGN AREA SIZE
     */
    const maxWidth = Math.max(60, (area?.width || CANVAS_WIDTH * 0.45) - 10);

    const maxHeight = Math.max(60, (area?.height || CANVAS_HEIGHT * 0.45) - 10);

    /**
     * ORIGINAL IMAGE SIZE
     */
    const imageWidth = image.width || 1;
    const imageHeight = image.height || 1;

    /**
     * PERFECT CONTAIN SCALE
     *
     * Keeps entire image inside box.
     * No overflow.
     * No cropping.
     */
    const scale = Math.min(
        maxWidth / imageWidth,
        maxHeight / imageHeight
    );

    /**
     * FINAL RENDER SIZE
     */
    const finalWidth = imageWidth * scale;
    const finalHeight = imageHeight * scale;

    /**
     * CENTER INSIDE DESIGN AREA
     */
    const left = area
        ? area.left + area.width / 2
        : center.left;

    const top = area
        ? area.top + area.height / 2
        : center.top;

    image.set({
        originX: 'center',
        originY: 'center',

        left,
        top,

        scaleX: scale,
        scaleY: scale,

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

        // Lock flip for better UX
        lockScalingFlip: true,
    });

    /**
     * IMPORTANT
     * Prevent oversized images after scaling
     */
    image.setControlsVisibility({
        mtr: true,
    });

    image.setCoords();

    /**
     * FINAL SAFETY CLAMP
     */
    clampObjectToArea(image, {
        shouldFit: true,
    });
    updateImageVisibilityByArea(image);

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
        const center = getDesignAreaCenter();

        const textObject = new IText(draftText.trim(), {
            originX: 'center',
            originY: 'center',
            left: center.left,
            top: center.top,
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

        clampObjectToArea(textObject, { shouldFit: true });

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
        const center = getDesignAreaCenter();

        const commonProps = {
            originX: 'center',
            originY: 'center',
            left: center.left,
            top: center.top,
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

        clampObjectToArea(shape, { shouldFit: true });

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

        clampObjectToArea(object, { shouldFit: true });

        canvas.renderAll();
        refreshLayers();

        if (shouldRecord) {
            recordHistory();
        }
    };

    const updateImageLayer = (layerId, updates, shouldRecord = true) => {
        const canvas = getCanvas();
        const object = getObjectById(layerId);
        if (!canvas || !object || object.get?.('layerType') !== 'image') return;

        const baseWidth = Number(object.width || 1);
        const baseHeight = Number(object.height || 1);
        const viewId = object.get?.('viewId') || activeViewRef.current;
        const designArea = getDesignArea(viewId);

        if (typeof updates.left === 'number' && Number.isFinite(updates.left)) {
            object.set('left', updates.left);
        }

        if (typeof updates.top === 'number' && Number.isFinite(updates.top)) {
            object.set('top', updates.top);
        }

        if (typeof updates.leftPercent === 'number' && Number.isFinite(updates.leftPercent) && designArea?.width) {
            object.set('left', designArea.left + (updates.leftPercent / 100) * designArea.width);
        }

        if (typeof updates.topPercent === 'number' && Number.isFinite(updates.topPercent) && designArea?.height) {
            object.set('top', designArea.top + (updates.topPercent / 100) * designArea.height);
        }

        if (typeof updates.width === 'number' && Number.isFinite(updates.width) && updates.width > 0) {
            object.set('scaleX', Math.max(0.05, updates.width / baseWidth));
        }

        if (typeof updates.height === 'number' && Number.isFinite(updates.height) && updates.height > 0) {
            object.set('scaleY', Math.max(0.05, updates.height / baseHeight));
        }

        if (typeof updates.scalePercent === 'number' && Number.isFinite(updates.scalePercent)) {
            const uniformScale = Math.max(0.05, updates.scalePercent / 100);
            object.set({ scaleX: uniformScale, scaleY: uniformScale });
        }

        if (typeof updates.angle === 'number' && Number.isFinite(updates.angle)) {
            object.set('angle', updates.angle);
        }

        clampObjectToArea(object, { shouldFit: true });
        updateImageVisibilityByArea(object, viewId);

        canvas.renderAll();
        refreshLayers();

        if (shouldRecord) {
            recordHistory();
        }
    };

    const handleDraftFontFamilyChange = (fontFamily) => {
        setDraftFontFamily(fontFamily);

        if (selectedTextLayer) {
            updateTextLayer(selectedTextLayer.id, { fontFamily });
        }
    };

    const handleDraftFontSizeChange = (fontSize) => {
        setDraftFontSize(fontSize);

        if (selectedTextLayer) {
            updateTextLayer(selectedTextLayer.id, { fontSize });
        }
    };

    const handleDraftTextColorChange = (fill) => {
        setDraftTextColor(fill);

        if (selectedTextLayer) {
            updateTextLayer(selectedTextLayer.id, { fill });
        }
    };

    const toggleLayerVisibility = (layerId) => {
        const canvas = getCanvas();
        const object = getObjectById(layerId);
        if (!canvas || !object) return;

        const nextVisible = object.visible === false;
        object.set('hiddenByUser', !nextVisible);

        if (object.get?.('layerType') === 'image') {
            if (nextVisible) {
                updateImageVisibilityByArea(object);
            } else {
                object.set('visible', false);
            }
        } else {
            object.set('visible', nextVisible);
        }

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
            .filter((object) => !object.get?.('isBaseImage')
                && object.get?.('viewId') === view.id
                && object.get?.('hiddenByUser') !== true
                && (object.get?.('layerType') !== 'image' || object.get?.('outOfBounds') !== true));

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
        if (!canvas) return null;

        setIsSaving(true);
        try {
            await ensureCsrfCookie();

            const [frontImageData, backImageData] = await Promise.all([
                renderViewDataUrl(PRODUCT_VIEWS[0]),
                renderViewDataUrl(PRODUCT_VIEWS[1]),
            ]);

            const imageData = frontImageData || backImageData || canvas.toDataURL({
                format: 'png',
                multiplier: 2,
            });

            const unitPriceNumber = Number((PRODUCT_PRICE || '').replace(/[^0-9.]/g, '')) || 0;
            const totalPrice = unitPriceNumber * orderQuantity;

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
                    front_image: frontImageData,
                    back_image: backImageData,
                    title: 'Customized Product Design',
                    quantity: orderQuantity,
                    unit_price: unitPriceNumber,
                    total_price: totalPrice,
                    order_status: 'pending',
                }),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data?.message || 'Failed to save design.');
            }

            const imageUrl = data?.data?.image_url || '';
            setSavedUrl(imageUrl);

            const orderDetails = {
                imageUrl,
                frontImageUrl: data?.data?.front_image_url || imageUrl,
                backImageUrl: data?.data?.back_image_url || '',
                quantity: orderQuantity,
                unitPrice: PRODUCT_PRICE,
                totalPrice: `$${totalPrice.toFixed(2)}`,
                orderStatus: data?.data?.order_status || 'pending',
                productColor,
                view: activeViewRef.current,
                createdAt: new Date().toISOString(),
            };

            sessionStorage.setItem('personalizer:pendingOrder', JSON.stringify(orderDetails));
            toast.success('Design saved successfully.');
            return orderDetails;
        } catch (error) {
            toast.error(error.message || 'Unable to save design.');
            return null;
        } finally {
            setIsSaving(false);
        }
    };

    const handleOrderNow = async () => {
        const orderDetails = await handleSaveOrderDesign();
        if (!orderDetails) return;

        navigate('/personalizer/confirm-order', {
            state: {
                orderDetails,
            },
        });
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
                <PageHeader
                    isSaving={isSaving}
                    onSaveDesign={handleSaveOrderDesign}
                    onShare={handleShare}
                />

                <div className="grid flex-1 gap-4 xl:grid-cols-[88px_minmax(0,1.45fr)_380px]">
                    <LeftToolbar
                        activeTool={activeTool}
                        canUndo={canUndo}
                        canRedo={canRedo}
                        onSelectTool={handleToolbarSelect}
                    />

                    <CanvasStage
                        canvasRef={canvasRef}
                        productViews={PRODUCT_VIEWS}
                        activeView={activeView}
                        onSwitchView={handleSwitchView}
                    />

                    <CustomizePanel
                        activeTool={activeTool}
                        selectedColor={selectedColor}
                        productColors={PRODUCT_COLORS}
                        productColor={productColor}
                        onSelectProductColor={setProductColor}
                        onOpenUpload={() => fileInputRef.current?.click()}
                        uploadedDesigns={uploadedDesigns}
                        selectedDesignId={selectedDesignId}
                        onClearUploadedDesigns={handleClearUploadedDesigns}
                        usedDesignIds={usedDesignIds}
                        onUseUploadedDesign={handleUseUploadedDesign}
                        onRemoveUploadedDesign={handleRemoveUploadedDesign}
                        draftText={draftText}
                        onDraftTextChange={setDraftText}
                        draftFontFamily={draftFontFamily}
                        onDraftFontFamilyChange={handleDraftFontFamilyChange}
                        draftFontSize={draftFontSize}
                        onDraftFontSizeChange={handleDraftFontSizeChange}
                        draftTextColor={draftTextColor}
                        onDraftTextColorChange={handleDraftTextColorChange}
                        onAddText={handleAddText}
                        fontOptions={FONT_OPTIONS}
                        activeImageLayers={activeImageLayers}
                        activeTextLayers={activeTextLayers}
                        selectedObjectId={selectedObjectId}
                        onSelectObject={selectObject}
                        onUpdateImageLayer={updateImageLayer}
                        onUpdateTextLayer={updateTextLayer}
                        onAddShape={addShape}
                        onBringForward={handleBringForward}
                        onSendBackward={handleSendBackward}
                        onDeleteSelected={handleDeleteSelected}
                        orderQuantity={orderQuantity}
                        onDecreaseQuantity={() => setOrderQuantity((prev) => Math.max(1, prev - 1))}
                        onIncreaseQuantity={() => setOrderQuantity((prev) => Math.min(99, prev + 1))}
                        onDownload={handleDownloadBoth}
                        onOrderNow={handleOrderNow}
                        isSaving={isSaving}
                        savedUrl={savedUrl}
                    />
                </div>
            </div>
        </div>
    );
}
