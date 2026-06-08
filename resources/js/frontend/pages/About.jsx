
import AboutHeroSection from '../components/AboutHeroSection.jsx';
import Features from '../components/Features.jsx';
import TimelessAboutSection from '../components/TimelessAboutSection.jsx';
import OurStory from '../components/OurStory.jsx';
import OurMission from '../components/OurMission.jsx';
export default function AboutPage() {
    return (
        <div className="bg-white">
            <AboutHeroSection />
            <Features />
            <TimelessAboutSection />
            <OurStory />
            <OurMission />
            
        </div>
    );
}