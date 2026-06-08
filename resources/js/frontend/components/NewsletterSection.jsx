import { featuresFontClass } from '../../utils/typography';

const watermarkRows = [
    'TIMELESS TIMELESS TIMELESS TIMELESS',
    'TIMELESS TIMELESS TIMELESS TIMELESS',
    'TIMELESS TIMELESS TIMELESS TIMELESS',
    'TIMELESS TIMELESS TIMELESS TIMELESS',
];

export default function NewsletterSection() {
    return (
        <section
            className={`${featuresFontClass} relative overflow-hidden bg-gray-100 py-16 sm:py-20 lg:py-24`}
        >
            <div className="pointer-events-none absolute inset-0">
                <div className="flex h-full flex-col justify-between px-2 text-[clamp(2.7rem,8vw,5.6rem)] font-light uppercase leading-none tracking-[0.08em] text-zinc-300/[0.35]">
                    {watermarkRows.map((row, index) => (
                        <p
                            key={`newsletter-watermark-${index}`}
                            className="whitespace-nowrap"
                        >
                            {row}
                        </p>
                    ))}
                </div>
            </div>

            <div className="relative mx-auto w-full max-w-[980px] px-5 sm:px-8">
                <h2 className="text-center font-serif text-[2rem] uppercase tracking-[0.04em] text-zinc-900 sm:text-[2.5rem]">
                    Sign Up For Our Newsletter
                </h2>

                <form
                    className="mt-8 space-y-4"
                    onSubmit={(event) => {
                        event.preventDefault();
                    }}
                >
                    <label htmlFor="newsletter-email" className="sr-only">
                        Your e-mail address
                    </label>

                    <input
                        id="newsletter-email"
                        type="email"
                        placeholder="Your e-mail address"
                        className="h-16 w-full border border-zinc-300 bg-white px-6 text-[1rem] text-zinc-700 outline-none transition-colors placeholder:text-zinc-500 focus:border-zinc-500"
                    />

                    <button
                        type="submit"
                        className="mx-auto block h-14 w-full max-w-[420px] bg-[#06070b] px-6 text-[1rem] font-semibold uppercase tracking-[0.18em] text-white transition-colors hover:bg-black"
                    >
                        Sign Up
                    </button>
                </form>
            </div>
        </section>
    );
}