import PageHeroBanner from '../components/ui/PageHero';
import { ContactSection } from '../components/Contact/ContactSection';
import { Publicidad } from '../components/ui/Publicidad';
import Marcas from '../components/ui/Marcas';

const ContactPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <PageHeroBanner pagina="contacto" />
      <Publicidad textoPromocional="Delivery gratis a compras mayores a 200" />
      <ContactSection />
      <Publicidad textoPromocional="Mercado en línea - Los mejores productos al mejor precio" />
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto bg-gradient-to-br from-blue-50 to-white rounded-xl shadow-lg overflow-hidden border border-blue-100">
          <div className="p-6">
            <h2 className="text-xl font-bold text-blue-900 text-center mb-4">SLOAN - Video instructivo</h2>
            <video
              controls
              width="100%"
              height="400"
              className="mx-auto rounded-lg bg-black"
              poster="/assets/video-poster.jpg"
            >
              <source src="../assets/Sloan TruFlush Instalación  Español.mp4" type="video/mp4" />
              Tu navegador no soporta el tag de video.
            </video>
          </div>
        </div>
      </div>
      <Marcas />
    </div>
  );
};

export default ContactPage;
