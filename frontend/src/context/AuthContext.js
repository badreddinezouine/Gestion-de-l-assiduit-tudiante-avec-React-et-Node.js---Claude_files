import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const navigate = useNavigate();

  // Configurer axios
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Vérifier l'authentification au chargement
  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      if (storedToken && storedUser) {
        try {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          
          // Vérifier la validité du token
          await axios.get('/api/auth/profile');
        } catch (error) {
          logout();
        }
      }
      setLoading(false);
    };
    
    checkAuth();
  }, []);

  // Login
  const login = async (email, password) => {
    try {
      const response = await axios.post('/api/auth/login', {
        email,
        motDePasse: password
      });

      const { token, user } = response.data;
      
      // Stocker dans le state
      setToken(token);
      setUser(user);
      
      // Stocker dans localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Configurer axios
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Rediriger selon le rôle
      if (user.role === 'PROFESSEUR') {
        navigate('/professor/dashboard');
      } else if (user.role === 'ETUDIANT') {
        navigate('/student/dashboard');
      }
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erreur de connexion'
      };
    }
  };

  // Logout
  const logout = () => {
    // Supprimer du state
    setUser(null);
    setToken(null);
    
    // Supprimer du localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Supprimer le header axios
    delete axios.defaults.headers.common['Authorization'];
    
    // Rediriger vers login
    navigate('/login');
  };

  // Register
  const register = async (userData) => {
    try {
      const response = await axios.post('/api/auth/register', userData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || "Erreur d'inscription"
      };
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    register
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};