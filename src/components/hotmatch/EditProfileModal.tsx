import { useEffect, useRef, useState } from "react";
import { Camera, Loader2, Plus, Save, X } from "lucide-react";
import { toast } from "sonner";
import { actions, useAppState } from "@/lib/hotmatch/store";
import { supabase, type DbProfile, type DbUserPhoto } from "@/lib/supabase";

/* ── Slot represents one gallery cell: empty, from DB, or a new local file ── */
type SlotState =
  | { kind: "empty" }
  | { kind: "existing"; id: string; url: string }
  | { kind: "new"; file: File; preview: string };

function buildSlots(photos: DbUserPhoto[], count: number): SlotState[] {
  const slots: SlotState[] = Array.from({ length: count }, () => ({ kind: "empty" }));
  photos.slice(0, count).forEach((p, i) => {
    slots[i] = { kind: "existing", id: p.id, url: p.photo_url };
  });
  return slots;
}

function slotSrc(s: SlotState): string | null {
  if (s.kind === "existing") return s.url;
  if (s.kind === "new") return s.preview;
  return null;
}

async function uploadFile(bucket: string, file: File, path: string): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { upsert: true, contentType: file.type });
  if (error) {
    console.error("[Upload] Failed:", error.message);
    toast.error(`Erro ao enviar imagem: ${error.message}`);
    return null;
  }
  const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(data.path);
  return publicUrl;
}

type Props = {
  open: boolean;
  onClose: () => void;
  onSaved?: () => void;
  profile?: DbProfile | null;
  publicPhotos?: DbUserPhoto[];
  vipPhotos?: DbUserPhoto[];
};

export function EditProfileModal({
  open,
  onClose,
  onSaved,
  profile,
  publicPhotos: publicPhotosProp = [],
  vipPhotos: vipPhotosProp = [],
}: Props) {
  const { gender, profileId, name: storeName, avatarUrl: storeAvatar, coins, earnings } = useAppState();
  const isCreator = gender === "female";

  const [name, setName] = useState(storeName || "");
  const [age, setAge] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");

  const [avatarPreview, setAvatarPreview] = useState<string | null>(storeAvatar);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const [publicSlots, setPublicSlots] = useState<SlotState[]>(buildSlots([], 3));
  const [vipSlots, setVipSlots] = useState<SlotState[]>(buildSlots([], 6));
  const [deletedPhotoIds, setDeletedPhotoIds] = useState<string[]>([]);

  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const avatarInputRef = useRef<HTMLInputElement>(null);

  /* Pre-populate fields from DB profile + photos whenever the modal opens */
  useEffect(() => {
    if (!open) return;
    setName(profile?.name ?? storeName ?? "");
    setAge(profile?.age != null ? String(profile.age) : "");
    setBio(profile?.bio ?? "");
    setLocation(profile?.location ?? "");
    setAvatarPreview(profile?.avatar_url ?? storeAvatar ?? null);
    setAvatarFile(null);
    setPublicSlots(buildSlots(publicPhotosProp, 3));
    setVipSlots(buildSlots(vipPhotosProp, 6));
    setDeletedPhotoIds([]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function onAvatarPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }

  function handleGalleryPick(
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
    kind: "public" | "vip",
  ) {
    const file = e.target.files?.[0];
    if (!file) return;
    const newSlot: SlotState = { kind: "new", file, preview: URL.createObjectURL(file) };
    if (kind === "public") {
      setPublicSlots((prev) => prev.map((s, i) => (i === index ? newSlot : s)));
    } else {
      setVipSlots((prev) => prev.map((s, i) => (i === index ? newSlot : s)));
    }
    // reset the input so the same file can be re-selected if needed
    e.target.value = "";
  }

  function handleGalleryRemove(index: number, kind: "public" | "vip") {
    const slots = kind === "public" ? publicSlots : vipSlots;
    const slot = slots[index];
    if (slot.kind === "existing") {
      setDeletedPhotoIds((ids) => [...ids, slot.id]);
    }
    const empty: SlotState = { kind: "empty" };
    if (kind === "public") {
      setPublicSlots((prev) => prev.map((s, i) => (i === index ? empty : s)));
    } else {
      setVipSlots((prev) => prev.map((s, i) => (i === index ? empty : s)));
    }
  }

  async function save() {
    if (!profileId) { toast.error("Faça login para editar o perfil."); return; }
    setSaving(true);

    try {
      /* 1 — Upload avatar to dedicated 'avatars' bucket if a new file was selected */
      let newAvatarUrl: string | null = null;
      if (avatarFile) {
        setUploadingAvatar(true);
        const ext = avatarFile.name.split(".").pop() ?? "jpg";
        newAvatarUrl = await uploadFile(
          "avatars",
          avatarFile,
          `${profileId}/avatar_${Date.now()}.${ext}`,
        );
        setUploadingAvatar(false);
        if (!newAvatarUrl) { setSaving(false); return; }
      }
      const finalAvatarUrl = newAvatarUrl ?? profile?.avatar_url ?? storeAvatar;

      /* 2 — Build and apply profiles UPDATE */
      const updatePayload: Record<string, unknown> = {};
      if (name.trim()) updatePayload.name = name.trim();
      if (age.trim() && !isNaN(Number(age))) updatePayload.age = Number(age);
      if (bio.trim()) updatePayload.bio = bio.trim();
      if (location.trim()) updatePayload.location = location.trim();
      if (newAvatarUrl) updatePayload.avatar_url = newAvatarUrl;

      if (Object.keys(updatePayload).length > 0) {
        const { error } = await supabase
          .from("profiles")
          .update(updatePayload)
          .eq("id", profileId);
        if (error) throw new Error(error.message);
      }

      /* 3 — Delete removed photos from user_photos table */
      if (deletedPhotoIds.length > 0) {
        const { error } = await supabase
          .from("user_photos")
          .delete()
          .in("id", deletedPhotoIds);
        if (error) console.error("[Delete photos] Failed:", error.message);
      }

      /* 4 — Upload new gallery photos to 'user_photos' bucket and insert DB rows */
      const newPublicUploads = publicSlots
        .filter((s): s is Extract<SlotState, { kind: "new" }> => s.kind === "new")
        .map(async ({ file }, i) => {
          const ext = file.name.split(".").pop() ?? "jpg";
          const url = await uploadFile(
            "user_photos",
            file,
            `${profileId}/public_${Date.now()}_${i}.${ext}`,
          );
          if (url) {
            await supabase.from("user_photos").insert({
              user_id: profileId,
              photo_url: url,
              is_vip: false,
              coin_price: 0,
              sort_order: i,
            });
          }
        });

      const newVipUploads = isCreator
        ? vipSlots
            .filter((s): s is Extract<SlotState, { kind: "new" }> => s.kind === "new")
            .map(async ({ file }, i) => {
              const ext = file.name.split(".").pop() ?? "jpg";
              const url = await uploadFile(
                "user_photos",
                file,
                `${profileId}/vip_${Date.now()}_${i}.${ext}`,
              );
              if (url) {
                await supabase.from("user_photos").insert({
                  user_id: profileId,
                  photo_url: url,
                  is_vip: true,
                  coin_price: 60,
                  sort_order: i,
                });
              }
            })
        : [];

      await Promise.all([...newPublicUploads, ...newVipUploads]);

      /* 5 — Sync store and notify parent */
      actions.setProfile({
        profileId,
        gender,
        name: (updatePayload.name as string | undefined) ?? storeName,
        avatarUrl: finalAvatarUrl ?? storeAvatar,
        coins,
        earnings,
      });

      toast.success("Perfil atualizado! ✨");
      onSaved?.();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[30rem] overflow-y-auto rounded-t-3xl border-t border-border bg-background"
        style={{ maxHeight: "92dvh" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center pt-3">
          <div className="h-1 w-10 rounded-full bg-border" />
        </div>

        <div className="flex items-center justify-between px-5 py-4">
          <h2 className="text-lg font-extrabold">Editar Perfil</h2>
          <button onClick={onClose} className="grid size-8 place-items-center rounded-full bg-surface-2">
            <X className="size-4 text-muted-foreground" />
          </button>
        </div>

        <div className="space-y-6 px-5 pb-10">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <div className="ring-match grid size-24 place-items-center rounded-full p-[3px] shadow-gold">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="size-full rounded-full object-cover" />
                ) : (
                  <div className="size-full rounded-full bg-surface-2" />
                )}
              </div>
              <button
                onClick={() => avatarInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="tap-scale absolute -bottom-1 -right-1 grid size-7 place-items-center rounded-full bg-gradient-hot shadow-hot disabled:opacity-70"
              >
                {uploadingAvatar
                  ? <Loader2 className="size-3.5 text-white animate-spin" />
                  : <Camera className="size-3.5 text-white" />}
              </button>
              <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={onAvatarPick} />
            </div>
            <p className="text-xs text-muted-foreground">Selecione da galeria ou tire uma foto</p>
          </div>

          {/* Text fields */}
          <div className="space-y-4">
            <Field label="Nome" value={name} onChange={setName} placeholder={storeName || "Seu nome"} />
            <Field label="Idade" value={age} onChange={setAge} type="number" placeholder="Ex: 25" />
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                placeholder="Conte algo sobre você..."
                className="w-full resize-none rounded-2xl border border-border bg-surface px-4 py-3 text-sm text-foreground outline-none focus:border-primary placeholder:text-muted-foreground/60"
              />
            </div>
            <Field label="Localização" value={location} onChange={setLocation} placeholder="Ex: São Paulo, SP" />
          </div>

          {/* Public gallery */}
          <div>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Galeria Pública · 3 fotos
            </p>
            <div className="grid grid-cols-3 gap-2">
              {publicSlots.map((slot, i) => (
                <GallerySlot
                  key={i}
                  src={slotSrc(slot)}
                  onPick={(e) => handleGalleryPick(e, i, "public")}
                  onRemove={() => handleGalleryRemove(i, "public")}
                />
              ))}
            </div>
          </div>

          {/* VIP gallery (creators only) */}
          {isCreator && (
            <div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Galeria VIP 🔒 · 6 slots
              </p>
              <div className="grid grid-cols-3 gap-2">
                {vipSlots.map((slot, i) => (
                  <GallerySlot
                    key={i}
                    src={slotSrc(slot)}
                    onPick={(e) => handleGalleryPick(e, i, "vip")}
                    onRemove={() => handleGalleryRemove(i, "vip")}
                  />
                ))}
              </div>
            </div>
          )}

          <button
            onClick={save}
            disabled={saving}
            className="tap-scale flex w-full items-center justify-center gap-2 rounded-full bg-gradient-hot py-3.5 text-sm font-extrabold text-primary-foreground shadow-hot disabled:opacity-50"
          >
            <Save className="size-4" />
            {saving ? "Salvando..." : "Salvar alterações"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", placeholder }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-muted-foreground">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-sm text-foreground outline-none focus:border-primary placeholder:text-muted-foreground/60"
      />
    </div>
  );
}

function GallerySlot({ src, onPick, onRemove }: {
  src: string | null;
  onPick: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="tap-scale relative aspect-square overflow-hidden rounded-xl border-2 border-dashed border-border bg-surface-2">
      {src ? (
        <>
          <img src={src} alt="" className="size-full object-cover" />
          <button onClick={onRemove} className="absolute right-1 top-1 grid size-5 place-items-center rounded-full bg-black/60">
            <X className="size-3 text-white" />
          </button>
        </>
      ) : (
        <button
          onClick={() => inputRef.current?.click()}
          className="absolute inset-0 flex items-center justify-center text-muted-foreground/50"
        >
          <Plus className="size-6" />
        </button>
      )}
      <input ref={inputRef} type="file" accept="image/*,video/*" className="hidden" onChange={onPick} />
    </div>
  );
}
