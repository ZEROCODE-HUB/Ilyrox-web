import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  profile: {
    full_name?: string;
    foto?: string;
  } | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<{
    full_name?: string;
    foto?: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("perfiles")
        .select("nombre_completo, foto")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        return null;
      }
      return data;
    } catch (error) {
      console.error("Unexpected error fetching profile:", error);
      return null;
    }
  };

  const updateUserInfo = async (sessionUser: User | null) => {
    if (sessionUser) {
      setUser(sessionUser);

      // Fetch profile from DB
      const dbProfile = await fetchProfile(sessionUser.id);

      if (dbProfile) {
        setProfile({
          full_name: dbProfile.nombre_completo,
          foto: dbProfile.foto,
        });
      } else {
        // Fallback to metadata if DB fetch fails
        const fullName =
          sessionUser.user_metadata?.full_name ||
          sessionUser.user_metadata?.nombre ||
          sessionUser.email?.split("@")[0];
        const avatarUrl = sessionUser.user_metadata?.foto;
        setProfile({ full_name: fullName, foto: avatarUrl });
      }
    } else {
      setUser(null);
      setProfile(null);
    }
  };

  useEffect(() => {
    // Check active session
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      await updateUserInfo(session?.user ?? null);
      setIsLoading(false);
    };

    checkSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      await updateUserInfo(session?.user ?? null);
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, profile, isLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
