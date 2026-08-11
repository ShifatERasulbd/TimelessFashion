import { Link } from 'react-router-dom';

import { featuresFontClass } from '../../utils/typography';

const bannerImage = '/uploads/heroes/images/industry-banner.webp';

const industryCards = [
    {
        title: 'Uniforms & Sports Event',
        image: bannerImage,
        imagePosition: 'object-[10%_center]',
    },
    {
        title: 'Country Clubs',
        image: bannerImage,
        imagePosition: 'object-[30%_center]',
    },
    {
        title: 'Hospitality',
        image: bannerImage,
        imagePosition: 'object-[50%_center]',
    },
    {
        title: 'Corporate',
        image: bannerImage,
        imagePosition: 'object-[70%_center]',
    },
    {
        title: 'Industrial',
        image: bannerImage,
        imagePosition: 'object-[90%_center]',
    },
];

function IndustryCard({ title, image, imagePosition }) {
    return (
        <article className="group relative aspect-[3/5] w-full overflow-hidden bg-zinc-200">
            <img
                src={image}
                alt={title}
                className={`h-full w-full object-cover ${imagePosition} transition-transform duration-500 group-hover:scale-105`}
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

            <div className="absolute inset-x-0 bottom-1/4 z-10 px-6 text-center">
                <h3 className="text-[2rem] font-normal uppercase leading-snug tracking-[0.04em] text-white [text-shadow:0_2px_4px_rgba(0,0,0,0.5)] sm:text-[1.4rem]">
                    {title}
                </h3>
            </div>
        </article>
    );
}

export default function ShopByIndustry() {
    return (
        <section className={`${featuresFontClass} bg-[#F9F9F8] py-5 sm:py-5 w-full`}>
            {/* Header section with full-width padding to match outer layout */}
            <div className="w-full px-6 sm:px-8 lg:px-12 mb-10 sm:mb-12">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <h2 className="text-[2.7rem] font-light uppercase leading-none tracking-[0.04em] text-zinc-900 sm:text-[2rem]">
                            Shop By Industry
                        </h2>
                        <p className="mt-3 text-[1rem] leading-7 text-zinc-700 sm:text-[1.1rem]">
                            Top picks loved for their comfort, quality, and timeless style.
                        </p>
                    </div>

                    <Link
                        to="/"
                        className="inline-flex items-center self-start whitespace-nowrap border-b border-zinc-400 pb-1 text-[0.85rem] font-medium uppercase tracking-[0.15em] text-zinc-700 transition-colors hover:text-zinc-950"
                    >
                        View all products
                    </Link>
                </div>
            </div>

            {/* The 5-column grid layout is breakout/full-bleed width */}
            <div className="w-full px-0">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5 lg:gap-0.5">
                    {industryCards.map((card, index) => (
                        <IndustryCard key={index} {...card} />
                    ))}
                </div>
            </div>
        </section>
    );
}