export async function recordMatch(
  userId: string,
  targetUserId: string,
  action: "like" | "pass",
): Promise<{ error: string | null; mutualMatch: boolean }> {

  // 1. Grava no histórico de ações (matches)
  const { error: swipeError } = await supabase.from("matches").upsert(
    { user_id: userId, target_user_id: targetUserId, action },
    { onConflict: "user_id,target_user_id" },
  );

  if (swipeError) {
    console.error("Erro ao gravar histórico em matches:", swipeError.message);
    return { error: swipeError.message, mutualMatch: false };
  }

  // Se foi um 'pass' (descarte), encerra aqui
  if (action !== "like") return { error: null, mutualMatch: false };

  // 2. Notificação interna + Push de "Alguém curtiu você"
  supabase
    .from("profiles")
    .select("name, avatar_url")
    .eq("id", userId)
    .maybeSingle()
    .then(({ data: actor }) => {
      supabase.from("notifications").insert({
        user_id: targetUserId,
        type: "like",
        title: actor?.name ? `${actor.name} curtiu você! 🔥` : "Alguém curtiu você! 🔥",
        content: "Toque para ver quem te curtiu",
        is_read: false,
        actor_id: userId,
        actor_avatar_url: actor?.avatar_url ?? null,
      }).then(() => {});

      supabase
        .from("profiles")
        .select("onesignal_player_id")
        .eq("id", targetUserId)
        .maybeSingle()
        .then(({ data: targetProf }) => {
          if ((targetProf as any)?.onesignal_player_id) {
            sendPushNotification(
              (targetProf as any).onesignal_player_id,
              actor?.name ? `${actor.name} curtiu você! 🔥` : "Nova curtida! 🔥",
              "Toque para ver no HotMatch"
            );
          }
        });
    })
    .catch(() => {});

  // 3. Verifica se o Trigger do banco gerou um Match Mútuo entre os dois
  const [u1, u2] = [userId, targetUserId].sort();
  const { data: matchData } = await supabase
    .from("mutual_matches")
    .select("id")
    .eq("user_1", u1)
    .eq("user_2", u2)
    .maybeSingle();

  // Se ainda não houve match recíproco, encerra por aqui
  if (!matchData) return { error: null, mutualMatch: false };

  // 4. DEU MATCH MÚTUO! Dispara notificações e push de Match para ambos
  supabase
    .from("profiles")
    .select("id, name, onesignal_player_id")
    .in("id", [userId, targetUserId])
    .then(({ data: profs }) => {
      const me = profs?.find((p) => p.id === userId);
      const them = profs?.find((p) => p.id === targetUserId);

      const meContent = them?.name
        ? `Você e ${them.name} se curtiram! Comece a conversar agora.`
        : "Vocês se curtiram! Comece a conversar agora.";
      const themContent = me?.name
        ? `Você e ${me.name} se curtiram! Comece a conversar agora.`
        : "Vocês se curtiram! Comece a conversar agora.";

      supabase.from("notifications").insert([
        { user_id: userId, type: "match", title: "Deu Match! 🔥", content: meContent, is_read: false },
        { user_id: targetUserId, type: "match", title: "Deu Match! 🔥", content: themContent, is_read: false },
      ]).then(() => {});

      if ((me as any)?.onesignal_player_id) {
        sendPushNotification((me as any).onesignal_player_id, "Deu Match! 🔥", meContent);
      }
      if ((them as any)?.onesignal_player_id) {
        sendPushNotification((them as any).onesignal_player_id, "Deu Match! 🔥", themContent);
      }
    })
    .catch(() => {});

  return { error: null, mutualMatch: true };
}
