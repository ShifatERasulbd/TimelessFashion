import { Suspense, lazy } from 'react';

import SectionSkeleton from '../components/SectionSkeleton.jsx';

const Hero = lazy(() => import('../components/Hero.jsx'));
const Features = lazy(() => import('../components/Features.jsx'));
const ShopByEvent = lazy(() => import('../components/ShopByEvent.jsx'));
const Customizer = lazy(() => import('../components/Customizer.jsx'));
const NewArrivals = lazy(() => import('../components/NewArrivals.jsx'));
const BestSellingProducts = lazy(() => import('../components/BestSellingProducts.jsx'));
const HomeAbout = lazy(() => import('../components/HomeAbout.jsx'));
const NewsletterSection = lazy(() => import('../components/NewsletterSection.jsx'));
const InstagramSection = lazy(() => import('../components/InstagramSection.jsx'));

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
            <LazySection heightClass="h-[520px]">
                <Customizer />
            </LazySection>
            <LazySection heightClass="h-[620px]">
                <NewArrivals />
            </LazySection>
            <LazySection heightClass="h-[540px]">
                <BestSellingProducts />
            </LazySection>
            <LazySection heightClass="h-[420px]">
                <HomeAbout />
            </LazySection>
            <LazySection heightClass="h-[220px]">
                <NewsletterSection />
            </LazySection>
            <LazySection heightClass="h-[320px]">
                <InstagramSection />
            </LazySection>
        </>
    );
}