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
        icon: Gift,
        title: 'Bulk Order Solutions',
        description: 'Efficient production and scalable solutions for businesses of all sizes.',
    },
    {
        icon: RefreshCcw,
        title: 'Hassle-Free Global Returns',
        description: 'Shop with confidence with easy returns worldwide.',
    },
];

export default function Features() {
    return (
        <section className={`${featuresFontClass} bg-[#f3f3f3] py-20 sm:py-24`}>
            <div className="mx-auto w-full max-w-[1700px] px-6 sm:px-8 lg:px-12">
                <div className="grid grid-cols-1 gap-14 sm:grid-cols-2 xl:grid-cols-4 xl:gap-10">
                    {featureItems.map(({ icon: Icon, title, description }) => (
                        <article key={title} className="mx-auto max-w-sm text-center">
                            <div className="mb-4 flex justify-center text-zinc-950">
                                <Icon className="size-9" strokeWidth={1.7} />
                            </div>
                            <h3 className="text-[2rem] font-medium leading-tight tracking-[0.01em] text-zinc-900 sm:text-[1.4rem]">
                                {title}
                            </h3>
                            <p className="mx-auto mt-3 max-w-[24ch] text-[0.5rem] leading-5 text-zinc-600 sm:text-[1rem]">
                                {description}
                            </p>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}