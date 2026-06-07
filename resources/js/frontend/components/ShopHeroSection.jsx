import { Link } from 'react-router-dom';

import { featuresFontClass } from '../../utils/typography';

export default function ShopHeroSection() {
    return (
        <section className={`${featuresFontClass} border-b border-zinc-200 bg-zinc-900 px-5 py-14 text-white sm:px-8 sm:py-16 lg:px-12 lg:py-20`}>
            <div className="mx-auto w-full max-w-[1480px]">
                <p className="text-[0.75rem] uppercase tracking-[0.2em] text-zinc-300">
                    <Link to="/" className="transition-colors hover:text-white">
                        Home
                    </Link>{' '}
                    / Shop
                </p>
                <h1 className="mt-4 font-serif text-[2.6rem] uppercase tracking-[0.06em] sm:text-[3.6rem]">
                    Shop
                </h1>
                <p className="mt-3 max-w-[65ch] text-[1.02rem] leading-7 text-zinc-300">
                    Browse premium apparel built for teams, events, and modern brands. Every style is ready for customization.
                </p>
            </div>
        </section>
    );
}
