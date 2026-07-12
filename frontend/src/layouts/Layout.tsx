import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Navbar } from '../components/Layout/Navbar';
import {Footer} from '../components/Layout/Footer';
import { WhatsAppButton } from '../components/Layout/WhatsAppButton';

const pageVariants = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const Layout: React.FC = () => {
  const location = useLocation();
  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.35, ease: 'easeInOut' }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      <WhatsAppButton />
      <Footer />
    </>
  );
};

export default Layout;
