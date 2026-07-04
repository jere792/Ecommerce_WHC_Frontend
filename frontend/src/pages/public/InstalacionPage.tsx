import React from 'react';
import { Wrench, CheckCircle, ShieldCheck, Users, MessageCircle, ChevronRight } from 'lucide-react';

const Card: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="bg-white rounded-xl shadow-xl p-8 mb-8 border border-secondary-100 max-w-[750px] mx-auto">
    {children}
  </div>
);

const iconList = [
  <Users size={18} className="text-secondary mr-2 inline align-middle" />,
  <CheckCircle size={18} className="text-secondary mr-2 inline align-middle" />,
  <ShieldCheck size={18} className="text-secondary mr-2 inline align-middle" />,
  <MessageCircle size={18} className="text-secondary mr-2 inline align-middle" />,
];

const InstalacionPage: React.FC = () => (
  <div className="px-3 py-10 max-w-[930px] mx-auto text-secondary">
    {/* HERO */}
    <div className="flex flex-col items-center gap-1.5 mb-6">
      <div className="w-16 h-16 rounded-full flex items-center justify-center mb-3 shadow-lg"
        style={{ background: 'linear-gradient(100deg, #233876 60%, #4f6dbe 100%)' }}>
        <Wrench size={36} color="#fff" />
      </div>
      <h1 className="font-extrabold text-4xl mb-1 tracking-wide text-secondary">Servicio Profesional de Instalación</h1>
      <p className="text-secondary-300 text-lg text-center font-medium tracking-wide">
        Soluciones confiables y seguras para tu hogar o empresa con técnicos certificados.
      </p>
    </div>

    {/* ¿En qué consiste nuestro servicio? */}
    <Card>
      <h2 className="text-secondary font-bold text-xl mb-4">¿En qué consiste nuestro servicio?</h2>
      <p className="text-lg">
        En <b>WHC Representaciones</b> ofrecemos instalación profesional de sistemas de gasfitería: tuberías, grifería, sanitarios, termas y más. Nuestro equipo técnico garantiza un trabajo seguro, limpio y conforme a las normas técnicas, con atención a detalle en cada proyecto.
      </p>
    </Card>

    {/* ¿Por qué elegirnos? */}
    <Card>
      <h2 className="text-secondary font-bold text-xl mb-4">¿Por qué elegirnos?</h2>
      <ul className="list-none pl-0 space-y-2.5">
        <li className="flex items-center">{iconList[0]}<b>Personal certificado:</b> Técnicos calificados y experiencia comprobada.</li>
        <li className="flex items-center">{iconList[1]}<b>Calidad de materiales:</b> Solo primeras marcas y productos garantizados.</li>
        <li className="flex items-center">{iconList[2]}<b>Garantía real:</b> Cobertura post-servicio y prueba de funcionamiento en cada instalación.</li>
        <li className="flex items-center">{iconList[3]}<b>Asesoría personalizada:</b> Soluciones adaptadas a tu necesidad y presupuesto.</li>
      </ul>
    </Card>

    {/* ¿Qué productos instalamos? */}
    <Card>
      <h2 className="text-secondary font-bold text-xl mb-4">¿Qué productos instalamos?</h2>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-2 text-lg">
        {[
          'Tuberías (PVC, PPR, cobre, multicapa)',
          'Grifería (lavamanos, fregaderos, duchas, etc.)',
          'Sanitarios (inodoros, lavabos, urinarios)',
          'Termas y calentadores de agua',
          'Bombas y sistemas de presión',
          'Otros equipos comprados en nuestro ecommerce',
        ].map((text, i) => (
          <div key={i} className="flex items-center mb-1.5">
            <ChevronRight size={18} className="text-secondary mr-[7px] shrink-0" />
            {text}
          </div>
        ))}
      </div>
    </Card>

    {/* ¿Cómo solicitar la instalación? */}
    <Card>
      <h2 className="text-secondary font-bold text-xl mb-4">¿Cómo solicitar la instalación?</h2>
      <ol className="pl-4 m-0 text-lg space-y-2">
        <li><b>Compra tu producto:</b> Realiza la compra de cualquier artículo con opción de instalación.</li>
        <li><b>Selecciona el servicio de instalación:</b> Agrégalo al carrito o solicita cotización personalizada.</li>
        <li><b>Coordinación:</b> Nuestro equipo te contactará para agendar la visita de instalación.</li>
        <li><b>Instalación:</b> Técnicos certificados realizarán el servicio en la fecha acordada.</li>
        <li><b>Prueba y garantía:</b> Verificamos el funcionamiento y entregamos garantía.</li>
      </ol>
    </Card>

    {/* Recomendaciones antes de la instalación */}
    <Card>
      <h2 className="text-secondary font-bold text-xl mb-4">Recomendaciones antes de la instalación</h2>
      <ul className="list-none pl-0 space-y-2">
        <li className="flex items-center"><ChevronRight size={18} className="text-secondary mr-[7px] shrink-0" />Asegúrate de que el área esté despejada y accesible.</li>
        <li className="flex items-center"><ChevronRight size={18} className="text-secondary mr-[7px] shrink-0" />Verifica que cuentes con los servicios básicos necesarios (agua, desagüe, energía eléctrica si corresponde).</li>
        <li className="flex items-center"><ChevronRight size={18} className="text-secondary mr-[7px] shrink-0" />¿Tienes dudas de compatibilidad? Consulta con nuestro equipo antes de la instalación.</li>
      </ul>
    </Card>

    {/* Preguntas frecuentes */}
    <Card>
      <h2 className="text-secondary font-bold text-xl mb-4">Preguntas frecuentes</h2>
      <div className="mb-3 text-base">
        <b>¿Puedo pedir instalación si ya tengo el producto?</b><br />
        Solo instalamos productos comprados en WHC Representaciones para garantizar compatibilidad y respaldo.
      </div>
      <div className="mb-3 text-base">
        <b>¿La instalación tiene costo adicional?</b><br />
        El costo se muestra en el carrito y puede variar según producto y ubicación.
      </div>
      <div className="text-base">
        <b>¿Ofrecen mantenimiento?</b><br />
        Sí, revisa nuestra sección de <a href="/mantenimiento" className="text-secondary underline">Mantenimiento</a>.
      </div>
    </Card>

    {/* Contacto */}
    <div className="text-white rounded-xl px-8 py-7 text-center mx-auto mt-8 max-w-[700px] text-lg font-medium shadow-lg"
      style={{ background: 'linear-gradient(90deg, #233876 80%, #4f6dbe 100%)' }}>
      ¿Tienes dudas? Escribe a <a href="mailto:soporte@whc.com" className="text-white underline">soporte@whs.com</a> o contáctanos por WhatsApp.
    </div>
  </div>
);

export default InstalacionPage;
