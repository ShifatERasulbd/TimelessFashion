import InstagramSection from '../components/InstagramSection.jsx';
import NewsletterSection from '../components/NewsletterSection.jsx';
import ShopCatalogSection from '../components/ShopCatalogSection.jsx';
import ShopHeroSection from '../components/ShopHeroSection.jsx';

export default function ShopPage() {
    return (
        <>
            <ShopHeroSection />
            <ShopCatalogSection />
            <NewsletterSection />
            <InstagramSection />
        </>
    );
}
