import React from 'react';
import { ShieldCheck, Wrench, LifeBuoy, CheckCircle, MessageCircle, CalendarCheck, UserCheck, RefreshCcw } from 'lucide-react';

const iconColor = '#2dc99d';
const imgContainerStyle = 'flex-shrink-0 flex items-center justify-center rounded-xl p-2.5 bg-gradient-to-br from-secondary-50 to-secondary-100';

const cardClasses = 'bg-white rounded-xl shadow-lg p-8 mb-8 border border-secondary-100 flex items-center gap-8';

const subtitleClasses = 'text-secondary font-bold text-xl mb-3 flex items-center gap-2';

function PreguntasFrecuentes() {
  return (
    <section className={`${cardClasses} flex-col items-start gap-5`}>
      <div className={subtitleClasses}><MessageCircle size={24} color={iconColor} />Preguntas frecuentes</div>
      <div>
        <b>¿Puedo solicitar mantenimiento si no compré el producto en WHC?</b><br />
        Por políticas de garantía y compatibilidad, el servicio de mantenimiento y soporte está disponible exclusivamente para productos adquiridos en WHC Representaciones.
      </div>
      <div>
        <b>¿Cuánto tiempo tarda un mantenimiento?</b><br />
        La duración depende del tipo de equipo y la complejidad, pero la mayoría de servicios se realizan en el mismo día de la visita.
      </div>
      <div>
        <b>¿El mantenimiento tiene garantía?</b><br />
        Sí, todos nuestros servicios cuentan con garantía sobre mano de obra y repuestos originales.
      </div>
      <div>
        <b>¿Puedo agendar el mantenimiento en fin de semana?</b><br />
        Sí, puedes coordinar tu cita según disponibilidad del equipo técnico. Escríbenos para consultar fechas especiales.
      </div>
      <div>
        <b>¿Qué hago si tengo una emergencia?</b><br />
        Contáctanos de inmediato por WhatsApp o teléfono para priorizar tu caso. Atendemos urgencias dentro de Lima Metropolitana.
      </div>
    </section>
  );
}

function BeneficiosExtra() {
  return (
    <ul className="pl-5 m-0 text-lg text-secondary space-y-1">
      <li className="flex items-center gap-2"><UserCheck size={18} color={iconColor} /> Atención personalizada y seguimiento post-servicio.</li>
      <li className="flex items-center gap-2"><CalendarCheck size={18} color={iconColor} /> Puedes programar mantenimientos periódicos.</li>
      <li className="flex items-center gap-2"><RefreshCcw size={18} color={iconColor} /> Servicio de renovación y modernización de equipos sanitarios.</li>
    </ul>
  );
}

function MantenimientoPage() {
  return (
    <div className="px-3 py-10 max-w-[950px] mx-auto text-secondary bg-secondary-50 min-h-screen">
      {/* HERO */}
      <div className="flex flex-col items-center gap-1.5 mb-7">
        <div className="w-[70px] h-[70px] rounded-full flex items-center justify-center mb-3 shadow-lg"
          style={{ background: 'linear-gradient(135deg, #233876 70%, #5e7fd9 100%)' }}>
          <ShieldCheck size={38} color="#fff" />
        </div>
        <h1 className="font-black text-4xl mb-3 tracking-widest text-center text-secondary">
          Soporte y Mantenimiento Profesional
        </h1>
        <p className="text-secondary-300 text-lg text-center font-medium tracking-wide">
          Protege tu inversión: mantenemos tus instalaciones funcionando como nuevas, con respaldo profesional, garantía y atención inmediata.
        </p>
      </div>

      {/* Mantenimiento Preventivo */}
      <div className={cardClasses}>
        <div className={imgContainerStyle}>
          <img src="/assets/mantenimiento1.webp" alt="Mantenimiento Preventivo"
            className="w-[110px] h-[110px] object-cover rounded-lg shadow border-2 border-secondary-100 bg-white transition-transform duration-200 hover:scale-105" />
        </div>
        <div>
          <div className={subtitleClasses}><CheckCircle size={24} color={iconColor} />Mantenimiento Preventivo</div>
          <p>
            Realizamos revisiones periódicas para prevenir fallas, fugas y desgaste en tus sistemas de gasfitería. Incluye limpieza, ajuste y diagnóstico profesional de tuberías, grifería, sanitarios y equipos instalados. <b style={{color: iconColor}}>¡Evita emergencias y alarga la vida útil de tus productos!</b>
          </p>
          <ul className="pl-5 m-0 text-lg text-secondary space-y-1">
            <li>Chequeo de instalaciones y detección de fugas.</li>
            <li>Limpieza y desinfección de componentes.</li>
            <li>Revisión de presión y funcionamiento de sistemas hidráulicos.</li>
          </ul>
        </div>
      </div>

      {/* Mantenimiento Correctivo */}
      <div className={cardClasses}>
        <div className={imgContainerStyle}>
          <img src="/assets/mantenimiento2.jpg" alt="Mantenimiento Correctivo"
            className="w-[110px] h-[110px] object-cover rounded-lg shadow border-2 border-secondary-100 bg-white transition-transform duration-200 hover:scale-105" />
        </div>
        <div>
          <div className={subtitleClasses}><Wrench size={24} color={iconColor} />Mantenimiento Correctivo</div>
          <p>
            ¿Tienes una fuga o un desperfecto? Solucionamos cualquier problema en tus instalaciones: cambio de piezas, reparación de grifería, sanitarios, termas y bombas. Servicio <b style={{color: iconColor}}>rápido, seguro y con garantía</b> WHC Representaciones.
          </p>
          <ul className="pl-5 m-0 text-lg text-secondary space-y-1">
            <li>Reemplazo de piezas dañadas o desgastadas.</li>
            <li>Reparación inmediata de fugas.</li>
            <li>Mantenimiento de termas, bombas y válvulas.</li>
          </ul>
        </div>
      </div>

      {/* Soporte Técnico Especializado */}
      <div className={cardClasses}>
        <div className={imgContainerStyle}>
          <img src="/assets/mantenimiento3.jpg" alt="Soporte Técnico Especializado"
            className="w-[110px] h-[110px] object-cover rounded-lg shadow border-2 border-secondary-100 bg-white transition-transform duration-200 hover:scale-105" />
        </div>
        <div>
          <div className={subtitleClasses}><LifeBuoy size={24} color={iconColor} />Soporte Técnico Especializado</div>
          <p>
            Nuestro equipo te asesora en el uso, instalación y cuidado de todos los productos comprados en <b>WHC Representaciones</b>. Atención personalizada por chat, correo o WhatsApp, para resolver tus dudas y ayudarte siempre.
          </p>
          <ul className="pl-5 m-0 text-lg text-secondary space-y-1">
            <li>Asesoría remota y presencial.</li>
            <li>Capacitación sobre uso óptimo de equipos.</li>
            <li>Diagnóstico de problemas recurrentes.</li>
          </ul>
        </div>
      </div>

      {/* Beneficios */}
      <div className={cardClasses}>
        <div className={imgContainerStyle}>
          <img src="/assets/mantenimiento4.jpg" alt="Beneficios del Servicio"
            className="w-[110px] h-[110px] object-cover rounded-lg shadow border-2 border-secondary-100 bg-white transition-transform duration-200 hover:scale-105" />
        </div>
        <div>
          <div className={subtitleClasses}><ShieldCheck size={24} color={iconColor} />Beneficios de nuestro servicio</div>
          <ul className="pl-5 m-0 text-lg text-secondary space-y-1">
            <li>Extiende la vida útil de tus instalaciones y equipos.</li>
            <li>Previene emergencias y gastos inesperados.</li>
            <li>Atención rápida y profesional, donde nos necesites.</li>
            <li>Uso exclusivo de repuestos originales y materiales de calidad.</li>
            <li>Garantía en todos nuestros trabajos y visitas técnicas.</li>
          </ul>
          <BeneficiosExtra />
        </div>
      </div>

      {/* Preguntas Frecuentes */}
      <PreguntasFrecuentes />

      {/* Solicita tu Servicio */}
      <div className="text-white rounded-xl px-9 py-7 text-center mx-auto mt-9 max-w-[650px] text-lg font-medium shadow-lg tracking-wide"
        style={{ background: 'linear-gradient(90deg, #233876 85%, #5e7fd9 100%)' }}>
        ¿Necesitas mantenimiento o soporte? Solicítalo desde tu área de usuario,{' '}
        <a href="mailto:soporte@whc.com" className="text-white underline">escríbenos</a> o contáctanos por WhatsApp.{' '}
        <span style={{color: iconColor, fontWeight: 700}}>¡Respaldo inmediato, siempre contigo!</span>
        <div className="mt-2.5 text-base opacity-85">
          <b>Horario de atención:</b> Lunes a Sábado de 8:00 a.m. a 7:00 p.m. | Lima y provincias
        </div>
      </div>
      <div className="text-center mt-10 text-secondary-300 text-lg">
        &copy; {new Date().getFullYear()} WHC Representaciones - Todos los derechos reservados.
      </div>
    </div>
  );
}

export default MantenimientoPage;
