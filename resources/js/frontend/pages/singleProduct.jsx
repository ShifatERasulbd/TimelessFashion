import InstagramSection from '../components/InstagramSection.jsx';
import NewsletterSection from '../components/NewsletterSection.jsx';
import SingleProductInfoTabs from '../components/SingleProductInfoTabs.jsx';
import SingleProductMainSection from '../components/SingleProductMainSection.jsx';

export default function SingleProductPage() {
    return (
        <div className="bg-white">
            <SingleProductMainSection />
            <SingleProductInfoTabs />
            <NewsletterSection />
            <InstagramSection />
        </div>
    );
}
