import { Eye, Heart, SlidersHorizontal } from 'lucide-react';
import { Link } from 'react-router-dom';

import { featuresFontClass } from '../../utils/typography';
import ShopSidebar from './ShopSidebar.jsx';

const productImage = '/uploads/heroes/images/hero1.webp';

const products = [
    {
        id: 1,
        name: 'REGULAR COVERALL',
        price: '$95.00',
        colors: ['#000000', '#2d6a4f', '#fefae0', '#1d3557', '#adb5bd'],
        position: 'object-[42%_center]',
    },
    {
        id: 2,
        name: 'CORPORATE POLO T-SHIRT',
        price: '$54.00',
        colors: ['#000000', '#2d6a4f', '#fefae0', '#1d3557', '#adb5bd'],
        position: 'object-[50%_center]',
    },
    {
        id: 3,
        name: 'FR WORK SHIRT',
        price: '$56.00',
        colors: ['#000000', '#2d6a4f', '#fefae0', '#1d3557', '#adb5bd'],
        position: 'object-[58%_center]',
    },
    {
        id: 4,
        name: 'BASIC BIB APRON',
        price: '$56.00',
        colors: ['#000000', '#2d6a4f', '#fefae0', '#1d3557', '#adb5bd'],
        position: 'object-[65%_center]',
    },
    {
        id: 5,
        name: 'CLASSIC TEAM HOODIE',
        price: '$72.00',
        colors: ['#000000', '#2d6a4f', '#fefae0', '#1d3557', '#adb5bd'],
        position: 'object-[45%_center]',
    },
    {
        id: 6,
        name: 'ATHLETIC TEAM JERSEY',
        price: '$60.00',
        colors: ['#000000', '#2d6a4f', '#fefae0', '#1d3557', '#adb5bd'],
        position: 'object-[55%_center]',
    },
];

function ProductCard({ product }) {
    return (
        <article className="group flex flex-col bg-white">
            <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#F4F4F4]">
                <Link to={`/singleProduct/${product.id}`} aria-label={`Open ${product.name} details`}>
                    <img
                        src={productImage}
                        alt={product.name}
                        className={`h-full w-full object-cover ${product.position} transition-transform duration-500 group-hover:scale-105`}
                    />
                </Link>

                {/* Hover overlay actions (Add to Cart, Wishlist, Quick View) */}
                <div className="absolute inset-x-0 bottom-4 flex items-center justify-center gap-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <button
                        type="button"
                        className="bg-white px-4 py-2.5 text-[0.7rem] font-medium uppercase tracking-[0.15em] text-zinc-900 shadow-sm transition-colors hover:bg-zinc-900 hover:text-white"
                    >
                        Add to Cart
                    </button>
                    <button
                        type="button"
                        className="flex size-10 items-center justify-center bg-white text-zinc-900 shadow-sm transition-colors hover:bg-zinc-900 hover:text-white"
                        aria-label="Wishlist"
                    >
                        <Heart className="size-4" strokeWidth={1.5} />
                    </button>
                    <button
                        type="button"
                        className="flex size-10 items-center justify-center bg-white text-zinc-900 shadow-sm transition-colors hover:bg-zinc-900 hover:text-white"
                        aria-label="Quick view"
                    >
                        <Eye className="size-4" strokeWidth={1.5} />
                    </button>
                </div>
            </div>

            <div className="mt-4 flex flex-col space-y-1.5">
                <Link
                    to={`/singleProduct/${product.id}`}
                    className="text-[0.95rem] font-normal tracking-[0.06em] text-zinc-900 transition-colors hover:text-zinc-600"
                >
                    {product.name}
                </Link>
                <p className="text-[0.9rem] font-light text-zinc-600">{product.price}</p>
                
                <div className="mt-1 flex flex-col gap-1">
                    <span className="text-[0.65rem] font-semibold uppercase tracking-[0.15em] text-zinc-400">Color</span>
                    <div className="flex items-center gap-2">
                        {product.colors.map((color, index) => (
                            <span
                                key={index}
                                className="size-4 rounded-full border border-zinc-300 transition-transform hover:scale-110"
                                style={{ backgroundColor: color }}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </article>
    );
}

function ShopProductsGrid() {
    return (
        <div>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 pb-4">
                <p className="text-[0.88rem] tracking-[0.04em] text-zinc-600">
                    Showing 1-12 of 27 results
                </p>

                <button
                    type="button"
                    className="inline-flex items-center gap-2 bg-[#222222] px-4 py-2 text-[0.72rem] font-medium uppercase tracking-[0.14em] text-white transition-colors hover:bg-black"
                >
                    Sort by
                    <SlidersHorizontal className="size-3.5" strokeWidth={1.7} />
                </button>
            </div>

            <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 xl:grid-cols-4">
                {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>

            <div className="mt-12 flex items-center justify-center gap-2">
                {[1, 2, 3].map((page) => (
                    <button
                        key={page}
                        type="button"
                        className={`inline-flex h-10 min-w-10 items-center justify-center border px-3 text-[0.75rem] font-semibold uppercase tracking-[0.14em] ${
                            page === 1
                                ? 'border-zinc-900 bg-zinc-900 text-white'
                                : 'border-zinc-300 bg-white text-zinc-700 hover:border-zinc-500'
                        }`}
                    >
                        {page}
                    </button>
                ))}
            </div>
        </div>
    );
}

export default function ShopCatalogSection() {
    return (
        <section className={`${featuresFontClass} bg-white px-5 py-12 sm:px-8 lg:px-12 lg:py-16`}>
            <div className="mx-auto grid w-full max-w-[1700px] gap-8 lg:grid-cols-[280px_1fr] lg:gap-12">
                <ShopSidebar />
                <ShopProductsGrid />
            </div>
        </section>
    );
}