import { useEffect } from "react";
import { useAppState } from "@/lib/hotmatch/store";
import { supabase } from "@/lib/supabase";

export function useSessionBootstrap() {
  const { setProfileId, setProfile } = useAppState();

  useEffect(() => {
    async function loadSession() {
      // Verifica se há uma sessão ativa no Supabase Auth
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        setProfileId(null);
        setProfile(null);
        return;
      }

      const userId = session.user.id;

      // Busca o perfil correspondente na tabela profiles
      const { data: profileData, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error || !profileData) {
        // Se o usuário está autenticado mas ainda não tem perfil criado
        setProfileId(userId);
        setProfile(null);
        return;
      }

      setProfileId(profileData.id);
      setProfile(profileData);
    }

    loadSession();

    // Ouve mudanças de autenticação (login, logout, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session?.user) {
        setProfileId(null);
        setProfile(null);
        return;
      }

      const userId = session.user.id;
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      setProfileId(userId);
      setProfile(profileData || null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setProfileId, setProfile]);
            }
