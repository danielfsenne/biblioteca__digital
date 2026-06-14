import { useEffect, useState } from 'react'
import { Plus, RotateCcw, Loader2, BookMarked } from 'lucide-react'
import { loansApi } from '../api/loans'
import { booksApi } from '../api/books'
import { usersApi } from '../api/users'
import Modal from '../components/Modal'
import { useToast } from '../components/Toast'

const EMPTY_LOAN = { bookId: '', userId: '', dueDate: '' }

export default function Loans() {
  const [loans, setLoans] = useState([])
  const [books, setBooks] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(EMPTY_LOAN)
  const [saving, setSaving] = useState(false)
  const [returning, setReturning] = useState(null)
  const [filter, setFilter] = useState('all')
  const toast = useToast()

  async function load() {
    setLoading(true)
    try {
      const res = await loansApi.getAll()
      setLoans(res.data)
    } catch {
      toast('Erro ao carregar empréstimos', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])
  useEffect(() => {
    booksApi.getAll(0, 100).then((r) => setBooks(r.data.content || [])).catch(() => {})
    usersApi.getAll().then((r) => setUsers(r.data)).catch(() => {})
  }, [])

  async function handleCreate(e) {
    e.preventDefault()
    setSaving(true)
    try {
      await loansApi.create({
        bookId: Number(form.bookId),
        userId: Number(form.userId),
        dueDate: form.dueDate,
      })
      toast('Empréstimo registrado!')
      setModal(false)
      setForm(EMPTY_LOAN)
      load()
    } catch (err) {
      toast(err.response?.data?.message || 'Erro ao registrar empréstimo', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function handleReturn(id) {
    setReturning(id)
    try {
      await loansApi.returnLoan(id)
      toast('Devolução registrada!')
      load()
    } catch (err) {
      toast(err.response?.data?.message || 'Erro ao registrar devolução', 'error')
    } finally {
      setReturning(null)
    }
  }

  const filtered = loans.filter((l) => {
    if (filter === 'active') return !l.returned
    if (filter === 'returned') return l.returned
    return true
  })

  const isOverdue = (loan) =>
    !loan.returned && loan.dueDate && new Date(loan.dueDate) < new Date()

  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 14)
  const defaultDue = tomorrow.toISOString().split('T')[0]

  return (
    <div className="p-4 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Empréstimos</h1>
          <p className="text-gray-500 text-sm mt-1">Controle de empréstimos e devoluções</p>
        </div>
        <button
          onClick={() => { setForm({ ...EMPTY_LOAN, dueDate: defaultDue }); setModal(true) }}
          className="btn-primary flex items-center gap-2 shrink-0"
        >
          <Plus size={16} />
          Novo Empréstimo
        </button>
      </div>

      <div className="card">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-100 flex flex-wrap items-center gap-2">
          {['all', 'active', 'returned'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filter === f ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              {f === 'all' ? 'Todos' : f === 'active' ? 'Em aberto' : 'Devolvidos'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="p-12 flex items-center justify-center">
            <Loader2 size={24} className="animate-spin text-indigo-500" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <BookMarked size={40} className="mx-auto text-gray-200 mb-3" />
            <p className="text-sm text-gray-400">Nenhum empréstimo encontrado</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="table-header">Livro</th>
                  <th className="table-header">Usuário</th>
                  <th className="table-header hidden md:table-cell">Empréstimo</th>
                  <th className="table-header">Vencimento</th>
                  <th className="table-header hidden lg:table-cell">Devolução</th>
                  <th className="table-header">Status</th>
                  <th className="table-header w-20"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((l) => (
                  <tr key={l.id} className="hover:bg-gray-50 transition-colors">
                    <td className="table-cell font-medium text-gray-900 max-w-[160px] truncate">{l.book?.title}</td>
                    <td className="table-cell text-gray-500 max-w-[120px] truncate">{l.user?.name}</td>
                    <td className="table-cell text-gray-400 hidden md:table-cell">{l.loanDate}</td>
                    <td className={`table-cell ${isOverdue(l) ? 'text-red-600 font-medium' : 'text-gray-400'}`}>
                      {l.dueDate}
                      {isOverdue(l) && <span className="ml-1 text-xs hidden sm:inline">(vencido)</span>}
                    </td>
                    <td className="table-cell text-gray-400 hidden lg:table-cell">{l.returnDate || '—'}</td>
                    <td className="table-cell">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap ${
                        l.returned
                          ? 'bg-green-50 text-green-700'
                          : isOverdue(l)
                          ? 'bg-red-50 text-red-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}>
                        {l.returned ? 'Devolvido' : isOverdue(l) ? 'Vencido' : 'Em aberto'}
                      </span>
                    </td>
                    <td className="table-cell">
                      {!l.returned && (
                        <button
                          onClick={() => handleReturn(l.id)}
                          disabled={returning === l.id}
                          className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-800 disabled:opacity-50 whitespace-nowrap"
                        >
                          {returning === l.id
                            ? <Loader2 size={12} className="animate-spin" />
                            : <RotateCcw size={12} />}
                          Devolver
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title="Novo Empréstimo">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="label">Livro *</label>
            <select
              className="input"
              required
              value={form.bookId}
              onChange={(e) => setForm({ ...form, bookId: e.target.value })}
            >
              <option value="">Selecione um livro</option>
              {books.filter((b) => b.quantity > 0).map((b) => (
                <option key={b.id} value={b.id}>{b.title} ({b.quantity} disponíveis)</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Usuário *</label>
            <select
              className="input"
              required
              value={form.userId}
              onChange={(e) => setForm({ ...form, userId: e.target.value })}
            >
              <option value="">Selecione um usuário</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>{u.name} — {u.email}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Data de Vencimento *</label>
            <input
              type="date"
              className="input"
              required
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
            />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={() => setModal(false)} className="btn-secondary">Cancelar</button>
            <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
              {saving && <Loader2 size={14} className="animate-spin" />}
              Registrar
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
