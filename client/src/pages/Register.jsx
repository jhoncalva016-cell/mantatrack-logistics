import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ companyName: '', name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      navigate('/flota');
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo crear la cuenta.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0F1826] px-4">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2.5 justify-center mb-8 text-white">
          <span className="w-11 h-11 rounded-full bg-amber-500 flex items-center justify-center">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M3 16V6a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M14 9h4l3 3v4h-7V9Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </span>
          <p className="font-display font-bold text-lg">MANTATRACK LOGISTICS</p>
        </div>

        <div className="bg-white rounded-xl2 shadow-2xl p-8">
          <h1 className="text-xl font-display font-bold text-ink-900">Crea tu cuenta</h1>
          <p className="text-sm text-ink-900/50 mt-1 mb-6">Empieza a monitorear tu flota hoy mismo.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-ink-900/60 mb-1.5">Nombre de la empresa</label>
              <input required value={form.companyName} onChange={(e) => update('companyName', e.target.value)}
                className="w-full rounded-lg border border-black/10 px-3.5 py-2.5 text-sm focus:border-amber-500 outline-none" placeholder="Transportes del Pacífico" />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-900/60 mb-1.5">Tu nombre</label>
              <input required value={form.name} onChange={(e) => update('name', e.target.value)}
                className="w-full rounded-lg border border-black/10 px-3.5 py-2.5 text-sm focus:border-amber-500 outline-none" placeholder="Nombre y apellido" />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-900/60 mb-1.5">Correo electrónico</label>
              <input type="email" required value={form.email} onChange={(e) => update('email', e.target.value)}
                className="w-full rounded-lg border border-black/10 px-3.5 py-2.5 text-sm focus:border-amber-500 outline-none" placeholder="tucorreo@empresa.com" />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-900/60 mb-1.5">Contraseña</label>
              <input type="password" required minLength={6} value={form.password} onChange={(e) => update('password', e.target.value)}
                className="w-full rounded-lg border border-black/10 px-3.5 py-2.5 text-sm focus:border-amber-500 outline-none" placeholder="Mínimo 6 caracteres" />
            </div>
            {error && <p className="text-sm text-alertred bg-alertred/10 rounded-lg px-3 py-2">{error}</p>}
            <button type="submit" disabled={loading}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm rounded-lg py-2.5 transition-colors disabled:opacity-60">
              {loading ? 'Creando cuenta…' : 'Crear cuenta'}
            </button>
          </form>

          <p className="text-sm text-center mt-5 text-ink-900/60">
            ¿Ya tienes cuenta? <Link to="/login" className="text-amber-600 font-medium">Inicia sesión</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
