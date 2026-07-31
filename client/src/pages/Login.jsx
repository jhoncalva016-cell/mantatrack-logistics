import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@calguytrack.ec');
  const [password, setPassword] = useState('mantatrack2026');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/flota');
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo iniciar sesión.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0F1826] px-4 relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.06]" style={{
        backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
        backgroundSize: '28px 28px',
      }} />
      <div className="relative w-full max-w-md">
        <div className="flex items-center gap-2.5 justify-center mb-8">
          <Logo size={44} />
          <div className="leading-tight text-white">
            <p className="font-display font-bold text-lg tracking-tight">CALGUY TRACK</p>
            <p className="text-[11px] tracking-[0.2em] text-white/50 -mt-0.5">LOGISTICS</p>
          </div>
        </div>

        <div className="bg-white rounded-xl2 shadow-2xl p-8">
          <h1 className="text-xl font-display font-bold text-ink-900">Iniciar sesión</h1>
          <p className="text-sm text-ink-900/50 mt-1 mb-6">Monitorea tu flota en tiempo real, hoy.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-ink-900/60 mb-1.5">Correo electrónico</label>
              <input
                type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-black/10 px-3.5 py-2.5 text-sm focus:border-amber-500 outline-none"
                placeholder="tucorreo@empresa.com"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-900/60 mb-1.5">Contraseña</label>
              <input
                type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-black/10 px-3.5 py-2.5 text-sm focus:border-amber-500 outline-none"
                placeholder="••••••••"
              />
            </div>
            {error && <p className="text-sm text-alertred bg-alertred/10 rounded-lg px-3 py-2">{error}</p>}
            <button
              type="submit" disabled={loading}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm rounded-lg py-2.5 transition-colors disabled:opacity-60"
            >
              {loading ? 'Ingresando…' : 'Ingresar al panel'}
            </button>
          </form>

          <p className="text-xs text-ink-900/40 mt-5 text-center">
            Cuenta demo precargada — puedes ingresar directamente.
          </p>
          <p className="text-sm text-center mt-4 text-ink-900/60">
            ¿Tu empresa aún no tiene cuenta? <Link to="/registro" className="text-amber-600 font-medium">Crear cuenta</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
