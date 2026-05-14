import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { 
  Users, UserPlus, Search, MoreVertical, 
  Trash2, Mail, Hash, ChevronRight, X 
} from 'lucide-react';

interface Client {
  id: string;
  display_name: string;
  email: string;
  username: string;
  created_at: string;
}

export default function ClientManagementPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // New Client Form
  const [newClient, setNewClient] = useState({
    email: '',
    displayName: '',
    username: '',
    passcode: ''
  });
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'client')
      .order('display_name', { ascending: true });

    if (!error) setClients(data || []);
    setLoading(false);
  };

  const generatePasscode = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setNewClient(prev => ({ ...prev, passcode: code }));
  };

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      // 1. Create auth user (this requires service role, or a specialized edge function)
      // For now, we'll use a placeholder logic or assume coach has permissions
      // Note: Admin.createUser is only available with service role.
      // In a real app, this should be an Edge Function.
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newClient.email,
        password: newClient.passcode,
        options: {
          data: {
            display_name: newClient.displayName,
            role: 'client'
          }
        }
      });

      if (authError) throw authError;

      // Profile is typically created via Trigger in Supabase, but we can do it here too
      // if trigger isn't set up yet.
      
      setIsAddModalOpen(false);
      setNewClient({ email: '', displayName: '', username: '', passcode: '' });
      fetchClients();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const filteredClients = clients.filter(c => 
    c.display_name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Client Management</h1>
          <p className="text-gray-400">Manage your roster of {clients.length} athletes</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-2xl flex items-center gap-2 font-bold transition-all shadow-lg shadow-primary/20"
        >
          <UserPlus size={20} />
          Add New Client
        </button>
      </header>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="glass-card p-4 flex items-center gap-4">
          <div className="bg-blue-400/10 p-3 rounded-xl text-blue-400">
            <Users size={24} />
          </div>
          <div>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Total Clients</p>
            <p className="text-2xl font-bold">{clients.length}</p>
          </div>
        </div>
        {/* Add more stats as needed */}
      </div>

      {/* Search & List */}
      <div className="glass-card overflow-hidden">
        <div className="p-4 border-b border-white/5">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
            <input 
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/5 rounded-xl py-3 pl-12 pr-4 focus:bg-white/10 outline-none transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-gray-500 text-xs font-bold uppercase tracking-wider border-b border-white/5">
                <th className="px-6 py-4">Client</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Joined</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">Loading clients...</td>
                </tr>
              ) : filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">No clients found.</td>
                </tr>
              ) : (
                filteredClients.map((client) => (
                  <tr key={client.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                          {client.display_name.charAt(0)}
                        </div>
                        <span className="font-medium">{client.display_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-400">{client.email}</td>
                    <td className="px-6 py-4 text-gray-400">
                      {new Date(client.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button className="p-2 hover:bg-white/10 rounded-lg text-gray-400 transition-colors">
                          <ChevronRight size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Client Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative glass-card w-full max-w-lg p-8 shadow-2xl"
            >
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="absolute right-6 top-6 text-gray-500 hover:text-white"
              >
                <X size={24} />
              </button>

              <h2 className="text-2xl font-bold mb-2">Add New Client</h2>
              <p className="text-gray-400 mb-8">Create a new profile and generate credentials.</p>

              <form onSubmit={handleAddClient} className="space-y-6">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Display Name</label>
                  <input 
                    type="text"
                    required
                    value={newClient.displayName}
                    onChange={(e) => setNewClient({...newClient, displayName: e.target.value})}
                    className="w-full bg-white/5 border border-white/5 rounded-xl py-4 px-4 focus:bg-white/10 outline-none transition-all"
                    placeholder="e.g. John Doe"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input 
                      type="email"
                      required
                      value={newClient.email}
                      onChange={(e) => setNewClient({...newClient, email: e.target.value})}
                      className="w-full bg-white/5 border border-white/5 rounded-xl py-4 pl-12 pr-4 focus:bg-white/10 outline-none transition-all"
                      placeholder="client@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Login Passcode</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                      <input 
                        type="text"
                        required
                        value={newClient.passcode}
                        onChange={(e) => setNewClient({...newClient, passcode: e.target.value})}
                        className="w-full bg-white/5 border border-white/5 rounded-xl py-4 pl-12 pr-4 focus:bg-white/10 outline-none transition-all"
                        placeholder="6-digit code"
                      />
                    </div>
                    <button 
                      type="button"
                      onClick={generatePasscode}
                      className="bg-white/5 hover:bg-white/10 text-white px-4 rounded-xl transition-all border border-white/5"
                    >
                      Generate
                    </button>
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={formLoading}
                  className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 transition-all disabled:opacity-50"
                >
                  {formLoading ? 'Creating Client...' : 'Confirm & Send Access'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
