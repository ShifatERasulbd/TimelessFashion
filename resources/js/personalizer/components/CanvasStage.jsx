import { useState } from 'react';

import { cn } from '@/lib/utils';

import { CANVAS_HEIGHT, CANVAS_WIDTH } from '../config';

export default function CanvasStage({ canvasRef, productViews, activeView, onSwitchView, onDropDesign }) {
    const [isDragOver, setIsDragOver] = useState(false);

    const handleDragOver = (event) => {
        event.preventDefault();
        if (!event.dataTransfer?.types?.includes('application/x-personalizer-design')) return;

        event.dataTransfer.dropEffect = 'copy';
        if (!isDragOver) setIsDragOver(true);
    };

    const handleDragLeave = () => {
        if (isDragOver) setIsDragOver(false);
    };

    const handleDrop = (event) => {
        event.preventDefault();
        setIsDragOver(false);

        const payload = event.dataTransfer?.getData('application/x-personalizer-design');
        if (!payload || !onDropDesign) return;

        try {
            const parsed = JSON.parse(payload);
            onDropDesign(parsed, { clientX: event.clientX, clientY: event.clientY });
        } catch {
            // Ignore malformed drag payloads.
        }
    };

    return (
        <section className="overflow-hidden rounded-[32px] border border-zinc-200 bg-white shadow-sm">
            <div className="flex  flex-col">
                <div className="flex-1 bg-[radial-gradient(circle_at_top,#ffffff,transparent_45%),linear-gradient(180deg,#f7f6f2_0%,#f2f0ea_100%)] p-4 sm:p-6">
                    <div
                        className={cn(
                            'mx-auto flex max-w-[860px] items-center justify-center rounded-[30px] border bg-white shadow-inner transition-colors',
                            isDragOver ? 'border-zinc-950/70 ring-2 ring-zinc-950/20' : 'border-zinc-200/60'
                        )}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                    >
                        <div className="relative w-full">
                            <canvas
                                ref={canvasRef}
                                className="block max-w-full rounded-[28px]"
                                style={{ width: '100%', height: 'auto', aspectRatio: `${CANVAS_WIDTH} / ${CANVAS_HEIGHT}` }}
                            />
                        </div>
                    </div>
                </div> 

                <div className="border-t border-zinc-200 bg-white px-4 py-4 sm:px-6">
                    <div className="flex flex-wrap gap-3">
                        {productViews.map((view) => (
                            <button
                                key={view.id}
                                type="button"
                                onClick={() => onSwitchView(view)}
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
    );
}
