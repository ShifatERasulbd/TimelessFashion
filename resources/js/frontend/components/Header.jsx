import { Menu, Search, ShoppingCart, SlidersHorizontal, UserRound } from 'lucide-react';
import { Link } from 'react-router-dom';

import { timelessFontClass } from '../../utils/typography';

const navigationItems = [
    { label: 'Best Sellers', href: '#best-sellers' },
    { label: 'Shop', href: '#shop' },
    { label: 'About', href: '#about' },
    { label: 'Contact', href: '#contact' },
];

const utilityIcons = [
    { label: 'Account', icon: UserRound, href: '#account' },
    { label: 'Search', icon: Search, href: '#search' },
    { label: 'Cart', icon: ShoppingCart, href: '#cart' },
];

export default function Header() {
    return (
        <header className={`${timelessFontClass} sticky top-0 z-50 border-b border-zinc-200 bg-[#f4f2ed]/95 text-zinc-950 backdrop-blur`}>
            <div className="mx-auto flex h-[90px] max-w-[1920px] items-center gap-4 px-4 sm:px-6 lg:px-10">
                <Link
                    to="/"
                    className="flex min-w-0 items-center text-[1.65rem] font-black tracking-[0.22em] text-zinc-950 transition-opacity hover:opacity-80 sm:text-[1.9rem]"
                    aria-label="Timeless home"
                >
                    TIMLESS
                </Link>

                <nav className="hidden flex-1 items-center justify-center gap-10 xl:flex" aria-label="Primary">
                    {navigationItems.map((item) => (
                        <a
                            key={item.label}
                            href={item.href}
                            className="text-[0.85rem] font-medium uppercase tracking-[0.22em] text-zinc-950 transition-opacity hover:opacity-60"
                        >
                            {item.label}
                        </a>
                    ))}
                </nav>

                <div className="ml-auto flex items-center gap-2 sm:gap-3">
                    <a
                        href="#customize"
                        className="inline-flex items-center gap-2 rounded-sm bg-black px-3.5 py-2 text-[0.78rem] font-semibold uppercase tracking-[0.2em] text-white transition-transform hover:-translate-y-0.5 hover:bg-zinc-800 sm:px-4"
                    >
                        <SlidersHorizontal className="size-4 shrink-0" />
                        <span className="whitespace-nowrap">Start Customizing</span>
                    </a>

                    <div className="hidden items-center gap-1 md:flex">
                        {utilityIcons.map(({ label, icon: Icon, href }) => (
                            <a
                                key={label}
                                href={href}
                                aria-label={label}
                                className="inline-flex size-11 items-center justify-center rounded-full text-zinc-950 transition-colors hover:bg-white/70 hover:text-zinc-700"
                            >
                                <Icon className="size-5" strokeWidth={1.75} />
                            </a>
                        ))}
                    </div>

                    <button
                        type="button"
                        className="inline-flex size-11 items-center justify-center rounded-full text-zinc-950 transition-colors hover:bg-white/70 md:hidden"
                        aria-label="Open menu"
                    >
                        <Menu className="size-5" strokeWidth={1.75} />
                    </button>
                </div>
            </div>
        </header>
    );
}