import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, Users, ClipboardList, 
  Settings, LogOut, Activity, Dumbbell 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function CoachSidebar() {
  const { signOut } = useAuth();
  const location = useLocation();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Overview', path: '/coach/dashboard' },
    { icon: Users, label: 'Clients', path: '/coach/clients' },
    { icon: ClipboardList, label: 'Plans', path: '/coach/plans' },
    { icon: Dumbbell, label: 'Library', path: '/coach/exercises' },
    { icon: Activity, label: 'Analytics', path: '/coach/analytics' },
  ];

  return (
    <div className="w-64 h-screen bg-surface border-r border-white/5 flex flex-col fixed left-0 top-0">
      <div className="p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-primary p-2 rounded-xl">
            <Activity className="text-white" size={24} />
          </div>
          <span className="text-xl font-bold tracking-tight">Hasaneen PT</span>
        </div>

        <nav className="space-y-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link 
                key={item.path} 
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive 
                    ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                    : 'text-gray-500 hover:bg-white/5 hover:text-white'
                }`}
              >
                <item.icon size={20} />
                <span className="font-medium">{item.label}</span>
                {isActive && (
                  <motion.div 
                    layoutId="activeTab"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-white"
                  />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto p-8 border-t border-white/5">
        <button 
          onClick={() => signOut()}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-error hover:bg-error/10 w-full transition-all"
        >
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}
