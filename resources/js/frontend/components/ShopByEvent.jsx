import { Link } from 'react-router-dom';

import { featuresFontClass } from '../../utils/typography';

const cardImage = '/uploads/heroes/images/hero1.webp';

const eventCards = [
    {
        title: 'Corporate',
        image: cardImage,
        className: 'row-span-2',
        imagePosition: 'object-[42%_center]',
    },
    {
        title: 'Spiritwear',
        image: cardImage,
        className: '',
        imagePosition: 'object-[50%_22%]',
    },
    {
        title: 'Sports',
        image: cardImage,
        className: 'row-span-2',
        imagePosition: 'object-[70%_center]',
    },
    {
        title: 'Graduation',
        image: cardImage,
        className: '',
        imagePosition: 'object-[50%_78%]',
    },
];

function EventCard({ title, image, className, imagePosition }) {
    return (
        <article
            className={`group relative overflow-hidden bg-zinc-200 ${className}`}
        >
            <img
                src={image}
                alt={title}
                className={`h-full w-full object-cover ${imagePosition} transition-transform duration-500 group-hover:scale-105`}
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-black/5 to-transparent" />

            <div className="absolute bottom-5 left-5 bg-black/42 px-4 py-2 text-[1.95rem] font-medium uppercase tracking-[0.08em] text-white backdrop-blur-sm sm:text-[1.05rem]">
                {title}
            </div>
        </article>
    );
}

export default function ShopByEvent() {
    return (
        <section className={`${featuresFontClass} bg-[#f3f3f3] pb-14 pt-6 sm:pb-20 sm:pt-10`}>
            <div className="mx-auto w-full max-w-[1700px] px-6 sm:px-8 lg:px-12">
                <div className="mb-7 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <h2 className="text-[3rem] uppercase leading-none tracking-[0.02em] text-zinc-900 sm:text-[3.2rem]">
                            Shop By Event
                        </h2>
                        <p className="mt-3 text-[1.04rem] leading-8 text-zinc-600 sm:text-[1.12rem]">
                            Top picks loved for their comfort, quality, and timeless style.
                        </p>
                    </div>

                    <Link
                        to="/"
                        className="inline-flex items-center self-start border-b border-zinc-400 pb-1 text-[0.95rem] font-medium uppercase tracking-[0.14em] text-zinc-700 transition-colors hover:text-zinc-950"
                    >
                        View all products
                    </Link>
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                    <EventCard {...eventCards[0]} />

                    <div className="grid grid-cols-1 gap-4">
                        <EventCard {...eventCards[1]} />
                        <EventCard {...eventCards[3]} />
                    </div>

                    <EventCard {...eventCards[2]} />
                </div>
            </div>
        </section>
    );
}