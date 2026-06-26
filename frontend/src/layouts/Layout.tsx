import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/Layout/Navbar';
import {Footer} from '../components/Layout/Footer';
import ScrollToTopButton  from '../components/Layout/ScrollToTopButton'; // Importa el nuevo componente
import { WhatsAppButton } from '../components/Layout/WhatsAppButton';
import AccessibilityButton from '../components/Layout/AccesibilityButton';
import ThemeToggle from '../components/ui/ThemeToggle';
const Layout: React.FC = () => {
  return (
    <>
      <Navbar />
      <main className="min-h-screen ">
      <Outlet />
      </main>
      <WhatsAppButton />
      <ScrollToTopButton/>
      <AccessibilityButton />
      <ThemeToggle />

      <Footer />
    </>
  );
};

export default Layout;
