
import AboutHeroSection from '../components/AboutHeroSection.jsx';
import Features from '../components/Features.jsx';
import TimelessAboutSection from '../components/TimelessAboutSection.jsx';
import OurStory from '../components/OurStory.jsx';
import OurMission from '../components/OurMission.jsx';
import TestimonialSection from '../components/TestimonialSection.jsx';
import NewsletterSection from '../components/NewsletterSection.jsx';
import InstagramSection from '../components/InstagramSection.jsx';
export default function AboutPage() {
    return (
        <div className="bg-white">
            <AboutHeroSection />
            <Features />
            <TimelessAboutSection />
            <OurStory />
            <OurMission />
            <TestimonialSection />
            <NewsletterSection />
            <InstagramSection />
        </div>
    );
}