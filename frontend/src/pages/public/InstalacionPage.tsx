import React from 'react';
import { Wrench, CheckCircle, ShieldCheck, Users, MessageCircle, ChevronRight, Phone, Mail, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStore } from '../../contexts/StoreContext';

const InstalacionPage: React.FC = () => {
  const { settings } = useStore();
  const companyName = settings?.company_name || 'WHC Representaciones';
  const email = settings?.company_email || 'whcRepresentaciones@gmail.com';
  const whatsapp = settings?.company_whatsapp || '51949790715';
  const phone = settings?.company_phone || '(+51) 949790715';

  const productos = [
    { title: 'Tuberías', desc: 'PVC, PPR, cobre, multicapa' },
    { title: 'Grifería', desc: 'Lavamanos, fregaderos, duchas' },
    { title: 'Sanitarios', desc: 'Inodoros, lavabos, urinarios' },
    { title: 'Termas', desc: 'Calentadores de agua' },
    { title: 'Bombas', desc: 'Sistemas de presión' },
    { title: 'Ecommerce', desc: 'Productos de nuestra tienda' },
  ];

  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <div className="w-16 h-16 mx-auto mb-6 bg-white/10 flex items-center justify-center">
            <Wrench className="w-8 h-8" />
          </div>
          <h1 className="text-3xl md:text-5xl font-bold mb-4">Servicio Profesional de Instalación</h1>
          <p className="text-lg md:text-xl text-blue-200 max-w-2xl mx-auto">
            Soluciones confiables y seguras para tu hogar o empresa con técnicos certificados.
          </p>
        </div>
      </section>

      {/* Servicio */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white shadow p-8">
              <h2 className="text-xl font-bold text-gray-800 mb-4">¿En qué consiste nuestro servicio?</h2>
              <p className="text-gray-600 leading-relaxed">
                En <strong>{companyName}</strong> ofrecemos instalación profesional de sistemas de gasfitería: tuberías, grifería, sanitarios, termas y más. Nuestro equipo técnico garantiza un trabajo seguro, limpio y conforme a las normas técnicas.
              </p>
            </div>
            <div className="bg-white shadow p-8">
              <h2 className="text-xl font-bold text-gray-800 mb-4">¿Por qué elegirnos?</h2>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-blue-700 mt-0.5 shrink-0" />
                  <span><strong>Personal certificado:</strong> Técnicos calificados con experiencia comprobada.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-blue-700 mt-0.5 shrink-0" />
                  <span><strong>Calidad de materiales:</strong> Solo primeras marcas y productos garantizados.</span>
                </li>
                <li className="flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-blue-700 mt-0.5 shrink-0" />
                  <span><strong>Garantía real:</strong> Cobertura post-servicio en cada instalación.</span>
                </li>
                <li className="flex items-start gap-3">
                  <MessageCircle className="w-5 h-5 text-blue-700 mt-0.5 shrink-0" />
                  <span><strong>Asesoría personalizada:</strong> Soluciones adaptadas a tu presupuesto.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Productos que instalamos */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-8">¿Qué productos instalamos?</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {productos.map((p, i) => (
              <div key={i} className="bg-gray-50 p-5 text-center hover:bg-blue-50 transition">
                <h3 className="font-semibold text-gray-800 mb-1">{p.title}</h3>
                <p className="text-sm text-gray-500">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cómo solicitar */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-8">¿Cómo solicitar la instalación?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
            {[
              { step: '1', title: 'Compra', desc: 'Compra tu producto en nuestra tienda' },
              { step: '2', title: 'Selecciona', desc: 'Agrega el servicio de instalación al carrito' },
              { step: '3', title: 'Coordina', desc: 'Agendamos la visita de instalación' },
              { step: '4', title: 'Instala', desc: 'Técnicos realizan el servicio' },
              { step: '5', title: 'Garantía', desc: 'Verificamos y entregamos garantía' },
            ].map((s) => (
              <div key={s.step} className="text-center">
                <div className="w-10 h-10 mx-auto mb-3 bg-blue-900 text-white flex items-center justify-center text-lg font-bold">{s.step}</div>
                <h3 className="font-semibold text-gray-800 text-sm mb-1">{s.title}</h3>
                <p className="text-xs text-gray-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-8">Preguntas frecuentes</h2>
          <div className="space-y-4">
            {[
              { q: '¿Puedo pedir instalación si ya tengo el producto?', a: `Solo instalamos productos comprados en ${companyName} para garantizar compatibilidad y respaldo.` },
              { q: '¿La instalación tiene costo adicional?', a: 'El costo se muestra en el carrito y puede variar según producto y ubicación.' },
              { q: '¿Ofrecen mantenimiento?', a: 'Sí, revisa nuestra sección de mantenimiento.' },
            ].map((faq, i) => (
              <div key={i} className="bg-gray-50 p-5">
                <h3 className="font-semibold text-gray-800 mb-1">{faq.q}</h3>
                <p className="text-gray-600 text-sm">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recomendaciones */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-8">Recomendaciones</h2>
          <div className="space-y-3">
            {[
              'Asegúrate de que el área esté despejada y accesible.',
              'Verifica que cuentes con los servicios básicos necesarios (agua, desagüe, energía eléctrica).',
              '¿Tienes dudas de compatibilidad? Consulta con nuestro equipo antes de la instalación.',
            ].map((r, i) => (
              <div key={i} className="flex items-start gap-3">
                <ChevronRight className="w-5 h-5 text-blue-700 mt-0.5 shrink-0" />
                <span className="text-gray-600">{r}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-blue-900 to-blue-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">¿Listo para tu instalación?</h2>
          <p className="text-blue-200 mb-8 max-w-xl mx-auto">Contáctanos y te asesoramos sin compromiso</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href={`mailto:${email}`} className="flex items-center gap-2 bg-white text-blue-900 px-6 py-3 font-semibold hover:bg-gray-100 transition">
              <Mail className="w-4 h-4" /> {email}
            </a>
            <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-green-500 text-white px-6 py-3 font-semibold hover:bg-green-600 transition">
              <Phone className="w-4 h-4" /> {phone}
            </a>
            <Link to="/productos" className="flex items-center gap-2 border border-white text-white px-6 py-3 font-semibold hover:bg-white/10 transition">
              Ver productos <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default InstalacionPage;
