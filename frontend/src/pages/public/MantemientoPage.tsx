import React from 'react';
import { ShieldCheck, Wrench, LifeBuoy, CheckCircle, MessageCircle, CalendarCheck, UserCheck, RefreshCcw, Mail, Phone, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStore } from '../../contexts/StoreContext';

function MantenimientoPage() {
  const { settings } = useStore();
  const companyName = settings?.nombre_empresa;
  const email = settings?.correo_empresa;
  const whatsapp = settings?.whatsapp_empresa;
  const phone = settings?.telefono_empresa;

  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <div className="w-16 h-16 mx-auto mb-6 bg-white/10 flex items-center justify-center">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-3xl md:text-5xl font-bold mb-4">Soporte y Mantenimiento</h1>
          <p className="text-lg md:text-xl text-blue-200 max-w-2xl mx-auto">
            Protege tu inversión: mantenemos tus instalaciones funcionando como nuevas, con respaldo profesional y garantía.
          </p>
        </div>
      </section>

      {/* Servicios */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: CheckCircle, title: 'Mantenimiento Preventivo', items: ['Chequeo de instalaciones y detección de fugas', 'Limpieza y desinfección de componentes', 'Revisión de presión y sistemas hidráulicos'] },
              { icon: Wrench, title: 'Mantenimiento Correctivo', items: ['Reemplazo de piezas dañadas', 'Reparación inmediata de fugas', 'Mantenimiento de termas y bombas'] },
              { icon: LifeBuoy, title: 'Soporte Técnico', items: ['Asesoría remota y presencial', 'Capacitación sobre uso de equipos', 'Diagnóstico de problemas recurrentes'] },
            ].map((s, i) => (
              <div key={i} className="bg-white shadow p-6">
                <div className="w-12 h-12 bg-blue-50 flex items-center justify-center mb-4">
                  <s.icon className="w-6 h-6 text-blue-700" />
                </div>
                <h3 className="font-bold text-gray-800 mb-3">{s.title}</h3>
                <ul className="space-y-2">
                  {s.items.map((item, j) => (
                    <li key={j} className="text-sm text-gray-600 flex items-start gap-2">
                      <span className="text-blue-700 mt-0.5">•</span> {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Beneficios */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-8">Beneficios de nuestro servicio</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: UserCheck, text: 'Atención personalizada y seguimiento post-servicio' },
              { icon: CalendarCheck, text: 'Programa mantenimientos periódicos' },
              { icon: RefreshCcw, text: 'Renovación y modernización de equipos' },
              { icon: ShieldCheck, text: 'Garantía en todos nuestros trabajos' },
              { icon: CheckCircle, text: 'Uso exclusivo de repuestos originales' },
              { icon: LifeBuoy, text: 'Atención rápida donde nos necesites' },
            ].map((b, i) => (
              <div key={i} className="flex items-start gap-3 p-4 bg-gray-50">
                <b.icon className="w-5 h-5 text-blue-700 mt-0.5 shrink-0" />
                <span className="text-sm text-gray-700">{b.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Preguntas frecuentes */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-8">Preguntas frecuentes</h2>
          <div className="space-y-4">
            {[
              { q: '¿Puedo solicitar mantenimiento si no compré en WHC?', a: `Por políticas de garantía, el servicio está disponible exclusivamente para productos adquiridos en ${companyName}.` },
              { q: '¿Cuánto tiempo tarda un mantenimiento?', a: 'Depende del equipo, pero la mayoría se realizan el mismo día de la visita.' },
              { q: '¿El mantenimiento tiene garantía?', a: 'Sí, todos nuestros servicios cuentan con garantía sobre mano de obra y repuestos.' },
              { q: '¿Puedo agendar en fin de semana?', a: 'Sí, según disponibilidad del equipo técnico. Contáctanos para consultar fechas.' },
              { q: '¿Qué hago si tengo una emergencia?', a: 'Contáctanos por WhatsApp o teléfono para priorizar tu caso. Atendemos urgencias en Lima Metropolitana.' },
            ].map((faq, i) => (
              <div key={i} className="bg-white p-5 shadow-sm">
                <h3 className="font-semibold text-gray-800 mb-1">{faq.q}</h3>
                <p className="text-gray-600 text-sm">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-blue-900 to-blue-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">¿Necesitas mantenimiento?</h2>
          <p className="text-blue-200 mb-8 max-w-xl mx-auto">Solicítalo y te atendemos de inmediato</p>
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
}

export default MantenimientoPage;
