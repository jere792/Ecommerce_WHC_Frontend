import { Building2, Shield, Truck, Headphones } from 'lucide-react';

export const ContactHero = () => {
  return (
    <section className="bg-gradient-to-b from-blue-900 to-blue-800 text-white py-16">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-3xl md:text-5xl font-bold mb-4">¿Quiénes Somos?</h1>
        <p className="text-lg md:text-xl text-blue-200 max-w-2xl mx-auto mb-12">
          WHC Representaciones — Soluciones profesionales de gasfitería para proyectos residenciales, comerciales e industriales.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          {[
            { icon: Building2, label: '+20 años', desc: 'de experiencia' },
            { icon: Shield, label: 'Certificados', desc: 'productos de calidad' },
            { icon: Truck, label: 'Entrega rápida', desc: 'a todo el Perú' },
            { icon: Headphones, label: 'Asesoría', desc: 'técnica personalizada' },
          ].map((item) => (
            <div key={item.label} className="bg-white/10 backdrop-blur rounded-xl p-4 text-center">
              <item.icon className="w-8 h-8 mx-auto mb-2 text-blue-300" />
              <div className="font-bold text-lg">{item.label}</div>
              <div className="text-sm text-blue-200">{item.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ContactHero;
