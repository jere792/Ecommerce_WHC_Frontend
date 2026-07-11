import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useStore } from '../../contexts/StoreContext';
import { Mail, Phone, MapPin, Clock, Send } from 'lucide-react';

const MOTIVOS = [
  "Consulta general",
  "Cotización",
  "Instalación",
  "Soporte técnico",
  "Reclamo",
  "Otro",
];

export const ContactSection = () => {
  const { settings } = useStore();
  const [nombre, setNombre] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [correo, setCorreo] = useState("");
  const [telefono, setTelefono] = useState("");
  const [motivo, setMotivo] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!nombre || !correo || !mensaje) {
      setError("Por favor, completa los campos obligatorios.");
      return;
    }

    setEnviando(true);

    try {
      const { error: insertError } = await supabase.from('formulario').insert({
        nombre_formulario: `${nombre} ${apellidos}`,
        dni_formulario: "",
        correo_formulario: correo,
        telefono_formulario: telefono,
        pk_tipo_formulario: 5,
        pk_estado_formulario: 1,
        text_estado: `[${motivo || "Sin motivo"}] ${mensaje}`,
      });

      if (insertError) throw insertError;

      setNombre("");
      setApellidos("");
      setCorreo("");
      setTelefono("");
      setMotivo("");
      setMensaje("");
      setSuccess("¡Tu mensaje fue enviado correctamente! Te responderemos pronto.");
    } catch (err) {
      console.error(err);
      setError("Ocurrió un error al enviar tu mensaje. Inténtalo nuevamente.");
    } finally {
      setEnviando(false);
    }
  };

  const phone = settings?.telefono_empresa || '(+51) 949790715';
  const whatsapp = settings?.whatsapp_empresa || '51949790715';
  const email = settings?.correo_empresa || 'whcRepresentaciones@gmail.com';
  const address = settings?.direccion_empresa || 'Los Rubies 295, La Victoria, Lima';
  const schedule = settings?.horario_empresa || 'Lun - Vie: 9:00 a.m. - 6:00 p.m.';
  const mapsUrl = settings?.url_google_maps ||
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3903.594488711491!2d-77.08852892439776!3d-12.06438884214716!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9105c849a17412b7%3A0x316342a24980719b!2sLos%20Rubies%20295%2C%20Lima%2015034!5e0!3m2!1ses-419!2spe!4v1713538117347!5m2!1ses-419!2spe';

  const contactInfo = [
    { icon: Phone, label: "Teléfono", value: phone, href: `tel:+${whatsapp}` },
    { icon: Mail, label: "Correo", value: email, href: `mailto:${email}` },
    { icon: MapPin, label: "Dirección", value: address },
    { icon: Clock, label: "Horario", value: schedule },
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-blue-900 mb-2">Contáctanos</h2>
          <p className="text-gray-600">Estamos listos para ayudarte con tu proyecto</p>
        </div>

        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
            <h3 className="text-lg font-semibold text-gray-800">Información de contacto</h3>
            <div className="space-y-4">
              {contactInfo.map((item) => (
                <div key={item.label} className="flex items-start gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <item.icon className="w-5 h-5 text-blue-700" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">{item.label}</div>
                    {item.href ? (
                      <a href={item.href} className="text-blue-700 hover:underline font-medium">
                        {item.value}
                      </a>
                    ) : (
                      <div className="text-gray-800 font-medium">{item.value}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Ubicación</h3>
              <div className="rounded-lg overflow-hidden shadow h-64">
                <iframe
                  title="Ubicación"
                  src={mapsUrl}
                  className="w-full h-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-6">Envíanos un mensaje</h3>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    placeholder="Tu nombre"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-gray-50/50"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Apellidos <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    placeholder="Tus apellidos"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-gray-50/50"
                    value={apellidos}
                    onChange={(e) => setApellidos(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Motivo</label>
                  <select
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-gray-50/50 text-gray-700"
                    value={motivo}
                    onChange={(e) => setMotivo(e.target.value)}
                  >
                    <option value="">Seleccionar motivo</option>
                    {MOTIVOS.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Teléfono</label>
                  <input
                    type="tel"
                    placeholder="+51 999 999 999"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-gray-50/50"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Correo <span className="text-red-500">*</span></label>
                <input
                  type="email"
                  placeholder="correo@ejemplo.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-gray-50/50"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Mensaje <span className="text-red-500">*</span></label>
                <textarea
                  placeholder="Escribe tu mensaje aquí..."
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none bg-gray-50/50"
                  value={mensaje}
                  onChange={(e) => setMensaje(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                className={`w-full bg-gradient-to-r from-blue-700 to-blue-500 text-white px-6 py-3.5 rounded-xl hover:from-blue-800 hover:to-blue-600 transition font-semibold flex items-center justify-center gap-2 shadow-md hover:shadow-lg ${enviando ? "opacity-50 cursor-not-allowed" : ""}`}
                disabled={enviando}
              >
                <Send className="w-4 h-4" />
                {enviando ? "Enviando..." : "Enviar mensaje"}
              </button>
              {error && <p className="text-red-600 text-sm bg-red-50 px-4 py-2 rounded-lg">{error}</p>}
              {success && <p className="text-green-600 text-sm bg-green-50 px-4 py-2 rounded-lg">{success}</p>}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
