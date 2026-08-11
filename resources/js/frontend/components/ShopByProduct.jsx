import { Link } from 'react-router-dom';
import { featuresFontClass } from '../../utils/typography';

const sampleImage = '/uploads/heroes/images/hero1.webp';

const productCards = [
    {
        title: 'T-SHIRT',
        image: sampleImage,
        imagePosition: 'object-[20%_center]',
    },
    {
        title: 'POLOS',
        image: sampleImage,
        imagePosition: 'object-[40%_center]',
    },
    {
        title: 'HOODIES',
        image: sampleImage,
        imagePosition: 'object-[60%_center]',
    },
    {
        title: 'SPORTSWEAR',
        image: sampleImage,
        imagePosition: 'object-[80%_center]',
    },
    {
        title: 'OUTERWEAR WORKWEAR',
        image: sampleImage,
        imagePosition: 'object-[95%_center]',
    },
];

function ProductCard({ title, image, imagePosition }) {
    return (
        <article className="group relative aspect-[3/5] w-full overflow-hidden bg-zinc-200">
            <img
                src={image}
                alt={title}
                className={`h-full w-full object-cover ${imagePosition} transition-transform duration-500 group-hover:scale-105`}
            />
            {/* Gradient overlay for readability */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

            {/* Title overlay */}
            <div className="absolute inset-x-0 bottom-1/4 z-10 px-4 text-center">
                <h3 className="text-[1.8rem] font-normal uppercase tracking-[0.06em] text-white [text-shadow:0_2px_4px_rgba(0,0,0,0.5)] sm:text-[1.6rem]">
                    {title}
                </h3>
            </div>
        </article>
    );
}

export default function ShopByProduct() {
    return (
        <section className={`${featuresFontClass} bg-[#F9F9F8] py-14 sm:py-20`}>
            <div className="mx-auto w-full max-w-[1700px] px-6 sm:px-8 lg:px-12">
                {/* Header Layout */}
                <div className="mb-10 flex flex-col gap-4 sm:mb-12 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <h2 className="text-[2.7rem] font-light uppercase leading-none tracking-[0.04em] text-zinc-900 sm:text-[3rem]">
                            Shop By Product
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

                {/* 5-Column Grid */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 lg:gap-0.5">
                    {productCards.map((card, index) => (
                        <ProductCard key={index} {...card} />
                    ))}
                </div>
            </div>
        </section>
    );
}