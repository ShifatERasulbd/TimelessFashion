import { Link } from 'react-router-dom';

import { featuresFontClass } from '../../utils/typography';

const categoryImage = '/uploads/heroes/images/hero1.webp';

const categories = [
    {
        title: 'Shop for Men',
        imagePosition: 'object-[40%_center]',
        buttonLabel: 'Shop for Men',
    },
    {
        title: 'Shop for Women',
        imagePosition: 'object-[56%_center]',
        buttonLabel: 'Shop for Women',
    },
    {
        title: 'Shop for Youth',
        imagePosition: 'object-[68%_center]',
        buttonLabel: 'Shop for Youth',
    },
];

function CategoryCard({ title, imagePosition, buttonLabel }) {
    return (
        <article className="group relative overflow-hidden bg-zinc-100 shadow-sm">
            <img
                src={categoryImage}
                alt={title}
                className={`h-[500px] w-full object-cover ${imagePosition} transition-transform duration-500 group-hover:scale-105 sm:h-[560px]`}
            />

            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/12 via-transparent to-transparent" />

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
                <Link
                    to="/"
                    className="inline-flex items-center justify-center bg-white px-6 py-3 text-[0.86rem] uppercase tracking-[0.18em] text-zinc-900 shadow-[0_1px_2px_rgba(0,0,0,0.06)] transition-transform duration-200 group-hover:-translate-y-0.5"
                >
                    {buttonLabel}
                </Link>
            </div>
        </article>
    );
}

export default function BestSellingProducts() {
    return (
        <section className={`${featuresFontClass} bg-white py-14 sm:py-20`}>
            <div className="mx-auto w-full max-w-[1700px] px-6 sm:px-8 lg:px-12">
                <div className="mb-8 flex flex-col gap-5 sm:mb-10 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <h2 className="text-[1.8rem] uppercase leading-none tracking-[0.03em] text-zinc-900 sm:text-[2.6rem]">
                            Best Selling Items
                        </h2>
                        <p className="mt-3 text-[1.05rem] leading-8 text-zinc-600 sm:text-[1.12rem]">
                            Top picks loved for their comfort, quality, and timeless style.
                        </p>
                    </div>

                    <Link
                        to="/"
                        className="inline-flex items-center self-start border-b border-zinc-400 pb-1 text-[0.75rem] font-medium uppercase tracking-[0.14em] text-zinc-700 transition-colors hover:text-zinc-950"
                    >
                        View all products
                    </Link>
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                    {categories.map((category) => (
                        <CategoryCard key={category.title} {...category} />
                    ))}
                </div>
            </div>
        </section>
    );
}