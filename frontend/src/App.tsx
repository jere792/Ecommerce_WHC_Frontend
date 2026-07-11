import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import HomePage from './pages/public/HomePage';
import ProductsPage from './pages/public/ProductsPage';
import ContactPage from './pages/public/ContactPage';
import NotFoundPage from './pages/public/NotFoundPage';
import CartPage from './pages/public/CartPage';
import LibroReclamaciones from './pages/public/LibroReclamacionesPage';
import { DetalleProducto } from "./pages/public/DetalleProductoPage";
import InstalacionPage from './pages/public/InstalacionPage';
import MantenimientoPage from './pages/public/MantemientoPage';
import TerminosPage from './pages/public/TerminosPage';
import PrivacidadPage from './pages/public/PrivacidadPage';
import LoginPage from './pages/public/LoginPage';

import Layout from './layouts/Layout';
import ResetPasswordPage from './pages/public/ResetPasswordPage';
import MisPedidosPage from './pages/public/MisPedidosPage';

import ScrollToTop from './components/ui/ScrollToTop';

import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/admin/DashboardPage';
import AdminProducts from './pages/admin/ProductsPage';
import AdminProductForm from './pages/admin/ProductFormPage';
import AdminOrders from './pages/admin/OrdersPage';
import AdminOrderDetail from './pages/admin/OrderDetailPage';
import AdminUsers from './pages/admin/UsersPage';
import AdminUserForm from './pages/admin/UserFormPage';
import AdminForms from './pages/admin/FormsPage';
import AdminFormDetail from './pages/admin/FormDetailPage';
import AdminOffers from './pages/admin/OffersPage';
import AdminMovements from './pages/admin/MovementsPage';
import AdminCategories from './pages/admin/CategoriesPage';
import AdminCategoryForm from './pages/admin/CategoryFormPage';
import AdminBrands from './pages/admin/BrandsPage';
import AdminBrandForm from './pages/admin/BrandFormPage';
import AdminHeroSlides from './pages/admin/HeroSlidesPage';
import AdminBannerPublicidad from './pages/admin/BannerPublicidadPage';
import AdminPageHero from './pages/admin/PageHeroPage';
import AdminEmpresa from './pages/admin/EmpresaPage';

const App: React.FC = () => {
  useEffect(() => {
    const splash = document.getElementById('splash-screen');
    if (splash) {
      setTimeout(() => {
        splash.classList.add('splash-hidden');
        setTimeout(() => {
          splash.style.display = 'none';
        }, 600);
      }, 3000);
    }
  }, []);

  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/inicio" element={<HomePage />} />
          <Route path="/" element={<Navigate to="/inicio" replace />} />
          <Route path="/productos" element={<ProductsPage />} />
          <Route path="/contacto" element={<ContactPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/productos/:slug" element={<DetalleProducto />} />
          <Route path="/libro" element={<LibroReclamaciones />} />
          <Route path="/instalacion" element={<InstalacionPage />} />
          <Route path="/mantenimiento" element={<MantenimientoPage />} />
          <Route path="/mis-pedidos" element={<MisPedidosPage />} />
          <Route path="/terminos" element={<TerminosPage />} />
          <Route path="/privacidad" element={<PrivacidadPage />} />
        </Route>
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="productos" element={<AdminProducts />} />
          <Route path="productos/nuevo" element={<AdminProductForm />} />
          <Route path="productos/editar/:slug" element={<AdminProductForm />} />
          <Route path="pedidos" element={<AdminOrders />} />
          <Route path="pedidos/:id" element={<AdminOrderDetail />} />
          <Route path="usuarios" element={<AdminUsers />} />
          <Route path="usuarios/nuevo" element={<AdminUserForm />} />
          <Route path="usuarios/editar/:id" element={<AdminUserForm />} />
          <Route path="formularios" element={<AdminForms />} />
          <Route path="formularios/:id" element={<AdminFormDetail />} />
          <Route path="categorias" element={<AdminCategories />} />
          <Route path="categorias/nuevo" element={<AdminCategoryForm />} />
          <Route path="categorias/editar/:id" element={<AdminCategoryForm />} />
          <Route path="marcas" element={<AdminBrands />} />
          <Route path="marcas/nueva" element={<AdminBrandForm />} />
          <Route path="marcas/editar/:id" element={<AdminBrandForm />} />
          <Route path="hero-slides" element={<AdminHeroSlides />} />
          <Route path="banners-publicidad" element={<AdminBannerPublicidad />} />
          <Route path="page-hero" element={<AdminPageHero />} />
          <Route path="empresa" element={<AdminEmpresa />} />
          <Route path="ofertas" element={<AdminOffers />} />
          <Route path="movimientos" element={<AdminMovements />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
};

export default App;
