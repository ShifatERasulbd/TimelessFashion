import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { timelessFontClass } from '../../utils/typography';
import {
    resolveHeroFontFamily,
    resolveHeroFontSize,
} from '../../utils/heroTypography';

const defaultHeroData = {
    title: 'Custom apparel solutions',
    description:
        'Elevate your brand with premium customized apparel designed for teams, events, corporate identity, and professional wear.',
    image_url: '/uploads/heroes/images/hero1.webp',
    video_url: null,
    title_font_size: 124,
    title_font_family: 'instrument-sans',
    description_font_size: 24,
    description_font_family: 'instrument-sans',
};

function splitHeroTitle(value) {
    const title = String(value || '').trim();

    if (!title) {
        return ['Custom apparel', 'solutions'];
    }

    const words = title.split(/\s+/);

    if (words.length <= 2) {
        return [title];
    }

    const middle = Math.ceil(words.length / 2);
    return [words.slice(0, middle).join(' '), words.slice(middle).join(' ')];
}

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

    const titleLines = useMemo(() => splitHeroTitle(heroData.title), [heroData.title]);
    const heroImage = heroData.image_url || defaultHeroData.image_url;
    const titleSize = resolveHeroFontSize(heroData.title_font_size, 124);
    const descriptionSize = resolveHeroFontSize(heroData.description_font_size, 24);
    const titleFamily = resolveHeroFontFamily(heroData.title_font_family, 'instrument-sans');
    const descriptionFamily = resolveHeroFontFamily(
        heroData.description_font_family,
        'instrument-sans'
    );
    const displayTitleSize = Math.max(52, Math.round(titleSize * 0.58));
    const displayDescriptionSize = Math.max(16, Math.round(descriptionSize * 0.72));

    return (
        <section className={`${timelessFontClass} relative isolate min-h-[calc(100vh-90px)] overflow-hidden bg-zinc-950 text-white`}>
            {heroData.video_url ? (
                <video
                    src={heroData.video_url}
                    className="absolute inset-0 -z-20 h-full w-full object-cover object-center"
                    autoPlay
                    muted
                    loop
                    playsInline
                />
            ) : (
                <img
                    src={heroImage}
                    alt="Timeless custom apparel hero"
                    className="absolute inset-0 -z-20 h-full w-full object-cover object-center"
                />
            )}

            <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_30%_35%,rgba(28,28,28,0.18),rgba(0,0,0,0.72)_55%,rgba(0,0,0,0.92)_100%)]" />
            <div className="absolute inset-0 -z-10 bg-black/20" />

            <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/35 to-transparent" />

            <div className="mx-auto flex min-h-[calc(100vh-90px)] w-full max-w-[1920px] items-center px-5 py-10 sm:px-8 lg:px-12">
                <div className="relative flex w-full items-center">
                    <button
                        type="button"
                        aria-label="Previous slide"
                        className="absolute left-2 top-1/2 hidden size-24 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/5 text-white/90 backdrop-blur-sm transition-colors hover:border-white/35 hover:bg-white/10 md:inline-flex lg:left-4 lg:size-28"
                    >
                        <ArrowLeft className="size-10" strokeWidth={1.6} />
                    </button>

                    <div className="w-full pl-0 md:pl-24 lg:pl-32 xl:pl-40">
                        <div className="w-full max-w-[min(60vw,760px)] space-y-5 bg-black/18 p-4 backdrop-blur-[2px] sm:bg-transparent sm:p-0">
                            <h1
                                className="max-w-3xl font-light uppercase leading-[0.9] tracking-[-0.045em] text-white drop-shadow-[0_6px_26px_rgba(0,0,0,0.35)]"
                                style={{
                                    fontFamily: titleFamily,
                                    fontSize: `clamp(2.1rem, 5.4vw, ${displayTitleSize}px)`,
                                }}
                            >
                                {titleLines.map((line, index) => (
                                    <span key={`${line}-${index}`} className="block">
                                        {line}
                                    </span>
                                ))}
                            </h1>

                            <p
                                className="max-w-[680px] leading-7 text-white/82"
                                style={{
                                    fontFamily: descriptionFamily,
                                    fontSize: `clamp(0.95rem, 1.45vw, ${displayDescriptionSize}px)`,
                                }}
                            >
                                {heroData.description || defaultHeroData.description}
                            </p>

                            <a
                                href="#shop"
                                className="inline-flex items-center justify-center rounded-sm bg-white px-7 py-4 text-[0.78rem] font-medium uppercase tracking-[0.22em] text-zinc-950 transition-transform hover:-translate-y-0.5 hover:bg-zinc-100"
                            >
                                Shop collection
                            </a>

                            <div className="pointer-events-none flex justify-start pt-1">
                                <div className="flex items-center gap-2 rounded-full border border-white/15 bg-black/20 px-3 py-2 backdrop-blur-sm">
                                    <span className="size-2 rounded-full bg-white" />
                                    <span className="size-2 rounded-full bg-white/40" />
                                    <span className="size-2 rounded-full bg-white/40" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <button
                        type="button"
                        aria-label="Next slide"
                        className="absolute right-2 top-1/2 hidden size-24 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/5 text-white/90 backdrop-blur-sm transition-colors hover:border-white/35 hover:bg-white/10 md:inline-flex lg:right-4 lg:size-28"
                    >
                        <ArrowRight className="size-10" strokeWidth={1.6} />
                    </button>

                </div>
            </div>
        </section>
    );
}