import { ArrowLeft, ChevronDown, ChevronUp, Download, Eye, Layers, Share2, Upload } from 'lucide-react';
import { timelessFontClass } from '../../utils/typography';

const mockupImage = '/uploads/personalizer/order/order-design-ec8725a6-cb1f-456a-b929-ebf789cc956d.png';

export default function Customizer() {
    return (
        <section className={`${timelessFontClass} bg-white py-14 text-zinc-900 sm:py-20`}>
            <div className="mx-auto grid w-full max-w-[1700px] grid-cols-1 gap-10 px-6 sm:px-8 lg:grid-cols-[0.88fr_1.12fr] lg:items-center lg:gap-14 lg:px-12">
                
                {/* Left Column - Text Content */}
                <div className="max-w-2xl space-y-6 lg:space-y-7">
                    <h2 className="text-[clamp(2.2rem,3.2vw,3rem)] font-normal uppercase leading-[1.05] tracking-[0.02em] text-zinc-900">
                        Interactive Personalization Experience
                    </h2>

                    <p className="max-w-[49ch] text-[1.05rem] leading-relaxed text-zinc-600 sm:text-[1.125rem]">
                        Upload your logo, imprint, and graphics, download, and try our Product Personalizer to fine-tune placement and color for a personalized design.
                    </p>

                    <ul className="space-y-3 text-[1rem] font-medium text-zinc-800">
                        <li className="flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-zinc-400" /> Custom Colors &amp; Designs
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-zinc-400" /> Personalized Printing
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-zinc-400" /> Choose wide range of available styles
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-zinc-400" /> No MOQ
                        </li>
                    </ul>

                    <div>
                        <a
                            href="/personalizer/features"
                            className="inline-flex items-center justify-center bg-[#E56338] px-7 py-3 text-[0.9rem] font-medium uppercase tracking-[0.15em] text-white transition-colors hover:bg-[#d0552e]"
                        >
                            Start Customizing
                        </a>
                    </div>
                </div>

                {/* Right Column - Customizer UI Preview Box */}
                <div className="overflow-hidden rounded-md border border-zinc-200 bg-white shadow-[0_10px_40px_rgba(0,0,0,0.08)]">
                    
                    {/* Top App Header bar */}
                    <div className="flex items-center justify-between border-b border-zinc-200 bg-white px-4 py-3 text-zinc-700">
                        <div className="flex items-center gap-2 text-[0.8rem] font-medium text-zinc-600 hover:text-zinc-900 cursor-pointer">
                            <ArrowLeft className="size-4" />
                            <span>Back to shop</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <button className="inline-flex items-center gap-1.5 rounded border border-zinc-200 bg-white px-3 py-1.5 text-[0.75rem] font-medium text-zinc-700 shadow-sm hover:bg-zinc-50">
                                <Download className="size-3.5" /> Save design
                            </button>
                            <button className="inline-flex items-center gap-1.5 rounded bg-zinc-900 px-3 py-1.5 text-[0.75rem] font-medium text-white shadow-sm hover:bg-zinc-800">
                                <Share2 className="size-3.5" /> Share
                            </button>
                        </div>
                    </div>

                    {/* App Workbench Grid */}
                    <div className="grid grid-cols-[64px_1fr_300px] bg-zinc-50/50">
                        
                        {/* Left Toolbar Sidebar */}
                        <aside className="space-y-2 border-r border-zinc-200 bg-white p-2 text-zinc-500">
                            {[
                                { name: 'Upload', icon: Upload },
                                { name: 'Text', icon: null, label: 'T' },
                                { name: 'Images', icon: null, label: 'img' },
                                { name: 'Shapes', icon: null, label: '□' },
                                { name: 'Undo', icon: null, label: '↩' },
                                { name: 'Redo', icon: null, label: '↪' }
                            ].map((item) => (
                                <div key={item.name} className="flex flex-col items-center justify-center gap-1 rounded-lg p-2 text-[0.65rem] font-medium text-zinc-600 hover:bg-zinc-100 cursor-pointer transition-colors">
                                    {item.icon ? (
                                        <item.icon className="size-4" />
                                    ) : (
                                        <span className="flex h-4 w-4 items-center justify-center text-xs font-semibold">{item.label}</span>
                                    )}
                                    <span>{item.name}</span>
                                </div>
                            ))}
                        </aside>

                        {/* Center Canvas Area */}
                        <div className="relative flex flex-col items-center justify-between bg-white p-6">
                            <div className="relative flex flex-1 items-center justify-center w-full">
                                <img src={mockupImage} alt="Customizer preview" className="max-h-[380px] w-auto object-contain" />
                            </div>

                            {/* Front/Back Thumbnail switcher footer */}
                            <div className="mt-4 flex items-center gap-3">
                                <div className="flex flex-col items-center cursor-pointer group">
                                    <div className="h-14 w-12 overflow-hidden rounded border-2 border-zinc-900 bg-zinc-100 p-1">
                                        <img src={mockupImage} alt="Front View" className="h-full w-full object-cover" />
                                    </div>
                                    <span className="mt-1 text-[0.7rem] font-medium text-zinc-900">Front</span>
                                </div>
                                <div className="flex flex-col items-center cursor-pointer opacity-70 hover:opacity-100">
                                    <div className="h-14 w-12 overflow-hidden rounded border border-zinc-200 bg-zinc-100 p-1">
                                        <img src={mockupImage} alt="Back View" className="h-full w-full object-cover" />
                                    </div>
                                    <span className="mt-1 text-[0.7rem] font-medium text-zinc-500">Back</span>
                                </div>
                            </div>
                        </div>

                        {/* Right Configuration Panel */}
                        <aside className="border-l border-zinc-200 bg-white text-zinc-700 flex flex-col">
                            
                            {/* Product Options Accordion Block */}
                            <div className="border-b border-zinc-200 p-4 space-y-4">
                                <div>
                                    <h3 className="text-[0.95rem] font-semibold text-zinc-900">Customize your sweatshirt</h3>
                                    <p className="text-[0.75rem] text-zinc-500 mt-0.5">Create something timeless.</p>
                                </div>

                                {/* Color Selection Dropdown Section */}
                                <div className="rounded-lg border border-zinc-200 bg-zinc-50/60 p-3">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-[0.75rem] font-semibold uppercase tracking-wider text-zinc-600">Product color</span>
                                        <ChevronDown className="size-3.5 text-zinc-400" />
                                    </div>
                                    <p className="text-[0.75rem] text-zinc-500 mb-2.5">Selected: Black</p>
                                    <div className="flex items-center gap-2.5">
                                        {[
                                            { hex: '#18181b', active: true },
                                            { hex: '#1e3a8a', active: false },
                                            { hex: '#991b1b', active: false },
                                            { hex: '#64748b', active: false },
                                            { hex: '#f5f5f4', active: false }
                                        ].map((color, i) => (
                                            <span 
                                                key={i} 
                                                className={`size-6 rounded-full border cursor-pointer transition-transform ${color.active ? 'ring-2 ring-zinc-900 ring-offset-2 border-transparent' : 'border-zinc-300'}`} 
                                                style={{ backgroundColor: color.hex }} 
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* Add Design Box */}
                                <div className="rounded-lg border border-zinc-200 p-3 space-y-3 bg-white">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[0.75rem] font-semibold uppercase tracking-wider text-zinc-700">Add your design</span>
                                        <ChevronUp className="size-3.5 text-zinc-400" />
                                    </div>
                                    <button className="inline-flex w-full items-center justify-center rounded bg-zinc-900 px-3 py-2 text-[0.75rem] font-medium text-white hover:bg-zinc-800 transition-colors">
                                        Upload image or logo
                                    </button>
                                    <div className="text-[0.65rem] text-zinc-400 text-center">JPG, PNG, SVG up to 10MB</div>

                                    {/* Uploaded items list preview */}
                                    <div className="pt-2 border-t border-zinc-100">
                                        <div className="flex items-center justify-between text-[0.7rem] text-zinc-500 mb-1.5">
                                            <span className="uppercase tracking-wide font-semibold text-[0.65rem]">Images</span>
                                            <span className="cursor-pointer hover:text-zinc-800 text-[0.65rem]">Clear</span>
                                        </div>
                                        <div className="flex items-center justify-between rounded border border-zinc-200 bg-zinc-50 p-1.5">
                                            <div className="flex items-center gap-2">
                                                <div className="h-7 w-7 rounded bg-zinc-200 overflow-hidden flex-shrink-0">
                                                    <img src={mockupImage} alt="Uploaded logo" className="h-full w-full object-cover" />
                                                </div>
                                                <span className="text-[0.7rem] text-zinc-700 truncate max-w-[130px]">WhatsApp Image 2026-…</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <span className="rounded bg-zinc-200 px-1.5 py-0.5 text-[0.6rem] font-medium text-zinc-700">Use</span>
                                                <button className="text-zinc-400 hover:text-red-500">×</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Additional Accordion items */}
                            <div className="divide-y divide-zinc-200">
                                {[
                                    { title: 'Add text' },
                                    { title: 'Shapes' },
                                    { title: 'Arrange', subtitle: 'Drag on the canvas, then refine the stack here.' },
                                    { title: 'Checkout' }
                                ].map((acc, index) => (
                                    <div key={index} className="p-4 flex items-center justify-between cursor-pointer hover:bg-zinc-50/50 transition-colors">
                                        <div>
                                            <h4 className="text-[0.8rem] font-medium text-zinc-800">{acc.title}</h4>
                                            {acc.subtitle && <p className="text-[0.65rem] text-zinc-400 mt-0.5">{acc.subtitle}</p>}
                                        </div>
                                        <ChevronDown className="size-4 text-zinc-400" />
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