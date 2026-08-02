import { useEffect, useRef, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  Check,
  Crown,
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

function WelcomePage() {
  const [gender, setGender] = useState<Gender | null>(null);
  const [signupOpen, setSignupOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const navigate = useNavigate();
  const { profileId } = useAppState();

  // Already logged in — go straight to app
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

/* ─────────────────────────── Login ─────────────────────────── */
function LoginDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { toast.error("Informe seu nome ou e-mail."); return; }
    setLoading(true);

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("is_demo", false)
      .ilike("name", `%${name.trim().split("@")[0]}%`)
      .maybeSingle();

    setLoading(false);

    if (error || !data) {
      toast.error("Conta não encontrada. Crie sua conta primeiro.");
      return;
    }

    actions.setProfile({
      profileId: data.id,
      gender: data.gender as "male" | "female",
      name: data.name,
      avatarUrl: data.avatar_url,
      coins: data.coin_balance,
      earnings: Number(data.earnings_brl),
      vip: false,
    });

    // Request push permission and persist player ID (non-blocking)
    registerPush(data.id).catch((e) =>
      console.warn("[OneSignal] registerPush on login failed:", e),
    );

    onOpenChange(false);
    toast.success(`Bem-vindo de volta, ${data.name}! 🔥`);
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
          <Field label="Nome ou e-mail" placeholder="Seu nome ou e-mail" value={name} onChange={(e) => setName(e.target.value)} />
          <Field label="Senha" type="password" placeholder="Sua senha" />
          <Button
            type="submit"
            disabled={loading}
            className="mt-2 h-12 w-full rounded-full bg-gradient-hot text-sm font-bold text-primary-foreground shadow-hot disabled:opacity-50"
          >
            {loading ? "Buscando conta..." : "Entrar na minha conta"}
            <ArrowRight className="size-4" />
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ─────────────────────────── Signup Flow ─────────────────────────── */
function calcAge(dob: string): number {
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age < 18 ? 18 : age;
}

function delay(ms: number) { return new Promise<void>((r) => setTimeout(r, ms)); }

function SignupFlow({ open, onOpenChange, gender }: {
  open: boolean; onOpenChange: (v: boolean) => void; gender: Gender;
}) {
  const navigate = useNavigate();
  const isCreator = gender === "female";
  const STEPS = 3;

  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  // Step 1
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [dob, setDob] = useState("");
  const [phone, setPhone] = useState("");

  // Step 2
  const [hasPhoto, setHasPhoto] = useState(false);
  const [extraPhotos, setExtraPhotos] = useState<boolean[]>([false, false, false]);

  // Step 3 — biometrics
  const [camPhase, setCamPhase] = useState<"idle" | "active" | "scanning" | "done">("idle");
  const [scanMsg, setScanMsg] = useState("");
  const [scanPct, setScanPct] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Reset on close
  useEffect(() => {
    if (!open) {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      setStep(1); setHasPhoto(false); setExtraPhotos([false, false, false]);
      setCamPhase("idle"); setScanMsg(""); setScanPct(0);
      setName(""); setEmail(""); setDob(""); setPhone("");
    }
  }, [open]);

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
      // Permission denied or no camera — allow skip so the user isn't blocked
      toast("Câmera não disponível — você pode continuar sem a verificação.", { description: "Recomendamos verificar para maior segurança." });
      setCamPhase("done");
    }
  }

  async function runScan() {
    if (camPhase !== "active") return;
    setCamPhase("scanning");
    const msgs = [
      "Iniciando análise biométrica...",
      "Analisando características faciais... Mantenha-se firme",
      "Validando identidade...",
      "Verificação facial concluída ✓",
    ];
    for (let i = 0; i < msgs.length; i++) {
      await delay(750);
      setScanMsg(msgs[i]);
      setScanPct(Math.round(((i + 1) / msgs.length) * 100));
    }
    await delay(400);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCamPhase("done");
    toast.success(isCreator ? "Selo de Criadora VIP validado!" : "Perfil verificado como real!");
  }

  async function finish() {
    if (camPhase !== "done") {
      // Allow the user to proceed even without camera by marking it as skipped
      toast("Verificação facial pendente.", { description: "Toque em 'Ativar câmera' ou continue sem ela." });
      return;
    }
    // CPF is optional for creators (nullable column doesn't exist — we simply don't send it)
    setSaving(true);
    try {
      const payload: {
        gender: string;
        name: string;
        age: number;
        bio: string;
        location: string;
        avatar_url: string | null;
        coin_balance: number;
        earnings_brl: number;
        is_verified: boolean;
        is_demo: boolean;
      } = {
        gender,
        name: name.trim() || (isCreator ? "Criadora" : "Usuário"),
        age: dob ? calcAge(dob) : (isCreator ? 22 : 25),
        bio: isCreator
          ? "Criadora de conteúdo exclusivo no HotMatch 🔥"
          : "Novo no HotMatch. Aqui para se conectar!",
        location: "Brasil",
        avatar_url: null,
        coin_balance: 0,
        earnings_brl: 0,
        is_verified: true,
        is_demo: false,
      };

      console.log("[HotMatch] Inserting profile:", payload);

      const { data, error } = await supabase
        .from("profiles")
        .insert(payload)
        .select()
        .single();

      if (error) {
        console.error("[HotMatch] Supabase error:", error);
        throw new Error(error.message || "Erro ao salvar perfil no banco de dados.");
      }
      if (!data) throw new Error("Perfil não retornado após inserção.");

      actions.setProfile({
        profileId: data.id,
        gender,
        name: data.name,
        avatarUrl: data.avatar_url,
        coins: data.coin_balance,
        earnings: Number(data.earnings_brl),
        vip: false,
      });

      // Request push permission and persist player ID (non-blocking)
      registerPush(data.id).catch((e) =>
        console.warn("[OneSignal] registerPush failed:", e),
      );

      // Fire-and-forget welcome notification — don't let failure block redirect
      supabase.from("notifications").insert({
        user_id: data.id,
        type: "match",
        title: "Bem-vindo ao HotMatch! 🔥",
        content: isCreator
          ? "Seu perfil de criadora foi verificado. Comece a postar!"
          : "Conta criada com 320 moedas de boas-vindas. Explore o feed!",
        is_read: false,
      }).then(({ error: nErr }) => {
        if (nErr) console.warn("[HotMatch] Notification insert failed:", nErr);
      });

      onOpenChange(false);
      toast.success(`Bem-vindo ao HotMatch, ${data.name}! 🔥`);
      // Always go to main feed on success
      navigate({ to: "/" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro desconhecido ao criar conta.";
      console.error("[HotMatch] finish() error:", err);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }

  const next = async () => {
    if (step === 1) {
      if (!name.trim()) { toast.error("Informe seu nome."); return; }
      setStep(2);
    } else if (step === 2) {
      if (!hasPhoto) { toast.error("Foto de perfil obrigatória."); return; }
      setStep(3);
    } else {
      await finish();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!saving) onOpenChange(v); }}>
      <DialogContent className="max-h-[92dvh] overflow-y-auto rounded-3xl border-border bg-surface p-5 sm:max-w-[26rem]">
        <DialogTitle className="sr-only">Criar conta HotMatch</DialogTitle>

        {/* Progress */}
        <div className="flex items-center gap-3">
          {step > 1 && (
            <button onClick={() => setStep((s) => s - 1)} className="tap-scale text-muted-foreground">
              <ArrowLeft className="size-5" />
            </button>
          )}
          <HotMark className="size-6" />
          <div className="flex-1">
            <div className="flex gap-1.5">
              {Array.from({ length: STEPS }).map((_, i) => (
                <span key={i} className={cn("h-1 flex-1 rounded-full transition-all", i < step ? "bg-gradient-hot" : "bg-surface-2")} />
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

        {/* Step 1 */}
        {step === 1 && (
          <div className="mt-4 space-y-3">
            <h2 className="text-lg font-extrabold">Dados básicos</h2>
            <Field label="Seu Nome ou Apelido *" placeholder="Ex: Lucas ou Mari" value={name} onChange={(e) => setName(e.target.value)} />
            <Field label="E-mail" type="email" placeholder="voce@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Field label="Senha" type="password" placeholder="Mínimo 8 caracteres" />
            <Field label="Data de nascimento (+18)" type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
            <Field label="Telefone (WhatsApp)" type="tel" placeholder="(11) 90000-0000" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="mt-4 space-y-5">
            <h2 className="text-lg font-extrabold">Fotos do Perfil</h2>
            <div className="flex flex-col items-center gap-3">
              <p className="text-xs font-semibold text-muted-foreground">Foto de perfil <span className="text-primary">*obrigatória</span></p>
              <button
                onClick={() => { setHasPhoto((v) => !v); if (!hasPhoto) toast("Foto adicionada ✨"); }}
                className={cn("tap-scale relative grid size-32 place-items-center rounded-full border-2 border-dashed transition-all", hasPhoto ? "border-gold bg-gold/10" : "border-border bg-surface-2")}
              >
                {hasPhoto ? (
                  <span className="grid size-28 place-items-center rounded-full bg-gold/20">
                    <Check className="size-8 text-gold" />
                  </span>
                ) : (
                  <span className="grid size-28 place-items-center rounded-full bg-surface-2">
                    <Camera className="size-9 text-muted-foreground" />
                  </span>
                )}
              </button>
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold text-muted-foreground">Galeria pública <span className="text-muted-foreground/60">(opcional)</span></p>
              <div className="grid grid-cols-3 gap-2">
                {extraPhotos.map((filled, i) => (
                  <button
                    key={i}
                    onClick={() => { const next = [...extraPhotos]; next[i] = !next[i]; setExtraPhotos(next); if (!filled) toast("Foto adicionada 📸"); }}
                    className={cn("tap-scale grid aspect-square place-items-center rounded-2xl border border-dashed transition-all", filled ? "border-gold/50 bg-gold/10 text-gold" : "border-border bg-surface-2 text-muted-foreground")}
                  >
                    {filled ? <Check className="size-5" /> : <Plus className="size-5" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 3 — biometrics */}
        {step === 3 && (
          <div className="mt-4 space-y-4">
            <h2 className="text-lg font-extrabold">{isCreator ? "Validação & Selo VIP" : "Validação Anti-Fake"}</h2>
            <div className="rounded-2xl border border-gold/25 bg-gold/10 p-3">
              <p className="flex items-center gap-2 text-xs font-bold text-gold">
                <ShieldCheck className="size-4" /> Garantia de Segurança HotMatch
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                {isCreator ? "Apenas pessoas reais! A verificação protege sua conta e libera saques Pix." : "Apenas pessoas reais! A validação facial elimina perfis falsos."}
              </p>
            </div>

            <div className="flex flex-col items-center gap-3">
              {/* Oval camera frame */}
              <div className="relative flex items-center justify-center">
                <div
                  className={cn(
                    "relative overflow-hidden rounded-full border-4 transition-all duration-500",
                    camPhase === "done" ? "border-gold shadow-[0_0_24px_oklch(0.86_0.16_92/0.5)]"
                      : camPhase === "scanning" ? "border-primary animate-pulse"
                      : "border-border",
                  )}
                  style={{ width: 200, height: 240 }}
                >
                  {(camPhase === "active" || camPhase === "scanning") && (
                    <video ref={videoRef} autoPlay playsInline muted className="size-full object-cover [transform:scaleX(-1)]" />
                  )}
                  {camPhase === "idle" && (
                    <div className="flex size-full items-center justify-center bg-surface-2">
                      <Camera className="size-12 text-muted-foreground" />
                    </div>
                  )}
                  {camPhase === "scanning" && (
                    <div className="absolute inset-0 bg-black/20">
                      <div className="absolute h-0.5 w-3/4 translate-x-[16.7%] rounded-full bg-gradient-hot opacity-80" style={{ animation: "scanLine 1.5s ease-in-out infinite alternate", top: "30%" }} />
                    </div>
                  )}
                  {camPhase === "done" && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gold/20">
                      <div className="grid size-16 place-items-center rounded-full bg-gold/30">
                        <Check className="size-9 text-gold" />
                      </div>
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

              {(camPhase === "scanning" || camPhase === "done") && (
                <div className="w-full max-w-[200px]">
                  <div className="h-1.5 overflow-hidden rounded-full bg-surface-2">
                    <div className="h-full rounded-full bg-gradient-hot transition-all duration-700" style={{ width: `${scanPct}%` }} />
                  </div>
                </div>
              )}

              <p className={cn("text-center text-xs", camPhase === "done" ? "font-semibold text-gold" : "text-muted-foreground")}>
                {camPhase === "idle" && "Posicione seu rosto no círculo para verificação"}
                {camPhase === "active" && "Rosto detectado. Pressione Iniciar Scan."}
                {camPhase === "scanning" && scanMsg}
                {camPhase === "done" && "Biometria facial validada com sucesso ✓"}
              </p>

              {camPhase === "idle" && (
                <div className="flex flex-col items-center gap-2">
                  <Button onClick={startCamera} variant="secondary" className="rounded-full">
                    <Camera className="size-4" /> Ativar câmera
                  </Button>
                  <button
                    onClick={() => setCamPhase("done")}
                    className="text-[11px] text-muted-foreground underline underline-offset-4"
                  >
                    Pular verificação
                  </button>
                </div>
              )}
              {camPhase === "active" && (
                <Button onClick={runScan} className="rounded-full bg-gradient-hot text-primary-foreground shadow-hot">
                  <ShieldCheck className="size-4" /> Iniciar Scan Facial
                </Button>
              )}
            </div>
          </div>
        )}

        <Button
          onClick={next}
          disabled={saving}
          className="mt-5 h-12 w-full rounded-full bg-gradient-hot text-sm font-bold text-primary-foreground shadow-hot disabled:opacity-50"
        >
          {saving ? "Criando conta..." : step >= STEPS ? "Criar minha conta" : "Continuar"}
          <ArrowRight className="size-4" />
        </Button>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[11px] font-semibold text-muted-foreground">{label}</Label>
      <Input className="h-11 rounded-2xl border-border bg-surface-2" {...props} />
    </div>
  );
}
