import { Link } from 'react-router-dom';
import { FaWhatsapp, FaEnvelope, FaFacebook, FaInstagram } from 'react-icons/fa';
import { Phone, MapPin, Clock, ChevronRight } from 'lucide-react';
import { useStore } from '../../contexts/StoreContext';

export function Footer() {
  const { settings } = useStore();
  const companyName = settings?.nombre_empresa || 'WHC Representaciones';
  const whatsapp = settings?.whatsapp_empresa || '51949790715';
  const email = settings?.correo_empresa || 'whcRepresentaciones@gmail.com';
  const phone = settings?.telefono_empresa || '(+51) 949790715';
  const address = settings?.direccion_empresa || 'Los Rubies 295, La Victoria, Lima';
  const schedule = settings?.horario_empresa || 'Lun - Vie: 9:00 a.m. - 6:00 p.m.';

  const navLinks = [
    { to: '/inicio', label: 'Inicio' },
    { to: '/productos', label: 'Catálogo' },
    { to: '/contacto', label: 'Contacto' },
    { to: '/instalacion', label: 'Instalación' },
    { to: '/mantenimiento', label: 'Mantenimiento' },
  ];

  const legalLinks = [
    { to: '/terminos', label: 'Términos y Condiciones' },
    { to: '/privacidad', label: 'Política de Privacidad' },
    { to: '/libro', label: 'Libro de Reclamaciones' },
  ];

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Columna 1 - Marca */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link to="/inicio" className="inline-block mb-4">
              <span className="text-2xl font-bold text-white">{companyName}</span>
            </Link>
            <p className="text-sm text-gray-400 mb-6 leading-relaxed">
              Equipos de importación para tu negocio. Soluciones profesionales de gasfitería para proyectos residenciales, comerciales e industriales.
            </p>
            <div className="flex gap-2">
              <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 bg-green-600 flex items-center justify-center hover:bg-green-700 transition">
                <FaWhatsapp className="w-4 h-4 text-white" />
              </a>
              <a href={`mailto:${email}`}
                className="w-9 h-9 bg-blue-600 flex items-center justify-center hover:bg-blue-700 transition">
                <FaEnvelope className="w-4 h-4 text-white" />
              </a>
              <a href="#" className="w-9 h-9 bg-gray-700 flex items-center justify-center hover:bg-gray-600 transition">
                <FaFacebook className="w-4 h-4 text-white" />
              </a>
              <a href="#" className="w-9 h-9 bg-gray-700 flex items-center justify-center hover:bg-gray-600 transition">
                <FaInstagram className="w-4 h-4 text-white" />
              </a>
            </div>
          </div>

          {/* Columna 2 - Navegación */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-5">Navegación</h3>
            <ul className="space-y-2.5">
              {navLinks.map(link => (
                <li key={link.to}>
                  <Link to={link.to} className="text-sm text-gray-400 hover:text-white transition flex items-center gap-1 group">
                    <ChevronRight className="w-3 h-3 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Columna 3 - Legal */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-5">Legal</h3>
            <ul className="space-y-2.5">
              {legalLinks.map(link => (
                <li key={link.to}>
                  <Link to={link.to} className="text-sm text-gray-400 hover:text-white transition">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <Link to="/libro" className="inline-block mt-4">
              <img
                src="https://res.cloudinary.com/dxuk9bogw/image/upload/v1776155530/7f85d794-58b5-47d0-850d-d06179563fb2.png"
                alt="Libro de Reclamaciones"
                className="h-14 opacity-80 hover:opacity-100 transition"
              />
            </Link>
          </div>

          {/* Columna 4 - Contacto */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-5">Contacto</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a href={`tel:${phone}`} className="flex items-start gap-3 text-gray-400 hover:text-white transition group">
                  <Phone className="w-4 h-4 mt-0.5 shrink-0 text-gray-500 group-hover:text-white transition" />
                  <span>{phone}</span>
                </a>
              </li>
              <li>
                <a href={`mailto:${email}`} className="flex items-start gap-3 text-gray-400 hover:text-white transition group">
                  <FaEnvelope className="w-4 h-4 mt-0.5 shrink-0 text-gray-500 group-hover:text-white transition" />
                  <span>{email}</span>
                </a>
              </li>
              <li>
                <span className="flex items-start gap-3 text-gray-400">
                  <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-gray-500" />
                  <span>{address}</span>
                </span>
              </li>
              <li>
                <span className="flex items-start gap-3 text-gray-400">
                  <Clock className="w-4 h-4 mt-0.5 shrink-0 text-gray-500" />
                  <span>{schedule}</span>
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} {companyName}. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-4">
            <a
              href="https://www.instagram.com/solvegrades.com_/"
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 hover:opacity-80 transition-opacity"
            >
              <img
                src="https://res.cloudinary.com/dp1vgjhsq/image/upload/v1778834655/WhatsApp_Image_2026-05-15_at_3.21.36_AM-removebg-preview_wtgmkr.png"
                alt="SolveGrades"
                className="h-10 opacity-70 hover:opacity-100 transition"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
