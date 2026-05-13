import {
    AlignCenter,
    AlignLeft,
    AlignRight,
    Bold,
    BringToFront,
    Check,
    Circle as CircleIcon,
    Download,
    Italic,
    SendToBack,
    ShoppingCart,
    Square,
    Trash2,
    Type,
    Underline,
    Upload,
} from 'lucide-react';

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

export default function CustomizePanel({
    activeTool,
    selectedColor,
    productColors,
    productColor,
    onSelectProductColor,
    onOpenUpload,
    uploadedDesigns,
    selectedDesignId,
    usedDesignIds = new Set(),
    onClearUploadedDesigns,
    onUseUploadedDesign,
    onRemoveUploadedDesign,
    draftText,
    onDraftTextChange,
    draftFontFamily,
    onDraftFontFamilyChange,
    draftFontSize,
    onDraftFontSizeChange,
    draftTextColor,
    onDraftTextColorChange,
    onAddText,
    fontOptions,
    activeTextLayers,
    selectedObjectId,
    onSelectObject,
    onUpdateTextLayer,
    onAddShape,
    onBringForward,
    onSendBackward,
    onDeleteSelected,
    orderQuantity,
    onDecreaseQuantity,
    onIncreaseQuantity,
    onDownload,
    onOrderNow,
    isSaving,
    savedUrl,
}) {
    return (
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
                        {productColors.map((color) => (
                            <button
                                key={color.id}
                                type="button"
                                onClick={() => onSelectProductColor(color.id)}
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
                    <Button type="button" className="w-full rounded-2xl bg-zinc-950 text-white hover:bg-zinc-800" onClick={onOpenUpload}>
                        <Upload className="size-4" />
                        Upload image or logo
                    </Button>
                    <p className="text-xs text-zinc-500">JPG, PNG, SVG up to 10MB</p>

                    {uploadedDesigns.length > 0 && (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Label className="text-xs uppercase tracking-[0.2em] text-zinc-500">Images</Label>
                                <Button type="button" variant="ghost" size="sm" onClick={onClearUploadedDesigns}>
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
                                        {usedDesignIds.has(design.id) ? (
                                            <Button type="button" variant="outline" size="sm" disabled className="cursor-not-allowed opacity-60">
                                                Used
                                            </Button>
                                        ) : (
                                            <Button type="button" variant="outline" size="sm" onClick={() => onUseUploadedDesign(design)}>
                                                Use
                                            </Button>
                                        )}
                                        <Button type="button" variant="ghost" size="icon-sm" onClick={() => onRemoveUploadedDesign(design.id)}>
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
                            onChange={(event) => onDraftTextChange(event.target.value)}
                            placeholder="Write something bold"
                            className="h-11 rounded-xl bg-white"
                        />
                        <div className="grid grid-cols-[minmax(0,1fr)_90px_52px] gap-2">
                            <Select value={draftFontFamily} onValueChange={onDraftFontFamilyChange}>
                                <SelectTrigger className="h-11 w-full rounded-xl bg-white">
                                    <SelectValue placeholder="Font" />
                                </SelectTrigger>
                                <SelectContent>
                                    {fontOptions.map((font) => (
                                        <SelectItem key={font} value={font}>{font}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Input
                                type="number"
                                min={10}
                                max={120}
                                value={draftFontSize}
                                onChange={(event) => onDraftFontSizeChange(Number(event.target.value || 24))}
                                className="h-11 rounded-xl bg-white text-center"
                            />
                            <Input
                                type="color"
                                value={draftTextColor}
                                onChange={(event) => onDraftTextColorChange(event.target.value)}
                                className="h-11 rounded-xl bg-white p-1"
                            />
                        </div>
                        <Button type="button" className="w-full rounded-xl" onClick={onAddText} disabled={!draftText.trim()}>
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
                                    onClick={() => onSelectObject(layer.id)}
                                >
                                    <Input
                                        value={layer.text}
                                        onFocus={() => onSelectObject(layer.id)}
                                        onChange={(event) => onUpdateTextLayer(layer.id, { text: event.target.value }, false)}
                                        onBlur={(event) => onUpdateTextLayer(layer.id, { text: event.target.value })}
                                        className="h-10 rounded-xl"
                                    />
                                    <div className="grid grid-cols-[minmax(0,1fr)_80px_52px] gap-2">
                                        <Select value={layer.fontFamily} onValueChange={(value) => onUpdateTextLayer(layer.id, { fontFamily: value })}>
                                            <SelectTrigger className="h-10 w-full rounded-xl">
                                                <SelectValue placeholder="Font" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {fontOptions.map((font) => (
                                                    <SelectItem key={font} value={font}>{font}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <Input
                                            type="number"
                                            min={10}
                                            max={120}
                                            value={layer.fontSize}
                                            onFocus={() => onSelectObject(layer.id)}
                                            onChange={(event) => onUpdateTextLayer(layer.id, { fontSize: Number(event.target.value || 24) })}
                                            className="h-10 rounded-xl text-center"
                                        />
                                        <Input
                                            type="color"
                                            value={layer.fill}
                                            onFocus={() => onSelectObject(layer.id)}
                                            onChange={(event) => onUpdateTextLayer(layer.id, { fill: event.target.value })}
                                            className="h-10 rounded-xl p-1"
                                        />
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <Button
                                            type="button"
                                            variant={layer.fontWeight === '700' ? 'default' : 'outline'}
                                            size="icon-sm"
                                            onClick={() => onUpdateTextLayer(layer.id, { fontWeight: layer.fontWeight === '700' ? '400' : '700' })}
                                        >
                                            <Bold className="size-4" />
                                        </Button>
                                        <Button
                                            type="button"
                                            variant={layer.fontStyle === 'italic' ? 'default' : 'outline'}
                                            size="icon-sm"
                                            onClick={() => onUpdateTextLayer(layer.id, { fontStyle: layer.fontStyle === 'italic' ? 'normal' : 'italic' })}
                                        >
                                            <Italic className="size-4" />
                                        </Button>
                                        <Button
                                            type="button"
                                            variant={layer.underline ? 'default' : 'outline'}
                                            size="icon-sm"
                                            onClick={() => onUpdateTextLayer(layer.id, { underline: !layer.underline })}
                                        >
                                            <Underline className="size-4" />
                                        </Button>
                                        <Button
                                            type="button"
                                            variant={layer.textAlign === 'left' ? 'default' : 'outline'}
                                            size="icon-sm"
                                            onClick={() => onUpdateTextLayer(layer.id, { textAlign: 'left' })}
                                        >
                                            <AlignLeft className="size-4" />
                                        </Button>
                                        <Button
                                            type="button"
                                            variant={layer.textAlign === 'center' ? 'default' : 'outline'}
                                            size="icon-sm"
                                            onClick={() => onUpdateTextLayer(layer.id, { textAlign: 'center' })}
                                        >
                                            <AlignCenter className="size-4" />
                                        </Button>
                                        <Button
                                            type="button"
                                            variant={layer.textAlign === 'right' ? 'default' : 'outline'}
                                            size="icon-sm"
                                            onClick={() => onUpdateTextLayer(layer.id, { textAlign: 'right' })}
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
                        <Button type="button" variant="outline" className="rounded-2xl" onClick={() => onAddShape('rect')}>
                            <Square className="size-4" />
                            Rectangle
                        </Button>
                        <Button type="button" variant="outline" className="rounded-2xl" onClick={() => onAddShape('circle')}>
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
                        <Button type="button" variant="outline" className="h-auto whitespace-normal rounded-2xl justify-start py-2 text-left leading-tight" onClick={onBringForward}>
                            <BringToFront className="size-4" />
                            Bring forward
                        </Button>
                        <Button type="button" variant="outline" className="h-auto whitespace-normal rounded-2xl justify-start py-2 text-left leading-tight" onClick={onSendBackward}>
                            <SendToBack className="size-4" />
                            Send backward
                        </Button>
                        <Button type="button" variant="outline" className="h-auto whitespace-normal rounded-2xl justify-start py-2 text-left leading-tight" onClick={onDeleteSelected}>
                            <Trash2 className="size-4" />
                            Delete
                        </Button>
                    </div>
                </div>

                <div className="mt-auto space-y-3 rounded-3xl border border-zinc-200 bg-zinc-50 p-4">
                    <div className="space-y-2 rounded-2xl border border-zinc-200 bg-white p-3">
                        <Label htmlFor="order-quantity" className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Quantity</Label>
                        <div className="inline-flex h-11 items-center overflow-hidden rounded-xl border border-zinc-300 bg-white">
                            <Button
                                type="button"
                                variant="ghost"
                                className="h-full rounded-none px-3"
                                onClick={onDecreaseQuantity}
                                aria-label="Decrease quantity"
                            >
                                -
                            </Button>
                            <Input
                                id="order-quantity"
                                type="text"
                                readOnly
                                value={orderQuantity}
                                className="h-full w-14 rounded-none border-0 bg-transparent p-0 text-center text-base font-semibold focus-visible:ring-0"
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                className="h-full rounded-none px-3"
                                onClick={onIncreaseQuantity}
                                aria-label="Increase quantity"
                            >
                                +
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
                        <Button type="button" variant="outline" className="h-12 rounded-2xl" onClick={onDownload}>
                            <Download className="size-4" />
                            Download design
                        </Button>
                        <Button type="button" className="h-12 rounded-2xl bg-zinc-950 text-white hover:bg-zinc-800" onClick={onOrderNow} disabled={isSaving}>
                            <ShoppingCart className="size-4" />
                            <span className="truncate">Order now</span>
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
    );
}
