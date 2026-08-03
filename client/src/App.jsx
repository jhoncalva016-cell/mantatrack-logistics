import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedLayout from './components/ProtectedLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Mapa from './pages/Mapa';
import Flota from './pages/Flota';
import Rutas from './pages/Rutas';
import Alertas from './pages/Alertas';
import Historial from './pages/Historial';
import Reportes from './pages/Reportes';
import Conductores from './pages/Conductores';
import Mantenimiento from './pages/Mantenimiento';
import Configuracion from './pages/Configuracion';
import Planes from './pages/Planes';
import Tracking from './pages/Tracking';
import DriverTracking from './pages/DriverTracking';

export default function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Register />} />
          <Route path="/seguimiento/:token" element={<Tracking />} />
          <Route path="/conductor/:token" element={<DriverTracking />} />

          <Route element={<ProtectedLayout />}>
            <Route path="/flota" element={<Dashboard />} />
            <Route path="/mapa" element={<Mapa />} />
            <Route path="/lista-flota" element={<Flota />} />
            <Route path="/rutas" element={<Rutas />} />
            <Route path="/alertas" element={<Alertas />} />
            <Route path="/historial" element={<Historial />} />
            <Route path="/reportes" element={<Reportes />} />
            <Route path="/conductores" element={<Conductores />} />
            <Route path="/mantenimiento" element={<Mantenimiento />} />
            <Route path="/configuracion" element={<Configuracion />} />
            <Route path="/planes" element={<Planes />} />
          </Route>

          <Route path="/" element={<Navigate to="/flota" replace />} />
          <Route path="*" element={<Navigate to="/flota" replace />} />
        </Routes>
      </HashRouter>
    </AuthProvider>
  );
}
