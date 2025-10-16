import React, { useMemo, useState } from 'react'
import { AuthProvider, useAuth } from './auth'
import LoginSignup from './components/LoginSignup'

type Carro = {
  id: number;
  modelo: string;
  valorSemanal: number;
  ano: number;
  cambio: string;
  ativo: boolean;
  foto: string;
  observacoes: string;
};

export default function App() {
  return (
    <AuthProvider>
      <Shell />
    </AuthProvider>
  );
}

function Shell() {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState<'home' | 'buscar' | 'dashboard'>('home');

  // ---------- Dados fictícios ----------
  const [qModelo, setQModelo] = useState('');
  const [precoMin, setPrecoMin] = useState('');
  const [precoMax, setPrecoMax] = useState('');
  const [detalhe, setDetalhe] = useState<Carro | null>(null);

  const [veiculos, setVeiculos] = useState<Carro[]>([
    ['Chevrolet Onix', 730, 2022, 'Automático', true],
    ['Hyundai HB20', 780, 2021, 'Manual', true],
    ['Fiat Uno', 690, 2019, 'Manual', true],
    ['VW Voyage', 790, 2020, 'Automático', false],
    ['Renault Kwid', 620, 2021, 'Manual', true],
  ].map((v, i) => ({
    id: i + 1, modelo: v[0] as string, valorSemanal: v[1] as number, ano: v[2] as number,
    cambio: v[3] as string, ativo: v[4] as boolean,
    foto: 'https://images.unsplash.com/photo-1549921296-3ecf9a1f1b36?q=80&w=1200&auto=format&fit=crop',
    observacoes: 'Veículo de locadora, manutenção em dia. Caução sob consulta.',
  })));

  const filtrados = useMemo(() => {
    const min = precoMin ? parseInt(precoMin, 10) : 0;
    const max = precoMax ? parseInt(precoMax, 10) : Number.MAX_SAFE_INTEGER;
    return veiculos.filter((c) => {
      const passaModelo = qModelo ? c.modelo.toLowerCase().includes(qModelo.toLowerCase()) : true;
      const passaPreco = c.valorSemanal >= min && c.valorSemanal <= max;
      const passaAtivo = tab === 'buscar' ? c.ativo : true;
      return passaModelo && passaPreco && passaAtivo;
    });
  }, [veiculos, qModelo, precoMin, precoMax, tab]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-slate-200">
        <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Logo />
            <span className="font-semibold">AutoLinker</span>
          </div>

          <nav className="flex gap-1 items-center">
            <Tab label="Início" active={tab === 'home'} onClick={() => setTab('home')} />
            <Tab label="Buscar carros" active={tab === 'buscar'} onClick={() => setTab('buscar')} />
            <Tab
              label="Painel Locadora"
              active={tab === 'dashboard'}
              onClick={() => setTab('dashboard')}
            />
            {user ? (
              <div className="ml-2 flex items-center gap-2 text-sm">
                <span className="hidden sm:inline text-slate-600">
                  Olá, <b>{user.nome}</b> ({user.role})
                </span>
                <button className="rounded-full px-3 py-1 border" onClick={logout}>
                  Sair
                </button>
              </div>
            ) : null}
          </nav>
        </div>
      </header>

      {/* HOME */}
      {tab === 'home' && <Home onIrBuscar={() => setTab('buscar')} />}

      {/* BUSCAR */}
      {tab === 'buscar' && (
        <main className="mx-auto max-w-5xl px-4 py-6">
          <h1 className="text-2xl font-bold mb-4">Encontre seu carro</h1>

          {/* Filtros MVP: modelo e valor semanal */}
          <section className="grid md:grid-cols-3 gap-3 mb-4">
            <input
              className="w-full rounded-xl border border-slate-300 px-3 py-2"
              placeholder="Filtrar por modelo (ex: Onix, HB20)"
              value={qModelo}
              onChange={(e) => setQModelo(e.target.value)}
            />
            <input
              className="w-full rounded-xl border border-slate-300 px-3 py-2"
              placeholder="Valor semanal mínimo (R$)"
              inputMode="numeric"
              value={precoMin}
              onChange={(e) => setPrecoMin(e.target.value.replace(/\D/g, ''))}
            />
            <input
              className="w-full rounded-xl border border-slate-300 px-3 py-2"
              placeholder="Valor semanal máximo (R$)"
              inputMode="numeric"
              value={precoMax}
              onChange={(e) => setPrecoMax(e.target.value.replace(/\D/g, ''))}
            />
          </section>

          {/* Lista */}
          <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtrados.map((c) => (
              <article key={c.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="aspect-video overflow-hidden">
                  <img src={c.foto} alt={c.modelo} className="w-full h-full object-cover" />
                </div>
                <div className="p-4 flex flex-col gap-1">
                  <h3 className="font-semibold text-lg">{c.modelo}</h3>
                  <p className="text-sm text-slate-600">{c.ano} • {c.cambio}</p>
                  <p className="text-base font-semibold mt-1">R$ {c.valorSemanal}/semana</p>
                  <div className="flex gap-2 mt-3">
                    <button
                      className="flex-1 rounded-xl bg-emerald-600 text-white px-3 py-2 hover:bg-emerald-700 transition"
                      onClick={() => setDetalhe(c)}
                    >
                      Ver detalhes
                    </button>
                    <button className="rounded-xl border px-3 py-2" onClick={() => alert('Abrir WhatsApp/Chat – MVP')}>
                      Contato
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </section>
        </main>
      )}

      {/* DASHBOARD (protegido: somente Locadora) */}
      {tab === 'dashboard' && (
        <main className="mx-auto max-w-5xl px-4 py-6">
          <Protected role="Locadora">
            <Dashboard veiculos={veiculos} setVeiculos={setVeiculos} />
          </Protected>
        </main>
      )}

      {/* Modal de Detalhes */}
      {detalhe && (
        <div className="fixed inset-0 z-20 bg-black/40 flex items-end md:items-center justify-center p-4" onClick={() => setDetalhe(null)}>
          <div className="w-full max-w-xl bg-white rounded-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="aspect-video">
              <img src={detalhe.foto} alt={detalhe.modelo} className="w-full h-full object-cover" />
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-semibold">{detalhe.modelo}</h3>
                  <p className="text-sm text-slate-600">{detalhe.ano} • {detalhe.cambio}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-slate-500">Valor semanal</div>
                  <div className="text-2xl font-bold">R$ {detalhe.valorSemanal}</div>
                </div>
              </div>
              <p className="text-slate-700 mt-3">{detalhe.observacoes}</p>
              <div className="flex gap-2 mt-4">
                <button className="flex-1 rounded-xl border px-3 py-2" onClick={() => setDetalhe(null)}>Fechar</button>
                <button className="flex-1 rounded-xl bg-emerald-600 text-white px-3 py-2" onClick={() => alert('Abrir WhatsApp/Chat – MVP')}>Entrar em contato</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <footer className="mt-10 border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-6 text-sm text-slate-600 flex flex-col md:flex-row gap-2 md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} AutoLinker – MVP.</p>
          <p>Freemium • Filtros por modelo e valor semanal • Reputação (próxima etapa)</p>
        </div>
      </footer>
    </div>
  )
}

/** ----- Componentes auxiliares ----- */

function Protected({ role, children }: { role: 'Locadora' | 'Motorista'; children: React.ReactNode }) {
  const { user } = useAuth();
  const [showAuth, setShowAuth] = useState(!user);

  if (!user) {
    return (
      <div className="mx-auto max-w-lg">
        <p className="mb-4 text-slate-700">Você precisa estar logado para acessar esta área.</p>
        <LoginSignup onSuccess={() => setShowAuth(false)} />
      </div>
    );
  }
  if (user.role !== role) {
    return (
      <div className="mx-auto max-w-lg bg-amber-50 border border-amber-200 rounded-xl p-4">
        <p className="text-amber-800">
          Acesso restrito para <b>{role}</b>. Sua conta atual: <b>{user.role}</b>.
        </p>
      </div>
    );
  }
  return <>{children}</>;
}

function Dashboard({ veiculos, setVeiculos }: { veiculos: Carro[]; setVeiculos: React.Dispatch<React.SetStateAction<Carro[]>> }) {
  function toggleAtivo(id: number) {
    setVeiculos(curr => curr.map(c => (c.id === id ? { ...c, ativo: !c.ativo } : c)));
  }
  return (
    <>
      <h1 className="text-2xl font-bold mb-4">Painel da Locadora</h1>
      <p className="text-slate-600 mb-4">Gerencie os veículos e controle a exibição (Ativo/Inativo).</p>
      <div className="grid gap-3">
        {veiculos.map((c) => (
          <div key={c.id} className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-4">
            <div className="w-28 h-16 rounded-xl overflow-hidden bg-slate-100">
              <img src={c.foto} alt={c.modelo} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1">
              <div className="font-medium">{c.modelo}</div>
              <div className="text-sm text-slate-600">R$ {c.valorSemanal}/semana</div>
            </div>
            <span className={`text-xs px-2 py-1 rounded-full ${c.ativo ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-700'}`}>
              {c.ativo ? 'Ativo' : 'Inativo'}
            </span>
            <div className="flex gap-2">
              <button className="rounded-xl border px-3 py-2" onClick={() => alert('Editar – MVP')}>Editar</button>
              <button className="rounded-xl border px-3 py-2" onClick={() => alert('Excluir – MVP')}>Excluir</button>
              <button className="rounded-xl bg-slate-900 text-white px-3 py-2" onClick={() => toggleAtivo(c.id)}>
                {c.ativo ? 'Desativar' : 'Ativar'}
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6">
        <button className="w-full rounded-2xl bg-emerald-600 text-white px-4 py-3 text-center font-semibold hover:bg-emerald-700">
          Adicionar veículo (MVP)
        </button>
      </div>
    </>
  );
}

function Home({ onIrBuscar }: { onIrBuscar: () => void }) {
  const { user } = useAuth();
  return (
    <main className="mx-auto max-w-5xl px-4 pt-10 pb-8">
      <section className="grid md:grid-cols-2 items-center gap-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold leading-tight">Alugue seu carro para trabalhar nos apps</h1>
          <p className="mt-3 text-slate-700">Conectamos motoristas e locadoras com agilidade e transparência. Comece filtrando por modelo e valor semanal.</p>
          <div className="mt-5 flex gap-3 flex-wrap">
            <button className="rounded-2xl bg-emerald-600 text-white px-5 py-3 font-semibold hover:bg-emerald-700" onClick={onIrBuscar}>Encontrar carros</button>
            {!user && (
              <span className="text-sm text-slate-600 self-center">
                Para acessar o Painel da Locadora, crie uma conta como <b>Locadora</b> ou faça login.
              </span>
            )}
          </div>
        </div>
        <div className="rounded-3xl overflow-hidden shadow-sm border border-slate-200">
          <img src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=1600&auto=format&fit=crop" alt="Carros" className="w-full h-full object-cover" />
        </div>
      </section>
    </main>
  )
}

function Tab({ label, active, onClick }: { label: string; active?: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-medium transition ${active ? 'bg-slate-900 text-white' : 'hover:bg-slate-100'}`}
    >
      {label}
    </button>
  )
}

function Logo() {
  return (
    <div className="w-8 h-8 rounded-xl bg-emerald-600 grid place-items-center text-white font-bold">A</div>
  )
}
