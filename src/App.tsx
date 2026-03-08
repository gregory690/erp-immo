import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

const Home = lazy(() => import('./pages/Home'));
const Generate = lazy(() => import('./pages/Generate'));
const Preview = lazy(() => import('./pages/Preview'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Example = lazy(() => import('./pages/Example'));
const MentionsLegales = lazy(() => import('./pages/MentionsLegales'));
const CGU = lazy(() => import('./pages/CGU'));
const Confidentialite = lazy(() => import('./pages/Confidentialite'));
const Ressources = lazy(() => import('./pages/Ressources'));
const FAQ = lazy(() => import('./pages/FAQ'));
const Print = lazy(() => import('./pages/Print'));
const Admin = lazy(() => import('./pages/Admin'));
const ProLanding = lazy(() => import('./pages/ProLanding'));
const ProLogin = lazy(() => import('./pages/ProLogin'));
const ProAuth = lazy(() => import('./pages/ProAuth'));
const ProDashboard = lazy(() => import('./pages/ProDashboard'));
const ProInvoice = lazy(() => import('./pages/ProInvoice'));

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-6 h-6 border-2 border-navy-900 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/generer" element={<Generate />} />
          <Route path="/apercu" element={<Preview />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/exemple" element={<Example />} />
          <Route path="/mentions-legales" element={<MentionsLegales />} />
          <Route path="/cgu" element={<CGU />} />
          <Route path="/confidentialite" element={<Confidentialite />} />
          <Route path="/ressources" element={<Ressources />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/print" element={<Print />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/pro" element={<ProLanding />} />
          <Route path="/pro/login" element={<ProLogin />} />
          <Route path="/pro/auth" element={<ProAuth />} />
          <Route path="/pro/dashboard" element={<ProDashboard />} />
          <Route path="/pro/facture" element={<ProInvoice />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
