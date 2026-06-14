import { useEffect, useState } from 'react'
import { Plus, Edit2, Trash2, Loader2, Tag } from 'lucide-react'
import { categoriesApi } from '../api/categories'
import Modal from '../components/Modal'
import { useToast } from '../components/Toast'

export default function Categories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState({ open: false, editing: null })
  const [form, setForm] = useState({ name: '' })
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(null)
  const toast = useToast()

  async function load() {
    setLoading(true)
    try {
      const res = await categoriesApi.getAll()
      setCategories(res.data)
    } catch {
      toast('Erro ao carregar categorias', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  function openCreate() {
    setForm({ name: '' })
    setModal({ open: true, editing: null })
  }

  function openEdit(cat) {
    setForm({ name: cat.name })
    setModal({ open: true, editing: cat.id })
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    try {
      if (modal.editing) {
        await categoriesApi.update(modal.editing, form)
        toast('Categoria atualizada!')
      } else {
        await categoriesApi.create(form)
        toast('Categoria criada!')
      }
      setModal({ open: false, editing: null })
      load()
    } catch (err) {
      toast(err.response?.data?.message || 'Erro ao salvar', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    setDeleting(id)
    try {
      await categoriesApi.delete(id)
      toast('Categoria removida!')
      load()
    } catch {
      toast('Erro ao remover (pode haver livros vinculados)', 'error')
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categorias</h1>
          <p className="text-gray-500 text-sm mt-1">Organize os livros por categoria</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <Plus size={16} />
          Nova Categoria
        </button>
      </div>

      <div className="card">
        {loading ? (
          <div className="p-12 flex items-center justify-center">
            <Loader2 size={24} className="animate-spin text-indigo-500" />
          </div>
        ) : categories.length === 0 ? (
          <div className="p-12 text-center">
            <Tag size={40} className="mx-auto text-gray-200 mb-3" />
            <p className="text-sm text-gray-400">Nenhuma categoria cadastrada</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="table-header">ID</th>
                <th className="table-header">Nome</th>
                <th className="table-header w-24"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {categories.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="table-cell text-gray-400">#{c.id}</td>
                  <td className="table-cell">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-indigo-400" />
                      <span className="font-medium text-gray-900">{c.name}</span>
                    </span>
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center gap-1 justify-end">
                      <button
                        onClick={() => openEdit(c)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(c.id)}
                        disabled={deleting === c.id}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                      >
                        {deleting === c.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal
        open={modal.open}
        onClose={() => setModal({ open: false, editing: null })}
        title={modal.editing ? 'Editar Categoria' : 'Nova Categoria'}
        size="sm"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="label">Nome *</label>
            <input
              className="input"
              required
              value={form.name}
              onChange={(e) => setForm({ name: e.target.value })}
              placeholder="Ex: Ficção Científica"
              autoFocus
            />
          </div>
          <div className="flex gap-3 justify-end">
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
