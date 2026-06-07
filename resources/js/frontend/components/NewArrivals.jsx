import { ArrowLeft, ArrowRight, Eye, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

import { featuresFontClass } from '../../utils/typography';

const arrivalsImage = '/uploads/heroes/images/hero1.webp';

const products = [
    {
        name: 'Corporate Full Sleeve T-Shirt',
        price: '$54.00',
        image: arrivalsImage,
        imagePosition: 'object-[42%_center]',
    },
    {
        name: 'Corporate Full Sleeve T-Shirt',
        price: '$95.00',
        image: arrivalsImage,
        imagePosition: 'object-[50%_25%]',
    },
    {
        name: 'Corporate Full Sleeve T-Shirt',
        price: '$56.00',
        image: arrivalsImage,
        imagePosition: 'object-[58%_center]',
    },
    {
        name: 'Corporate Full Sleeve T-Shirt',
        price: '$65.00',
        image: arrivalsImage,
        imagePosition: 'object-[50%_38%]',
    },
];

function ProductCard({ product }) {
    return (
        <article className="group">
            <div className="relative overflow-hidden bg-zinc-200">
                <img
                    src={product.image}
                    alt={product.name}
                    className={`h-[520px] w-full ${product.imagePosition} object-cover transition-transform duration-500 group-hover:scale-105`}
                />

                <div className="pointer-events-none absolute inset-x-0 bottom-7 left-7 flex items-center gap-2 opacity-0 transition-all duration-300 group-hover:pointer-events-auto group-hover:opacity-100">
                    <button
                        type="button"
                        className="inline-flex h-10 items-center justify-center bg-white px-4 text-[0.88rem] uppercase tracking-[0.14em] text-zinc-900"
                    >
                        Add to cart
                    </button>
                    <button
                        type="button"
                        aria-label="Add to wishlist"
                        className="inline-flex size-10 items-center justify-center rounded-full bg-white text-zinc-700"
                    >
                        <Heart className="size-5" />
                    </button>
                    <button
                        type="button"
                        aria-label="Preview product"
                        className="inline-flex size-10 items-center justify-center rounded-full bg-white text-zinc-700"
                    >
                        <Eye className="size-5" />
                    </button>
                </div>
            </div>

            <div className="pt-4">
                <h3 className="text-[2.05rem] uppercase leading-tight tracking-[0.02em] text-zinc-900 sm:text-[1rem]">
                    {product.name}
                </h3>
                <p className="mt-1 text-[2rem] text-zinc-500 sm:text-[.80rem]">{product.price}</p>
            </div>
        </article>
    );
}

export default function NewArrivals() {
    return (
        <section className={`${featuresFontClass} bg-white py-14 sm:py-20`}>
            <div className="mx-auto w-full max-w-[1700px] px-6 sm:px-8 lg:px-12">
                <div className="mb-8 flex flex-col gap-5 sm:mb-10 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <h2 className="text-[1.8rem] uppercase leading-none tracking-[0.03em] text-zinc-900 sm:text-[2.6rem]">
                            Our New Arrivals
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

                <div className="relative">
                    <button
                        type="button"
                        aria-label="Previous products"
                        className="absolute -left-16 top-1/2 hidden -translate-y-1/2 text-zinc-400 transition-colors hover:text-zinc-700 xl:inline-flex"
                    >
                        <ArrowLeft className="size-10" strokeWidth={1.5} />
                    </button>

                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
                        {products.map((product) => (
                            <ProductCard key={`${product.name}-${product.price}`} product={product} />
                        ))}
                    </div>

                    <button
                        type="button"
                        aria-label="Next products"
                        className="absolute -right-16 top-1/2 hidden -translate-y-1/2 text-zinc-700 transition-colors hover:text-zinc-900 xl:inline-flex"
                    >
                        <ArrowRight className="size-10" strokeWidth={1.5} />
                    </button>
                </div>
            </div>
        </section>
    );
}