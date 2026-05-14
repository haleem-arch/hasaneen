import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCoachClients } from '../../hooks/useCoachClients';
import {
  UserPlus, Search, ChevronRight, Users, Mail
} from 'lucide-react';

export default function ClientsListPage() {
  const { clients, loading } = useCoachClients();
  const [search, setSearch] = useState('');

  const filtered = clients.filter(c =>
    c.user?.display_name?.toLowerCase().includes(search.toLowerCase()) ||
    c.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.user?.username?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Client Management</h1>
          <p className="text-gray-400">Manage your roster of {clients.length} athletes</p>
        </div>
        <Link
          to="/coach/clients/new"
          className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-2xl flex items-center gap-2 font-bold transition-all shadow-lg shadow-primary/20"
        >
          <UserPlus size={20} />
          Add New Client
        </Link>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="glass-card p-5 flex items-center gap-4">
          <div className="bg-blue-400/10 p-3 rounded-2xl text-blue-400">
            <Users size={22} />
          </div>
          <div>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Total Clients</p>
            <p className="text-2xl font-black">{clients.length}</p>
          </div>
        </div>
        <div className="glass-card p-5 flex items-center gap-4">
          <div className="bg-emerald-400/10 p-3 rounded-2xl text-emerald-400">
            <Users size={22} />
          </div>
          <div>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Active Plans</p>
            <p className="text-2xl font-black">{clients.filter(c => (c.workouts_per_week ?? 0) > 0).length}</p>
          </div>
        </div>
        <div className="glass-card p-5 flex items-center gap-4">
          <div className="bg-amber-400/10 p-3 rounded-2xl text-amber-400">
            <Mail size={22} />
          </div>
          <div>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Search Results</p>
            <p className="text-2xl font-black">{filtered.length}</p>
          </div>
        </div>
      </div>

      {/* Search + Table */}
      <div className="glass-card overflow-hidden">
        <div className="p-5 border-b border-white/5">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input
              type="text"
              placeholder="Search by name, email, or username..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/5 rounded-xl py-3 pl-11 pr-4 outline-none focus:bg-white/10 transition-all placeholder:text-gray-600"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-gray-500 text-xs font-black uppercase tracking-widest border-b border-white/5">
                <th className="px-6 py-4">Athlete</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Level</th>
                <th className="px-6 py-4">Schedule</th>
                <th className="px-6 py-4">Passcode</th>
                <th className="px-6 py-4">Joined</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    Loading clients...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    {search ? `No clients matching "${search}"` : 'No clients yet. Add your first athlete!'}
                  </td>
                </tr>
              ) : (
                filtered.map((client, i) => (
                  <motion.tr
                    key={client.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="hover:bg-white/5 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-sm flex-shrink-0">
                          {client.user?.display_name?.charAt(0) ?? 'A'}
                        </div>
                        <div>
                          <p className="font-bold text-gray-100">{client.user?.display_name}</p>
                          <p className="text-xs text-gray-500">@{client.user?.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-sm">{client.user?.email}</td>
                    <td className="px-6 py-4">
                      <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase border border-primary/10">
                        {client.experience_level ?? 'Beginner'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-300 text-sm font-bold">
                      {client.workouts_per_week ?? 3} Days/Week
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm bg-white/5 px-3 py-1 rounded-lg border border-white/5 text-gray-300">
                        {client.generated_passcode ?? '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-sm">
                      {client.user?.created_at ? new Date(client.user.created_at).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        to={`/coach/clients/${client.user?.id}`}
                        className="inline-flex items-center gap-1 text-primary text-sm font-bold hover:underline group-hover:translate-x-0.5 transition-transform"
                      >
                        View <ChevronRight size={16} />
                      </Link>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
