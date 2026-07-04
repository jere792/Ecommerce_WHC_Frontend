import PageHeroBanner from '../components/ui/PageHero';
import { ContactSection } from '../components/Contact/ContactSection';
import Marcas from '../components/ui/Marcas';

const ContactPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <PageHeroBanner pagina="contacto" />
      <ContactSection />
      <Marcas />
    </div>
  );
};

export default ContactPage;
