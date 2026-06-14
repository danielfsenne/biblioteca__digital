import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Menu, BookOpen } from 'lucide-react'
import Sidebar from './Sidebar'

export default function Layout() {
  const [open, setOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-gray-50">
      {open && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <div className={`fixed inset-y-0 left-0 z-30 lg:static lg:z-auto transition-transform duration-200 ${
        open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <Sidebar onClose={() => setOpen(false)} />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 bg-gray-950 border-b border-gray-800">
          <button
            onClick={() => setOpen(true)}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-800 transition-colors"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-indigo-600 flex items-center justify-center">
              <BookOpen size={13} className="text-white" />
            </div>
            <span className="text-sm font-semibold text-white">Biblioteca Digital</span>
          </div>
        </div>
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
