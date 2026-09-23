'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { supabase } from '@/utils/supabaseClient';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [UserAllDetails, setUserAllDetails] = useState(null);

  // Load user from cookies on mount
  useEffect(() => {
    const token = Cookies.get("token");
    const id = Cookies.get("id");
    const name = Cookies.get("name");
    const role = Cookies.get("role");
    const email = Cookies.get("email");

    if (token && name && role) {
      setUser({ token, id, name, role, email });
    }
  }, []);

  // Fetch the full HR profile from Supabase when the signed-in user changes
  useEffect(() => {
    if (!user?.id) {
      setUserAllDetails(null);
      return;
    }

    const fetchUserData = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Failed to fetch user profile:', error.message);
          return;
        }

        setUserAllDetails(data);
      } catch (err) {
        console.error('Error fetching user data:', err);
      }
    };

    fetchUserData();
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, setUser, UserAllDetails, setUserAllDetails }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
