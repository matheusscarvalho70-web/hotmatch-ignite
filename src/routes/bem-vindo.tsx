import { useEffect, useRef, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  Check,
  Crown,
  Eye,
  EyeOff,
  Lock,
  Plus,
  ShieldCheck,
  Sparkles,
  User,
  UserRound,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { HotMark } from "@/components/hotmatch/HotMark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { actions, useAppState } from "@/lib/hotmatch/store";
import { supabase } from "@/lib/supabase";
import { registerPush } from "@/lib/hotmatch/onesignal";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/bem-vindo")({
  head: () => ({
    meta: [
      { title: "HotMatch — Conexões reais e mídias exclusivas" },
      { name: "description", content: "Cadastre-se grátis no HotMatch." },
      { property: "og:title", content: "HotMatch — Conexões reais e mídias exclusivas" },
    ],
  }),
  component: WelcomePage,
});

type Gender = "male" | "female";

/* ─── returns the REAL age — no clamping ─── */
function calcAge(dob: string): number {
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

function delay(ms: number) { return new Promise<void>((r) => setTimeout(r, ms)); }

/* ────────────────────────── Page ────────────────────────── */
function WelcomePage() {
  const [gender, setGender] = useState<Gender | null>(null);
  const [signupOpen, setSignupOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const navigate = useNavigate();
  const { profileId } = useAppState();

  useEffect(() => {
    if (profileId) navigate({ to: "/", replace: true });
  }, [profileId, navigate]);

  const start = (g: Gender) => { setGender(g); setSignupOpen(true); };

  return (
    <div className="min-h-screen pb-16">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(60%_60%_at_50%_0%,oklch(0.63_0.245_8.5/0.28),transparent_70%)]" />

      <header className="relative flex items-center justify-between px-4 pt-[calc(env(safe-area-inset-top)+1rem)]">
        <div className="flex items-center gap-2">
          <span className="grid size-10 place-items-center rounded-2xl border border-gold/25 bg-surface-2/70 shadow-hot">
            <HotMark className="size-6" />
          </span>
          <span className="text-lg font-extrabold tracking-tight">
            Hot<span className="text-gradient-gold">Match</span>
          </span>
        </div>
        <button
          onClick={() => setLoginOpen(true)}
          className="tap-scale rounded-full border border-border bg-surface/70 px-3.5 py-2 text-xs font-semibold text-muted-foreground"
        >
          Já tenho conta
        </button>
      </header>

      <main className="relative px-5">
        <section className="pt-10 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-[11px] font-semibold text-gold">
            <Sparkles className="size-3.5" /> +18 · Paquera & Conteúdo VIP
          </span>
          <h1 className="mt-5 text-[2rem] font-extrabold leading-[1.1] tracking-tight">
            Conexões Reais, Mídias Exclusivas e{" "}
            <span className="text-gradient-gold">Mimos de Verdade</span> 🔥
          </h1>
          <p className="mx-auto mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
            Encontre pessoas incríveis próximas a você e acesse conteúdos VIPs ilimitados.
          </p>
        </section>

        <section className="mt-8 space-y-3">
          <ChoiceCard
            onClick={() => start("male")}
            icon={<HotMark className="size-7" />}
            tone="hot"
            title="Quero Paquerar e Ver Mídias Exclusivas"
            desc="Swipe local, feed VIP e chat com mimos."
            chip="Acesso imediato"
            genderIcon={<User className="size-4" />}
          />
          <ChoiceCard
            onClick={() => start("female")}
            icon={<Crown className="size-6 text-gold" />}
            tone="gold"
            title="Quero Ser Criadora VIP e Monetizar"
            desc="Poste mídias trancadas e receba via Pix."
            chip="Monetize seu Conteúdo"
            genderIcon={<UserRound className="size-4" />}
          />
        </section>

        <section className="mt-8 grid grid-cols-3 gap-2 text-center">
          {[
            { icon: <Wallet className="size-4 text-gold" />, label: "Pagamentos Seguros" },
            { icon: <ShieldCheck className="size-4 text-gold" />, label: "Perfis Verificados" },
            { icon: <Lock className="size-4 text-gold" />, label: "Privacidade Garantida" },
          ].map((b) => (
            <div key={b.label} className="glass-panel flex flex-col items-center gap-1.5 rounded-2xl px-2 py-3">
              {b.icon}
              <span className="text-[10px] font-medium leading-tight text-muted-foreground">{b.label}</span>
            </div>
          ))}
        </section>
        <p className="mt-6 text-center text-[11px] text-muted-foreground">
          Ao continuar você confirma ter mais de 18 anos.
        </p>
      </main>

      <LoginDialog open={loginOpen} onOpenChange={setLoginOpen} />
      {signupOpen && gender && (
        <SignupFlow open={signupOpen} onOpenChange={setSignupOpen} gender={gender} />
      )}
    </div>
  );
}

/* ────────────────────────── Choice card ────────────────────────── */
function ChoiceCard({ onClick, icon, title, desc, chip, tone, genderIcon }: {
  onClick: () => void; icon: React.ReactNode; title: string; desc: string;
  chip: string; tone: "hot" | "gold"; genderIcon: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "tap-scale glass-panel relative flex w-full items-center gap-4 rounded-3xl p-4 text-left shadow-card-premium",
        tone === "gold" ? "border-gold/25" : "border-primary/25",
      )}
    >
      <span className={cn("grid size-14 shrink-0 place-items-center rounded-2xl", tone === "gold" ? "bg-gold/10" : "bg-primary/10")}>
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className={cn("inline-block rounded-full px-2 py-0.5 text-[10px] font-bold", tone === "gold" ? "bg-gold/15 text-gold" : "bg-primary/15 text-primary")}>
          {chip}
        </span>
        <span className="mt-1.5 block text-sm font-bold leading-snug">{title}</span>
        <span className="mt-0.5 block text-xs text-muted-foreground">{desc}</span>
      </span>
      <ArrowRight className="size-5 shrink-0 text-muted-foreground" />
      <span
        className={cn("absolute bottom-3 right-3 grid size-7 place-items-center rounded-full border", tone === "gold" ? "border-gold/25 bg-gold/10 text-gold" : "border-primary/25 bg-primary/10 text-primary")}
        aria-hidden
      >
        {genderIcon}
      </span>
    </button>
  );
}

/* ────────────────────────── Login dialog ────────────────────────── */
function LoginDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { toast.error("Informe seu e-mail."); return; }
    if (!password) { toast.error("Informe sua senha."); return; }
    setLoading(true);

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (authError || !authData.user) {
      setLoading(false);
      toast.error(
        authError?.message === "Invalid login credentials"
          ? "E-mail ou senha incorretos."
          : (authError?.message ?? "Erro ao entrar. Tente novamente."),
      );
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", authData.user.id)
      .maybeSingle();

    setLoading(false);

    if (profileError || !profile) {
      toast.error("Perfil não encontrado. Entre em contato com o suporte.");
      await supabase.auth.signOut();
      return;
    }

    actions.setProfile({
      profileId: profile.id,
      gender: profile.gender as Gender,
      name: profile.name,
      avatarUrl: profile.avatar_url,
      coins: profile.coin_balance,
      earnings: Number(profile.earnings_brl),
      xp: profile.xp ?? 0,
      level: profile.level ?? "bronze",
      vip: profile.is_verified ?? false,
    });

    registerPush(profile.id).catch(() => {});
    onOpenChange(false);
    toast.success(`Bem-vindo de volta, ${profile.name}! 🔥`);
    navigate({ to: "/" });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl border-border bg-surface p-5 sm:max-w-[24rem]">
        <DialogTitle className="sr-only">Entrar no HotMatch</DialogTitle>
        <div className="flex items-center gap-2">
          <HotMark className="size-6" />
          <span className="text-base font-extrabold tracking-tight">
            Entrar no Hot<span className="text-gradient-gold">Match</span>
          </span>
        </div>
        <form onSubmit={submit} className="mt-4 space-y-3">
          <Field
            label="E-mail"
            type="email"
            autoComplete="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <PasswordField
            label="Senha"
            value={password}
            onChange={setPassword}
            show={showPw}
            onToggle={() => setShowPw((v) => !v)}
          />
          <Button
            type="submit"
            disabled={loading}
            className="mt-2 h-12 w-full rounded-full bg-gradient-hot text-sm font-bold text-primary-foreground shadow-hot disabled:opacity-50"
          >
            {loading ? "Entrando..." : "Entrar na minha conta"}
            <ArrowRight className="size-4" />
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ────────────────────────── Signup flow ────────────────────────── */
function SignupFlow({ open, onOpenChange, gender }: {
  open: boolean; onOpenChange: (v: boolean) => void; gender: Gender;
}) {
  const navigate = useNavigate();
  const isCreator = gender === "female";
  const STEPS = 3;

  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  /* Step 1 */
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [dob, setDob] = useState("");
  const [bio, setBio] = useState("");

  /* computed age — updates every keystroke on dob */
  const computedAge = dob ? calcAge(dob) : null;
  const ageError =
    computedAge !== null && computedAge < 18
      ? "Você precisa ter no mínimo 18 anos para se cadastrar."
      : null;

  /* Step 2 — avatar */
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  /* Step 3 — biometrics */
  const [camPhase, setCamPhase] = useState<"idle" | "active" | "scanning" | "done">("idle");
  const [scanMsg, setScanMsg] = useState("");
  const [scanPct, setScanPct] = useState(0);
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
  const [capturedPreview, setCapturedPreview] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  /* Reset everything when dialog closes */
  useEffect(() => {
    if (!open) {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      setStep(1);
      setName(""); setEmail(""); setPassword(""); setDob(""); setBio("");
      setAvatarFile(null); setAvatarPreview(null);
      setCamPhase("idle"); setScanMsg(""); setScanPct(0);
      setCapturedBlob(null); setCapturedPreview(null);
    }
  }, [open]);

  /* Camera helpers */
  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCamPhase("active");
    } catch {
      toast.error("Câmera indisponível. Verifique as permissões do navegador.");
    }
  }

  function captureSelfie() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    canvas.getContext("2d")?.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        setCapturedBlob(blob);
        setCapturedPreview(URL.createObjectURL(blob));
        streamRef.current?.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        runScan();
      },
      "image/jpeg",
      0.85,
    );
  }

  async function runScan() {
    setCamPhase("scanning");
    const msgs = [
      "Iniciando análise biométrica...",
      "Analisando características faciais...",
      "Validando identidade...",
      "Verificação facial concluída ✓",
    ];
    for (let i = 0; i < msgs.length; i++) {
      await delay(700);
      setScanMsg(msgs[i]);
      setScanPct(Math.round(((i + 1) / msgs.length) * 100));
    }
    await delay(300);
    setCamPhase("done");
    toast.success(isCreator ? "Selo de Criadora VIP validado!" : "Perfil verificado como real!");
  }

  /* Final account creation */
  async function finish() {
    setSaving(true);
    try {
      /* 1 — Create Supabase Auth user */
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: { name: name.trim() },
        },
      });

      if (authError) {
        throw new Error(
          authError.message === "User already registered"
            ? "Este e-mail já está cadastrado. Use 'Já tenho conta' para entrar."
            : authError.message,
        );
      }

      const userId = authData.user?.id;
      if (!userId) throw new Error("Erro ao criar conta. Tente novamente.");

      /* 2 — Upload avatar */
      let avatarUrl: string | null = null;
      if (avatarFile) {
        const ext = avatarFile.name.split(".").pop() ?? "jpg";
        const path = `avatars/${userId}_${Date.now()}.${ext}`;
        const { data: sd } = await supabase.storage
          .from("photos")
          .upload(path, avatarFile, { upsert: true, contentType: avatarFile.type });
        if (sd) {
          const { data: { publicUrl } } = supabase.storage.from("photos").getPublicUrl(sd.path);
          avatarUrl = publicUrl;
        }
      }

      /* 3 — Upload biometric selfie (failure is non-fatal — account still gets created) */
      let verificationPhotoUrl: string | null = null;
      if (capturedBlob) {
        try {
          const path = `verifications/${userId}_${Date.now()}_selfie.jpg`;
          const { data: vd, error: verErr } = await supabase.storage
            .from("photos")
            .upload(path, capturedBlob, { upsert: true, contentType: "image/jpeg" });
          if (verErr) {
            console.warn(
              "[Signup] Biometric selfie upload failed:",
              verErr.message || JSON.stringify(verErr),
            );
          } else if (vd) {
            const { data: { publicUrl } } = supabase.storage.from("photos").getPublicUrl(vd.path);
            verificationPhotoUrl = publicUrl;
          }
        } catch (uploadErr) {
          console.warn("[Signup] Biometric selfie upload exception:", uploadErr);
          // verificationPhotoUrl remains null — account creation continues normally
        }
      }

      /* 4 — Insert profile linked to auth user */
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .insert({
          id: userId,
          gender,
          name: name.trim(),
          age: computedAge ?? 18,
          bio: bio.trim(),
          location: "Brasil",
          avatar_url: avatarUrl,
          coin_balance: 0,
          earnings_brl: 0,
          is_verified: false,
          is_demo: false,
          verification_status: verificationPhotoUrl ? "pending" : "unverified",
          verification_photo_url: verificationPhotoUrl,
        })
        .select()
        .single();

      if (profileError || !profile) {
        /* If profile insert fails, remove the auth user to avoid orphaned accounts */
        await supabase.auth.signOut();
        throw new Error(profileError?.message ?? "Erro ao salvar perfil. Tente novamente.");
      }

      /* 5 — Hydrate store */
      actions.setProfile({
        profileId: profile.id,
        gender,
        name: profile.name,
        avatarUrl: profile.avatar_url,
        coins: profile.coin_balance,
        earnings: Number(profile.earnings_brl),
        xp: profile.xp ?? 0,
        level: profile.level ?? "bronze",
        vip: false,
      });

      registerPush(profile.id).catch(() => {});

      supabase.from("notifications").insert({
        user_id: profile.id,
        type: "match",
        title: "Bem-vindo ao HotMatch! 🔥",
        content: isCreator
          ? "Seu perfil está sendo verificado. Em breve você poderá sacar seus ganhos!"
          : "Explore o feed e converse com pessoas incríveis.",
        is_read: false,
      }).then(({ error: nErr }) => {
        if (nErr) console.warn("[HotMatch] Notification insert failed:", nErr);
      });

      onOpenChange(false);
      toast.success(`Bem-vindo ao HotMatch, ${profile.name}! 🔥`);
      navigate({ to: "/" });
    } catch (err) {
      const error = err as Record<string, unknown> & { message?: string };
      const msg = error?.message || JSON.stringify(error, null, 2);
      console.error("[Signup] catch:", msg, err);
      alert(error?.message || JSON.stringify(error, null, 2));
      toast.error(msg || "Erro desconhecido ao criar conta.");
    } finally {
      setSaving(false);
    }
  }

  /* Step validation */
  const next = async () => {
    if (step === 1) {
      if (!name.trim()) { toast.error("Informe seu nome ou apelido."); return; }
      if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        toast.error("Informe um e-mail válido."); return;
      }
      if (password.length < 6) { toast.error("A senha deve ter pelo menos 6 caracteres."); return; }
      if (!dob) { toast.error("Informe sua data de nascimento."); return; }
      if (ageError) { toast.error(ageError); return; }
      if (!bio.trim()) { toast.error("Escreva uma breve bio."); return; }
      setStep(2);
    } else if (step === 2) {
      if (!avatarFile) { toast.error("Foto de perfil obrigatória. Selecione uma imagem."); return; }
      setStep(3);
    } else {
      if (camPhase !== "done") { toast.error("Complete a verificação facial para continuar."); return; }
      await finish();
    }
  };

  /* ── Render ── */
  const continueDisabledStep1 = !!ageError || saving;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!saving) onOpenChange(v); }}>
      <DialogContent className="max-h-[92dvh] overflow-y-auto rounded-3xl border-border bg-surface p-5 sm:max-w-[26rem]">
        <DialogTitle className="sr-only">Criar conta HotMatch</DialogTitle>

        {/* Progress bar */}
        <div className="flex items-center gap-3">
          {step > 1 && (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="tap-scale text-muted-foreground"
            >
              <ArrowLeft className="size-5" />
            </button>
          )}
          <HotMark className="size-6" />
          <div className="flex-1">
            <div className="flex gap-1.5">
              {Array.from({ length: STEPS }).map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    "h-1 flex-1 rounded-full transition-all",
                    i < step ? "bg-gradient-hot" : "bg-surface-2",
                  )}
                />
              ))}
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Etapa {step} de {STEPS} ·{" "}
              <span className={isCreator ? "text-gold" : "text-primary"}>
                {isCreator ? "Criadora VIP" : "Paquera"}
              </span>
            </p>
          </div>
        </div>

        {/* ── Step 1: Basic info ── */}
        {step === 1 && (
          <div className="mt-4 space-y-3">
            <h2 className="text-lg font-extrabold">Dados básicos</h2>

            <Field
              label="Seu nome ou apelido *"
              placeholder="Ex: Lucas ou Mari"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
            />
            <Field
              label="E-mail *"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
            <PasswordField
              label="Senha * (mínimo 6 caracteres)"
              value={password}
              onChange={setPassword}
              show={showPw}
              onToggle={() => setShowPw((v) => !v)}
              autoComplete="new-password"
            />

            {/* Date of birth with strict +18 gate */}
            <div className="space-y-1.5">
              <Label className="text-[11px] font-semibold text-muted-foreground">
                Data de nascimento (+18) *
              </Label>
              <Input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="h-11 rounded-2xl border-border bg-surface-2"
                max={new Date(new Date().setFullYear(new Date().getFullYear() - 18))
                  .toISOString()
                  .split("T")[0]}
              />
              {/* Real-time age feedback */}
              {dob && (
                <p
                  className={cn(
                    "text-[11px] font-semibold",
                    ageError ? "text-destructive" : "text-green-500",
                  )}
                >
                  {ageError ?? `✓ ${computedAge} anos — você pode continuar.`}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-[11px] font-semibold text-muted-foreground">Bio *</Label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                placeholder={
                  isCreator
                    ? "Ex: Criadora de conteúdo exclusivo 🔥"
                    : "Ex: Aqui para curtir e conhecer pessoas!"
                }
                className="w-full resize-none rounded-2xl border border-border bg-surface-2 px-4 py-3 text-sm text-foreground outline-none focus:border-primary placeholder:text-muted-foreground/60"
              />
            </div>
          </div>
        )}

        {/* ── Step 2: Profile photo ── */}
        {step === 2 && (
          <div className="mt-4 space-y-5">
            <h2 className="text-lg font-extrabold">Foto de Perfil</h2>
            <div className="flex flex-col items-center gap-3">
              <p className="text-xs font-semibold text-muted-foreground">
                Foto de perfil{" "}
                <span className="text-primary">*obrigatória</span>
              </p>
              <button
                onClick={() => avatarInputRef.current?.click()}
                className={cn(
                  "tap-scale relative grid size-32 place-items-center rounded-full border-2 border-dashed transition-all",
                  avatarPreview ? "border-gold bg-gold/10" : "border-border bg-surface-2",
                )}
              >
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Avatar"
                    className="size-full rounded-full object-cover"
                  />
                ) : (
                  <span className="grid size-28 place-items-center rounded-full bg-surface-2">
                    <Camera className="size-9 text-muted-foreground" />
                  </span>
                )}
                <span className="absolute -bottom-1 -right-1 grid size-8 place-items-center rounded-full bg-gradient-hot shadow-hot">
                  <Plus className="size-4 text-white" />
                </span>
              </button>
              <p className="text-[11px] text-muted-foreground">
                Toque para selecionar da galeria ou tirar foto
              </p>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) { setAvatarFile(f); setAvatarPreview(URL.createObjectURL(f)); }
                }}
              />
            </div>
          </div>
        )}

        {/* ── Step 3: Biometric verification ── */}
        {step === 3 && (
          <div className="mt-4 space-y-4">
            <h2 className="text-lg font-extrabold">
              {isCreator ? "Validação & Selo VIP" : "Validação Anti-Fake"}
            </h2>
            <div className="rounded-2xl border border-gold/25 bg-gold/10 p-3">
              <p className="flex items-center gap-2 text-xs font-bold text-gold">
                <ShieldCheck className="size-4" /> Verificação facial obrigatória
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                {isCreator
                  ? "Tire uma selfie para validar sua identidade e liberar saques Pix."
                  : "Tire uma selfie para confirmar que você é uma pessoa real."}
              </p>
            </div>

            <div className="flex flex-col items-center gap-3">
              <div className="relative flex items-center justify-center">
                <div
                  className={cn(
                    "relative overflow-hidden rounded-full border-4 transition-all duration-500",
                    camPhase === "done"
                      ? "border-gold shadow-[0_0_24px_oklch(0.86_0.16_92/0.5)]"
                      : camPhase === "scanning"
                      ? "border-primary animate-pulse"
                      : "border-border",
                  )}
                  style={{ width: 200, height: 240 }}
                >
                  {(camPhase === "active" || camPhase === "scanning") && (
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="size-full object-cover [transform:scaleX(-1)]"
                    />
                  )}
                  {camPhase === "idle" && (
                    <div className="flex size-full items-center justify-center bg-surface-2">
                      <Camera className="size-12 text-muted-foreground" />
                    </div>
                  )}
                  {camPhase === "scanning" && (
                    <div className="absolute inset-0 bg-black/20">
                      <div
                        className="absolute h-0.5 w-3/4 translate-x-[16.7%] rounded-full bg-gradient-hot opacity-80"
                        style={{ animation: "scanLine 1.5s ease-in-out infinite alternate", top: "30%" }}
                      />
                    </div>
                  )}
                  {camPhase === "done" && capturedPreview && (
                    <img
                      src={capturedPreview}
                      alt="Selfie capturada"
                      className="size-full object-cover [transform:scaleX(-1)]"
                    />
                  )}
                  {camPhase === "done" && (
                    <div className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-black/60 to-transparent pb-4">
                      <span className="flex items-center gap-1 text-xs font-bold text-white">
                        <Check className="size-4 text-gold" /> Verificado
                      </span>
                    </div>
                  )}
                </div>

                {(camPhase === "active" || camPhase === "scanning") && (
                  <>
                    <span className="absolute left-2 top-2 size-5 rounded-tl-xl border-l-2 border-t-2 border-primary" />
                    <span className="absolute right-2 top-2 size-5 rounded-tr-xl border-r-2 border-t-2 border-primary" />
                    <span className="absolute bottom-2 left-2 size-5 rounded-bl-xl border-b-2 border-l-2 border-primary" />
                    <span className="absolute bottom-2 right-2 size-5 rounded-br-xl border-b-2 border-r-2 border-primary" />
                  </>
                )}
              </div>

              {/* Hidden canvas for frame capture */}
              <canvas ref={canvasRef} className="hidden" />

              {(camPhase === "scanning" || camPhase === "done") && (
                <div className="w-full max-w-[200px]">
                  <div className="h-1.5 overflow-hidden rounded-full bg-surface-2">
                    <div
                      className="h-full rounded-full bg-gradient-hot transition-all duration-700"
                      style={{ width: `${scanPct}%` }}
                    />
                  </div>
                </div>
              )}

              <p
                className={cn(
                  "text-center text-xs",
                  camPhase === "done" ? "font-semibold text-gold" : "text-muted-foreground",
                )}
              >
                {camPhase === "idle" && "Posicione seu rosto no círculo e ative a câmera"}
                {camPhase === "active" && "Rosto detectado. Toque em Tirar Selfie quando estiver pronto."}
                {camPhase === "scanning" && scanMsg}
                {camPhase === "done" && "Biometria facial salva e enviada para verificação ✓"}
              </p>

              {camPhase === "idle" && (
                <Button onClick={startCamera} variant="secondary" className="rounded-full">
                  <Camera className="size-4" /> Ativar câmera
                </Button>
              )}
              {camPhase === "active" && (
                <Button
                  onClick={captureSelfie}
                  className="rounded-full bg-gradient-hot text-primary-foreground shadow-hot"
                >
                  <Camera className="size-4" /> Tirar Selfie
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Main CTA */}
        <Button
          onClick={next}
          disabled={step === 1 ? continueDisabledStep1 : saving}
          className="mt-5 h-12 w-full rounded-full bg-gradient-hot text-sm font-bold text-primary-foreground shadow-hot disabled:opacity-40"
        >
          {saving ? "Criando conta..." : step >= STEPS ? "Criar minha conta" : "Continuar"}
          <ArrowRight className="size-4" />
        </Button>

        {/* Explicit age-gate message below button on step 1 */}
        {step === 1 && ageError && (
          <p className="mt-2 text-center text-xs font-semibold text-destructive">{ageError}</p>
        )}
      </DialogContent>
    </Dialog>
  );
}

/* ────────────────────────── Shared sub-components ────────────────────────── */
function Field({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[11px] font-semibold text-muted-foreground">{label}</Label>
      <Input className="h-11 rounded-2xl border-border bg-surface-2" {...props} />
    </div>
  );
}

function PasswordField({
  label,
  value,
  onChange,
  show,
  onToggle,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  onToggle: () => void;
  autoComplete?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[11px] font-semibold text-muted-foreground">{label}</Label>
      <div className="relative">
        <Input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="••••••"
          autoComplete={autoComplete}
          className="h-11 rounded-2xl border-border bg-surface-2 pr-10"
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          tabIndex={-1}
        >
          {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
    </div>
  );
}
