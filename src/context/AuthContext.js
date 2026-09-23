'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [UserAllDetails, setUserAllDetails] = useState(null);

  // Load user from cookies on mount
  useEffect(() => {
    const token = Cookies.get("token");
    const name = Cookies.get("name");
    const role = Cookies.get("role");
    const email = Cookies.get("email");

    if (token && name && role) {
      setUser({ token, name, role, email });
    }
  }, []);

  // Fetch all users when user (token) changes
  useEffect(() => {
    if (!user?.token) {
      setUserAllDetails(null);
      return;
    }

    const fetchUserData = async () => {
      try {
        const res = await fetch(
          `https://code360.pro/api/user-all`,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${user.token}`,
            },
          }
        );

        if (res.ok) {
          const data = await res.json();
          setUserAllDetails(data.user);
        } else {
          console.error('Failed to fetch user data');
        }
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
