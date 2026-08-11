import { Gift, RefreshCcw, SlidersHorizontal, Sparkles } from 'lucide-react';

import { featuresFontClass } from '../../utils/typography';

const featureItems = [
    {
        icon: Sparkles,
        title: 'Premium Quality Materials',
        description: 'Durable fabrics designed for comfort and long-term use.',
    },
    {
        icon: SlidersHorizontal,
        title: 'Personalized Products',
        description: 'Customize designs, colors, and details to match your identity.',
    },
    {
        icon: RefreshCcw,
        title: 'Small Order Solutions',
        description: 'Efficient small quantity delivery with customized logo',
    },
    {
        icon: Gift,
        title: 'Bulk Order Solutions',
        description: 'Efficient production and scalable solutions for businesses of all sizes.',
    },
];

export default function Features() {
    return (
        <section className={`${featuresFontClass} bg-[#F9F9F8] py-16 sm:py-20`}>
            <div className="mx-auto w-full max-w-[1700px] px-6 sm:px-8 lg:px-12">
                <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 xl:grid-cols-4 xl:gap-8">
                    {featureItems.map(({ icon: Icon, title, description }) => (
                        <article key={title} className="mx-auto max-w-sm text-center">
                            <div className="mb-4 flex justify-center text-amber-700">
                                <Icon className="size-6" strokeWidth={1.7} />
                            </div>
                            <h3 className="text-[1.35rem] font-normal tracking-wide text-zinc-900">
                                {title}
                            </h3>
                            <p className="mx-auto mt-2.5 max-w-[28ch] text-[0.95rem] leading-relaxed text-zinc-600">
                                {description}
                            </p>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}