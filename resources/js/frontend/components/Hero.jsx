import { useEffect, useState } from 'react';

import { timelessFontClass } from '../../utils/typography';
import {
    resolveHeroFontFamily,
    resolveHeroFontSize,
} from '../../utils/heroTypography';

const defaultHeroData = {
    title: 'Brands for teams',
    description:
        'Discover premium apparel and uniform brands, customized with your logo and tailored to reflect your team\'s identity, style, and professionalism.',
    image_url: '/uploads/heroes/images/hero1.webp',
    video_url: null,
    title_font_size: 124,
    title_font_family: 'instrument-sans',
    description_font_size: 24,
    description_font_family: 'instrument-sans',
};

export default function Hero() {
    const [heroData, setHeroData] = useState(defaultHeroData);

    useEffect(() => {
        let ignore = false;

        async function loadHero() {
            try {
                const response = await fetch('/api/public/hero', {
                    headers: { Accept: 'application/json' },
                });

                if (!response.ok) {
                    return;
                }

                const payload = await response.json();
                if (!ignore && payload) {
                    setHeroData((previous) => ({ ...previous, ...payload }));
                }
            } catch {
                // Keep default hero when public endpoint is unavailable.
            }
        }

        loadHero();

        return () => {
            ignore = true;
        };
    }, []);

    const titleFamily = resolveHeroFontFamily(heroData.title_font_family, 'instrument-sans');
    const descriptionFamily = resolveHeroFontFamily(
        heroData.description_font_family,
        'instrument-sans'
    );

    return (
        <section className={`${timelessFontClass} relative isolate min-h-[520px] overflow-hidden bg-[#d9e5e0] text-zinc-950 lg:min-h-[600px]`}>
            <div className="mx-auto flex min-h-[520px] w-full max-w-[1920px] items-center px-6 py-16 sm:px-10 lg:min-h-[600px] lg:px-16">
                <div className="grid w-full grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-8">
                    
                    {/* Left Column: Content */}
                    <div className="flex flex-col items-start space-y-6 lg:col-span-5">
                        {/* Tag Pill */}
                        <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 shadow-sm">
                            <span className="size-1.5 rounded-full bg-zinc-900" />
                            <span className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-zinc-900">
                                Premium Apparel Brands
                            </span>
                        </div>

                        {/* Title */}
                        <h1
                            className="text-4xl font-normal tracking-tight text-zinc-950 sm:text-5xl lg:text-6xl"
                            style={{ fontFamily: titleFamily }}
                        >
                            Brands for <span className="font-serif italic text-zinc-900 underline decoration-[#e65c00] decoration-2 underline-offset-8">teams</span>
                        </h1>

                        {/* Description */}
                        <p
                            className="max-w-[540px] text-[0.95rem] leading-relaxed text-zinc-600 sm:text-base"
                            style={{ fontFamily: descriptionFamily }}
                        >
                            {heroData.description || defaultHeroData.description}
                        </p>

                        {/* CTA Button */}
                        <a
                            href="#shop"
                            className="inline-flex items-center justify-center rounded-sm bg-[#e65c00] px-7 py-3.5 text-[0.78rem] font-semibold uppercase tracking-[0.2em] text-white transition-all hover:bg-[#d55400]"
                        >
                            Discover More
                        </a>
                    </div>

                    {/* Right Column: Floating Brand Logo Badges (Exact match to target reference layout) */}
                    <div className="relative flex h-[360px] w-full items-center justify-center lg:col-span-7 lg:h-[440px]">
                        
                        {/* Badge 1: Timeless Sticker (Upper-mid area) */}
                        <div className="absolute right-[42%] top-[24%] rotate-[-4deg] rounded-sm bg-white p-3 shadow-[0_10px_30px_rgba(0,0,0,0.06)] transition-transform hover:rotate-0">
                            <div className="flex items-center bg-[#fcead8] px-4 py-2 font-black tracking-wider text-zinc-900">
                                <span className="text-xl">TIME</span>
                                <span className="font-serif italic font-normal lowercase text-[#e65c00] text-lg">less</span>
                            </div>
                        </div>

                        {/* Badge 2: 1971Co. Sticker (Mid-right area) */}
                        <div className="absolute right-[14%] top-[42%] rotate-[6deg] rounded-sm bg-white px-5 py-3.5 shadow-[0_10px_30px_rgba(0,0,0,0.06)] transition-transform hover:rotate-0">
                            <span className="text-2xl font-black italic tracking-tighter text-zinc-950">
                                1971<span className="text-sm font-sans not-italic font-normal">Co.</span>
                            </span>
                        </div>

                        {/* Badge 3: Chef Works Sticker (Lower-mid area) */}
                        <div className="absolute bottom-[16%] right-[44%] rotate-[-2deg] rounded-sm bg-white px-6 py-3.5 shadow-[0_10px_30px_rgba(0,0,0,0.06)] transition-transform hover:rotate-0">
                            <div className="flex items-center gap-2">
                                <div className="flex size-7 items-center justify-center rounded-full bg-[#cc0000] text-white">
                                    <span className="text-xs">🍴</span>
                                </div>
                                <span className="font-serif text-xl tracking-tight text-zinc-900">
                                    Chef<span className="font-sans font-bold text-[#cc0000]">Works</span>
                                </span>
                            </div>
                        </div>

                    </div>

                </div>
            </div>
        </section>
    );
}