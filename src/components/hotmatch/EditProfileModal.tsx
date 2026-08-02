import { useRef, useState } from "react";
import { Camera, Plus, Save, X } from "lucide-react";
import { toast } from "sonner";
import { actions, useAppState } from "@/lib/hotmatch/store";
import { supabase } from "@/lib/supabase";

type Props = { open: boolean; onClose: () => void };

export function EditProfileModal({ open, onClose }: Props) {
  const { gender, profileId, name: storeName, avatarUrl: storeAvatar, coins, earnings } = useAppState();
  const isCreator = gender === "female";

  const [name, setName] = useState(storeName || "");
  const [age, setAge] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");

  const [avatarPreview, setAvatarPreview] = useState<string | null>(storeAvatar);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const [publicFiles, setPublicFiles] = useState<(File | null)[]>([null, null, null]);
  const [publicPreviews, setPublicPreviews] = useState<(string | null)[]>([null, null, null]);

  const [vipFiles, setVipFiles] = useState<(File | null)[]>([null, null, null, null, null, null]);
  const [vipPreviews, setVipPreviews] = useState<(string | null)[]>([null, null, null, null, null, null]);

  const [saving, setSaving] = useState(false);

  const avatarInputRef = useRef<HTMLInputElement>(null);

  function onAvatarPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }

  function onGalleryPick(e: React.ChangeEvent<HTMLInputElement>, index: number, kind: "public" | "vip") {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    if (kind === "public") {
      setPublicFiles((f) => f.map((v, i) => (i === index ? file : v)));
      setPublicPreviews((p) => p.map((v, i) => (i === index ? url : v)));
    } else {
      setVipFiles((f) => f.map((v, i) => (i === index ? file : v)));
      setVipPreviews((p) => p.map((v, i) => (i === index ? url : v)));
    }
  }

  async function uploadFile(file: File, path: string): Promise<string | null> {
    const { data, error } = await supabase.storage
      .from("photos")
      .upload(path, file, { upsert: true, contentType: file.type });
    if (error) { console.error("[Upload] Failed:", error.message); return null; }
    const { data: { publicUrl } } = supabase.storage.from("photos").getPublicUrl(data.path);
    return publicUrl;
  }

  async function save() {
    if (!profileId) { toast.error("Faça login para editar o perfil."); return; }
    setSaving(true);

    try {
      let finalAvatarUrl = storeAvatar;

      if (avatarFile) {
        const url = await uploadFile(avatarFile, `${profileId}/avatar_${Date.now()}`);
        if (url) finalAvatarUrl = url;
      }

      const updatePayload: Record<string, unknown> = {};
      if (name.trim()) updatePayload.name = name.trim();
      if (age.trim() && !isNaN(Number(age))) updatePayload.age = Number(age);
      if (bio.trim()) updatePayload.bio = bio.trim();
      if (location.trim()) updatePayload.location = location.trim();
      if (finalAvatarUrl) updatePayload.avatar_url = finalAvatarUrl;

      if (Object.keys(updatePayload).length > 0) {
        const { error } = await supabase.from("profiles").update(updatePayload).eq("id", profileId);
        if (error) throw new Error(error.message);
      }

      const publicUploads = publicFiles.map(async (file, i) => {
        if (!file) return;
        const url = await uploadFile(file, `${profileId}/public_${i}_${Date.now()}`);
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

      const vipUploads = isCreator
        ? vipFiles.map(async (file, i) => {
            if (!file) return;
            const url = await uploadFile(file, `${profileId}/vip_${i}_${Date.now()}`);
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

      await Promise.all([...publicUploads, ...vipUploads]);

      // Preserve existing coins/earnings — only update identity fields
      actions.setProfile({
        profileId,
        gender,
        name: (updatePayload.name as string | undefined) ?? storeName,
        avatarUrl: finalAvatarUrl ?? storeAvatar,
        coins,
        earnings,
      });

      toast.success("Perfil atualizado! ✨");
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
                className="tap-scale absolute -bottom-1 -right-1 grid size-7 place-items-center rounded-full bg-gradient-hot shadow-hot"
              >
                <Camera className="size-3.5 text-white" />
              </button>
              {/* No capture="environment" — lets the user choose gallery OR camera */}
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
              {publicPreviews.map((src, i) => (
                <GallerySlot
                  key={i}
                  src={src}
                  onPick={(e) => onGalleryPick(e, i, "public")}
                  onRemove={() => {
                    setPublicFiles((f) => f.map((v, j) => (j === i ? null : v)));
                    setPublicPreviews((p) => p.map((v, j) => (j === i ? null : v)));
                  }}
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
                {vipPreviews.map((src, i) => (
                  <GallerySlot
                    key={i}
                    src={src}
                    onPick={(e) => onGalleryPick(e, i, "vip")}
                    onRemove={() => {
                      setVipFiles((f) => f.map((v, j) => (j === i ? null : v)));
                      setVipPreviews((p) => p.map((v, j) => (j === i ? null : v)));
                    }}
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
      {/* No capture="environment" — standard gallery/camera picker */}
      <input ref={inputRef} type="file" accept="image/*,video/*" className="hidden" onChange={onPick} />
    </div>
  );
}
