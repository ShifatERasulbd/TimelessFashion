import { Suspense, lazy } from 'react';

import SectionSkeleton from '../components/SectionSkeleton.jsx';

const Hero = lazy(() => import('../components/Hero.jsx'));
const Features = lazy(() => import('../components/Features.jsx'));
const ShopByEvent = lazy(() => import('../components/ShopByEvent.jsx'));
const Customizer = lazy(() => import('../components/Customizer.jsx'));
const HowWeHelp = lazy(() => import('../components/HowWeHelp.jsx'));
const ShopByProduct = lazy(() => import('../components/ShopByProduct.jsx'));

function LazySection({ children, heightClass }) {
    return <Suspense fallback={<SectionSkeleton heightClass={heightClass} />}>{children}</Suspense>;
}

export default function HomePage() {
    return (
        <>
            <LazySection heightClass="h-[520px]">
                <Hero />
            </LazySection>
            <LazySection heightClass="h-[300px]">
                <Features />
            </LazySection>
            <LazySection heightClass="h-[420px]">
                <ShopByEvent />
            </LazySection>
            <LazySection heightClass="h-[420px]">
                <HowWeHelp />
            </LazySection>
            <LazySection heightClass="h-[420px]">
                <ShopByProduct />
            </LazySection>
            <LazySection heightClass="h-[520px]">
                <Customizer />
            </LazySection>
            
        </>
    );
}