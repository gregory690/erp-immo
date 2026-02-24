import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Generate from './pages/Generate';
import Preview from './pages/Preview';
import Dashboard from './pages/Dashboard';
import Example from './pages/Example';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/generer" element={<Generate />} />
        <Route path="/apercu" element={<Preview />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/exemple" element={<Example />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
