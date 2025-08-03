import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";

interface UserData {
  id: string;
  email: string;
  nome_completo?: string;
  celular?: string;
  aprovado?: boolean;
  isAdmin: boolean;
}

export const useAuth = () => {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        loadUserData(session.user);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        if (session?.user) {
          await loadUserData(session.user);
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const loadUserData = async (authUser: User) => {
    try {
      // Check if admin
      const isAdmin = authUser.email === 'alice@paraiso.com';

      setUser({
        id: authUser.id,
        email: authUser.email || '',
        nome_completo: authUser.user_metadata?.nome_completo,
        celular: authUser.user_metadata?.celular,
        aprovado: isAdmin || authUser.user_metadata?.aprovado || false,
        isAdmin
      });
    } catch (error) {
      console.error('Error loading user data:', error);
      setUser({
        id: authUser.id,
        email: authUser.email || '',
        isAdmin: authUser.email === 'alice@paraiso.com'
      });
    }
  };

  const signUp = async (email: string, password: string, nomeCompleto: string, celular: string) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nome_completo: nomeCompleto,
            celular: celular,
            aprovado: email === 'alice@paraiso.com'
          }
        }
      });

      if (error) throw error;

      return { success: true, needsApproval: email !== 'alice@paraiso.com' };
    } catch (error: any) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    navigate("/");
  };

  const isAuthenticated = !!session;
  const isApproved = user?.aprovado || user?.isAdmin;

  return {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    isAuthenticated,
    isApproved
  };
};