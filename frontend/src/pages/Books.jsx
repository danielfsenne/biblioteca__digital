import { useEffect, useState, useCallback } from 'react'
import { Plus, Search, Edit2, Trash2, ChevronLeft, ChevronRight, Loader2, BookOpen } from 'lucide-react'
import { booksApi } from '../api/books'
import { categoriesApi } from '../api/categories'
import Modal from '../components/Modal'
import { useToast } from '../components/Toast'

const EMPTY = { title: '', author: '', isbn: '', quantity: 1, category: null }

export default function Books() {
  const [data, setData] = useState({ content: [], totalPages: 0, number: 0 })
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState(null)
  const [modal, setModal] = useState({ open: false, editing: null })
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(null)
  const toast = useToast()

  const load = useCallback(async (page = 0) => {
    setLoading(true)
    try {
      const res = await booksApi.getAll(page, 10)
      setData(res.data)
      setSearchResults(null)
    } catch {
      toast('Erro ao carregar livros', 'error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])
  useEffect(() => {
    categoriesApi.getAll().then((r) => setCategories(r.data)).catch(() => {})
  }, [])

  async function handleSearch(e) {
    const val = e.target.value
    setSearchTerm(val)
    if (!val.trim()) { setSearchResults(null); return }
    try {
      const res = await booksApi.search(val)
      setSearchResults(res.data)
    } catch { setSearchResults([]) }
  }

  function openCreate() {
    setForm(EMPTY)
    setModal({ open: true, editing: null })
  }

  function openEdit(book) {
    setForm({
      title: book.title,
      author: book.author,
      isbn: book.isbn || '',
      quantity: book.quantity || 1,
      category: book.category ? { id: book.category.id } : null,
    })
    setModal({ open: true, editing: book.id })
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        ...form,
        quantity: Number(form.quantity),
        category: form.category?.id ? { id: Number(form.category.id) } : null,
      }
      if (modal.editing) {
        await booksApi.update(modal.editing, payload)
        toast('Livro atualizado!')
      } else {
        await booksApi.create(payload)
        toast('Livro criado!')
      }
      setModal({ open: false, editing: null })
      load(data.number)
    } catch (err) {
      toast(err.response?.data?.message || 'Erro ao salvar livro', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    setDeleting(id)
    try {
      await booksApi.delete(id)
      toast('Livro removido!')
      load(data.number)
    } catch {
      toast('Erro ao remover livro', 'error')
    } finally {
      setDeleting(null)
    }
  }

  const books = searchResults ?? data.content

  return (
    <div className="p-4 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Livros</h1>
          <p className="text-gray-500 text-sm mt-1">Gerencie o acervo da biblioteca</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2 shrink-0">
          <Plus size={16} />
          Novo Livro
        </button>
      </div>

      <div className="card">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-100">
          <div className="relative w-full sm:max-w-xs">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por título..."
              value={searchTerm}
              onChange={handleSearch}
              className="input pl-9"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-12 flex items-center justify-center">
            <Loader2 size={24} className="animate-spin text-indigo-500" />
          </div>
        ) : books.length === 0 ? (
          <div className="p-12 text-center">
            <BookOpen size={40} className="mx-auto text-gray-200 mb-3" />
            <p className="text-sm text-gray-400">Nenhum livro encontrado</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="table-header">Título</th>
                    <th className="table-header">Autor</th>
                    <th className="table-header hidden md:table-cell">ISBN</th>
                    <th className="table-header hidden sm:table-cell">Categoria</th>
                    <th className="table-header text-center">Qtd.</th>
                    <th className="table-header w-20"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {books.map((b) => (
                    <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                      <td className="table-cell font-medium text-gray-900 max-w-[180px] truncate">{b.title}</td>
                      <td className="table-cell text-gray-500 max-w-[140px] truncate">{b.author}</td>
                      <td className="table-cell text-gray-400 hidden md:table-cell">{b.isbn || '—'}</td>
                      <td className="table-cell hidden sm:table-cell">
                        {b.category ? (
                          <span className="bg-indigo-50 text-indigo-700 text-xs font-medium px-2 py-0.5 rounded-md">
                            {b.category.name}
                          </span>
                        ) : '—'}
                      </td>
                      <td className="table-cell text-center">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${b.quantity > 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                          {b.quantity ?? 0}
                        </span>
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center gap-1 justify-end">
                          <button
                            onClick={() => openEdit(b)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(b.id)}
                            disabled={deleting === b.id}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                          >
                            {deleting === b.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {!searchResults && data.totalPages > 1 && (
              <div className="px-4 sm:px-6 py-3 border-t border-gray-100 flex items-center justify-between">
                <p className="text-xs text-gray-400">
                  Página {data.number + 1} de {data.totalPages}
                </p>
                <div className="flex gap-1">
                  <button
                    onClick={() => load(data.number - 1)}
                    disabled={data.number === 0}
                    className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 disabled:opacity-30 transition-colors"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() => load(data.number + 1)}
                    disabled={data.number >= data.totalPages - 1}
                    className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 disabled:opacity-30 transition-colors"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <Modal
        open={modal.open}
        onClose={() => setModal({ open: false, editing: null })}
        title={modal.editing ? 'Editar Livro' : 'Novo Livro'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="col-span-1 sm:col-span-2">
              <label className="label">Título *</label>
              <input className="input" required value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Título do livro" />
            </div>
            <div className="col-span-1 sm:col-span-2">
              <label className="label">Autor *</label>
              <input className="input" required value={form.author}
                onChange={(e) => setForm({ ...form, author: e.target.value })} placeholder="Nome do autor" />
            </div>
            <div>
              <label className="label">ISBN</label>
              <input className="input" value={form.isbn}
                onChange={(e) => setForm({ ...form, isbn: e.target.value })} placeholder="978-..." />
            </div>
            <div>
              <label className="label">Quantidade</label>
              <input className="input" type="number" min={0} value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
            </div>
            <div className="col-span-1 sm:col-span-2">
              <label className="label">Categoria</label>
              <select
                className="input"
                value={form.category?.id || ''}
                onChange={(e) => setForm({ ...form, category: e.target.value ? { id: e.target.value } : null })}
              >
                <option value="">Sem categoria</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={() => setModal({ open: false, editing: null })} className="btn-secondary">
              Cancelar
            </button>
            <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
              {saving && <Loader2 size={14} className="animate-spin" />}
              {modal.editing ? 'Salvar' : 'Criar'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
