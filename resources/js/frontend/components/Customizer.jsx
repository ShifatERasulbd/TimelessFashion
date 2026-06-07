import { ArrowLeft, Eye, Layers, Share2, Upload } from 'lucide-react';

import { timelessFontClass } from '../../utils/typography';

const mockupImage = '/uploads/personalizer/order/order-design-ec8725a6-cb1f-456a-b929-ebf789cc956d.png';

export default function Customizer() {
    return (
        <section className={`${timelessFontClass} bg-black py-14 text-white sm:py-20`}>
            <div className="mx-auto grid w-full max-w-[1700px] grid-cols-1 gap-10 px-6 sm:px-8 lg:grid-cols-[0.88fr_1.12fr] lg:items-center lg:gap-14 lg:px-12">
                <div className="max-w-2xl space-y-6 lg:space-y-7">
                    <h2 className="text-[clamp(1.7rem,3vw,2.4rem)] font-light uppercase leading-[0.92] tracking-[0.03em] text-white">
                        Interactive personalization
                        <span className="block"></span>
                        <span className="block">experience</span>
                    </h2>

                    <p className="max-w-[49ch] text-[1.06rem] leading-6 text-zinc-300 sm:text-[1.2rem]">
                        Timeless Fashion gives you the freedom to personalize every detail. Build clothing that reflects your identity with premium quality and effortless style.
                    </p>

                    <ul className="space-y-2 text-[.98rem] leading-7 text-zinc-100 sm:text-[.98rem]">
                        <li>• Custom Colors &amp; Designs</li>
                        <li>• Personalized Printing</li>
                        <li>• Premium Fabric Selection</li>
                        <li>• Individual Style Control</li>
                    </ul>

                    <a
                        href="/personalizer/features"
                        className="inline-flex items-center justify-center bg-white px-7 py-3 text-[0.9rem] font-medium uppercase tracking-[0.15em] text-zinc-900 transition-colors hover:bg-zinc-200"
                    >
                        Start customizing
                    </a>
                </div>

                <div className="overflow-hidden border border-zinc-700 bg-zinc-900 shadow-[0_20px_70px_rgba(0,0,0,0.55)]">
                    <div className="flex items-center justify-between border-b border-zinc-700 bg-zinc-100 px-4 py-2 text-zinc-700">
                        <div className="flex items-center gap-2 text-[0.72rem] font-medium">
                            <ArrowLeft className="size-3.5" />
                            <span>Back to shop</span>
                        </div>
                        <div className="flex items-center gap-4 text-[0.7rem] font-medium">
                            <span className="inline-flex items-center gap-1">
                                <Eye className="size-3.5" /> Save design
                            </span>
                            <span className="inline-flex items-center gap-1">
                                <Share2 className="size-3.5" /> Share
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-[64px_1fr_280px]">
                        <aside className="space-y-3 border-r border-zinc-700 bg-zinc-50 p-2 text-zinc-500">
                            {['Upload', 'Text', 'Images', 'Shop', 'Layers'].map((item) => (
                                <div key={item} className="flex flex-col items-center gap-1 rounded bg-white px-1 py-2 text-[0.62rem] shadow-sm">
                                    {item === 'Upload' && <Upload className="size-3.5" />}
                                    {item === 'Layers' && <Layers className="size-3.5" />}
                                    {item !== 'Upload' && item !== 'Layers' && <div className="h-3.5 w-3.5 rounded-sm border border-zinc-400" />}
                                    <span>{item}</span>
                                </div>
                            ))}
                        </aside>

                        <div className="relative flex min-h-[500px] items-center justify-center bg-white p-4">
                            <img src={mockupImage} alt="Customizer preview" className="h-full max-h-[430px] w-auto object-contain" />

                            <div className="absolute left-1/2 top-[46%] w-[42%] -translate-x-1/2 -translate-y-1/2 border border-sky-400">
                                <div className="bg-black/80 px-3 py-4 text-center">
                                    <p className="text-[0.95rem] font-semibold uppercase tracking-[0.12em] text-white">
                                        Explore
                                    </p>
                                    <p className="mt-1 text-[0.62rem] uppercase tracking-[0.18em] text-amber-400">
                                        The unknown
                                    </p>
                                </div>
                            </div>
                        </div>

                        <aside className="border-l border-zinc-700 bg-zinc-50 text-zinc-700">
                            <div className="space-y-4 border-b border-zinc-200 p-3">
                                <h3 className="text-[0.9rem] font-semibold">Customize your sweatshirt</h3>
                                <div>
                                    <p className="mb-2 text-[0.72rem] font-semibold uppercase tracking-[0.08em] text-zinc-500">Product color</p>
                                    <div className="flex gap-2">
                                        {['#09090b', '#1d4ed8', '#be123c', '#d4d4d8', '#fafafa'].map((color) => (
                                            <span key={color} className="size-5 rounded-full border border-zinc-300" style={{ backgroundColor: color }} />
                                        ))}
                                    </div>
                                </div>
                                <button className="inline-flex w-full items-center justify-center rounded bg-zinc-900 px-3 py-2 text-[0.72rem] font-medium text-white">
                                    Upload image or logo
                                </button>
                                <input
                                    readOnly
                                    value="EXPLORE"
                                    className="w-full rounded border border-zinc-300 bg-white px-2 py-1.5 text-[0.72rem]"
                                />
                            </div>

                            <div className="space-y-2 p-3">
                                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.08em] text-zinc-500">Layers</p>
                                {['EST. 2024', 'THE UNKNOWN', 'EXPLORE', 'mountain.png'].map((layer) => (
                                    <div key={layer} className="flex items-center justify-between rounded border border-zinc-200 bg-white px-2 py-1.5 text-[0.68rem]">
                                        <span>{layer}</span>
                                        <Eye className="size-3" />
                                    </div>
                                ))}
                            </div>
                        </aside>
                    </div>
                </div>
            </div>
        </section>
    );
}