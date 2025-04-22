import { createContext, useContext, useState, useEffect } from "react";
import { createClient, Session, AuthChangeEvent } from "@supabase/supabase-js";

// Define user type
interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  user: null,
  signIn: async () => {},
  signUp: async () => {},
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: React.ReactNode;
}

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth
      .getSession()
      .then(({ data: { session } }: { data: { session: Session | null } }) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || "",
            name: session.user.user_metadata?.name || "",
          });
          setIsAuthenticated(true);
        }
        setIsLoading(false);
      });

    // Listen for changes on auth state (logged in, signed out, etc.)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, session: Session | null) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || "",
            name: session.user.user_metadata?.name || "",
          });
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        setUser({
          id: data.user.id,
          email: data.user.email || "",
          name: data.user.user_metadata?.name || "",
        });
        setIsAuthenticated(true);
      }
    } catch (error: any) {
      console.error("Sign-up error:", error);
      throw new Error(error.message || "Failed to create account");
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        setUser({
          id: data.user.id,
          email: data.user.email || "",
          name: data.user.user_metadata?.name || "",
        });
        setIsAuthenticated(true);
      }
    } catch (error: any) {
      console.error("Sign-in error:", error);
      throw new Error(error.message || "Failed to sign in");
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setUser(null);
      setIsAuthenticated(false);
    } catch (error: any) {
      console.error("Logout error:", error);
      throw new Error(error.message || "Failed to logout");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        user,
        signIn,
        signUp,
        logout,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
