import { supabase } from '../lib/supabase';
import { useEffect, useState } from 'react';

export const useCoachClients = () => {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClients = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // We fetch from client_profiles to get the specific athlete data,
      // and join with profiles to get the auth-related details.
      const { data, error } = await supabase
        .from('client_profiles')
        .select(`
          *,
          user:profiles(id, username, email, display_name, created_at)
        `)
        .eq('coach_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching clients:', error);
      } else {
        setClients(data || []);
      }
      setLoading(false);
    };

    fetchClients();
    
    // Optional: Add real-time subscription here if needed later
  }, []);

  return { clients, loading };
};
