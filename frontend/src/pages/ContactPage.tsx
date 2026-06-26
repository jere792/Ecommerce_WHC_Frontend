import PageHeroBanner from '../components/ui/PageHero';
import { ContactSection } from '../components/Contact/ContactSection';
import { Publicidad } from '../components/ui/Publicidad';
import Marcas from '../components/ui/Marcas';

const ContactPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <PageHeroBanner pagina="contacto" />
      <Publicidad textoPromocional="Delivery gratis a compras mayores a S/.200" />
      <ContactSection />
      <Publicidad textoPromocional="Mercado en línea - Los mejores productos al mejor precio" />

      <Marcas />
    </div>
  );
};

export default ContactPage;
