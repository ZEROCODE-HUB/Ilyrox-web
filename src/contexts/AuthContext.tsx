import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
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

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("perfiles")
        .select("nombre_completo, foto")
        .eq("id", userId)
        .single();

      if (error) {
        if (error.code !== "PGRST116") {
          console.error("Error fetching profile:", error);
        }
        return null;
      }
      return data;
    } catch (error) {
      console.error("Unexpected error fetching profile:", error);
      return null;
    }
  }, []);

  const updateUserInfo = useCallback(
    async (sessionUser: User | null) => {
      if (sessionUser) {
        setUser(sessionUser);

        // Initially set profile with metadata fallback
        const fullName =
          sessionUser.user_metadata?.full_name ||
          sessionUser.user_metadata?.nombre ||
          sessionUser.email?.split("@")[0];
        const avatarUrl = sessionUser.user_metadata?.foto;

        setProfile({ full_name: fullName, foto: avatarUrl });

        // Then attempt to fetch enriched profile from DB asynchronously
        // We don't await this here to avoid blocking the auth state update
        fetchProfile(sessionUser.id).then((dbProfile) => {
          if (dbProfile) {
            setProfile({
              full_name: dbProfile.nombre_completo,
              foto: dbProfile.foto,
            });
          }
        });
      } else {
        setUser(null);
        setProfile(null);
      }
    },
    [fetchProfile],
  );

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      // Get initial session once
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (mounted) {
        await updateUserInfo(session?.user ?? null);
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (mounted) {
        // Only trigger update if it's not the initial session check we already did,
        // or if the event specifically requires an update (like SIGNED_IN, SIGNED_OUT)
        if (
          event === "SIGNED_IN" ||
          event === "SIGNED_OUT" ||
          event === "USER_UPDATED" ||
          event === "TOKEN_REFRESHED"
        ) {
          await updateUserInfo(session?.user ?? null);
        }
        setIsLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [updateUserInfo]);

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
