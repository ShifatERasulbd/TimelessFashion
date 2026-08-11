import { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { featuresFontClass } from '../../utils/typography';

const helpItems = [
    {
        title: 'Consultation & Advice',
        description: "We believe in real conversations and practical advice. Tell us what you need, and we'll guide you to the right solution.",
        image: '/uploads/heroes/images/hero1.webp',
        imagePosition: 'object-[42%_center]',
    },
    {
        title: 'Brand Integration',
        description: "Make your mark with custom embroidery, DTF printing and colours that reflect your brand's identity.",
        image: '/uploads/heroes/images/hero1.webp',
        imagePosition: 'object-[50%_22%]',
    },
    {
        title: 'Comprehensive Range',
        description: 'From school and sports to corporate events, we serve multiple industries and customize our services to fit your needs.',
        image: '/uploads/heroes/images/hero1.webp',
        imagePosition: 'object-[70%_center]',
    },
];

export default function HowWeHelp() {
    const [currentIndex, setCurrentIndex] = useState(0);

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev === 0 ? helpItems.length - 1 : prev - 1));
    };

 
    return (
        <section className={`${featuresFontClass} bg-[#F9F9F8] py-20 sm:py-24`}>
            <div className="mx-auto w-full max-w-[1700px] px-6 sm:px-8 lg:px-12">
                {/* Section Header */}
                <div className="mx-auto mb-16 max-w-2xl text-center">
                    <h2 className="text-[3rem] font-normal tracking-tight text-zinc-900 sm:text-[3.5rem]">
                        How we <span className="font-serif italic font-light">help</span>
                    </h2>
                    <div className="mx-auto mt-2 h-[1px] w-48 bg-zinc-300" />
                    <p className="mt-4 text-[1.05rem] leading-relaxed text-zinc-600 sm:text-[1.125rem]">
                        From selecting the right apparel to delivering fully branded uniforms, we make the customization process simple, seamless, and tailored to your business.
                    </p>
                </div>

                {/* Grid of Cards */}
                <div className="grid grid-cols-1 gap-8 md:grid-cols-3 lg:gap-10">
                    {helpItems.map((item, index) => (
                        <div key={index} className="flex flex-col">
                            {/* Image Container */}
                            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-sm bg-zinc-200">
                                <img
                                    src={item.image}
                                    alt={item.title}
                                    className={`h-full w-full object-cover ${item.imagePosition} transition-transform duration-500 hover:scale-105`}
                                />
                            </div>

                            {/* Content */}
                            <div className="mt-6 flex flex-col flex-grow border-b border-zinc-200 pb-8">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-[1.5rem] font-medium tracking-wide text-zinc-900">
                                        {item.title}
                                    </h3>
                                    <span className="flex h-8 w-8 items-center justify-center text-amber-700">
                                        <Plus className="h-5 w-5 font-light" />
                                    </span>
                                </div>
                                <p className="mt-3 text-[1rem] leading-relaxed text-zinc-600">
                                    {item.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

               
            </div>
        </section>
    );
}