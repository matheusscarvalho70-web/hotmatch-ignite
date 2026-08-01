import { useState } from "react";
import { Camera, X } from "lucide-react";
import { toast } from "sonner";
import { photos } from "@/lib/hotmatch/data";
import { useAppState } from "@/lib/hotmatch/store";

type Props = { open: boolean; onClose: () => void };

export function EditProfileModal({ open, onClose }: Props) {
  const { gender } = useAppState();
  const isCreator = gender === "female";

  const [name, setName] = useState(isCreator ? "Bianca" : "Carlos");
  const [age, setAge] = useState(isCreator ? "25" : "28");
  const [bio, setBio] = useState(
    isCreator
      ? "Amo noites de neon, drinks e boas conversas. Criadora de conteúdo exclusivo 🔥"
      : "Apaixonado por música, viagens e boa conversa.",
  );
  const [location, setLocation] = useState("São Paulo, SP");

  // Avatar
  const [hasAvatar, setHasAvatar] = useState(true);

  // Public gallery: 3 slots (plus avatar = 4 total)
  const PUBLIC_SRCS = [photos.p2, photos.p3, photos.p4];
  const [publicFilled, setPublicFilled] = useState([true, true, false]);

  // VIP gallery: 6 slots (creator only)
  const VIP_SRCS = [photos.p3, photos.p4, photos.p1, photos.p2, photos.p3, photos.p4];
  const [vipFilled, setVipFilled] = useState([true, true, false, false, false, false]);

  function save() {
    toast("Alterações salvas! ✨", {
      description: "Seu perfil foi atualizado com sucesso.",
      className: "bg-white text-zinc-900 border border-zinc-200 shadow-xl rounded-2xl",
    });
    onClose();
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
          <button
            onClick={onClose}
            className="grid size-8 place-items-center rounded-full bg-surface-2"
          >
            <X className="size-4 text-muted-foreground" />
          </button>
        </div>

        <div className="space-y-6 px-5 pb-10">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <div className="ring-match grid size-24 place-items-center rounded-full p-[3px] shadow-gold">
                {hasAvatar ? (
                  <img
                    src={isCreator ? photos.p1 : photos.p3}
                    alt="Avatar"
                    className="size-full rounded-full object-cover"
                  />
                ) : (
                  <div className="size-full rounded-full bg-surface-2" />
                )}
              </div>
              <button
                onClick={() => setHasAvatar((v) => !v)}
                className="tap-scale absolute -bottom-1 -right-1 grid size-7 place-items-center rounded-full bg-gradient-hot shadow-hot"
              >
                <Camera className="size-3.5 text-white" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground">Toque na câmera para alterar sua foto</p>
          </div>

          {/* Fields */}
          <div className="space-y-4">
            <Field label="Nome" value={name} onChange={setName} />
            <Field label="Idade" value={age} onChange={setAge} type="number" />
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                className="w-full resize-none rounded-2xl border border-border bg-surface px-4 py-3 text-sm text-foreground outline-none focus:border-primary"
              />
            </div>
            <Field label="Localização" value={location} onChange={setLocation} />
          </div>

          {/* Public gallery — 3 slots (1 avatar slot above + 3 here = 4 total) */}
          <div>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Galeria Pública · 3 fotos secundárias
            </p>
            <div className="grid grid-cols-3 gap-2">
              {PUBLIC_SRCS.map((src, i) => (
                <GallerySlot
                  key={i}
                  src={publicFilled[i] ? src : null}
                  onToggle={() =>
                    setPublicFilled((f) => f.map((v, j) => (j === i ? !v : v)))
                  }
                />
              ))}
            </div>
          </div>

          {/* VIP gallery — 6 slots, creators only */}
          {isCreator && (
            <div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Galeria VIP 🔒 · 6 slots
              </p>
              <div className="grid grid-cols-3 gap-2">
                {VIP_SRCS.map((src, i) => (
                  <GallerySlot
                    key={i}
                    src={vipFilled[i] ? src : null}
                    onToggle={() =>
                      setVipFilled((f) => f.map((v, j) => (j === i ? !v : v)))
                    }
                  />
                ))}
              </div>
            </div>
          )}

          <button
            onClick={save}
            className="tap-scale w-full rounded-full bg-gradient-hot py-3.5 text-sm font-extrabold text-primary-foreground shadow-hot"
          >
            Salvar alterações
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-muted-foreground">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-sm text-foreground outline-none focus:border-primary"
      />
    </div>
  );
}

function GallerySlot({
  src,
  onToggle,
}: {
  src: string | null | undefined;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className="tap-scale relative aspect-square overflow-hidden rounded-xl border-2 border-dashed border-border bg-surface-2"
    >
      {src ? (
        <img src={src} alt="" className="size-full object-cover" />
      ) : (
        <span className="absolute inset-0 flex items-center justify-center text-xl text-muted-foreground/50">
          +
        </span>
      )}
    </button>
  );
}
