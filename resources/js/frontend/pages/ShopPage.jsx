import { Suspense, lazy } from 'react';

import SectionSkeleton from '../components/SectionSkeleton.jsx';


const ShopCatalogSection = lazy(() => import('../components/ShopCatalogSection.jsx'));


function LazySection({ children, heightClass }) {
    return <Suspense fallback={<SectionSkeleton heightClass={heightClass} />}>{children}</Suspense>;
}

export default function ShopPage() {
    return (
        <div className="bg-white">
          
            <LazySection heightClass="h-[760px]">
                <ShopCatalogSection />
            </LazySection>
        
        </div>
    );
}
