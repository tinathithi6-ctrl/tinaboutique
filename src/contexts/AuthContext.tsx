import { createContext, useContext, useEffect, useState } from "react";

// Définir un type plus générique pour l'utilisateur
interface AppUser {
  id: string;
  email: string;
  fullName?: string;
  role?: string;
}

interface AuthContextType {
  user: AppUser | null;
  token: string | null;
  loading: boolean;
  setAuthData: (user: AppUser, token: string) => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  loading: true,
  setAuthData: () => {},
  signOut: () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Configuration de la durée de session (30 jours par défaut pour e-commerce)
const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 jours

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Au chargement, essayer de récupérer les données depuis le localStorage
    try {
      const storedToken = localStorage.getItem('authToken');
      const storedUser = localStorage.getItem('authUser');
      const storedExpiry = localStorage.getItem('authExpiry');
      
      if (storedToken && storedUser && storedExpiry) {
        const expiryTime = parseInt(storedExpiry);
        const now = Date.now();
        
        // Vérifier si la session a expiré
        if (now < expiryTime) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          
          // Renouveler l'expiration à chaque chargement (activité)
          const newExpiry = now + SESSION_DURATION_MS;
          localStorage.setItem('authExpiry', newExpiry.toString());
        } else {
          // Session expirée, nettoyer
          console.log('Session expirée');
          localStorage.removeItem('authUser');
          localStorage.removeItem('authToken');
          localStorage.removeItem('authExpiry');
        }
      }
    } catch (error) {
      console.error("Impossible de charger les données d'authentification", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const setAuthData = (user: AppUser, token: string) => {
    setUser(user);
    setToken(token);
    const expiry = Date.now() + SESSION_DURATION_MS;
    localStorage.setItem('authUser', JSON.stringify(user));
    localStorage.setItem('authToken', token);
    localStorage.setItem('authExpiry', expiry.toString());
  };

  const signOut = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('authUser');
    localStorage.removeItem('authToken');
    localStorage.removeItem('authExpiry');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, setAuthData, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
