import { useEffect, useRef, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  Crown,
  Eye,
  EyeOff,
  Lock,
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

function calcAge(dob: string): number {
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

function delay(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

function WelcomePage() {
  const [gender, setGender] = useState<Gender | null>(null);
  const [signupOpen, setSignupOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const navigate = useNavigate();
  const { profileId } = useAppState();

  useEffect(() => {
    if (profileId) navigate({ to: "/", replace: true });
  }, [profileId, navigate]);

  const start = (g: Gender) => {
    setGender(g);
    setSignupOpen(true);
  };

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

function SignupFlow({ open, onOpenChange, gender }: {
  open: boolean; onOpenChange: (v: boolean) => void; gender: Gender;
}) {
  const navigate = useNavigate();
  const isCreator = gender === "female";
  const STEPS = 3;

  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [dob, setDob] = useState("");
  const [bio, setBio] = useState("");

  const computedAge = dob ? calcAge(dob) : null;
  const ageError =
    computedAge !== null && computedAge < 18
      ? "Você precisa ter no mínimo 18 anos para se cadastrar."
      : null;

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [camPhase, setCamPhase] = useState<"idle" | "active" | "scanning" | "done">("idle");
  const [scanMsg, setScanMsg] = useState("");
  const [scanPct, setScanPct] = useState(0);
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
  const [capturedPreview, setCapturedPreview] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

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

  useEffect(() => {
    if (camPhase !== "active" || !streamRef.current) return;
    const el = videoRef.current;
    if (!el) return;
    el.srcObject = streamRef.current;
    el.play().catch(() => {});
  }, [camPhase]);

  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      streamRef.current = stream;
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

  async function finish() {
    if (!name.trim() || !email.trim() || !password || !dob) {
      alert("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    setSaving(true);

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: { full_name: name.trim(), name: name.trim() },
      },
    });

    if (authError) {
      const errorMsg = authError.message || "Erro desconhecido ao criar conta.";
      alert("Erro no cadastro: " + errorMsg);
      toast.error(errorMsg);
      setSaving(false);
      return;
    }

    const userId = authData?.user?.id;
    if (!userId) {
      alert("Erro crítico: ID do usuário não retornado.");
      setSaving(false);
      return;
    }

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

    let verificationPhotoUrl: string | null = null;
    if (capturedBlob) {
      try {
        const path = `verifications/${userId}_${Date.now()}_selfie.jpg`;
        const { data: vd, error: verErr } = await supabase.storage
          .from("photos")
          .upload(path, capturedBlob, { upsert: true, contentType: "image/jpeg" });
        if (!verErr && vd) {
          const { data: { publicUrl } } = supabase.storage.from("photos").getPublicUrl(vd.path);
          verificationPhotoUrl = publicUrl;
        }
      } catch (uploadErr) {
        console.warn("[Signup] Biometric selfie upload exception:", uploadErr);
      }
    }

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
      const profileErrorMsg = profileError?.message || "Erro desconhecido ao salvar perfil no banco.";
      alert("Erro ao salvar perfil: " + profileErrorMsg);
      toast.error(profileErrorMsg);
      await supabase.auth.signOut();
      setSaving(false);
      return;
    }

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

    setSaving(false);
    onOpenChange(false);
    toast.success(`Bem-vindo ao HotMatch, ${profile.name}! 🔥`);
    navigate({ to: "/" });
  }

  const next = async () => {
    if (step === 1) {
      if (!name.trim()) { toast.error("Informe seu nome."); return; }
      if (!email.trim()) { toast.error("Informe seu e-mail."); return; }
      if (!password || password.length < 6) { toast.error("A senha deve ter pelo menos 6 caracteres."); return; }
      if (!dob) { toast.error("Informe sua data de nascimento."); return; }
      if (ageError) { toast.error(ageError); return; }
      setStep(2);
    } else if (step === 2) {
      setStep(3);
      startCamera();
    } else if (step === 3) {
      finish();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-3xl border-border bg-surface p-5 sm:max-w-[26rem]">
        <DialogTitle className="sr-only">Cadastro no HotMatch</DialogTitle>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {step > 1 && (
              <button onClick={() => setStep((s) => s - 1)} className="rounded-full p-1 text-muted-foreground hover:text-foreground">
                <ArrowLeft className="size-5" />
              </button>
            )}
            <span className="text-xs font-bold text-muted-foreground">
              Etapa {step} de {STEPS} · {isCreator ? "Criadora VIP" : "Paquera"}
            </span>
          </div>
          <span className="grid size-8 place-items-center rounded-xl bg-gold/10 text-gold">
            {isCreator ? <Crown className="size-4" /> : <HotMark className="size-5" />}
          </span>
        </div>

        <div className="mt-3 flex gap-1.5">
          {Array.from({ length: STEPS }).map((_, i) => (
            <div key={i} className={cn("h-1 flex-1 rounded-full transition-colors", i + 1 <= step ? "bg-gradient-hot" : "bg-surface-2")} />
          ))}
        </div>

        {step === 1 && (
          <div className="mt-4 space-y-3">
            <h2 className="text-lg font-extrabold tracking-tight">Crie sua conta</h2>
            <Field label="Nome ou Apelido" placeholder="Seu nome" value={name} onChange={(e) => setName(e.target.value)}
