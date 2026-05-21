export const CANVAS_WIDTH = 555;
export const CANVAS_HEIGHT = 760;
export const PRODUCT_PRICE = '$49.99';
export const HISTORY_LIMIT = 40;
export const SERIALIZED_PROPS = ['objectId', 'viewId', 'layerType', 'layerName', 'designId', 'sourceName', 'shapeKind', 'isBaseImage', 'hiddenByUser'];

export const FONT_OPTIONS = ['Bebas Neue', 'Montserrat', 'Oswald', 'Poppins', 'Georgia', 'Arial'];

export const PRODUCT_COLORS = [
    { id: 'black', label: 'Black', value: '#111111' },
    { id: 'navy', label: 'Navy', value: '#17336f' },
    { id: 'red', label: 'Red', value: '#c91d3b' },
    { id: 'gray', label: 'Gray', value: '#c7c7cc' },
    { id: 'white', label: 'White', value: '#ffffff' },
];

export const PRODUCT_VIEWS = [
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

export const DESIGN_AREAS = {
    front: {
        left: 0.33,
        top: 0.341,
        width: 0.35,
        height: 0.438,
    },
    back: {
         left: 0.32,
        top: 0.341,
        width: 0.375,
        height: 0.438,
    },
};

const DESIGN_GUIDE_AREAS = {
    front: {
        left: 0.22,
        top: 0.22,
        width: 0.22,
        height: 0.29,
    },
    back: {
        left: 0.22,
        top: 0.22,
        width: 0.22,
        height: 0.29,
    },
};

export function getDesignGuideArea(viewId) {
    return DESIGN_GUIDE_AREAS[viewId] || DESIGN_GUIDE_AREAS.front;
}

