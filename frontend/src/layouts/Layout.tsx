import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/Layout/Navbar';
import {Footer} from '../components/Layout/Footer';
import { WhatsAppButton } from '../components/Layout/WhatsAppButton';
import { StoreTopBar } from '../components/Layout/StoreTopBar';
const Layout: React.FC = () => {
  return (
    <>
      <StoreTopBar />
      <Navbar />
      <main className="min-h-screen ">
      <Outlet />
      </main>
      <WhatsAppButton />

      <Footer />
    </>
  );
};

export default Layout;
