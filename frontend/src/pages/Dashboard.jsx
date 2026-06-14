import { useEffect, useState } from 'react'
import { BookOpen, Tag, Users, BookMarked, Clock } from 'lucide-react'
import { booksApi } from '../api/books'
import { categoriesApi } from '../api/categories'
import { loansApi } from '../api/loans'
import { usersApi } from '../api/users'

function StatCard({ label, value, icon: Icon, color, sub }) {
  return (
    <div className="card p-4 sm:p-6">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon size={18} className="text-white" />
        </div>
      </div>
      <p className="text-2xl sm:text-3xl font-bold text-gray-900">{value ?? '—'}</p>
      <p className="text-sm font-medium text-gray-500 mt-1">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  )
}

export default function Dashboard() {
  const [stats, setStats] = useState({ books: null, categories: null, loans: null, users: null })
  const [recentLoans, setRecentLoans] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [books, cats, loans, users] = await Promise.allSettled([
          booksApi.getAll(0, 1),
          categoriesApi.getAll(),
          loansApi.getAll(),
          usersApi.getAll(),
        ])

        const loansData = loans.status === 'fulfilled' ? loans.value.data : []
        const activeLoans = Array.isArray(loansData) ? loansData.filter((l) => !l.returned) : []

        setStats({
          books: books.status === 'fulfilled' ? books.value.data.totalElements : '—',
          categories: cats.status === 'fulfilled' ? cats.value.data.length : '—',
          loans: activeLoans.length,
          users: users.status === 'fulfilled' ? users.value.data.length : '—',
        })

        if (Array.isArray(loansData)) {
          setRecentLoans(loansData.slice(0, 5))
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="p-4 sm:p-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Visão geral da biblioteca</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <StatCard label="Total de Livros" value={stats.books} icon={BookOpen} color="bg-indigo-500" />
        <StatCard label="Categorias" value={stats.categories} icon={Tag} color="bg-violet-500" />
        <StatCard label="Empréstimos Ativos" value={stats.loans} icon={BookMarked} color="bg-amber-500" sub="em aberto" />
        <StatCard label="Usuários" value={stats.users} icon={Users} color="bg-emerald-500" />
      </div>

      <div className="card">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-100 flex items-center gap-2">
          <Clock size={16} className="text-gray-400" />
          <h2 className="text-sm font-semibold text-gray-700">Empréstimos Recentes</h2>
        </div>
        {loading ? (
          <div className="p-8 text-center text-sm text-gray-400">Carregando...</div>
        ) : recentLoans.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-400">Nenhum empréstimo registrado</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {recentLoans.map((loan) => (
              <div key={loan.id} className="px-4 sm:px-6 py-3.5 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{loan.book?.title}</p>
                  <p className="text-xs text-gray-400 truncate">{loan.user?.name} · Venc. {loan.dueDate}</p>
                </div>
                <span
                  className={`shrink-0 text-xs font-medium px-2.5 py-1 rounded-full ${
                    loan.returned
                      ? 'bg-green-50 text-green-700'
                      : 'bg-amber-50 text-amber-700'
                  }`}
                >
                  {loan.returned ? 'Devolvido' : 'Em aberto'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
