import { Link } from 'react-router-dom';

import { featuresFontClass } from '../../utils/typography';

const aboutImage = '/uploads/heroes/images/hero1.webp';

export default function HomeAbout() {
    return (
        <section className={`${featuresFontClass} relative overflow-hidden bg-[#040509] py-14 text-white sm:py-18 lg:py-24`}>
            <div className="pointer-events-none absolute left-4 top-2 select-none text-[clamp(4.2rem,14vw,12rem)] font-light uppercase leading-none tracking-[0.07em] text-white/[0.16] sm:left-8 lg:left-12">
                Timeless
            </div>

            <div className="relative mx-auto w-full max-w-[1380px] px-5 sm:px-8 lg:px-12">
                <article className="grid overflow-hidden border border-white/10 bg-[#0b1118] shadow-[0_35px_95px_rgba(0,0,0,0.5)] md:grid-cols-[1fr_1.05fr]">
                    <div className="relative min-h-[320px] md:min-h-[560px]">
                        <img
                            src={aboutImage}
                            alt="Timeless corporate apparel"
                            className="h-full w-full object-cover object-[46%_center]"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-transparent" />
                    </div>

                    <div className="flex items-center bg-[#ececec] px-8 py-10 text-zinc-900 sm:px-12 md:px-14 lg:px-16">
                        <div className="max-w-[34rem]">
                            <h2 className="font-serif text-[1.5rem] uppercase leading-tight tracking-[0.04em] sm:text-[1.85rem] lg:text-[2.15rem]">
                                Customized Corporate
                                <span className="block">Wear For Modern Teams</span>
                            </h2>

                            <p className="mt-5 text-[1rem] leading-8 text-zinc-600 sm:text-[1.05rem]">
                                Create premium customized apparel designed for teams, businesses,
                                events, and modern workplaces. From corporate uniforms to personalized
                                branding, Timeless Fashion combines comfort, quality, and identity in
                                every piece.
                            </p>

                            <Link
                                to="/shop"
                                className="mt-8 inline-flex items-center justify-center bg-zinc-950 px-8 py-3 text-[0.76rem] font-medium uppercase tracking-[0.22em] text-white transition-colors hover:bg-zinc-800"
                            >
                                Shop collection
                            </Link>
                        </div>
                    </div>
                </article>
            </div>
        </section>
    );
}
