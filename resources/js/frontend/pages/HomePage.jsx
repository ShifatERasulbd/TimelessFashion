import Features from '../components/Features.jsx';
import Hero from '../components/Hero.jsx';
import HomeAbout from '../components/HomeAbout.jsx';
import ShopByEvent from '../components/ShopByEvent.jsx';
import Customizer from '../components/Customizer.jsx';
import NewArrivals from '../components/NewArrivals.jsx';
import BestSellingProducts from '../components/BestSellingProducts.jsx';
import NewsletterSection from '../components/NewsletterSection.jsx';
import InstagramSection from '../components/InstagramSection.jsx';

export default function HomePage() {
    return (
        <>
           
            <Hero />
           
            <Features />
            <ShopByEvent />
            <Customizer />
            <NewArrivals />
            <BestSellingProducts />
            <HomeAbout />
            <NewsletterSection />
            <InstagramSection />
        </>
    );
}