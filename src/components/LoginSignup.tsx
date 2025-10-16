// src/components/LoginSignup.tsx
import React, { useState } from 'react';
import { Role, useAuth } from '../auth';

export default function LoginSignup({ onSuccess }: { onSuccess: () => void }) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');

  const [nome, setNome] = useState('');
  const [role, setRole] = useState<Role>('Motorista');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(email, senha);
      } else {
        if (!nome.trim()) throw new Error('Informe seu nome.');
        await register(nome, email, senha, role);
      }
      onSuccess();
    } catch (err: any) {
      setErro(err.message || 'Erro inesperado.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md w-full mx-auto bg-white rounded-2xl border border-slate-200 p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">{mode === 'login' ? 'Entrar' : 'Criar conta'}</h2>
        <button
          className="text-sm underline"
          onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
        >
          {mode === 'login' ? 'Criar conta' : 'Já tenho conta'}
        </button>
      </div>

      {erro && <div className="mb-3 text-sm text-red-600">{erro}</div>}

      <form onSubmit={handleSubmit} className="grid gap-3">
        {mode === 'signup' && (
          <>
            <input
              className="rounded-xl border border-slate-300 px-3 py-2"
              placeholder="Nome completo"
              value={nome}
              onChange={e => setNome(e.target.value)}
            />
            <div className="flex gap-3">
              <label className={`flex-1 rounded-xl border px-3 py-2 ${role === 'Motorista' ? 'border-slate-900' : 'border-slate-300'}`}>
                <input
                  type="radio"
                  name="role"
                  className="mr-2"
                  checked={role === 'Motorista'}
                  onChange={() => setRole('Motorista')}
                />
                Motorista
              </label>
              <label className={`flex-1 rounded-xl border px-3 py-2 ${role === 'Locadora' ? 'border-slate-900' : 'border-slate-300'}`}>
                <input
                  type="radio"
                  name="role"
                  className="mr-2"
                  checked={role === 'Locadora'}
                  onChange={() => setRole('Locadora')}
                />
                Locadora
              </label>
            </div>
          </>
        )}

        <input
          className="rounded-xl border border-slate-300 px-3 py-2"
          placeholder="E-mail"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <input
          className="rounded-xl border border-slate-300 px-3 py-2"
          placeholder="Senha"
          type="password"
          value={senha}
          onChange={e => setSenha(e.target.value)}
        />

        <button
          className="rounded-xl bg-emerald-600 text-white px-4 py-2 font-semibold hover:bg-emerald-700 disabled:opacity-60"
          disabled={loading}
        >
          {loading ? 'Aguarde…' : (mode === 'login' ? 'Entrar' : 'Criar conta')}
        </button>
      </form>
    </div>
  );
}
