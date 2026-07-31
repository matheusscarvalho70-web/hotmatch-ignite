import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  Check,
  Crown,
  Eye,
  Loader2,
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
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/bem-vindo")({
  head: () => ({
    meta: [
      { title: "HotMatch — Conexões reais e mídias exclusivas" },
      {
        name: "description",
        content:
          "Encontre pessoas incríveis perto de você, acesse conteúdos VIP ilimitados e envie mimos. Cadastre-se grátis no HotMatch.",
      },
      { property: "og:title", content: "HotMatch — Conexões reais e mídias exclusivas" },
      {
        property: "og:description",
        content:
          "Paquera local, feed exclusivo e monetização para criadoras VIP. Comece agora no HotMatch.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: WelcomePage,
});

type Gender = "male" | "female";

function WelcomePage() {
  const [gender, setGender] = useState<Gender | null>(null);
  const [signupOpen, setSignupOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

  const start = (g: Gender) => {
    setGender(g);
    setSignupOpen(true);
  };

  return (
    <div className="min-h-screen pb-16">
      {/* brilho de fundo */}
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
          Já tenho conta / Entrar
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
            O aplicativo híbrido onde você encontra pessoas incríveis próximas a você e acessa
            conteúdos VIPs ilimitados.
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
          <TrustBadge icon={<Wallet className="size-4 text-gold" />} label="Pagamentos 100% Seguros via Pix" />
          <TrustBadge icon={<ShieldCheck className="size-4 text-gold" />} label="Perfis Verificados" />
          <TrustBadge icon={<Lock className="size-4 text-gold" />} label="Privacidade Garantida" />
        </section>

        <p className="mt-6 text-center text-[11px] text-muted-foreground">
          Ao continuar você confirma ter mais de 18 anos.
        </p>
      </main>

      <LoginDialog open={loginOpen} onOpenChange={setLoginOpen} />
      <SignupFlow open={signupOpen} onOpenChange={setSignupOpen} gender={gender ?? "male"} />
    </div>
  );
}

function TrustBadge({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="glass-panel flex flex-col items-center gap-1.5 rounded-2xl px-2 py-3">
      {icon}
      <span className="text-[10px] font-medium leading-tight text-muted-foreground">{label}</span>
    </div>
  );
}

function ChoiceCard({
  onClick,
  icon,
  title,
  desc,
  chip,
  tone,
  genderIcon,
}: {
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  desc: string;
  chip: string;
  tone: "hot" | "gold";
  genderIcon: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "tap-scale glass-panel relative flex w-full items-center gap-4 rounded-3xl p-4 text-left shadow-card-premium",
        tone === "gold" ? "border-gold/25" : "border-primary/25",
      )}
    >
      <span
        className={cn(
          "grid size-14 shrink-0 place-items-center rounded-2xl",
          tone === "gold" ? "bg-gold/10" : "bg-primary/10",
        )}
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span
          className={cn(
            "inline-block rounded-full px-2 py-0.5 text-[10px] font-bold",
            tone === "gold" ? "bg-gold/15 text-gold" : "bg-primary/15 text-primary",
          )}
        >
          {chip}
        </span>
        <span className="mt-1.5 block text-sm font-bold leading-snug">{title}</span>
        <span className="mt-0.5 block text-xs text-muted-foreground">{desc}</span>
      </span>
      <ArrowRight className="size-5 shrink-0 text-muted-foreground" />
      <span
        className={cn(
          "absolute bottom-3 right-3 grid size-7 place-items-center rounded-full border",
          tone === "gold"
            ? "border-gold/25 bg-gold/10 text-gold"
            : "border-primary/25 bg-primary/10 text-primary",
        )}
        aria-hidden
      >
        {genderIcon}
      </span>
    </button>
  );
}

/* ---------------- Login ---------------- */

function LoginDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const navigate = useNavigate();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onOpenChange(false);
    toast.success("Bem-vindo de volta ao HotMatch 🔥");
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
          <Field label="E-mail ou Telefone" placeholder="voce@email.com ou (11) 90000-0000" />
          <Field label="Senha" type="password" placeholder="Sua senha" />
          <Button
            type="submit"
            className="mt-2 h-12 w-full rounded-full bg-gradient-hot text-sm font-bold text-primary-foreground shadow-hot"
          >
            Entrar na minha conta
            <ArrowRight className="size-4" />
          </Button>
          <button
            type="button"
            onClick={() => toast.info("Enviamos um link de recuperação para seu contato.")}
            className="mx-auto block text-[11px] font-medium text-muted-foreground underline-offset-4 hover:underline"
          >
            Esqueceu a senha?
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ---------------- Fluxo de cadastro ---------------- */

const maskCPF = (v: string) =>
  v
    .replace(/\D/g, "")
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/(\d{3})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3-$4");

function SignupFlow({
  open,
  onOpenChange,
  gender,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  gender: Gender;
}) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [photos, setPhotos] = useState<number[]>([]);
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [cpf, setCpf] = useState("");

  const totalSteps = 3;
  const isCreator = gender === "female";

  const next = () => {
    if (step >= totalSteps) {
      if (!scanned) {
        toast.error("Conclua a validação facial para continuar.");
        return;
      }
      if (isCreator && cpf.replace(/\D/g, "").length !== 11) {
        toast.error("Informe um CPF válido para liberar o selo VIP e os saques Pix.");
        return;
      }
      onOpenChange(false);
      toast.success("Conta criada! Bem-vindo ao HotMatch 🔥");
      navigate({ to: isCreator ? "/perfil" : "/" });
      return;
    }
    setStep((s) => s + 1);
  };

  const scan = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      setScanned(true);
      toast.success(isCreator ? "Selo de Criadora VIP validado!" : "Perfil validado como real!");
    }, 2200);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto rounded-3xl border-border bg-surface p-5 sm:max-w-[26rem]">
        <DialogTitle className="sr-only">Criar conta HotMatch</DialogTitle>

        <div className="flex items-center gap-3">
          {step > 1 && (
            <button onClick={() => setStep((s) => s - 1)} className="tap-scale text-muted-foreground">
              <ArrowLeft className="size-5" />
            </button>
          )}
          <HotMark className="size-6" />
          <div className="flex-1">
            <div className="flex gap-1.5">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    "h-1 flex-1 rounded-full transition-all",
                    i < step ? "bg-gradient-hot" : "bg-surface-2",
                  )}
                />
              ))}
            </div>
            <p className="mt-1.5 text-[11px] text-muted-foreground">
              Etapa {step} de {totalSteps} ·{" "}
              <span className={isCreator ? "text-gold" : "text-primary"}>
                {isCreator ? "Criadora VIP" : "Paquera"}
              </span>
            </p>
          </div>
        </div>

        {step === 1 && (
          <div className="mt-4 space-y-3">
            <h2 className="text-lg font-extrabold tracking-tight">Dados básicos</h2>
            <Field label="Seu Nome ou Apelido" placeholder="Ex: Lucas ou Mari" />
            <Field label="E-mail" type="email" placeholder="voce@email.com" />
            <Field label="Senha segura" type="password" placeholder="Mínimo 8 caracteres" />
            <Field label="Data de nascimento (+18)" type="date" />
            <Field label="Telefone (WhatsApp)" type="tel" placeholder="(11) 90000-0000" />
          </div>
        )}

        {step === 2 && (
          <div className="mt-4 space-y-4">
            <h2 className="text-lg font-extrabold tracking-tight">Fotos públicas</h2>
            <p className="text-xs text-muted-foreground">
              Adicione até 4 fotos que aparecem no seu perfil público.
            </p>
            <div className="grid grid-cols-4 gap-2">
              {[0, 1, 2, 3].map((i) => {
                const filled = photos.includes(i);
                return (
                  <button
                    key={i}
                    onClick={() => setPhotos((p) => (filled ? p.filter((x) => x !== i) : [...p, i]))}
                    className={cn(
                      "tap-scale grid aspect-[3/4] place-items-center rounded-2xl border border-dashed",
                      filled
                        ? "border-gold/50 bg-gold/10 text-gold"
                        : "border-border bg-surface-2 text-muted-foreground",
                    )}
                  >
                    {filled ? <Check className="size-5" /> : <Plus className="size-5" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="mt-4 space-y-4">
            <h2 className="text-lg font-extrabold tracking-tight">
              {isCreator ? "Validação & Selo VIP" : "Validação Anti-Fake"}
            </h2>
            <div className="rounded-2xl border border-gold/25 bg-gold/10 p-3">
              <p className="flex items-center gap-2 text-xs font-bold text-gold">
                <ShieldCheck className="size-4" /> Garantia de Segurança HotMatch
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                {isCreator
                  ? "Apenas pessoas reais! A verificação protege sua conta e libera saques via Pix."
                  : "Apenas pessoas reais! A validação facial elimina perfis falsos da comunidade."}
              </p>
            </div>

            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "relative grid size-40 place-items-center rounded-full border-2",
                  scanned ? "border-gold" : "border-primary/60",
                  scanning && "animate-pulse",
                )}
              >
                <span className="absolute inset-2 rounded-full border border-dashed border-border" />
                {scanned ? (
                  <Check className="size-12 text-gold" />
                ) : scanning ? (
                  <Loader2 className="size-10 animate-spin text-primary" />
                ) : (
                  <Camera className="size-10 text-muted-foreground" />
                )}
                {scanning && (
                  <span className="absolute inset-x-6 top-1/2 h-0.5 animate-bounce rounded-full bg-gradient-hot" />
                )}
              </div>
              <p className="mt-3 text-center text-xs text-muted-foreground">
                {scanning
                  ? "Escaneando rosto..."
                  : scanned
                    ? "Rosto validado com sucesso"
                    : isCreator
                      ? "Posicione seu rosto no círculo para validar seu Selo de Criadora VIP"
                      : "Posicione seu rosto no círculo para confirmar que você é real"}
              </p>
              {!scanned && (
                <Button
                  onClick={scan}
                  disabled={scanning}
                  variant="secondary"
                  className="mt-3 rounded-full"
                >
                  <Eye className="size-4" /> Iniciar biometria facial
                </Button>
              )}
            </div>

            {isCreator && (
              <Field
                label="CPF (obrigatório para selo VIP e saques Pix)"
                placeholder="000.000.000-00"
                inputMode="numeric"
                value={cpf}
                onChange={(e) => setCpf(maskCPF(e.target.value))}
              />
            )}
          </div>
        )}

        <Button
          onClick={next}
          className="mt-5 h-12 w-full rounded-full bg-gradient-hot text-sm font-bold text-primary-foreground shadow-hot"
        >
          {step >= totalSteps ? "Criar minha conta" : "Continuar"}
          <ArrowRight className="size-4" />
        </Button>
      </DialogContent>
    </Dialog>
  );
}

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
