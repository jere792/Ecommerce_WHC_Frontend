import { Link } from 'react-router-dom';
import { FaWhatsapp, FaEnvelope } from 'react-icons/fa';

export function Footer() {
  return (
    <footer className="bg-gray-900 dark:bg-gray-950 text-gray-300 dark:text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-4">
          <Link to="/" className="block">
            <span className="text-xl font-bold text-white">WHC Representaciones</span>
          </Link>
          <p className="text-sm text-gray-400">
            Equipos de importación para tu negocio. Soluciones profesionales de gasfitería para proyectos residenciales, comerciales e industriales.
          </p>
          <div className="flex gap-3 pt-2">
            <a
              href="https://wa.me/51949790715"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-600 p-2 rounded-lg hover:bg-green-700 transition"
            >
              <FaWhatsapp className="w-5 h-5 text-white" />
            </a>
            <a
              href="mailto:whsRepresentaciones@gmail.com"
              className="bg-blue-600 p-2 rounded-lg hover:bg-blue-700 transition"
            >
              <FaEnvelope className="w-5 h-5 text-white" />
            </a>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">Navegación</h3>
          <ul className="space-y-2 text-sm">
            <li><Link to="/" className="hover:text-white transition">Inicio</Link></li>
            <li><Link to="/productos" className="hover:text-white transition">Productos</Link></li>
            <li><Link to="/contacto" className="hover:text-white transition">Contacto</Link></li>
            <li>
              <a href="https://wa.me/51949790715" target="_blank" rel="noopener noreferrer" className="hover:text-white transition flex items-center gap-1">
                <FaWhatsapp className="w-3.5 h-3.5" /> WhatsApp
              </a>
            </li>
            <li>
              <a href="mailto:whsRepresentaciones@gmail.com" className="hover:text-white transition flex items-center gap-1">
                <FaEnvelope className="w-3.5 h-3.5" /> Email
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">Servicios</h3>
          <ul className="space-y-2 text-sm">
            <li><Link to="/instalacion" className="hover:text-white transition">Servicio de Instalación</Link></li>
            <li><Link to="/mantenimiento" className="hover:text-white transition">Soporte y Mantenimiento</Link></li>
            <li><Link to="/opiniones" className="hover:text-white transition">Opiniones de Clientes</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">Legal</h3>
          <ul className="space-y-2 text-sm">
            <li><Link to="/terminos" className="hover:text-white transition">Términos y Condiciones</Link></li>
            <li><Link to="/privacidad" className="hover:text-white transition">Política de Privacidad</Link></li>
            <li>
              <Link to="/libro" className="hover:text-white transition flex items-center gap-1">
                <img
                  src="https://res.cloudinary.com/dxuk9bogw/image/upload/v1776155530/7f85d794-58b5-47d0-850d-d06179563fb2.png"
                  alt="Libro de Reclamaciones"
                  className="h-16"
                />
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} WHC Representaciones. Todos los derechos reservados.</p>
          <a
            href="https://www.instagram.com/solvegrades.com_/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src="https://res.cloudinary.com/dp1vgjhsq/image/upload/v1778834655/WhatsApp_Image_2026-05-15_at_3.21.36_AM-removebg-preview_wtgmkr.png"
              alt="SolveGrades"
              className="h-14"
            />
          </a>
        </div>
      </div>
    </footer>
  );
}
