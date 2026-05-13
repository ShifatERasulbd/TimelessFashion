import { cn } from '@/lib/utils';

import { CANVAS_HEIGHT, CANVAS_WIDTH } from '../config';

export default function CanvasStage({ canvasRef, productViews, activeView, onSwitchView }) {
    return (
        <section className="overflow-hidden rounded-[32px] border border-zinc-200 bg-white shadow-sm">
            <div className="flex  flex-col">
                <div className="flex-1 bg-[radial-gradient(circle_at_top,#ffffff,transparent_45%),linear-gradient(180deg,#f7f6f2_0%,#f2f0ea_100%)] p-4 sm:p-6">
                    <div className="mx-auto flex max-w-[860px] items-center justify-center rounded-[30px] border border-zinc-200/60 bg-white shadow-inner">
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
