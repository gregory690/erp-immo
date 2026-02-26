import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Generate from './pages/Generate';
import Preview from './pages/Preview';
import Dashboard from './pages/Dashboard';
import Example from './pages/Example';
import MentionsLegales from './pages/MentionsLegales';
import CGU from './pages/CGU';
import Confidentialite from './pages/Confidentialite';
import Ressources from './pages/Ressources';
import FAQ from './pages/FAQ';
import Print from './pages/Print';

export default function App() {
  return (
    <BrowserRouter>
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
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
