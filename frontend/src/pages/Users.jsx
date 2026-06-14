import { useEffect, useState } from 'react'
import { Trash2, Loader2, Users as UsersIcon } from 'lucide-react'
import { usersApi } from '../api/users'
import { useToast } from '../components/Toast'

export default function Users() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(null)
  const toast = useToast()

  async function load() {
    setLoading(true)
    try {
      const res = await usersApi.getAll()
      setUsers(res.data)
    } catch {
      toast('Erro ao carregar usuários', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function handleDelete(id) {
    if (!confirm('Remover este usuário?')) return
    setDeleting(id)
    try {
      await usersApi.delete(id)
      toast('Usuário removido!')
      load()
    } catch {
      toast('Erro ao remover usuário', 'error')
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="p-4 sm:p-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Usuários</h1>
        <p className="text-gray-500 text-sm mt-1">Usuários cadastrados no sistema</p>
      </div>

      <div className="card">
        {loading ? (
          <div className="p-12 flex items-center justify-center">
            <Loader2 size={24} className="animate-spin text-indigo-500" />
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center">
            <UsersIcon size={40} className="mx-auto text-gray-200 mb-3" />
            <p className="text-sm text-gray-400">Nenhum usuário cadastrado</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[400px]">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="table-header">Usuário</th>
                  <th className="table-header hidden sm:table-cell">Email</th>
                  <th className="table-header hidden md:table-cell">Perfil</th>
                  <th className="table-header w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="table-cell">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600 uppercase shrink-0">
                          {u.name?.[0] || '?'}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 truncate">{u.name}</p>
                          <p className="text-xs text-gray-400 sm:hidden truncate">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell text-gray-500 hidden sm:table-cell">{u.email}</td>
                    <td className="table-cell hidden md:table-cell">
                      <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">
                        {u.role?.replace('ROLE_', '') || 'USER'}
                      </span>
                    </td>
                    <td className="table-cell">
                      <button
                        onClick={() => handleDelete(u.id)}
                        disabled={deleting === u.id}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                      >
                        {deleting === u.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
