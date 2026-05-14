import { motion } from 'framer-motion';
import { Users, ClipboardList, Activity, TrendingUp, Plus, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCoachClients } from '../../hooks/useCoachClients';

export default function DashboardPage() {
  const { clients, loading } = useCoachClients();

  const stats = [
    {
      label: 'Total Clients',
      value: loading ? '...' : clients.length.toString(),
      icon: Users,
      color: 'text-blue-400',
      bg: 'bg-blue-400/10',
    },
    {
      label: 'Active Plans',
      value: loading ? '...' : clients.filter(c => (c.workouts_per_week ?? 0) > 0).length.toString(),
      icon: ClipboardList,
      color: 'text-amber-400',
      bg: 'bg-amber-400/10',
    },
    {
      label: 'Avg Adherence',
      value: '92%',
      icon: Activity,
      color: 'text-emerald-400',
      bg: 'bg-emerald-400/10',
    },
    {
      label: 'Progress Rate',
      value: '78%',
      icon: TrendingUp,
      color: 'text-purple-400',
      bg: 'bg-purple-400/10',
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Coach Dashboard</h1>
          <p className="text-gray-400">
            {loading ? 'Loading...' : `You have ${clients.length} active athletes.`}
          </p>
        </div>
        <Link
          to="/coach/clients/new"
          className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-2xl flex items-center gap-2 font-bold transition-all shadow-lg shadow-primary/20"
        >
          <Plus size={20} />
          Add Client
        </Link>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-6 group hover:border-primary/20 transition-all"
          >
            <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
              <stat.icon size={24} />
            </div>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">{stat.label}</p>
            <p className="text-3xl font-black mt-1">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Recent Clients */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass-card p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Recent Clients</h2>
            <Link to="/coach/clients" className="text-primary text-sm font-bold hover:underline">
              View All
            </Link>
          </div>

          {loading ? (
            <div className="py-20 text-center text-gray-500">Loading athletes...</div>
          ) : clients.length === 0 ? (
            <div className="py-20 text-center space-y-4">
              <p className="text-gray-500 italic">No clients in your roster yet.</p>
              <Link to="/coach/clients/new" className="text-primary font-bold hover:underline">
                Create your first client →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {clients.slice(0, 5).map((client) => (
                <Link
                  key={client.id}
                  to={`/coach/clients/${client.user?.id}`}
                  className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-lg">
                      {client.user?.display_name?.charAt(0) ?? 'A'}
                    </div>
                    <div>
                      <p className="font-bold text-gray-100">{client.user?.display_name}</p>
                      <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">
                        {client.experience_level ?? 'Beginner'} &bull; {client.workouts_per_week ?? 3} Days/Week
                      </p>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-gray-700 group-hover:text-primary transition-colors" />
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Tips Panel */}
        <div className="glass-card p-8 bg-primary/5 border-primary/10">
          <h2 className="text-xl font-bold mb-6">Quick Tips</h2>
          <div className="space-y-6 text-sm text-gray-400 leading-relaxed">
            <div className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-black flex-shrink-0">1</span>
              Check client adherence weekly to ensure high retention.
            </div>
            <div className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-black flex-shrink-0">2</span>
              Update InBody scans every 4 weeks for accurate analytics.
            </div>
            <div className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-black flex-shrink-0">3</span>
              Leave coach notes after each client check-in.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
