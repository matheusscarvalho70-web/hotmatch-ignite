import { useEffect, useRef, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Camera, Check, Crown, Eye, EyeOff, Plus, Sparkles, User, UserRound, Wallet, ShieldCheck, Lock } from "lucide-react";
import { toast } from "sonner";
import { HotMark } from "@/components/hotmatch/HotMark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { actions, useAppState } from "@/lib/hotmatch/store";
import { supabase } from "@/lib/supabase";
import { registerPush } from "@/lib/hotmatch/onesignal";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/bem-vindo")({ component: WelcomePage });
type Gender = "male" | "female";
const calcAge = (dob: string) => {
  const b = new Date(dob), t = new Date();
  let a = t.getFullYear() - b.getFullYear();
  return (t.getMonth() - b.getMonth() < 0 || (t.getMonth() - b.getMonth() === 0 && t.getDate() < b.getDate())) ? a - 1 : a;
};
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

function WelcomePage() {
  const [gender, setGender] = useState<Gender | null>(null);
  const [signupOpen, setSignupOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const navigate = useNavigate();
  const { profileId } = useAppState();
  useEffect(() => { if (profileId) navigate({ to: "/", replace: true }); }, [profileId, navigate]);

  return (
    <div className="min-h-screen pb-16">
      <header className="flex items-center justify-between px-4 pt-8">
        <div className="flex items-center gap-2"><HotMark className="size-6" /> <span className="font-extrabold">HotMatch</span></div>
        <button onClick={() => setLoginOpen(true)} className="rounded-full border px-4 py-2 text-xs font-semibold">Já tenho conta</button>
      </header>
      <main className="px-5 text-center">
        <h1 className="mt-10 text-3xl font-extrabold">Conexões Reais e Mídias Exclusivas 🔥</h1>
        <div className="mt-8 space-y-3">
          <ChoiceCard onClick={() => {setGender("male"); setSignupOpen(true)}} title="Quero Paquerar" tone="hot" icon={<User size={20}/>} />
          <ChoiceCard onClick={() => {setGender("female"); setSignupOpen(true)}} title="Quero Ser Criadora" tone="gold" icon={<Crown size={20}/>} />
        </div>
      </main>
      <LoginDialog open={loginOpen} onOpenChange={setLoginOpen} />
      {signupOpen && gender && <SignupFlow open={signupOpen} onOpenChange={setSignupOpen} gender={gender} />}
    </div>
  );
}

function ChoiceCard({ onClick, title, tone, icon }: any) {
  return (
    <button onClick={onClick} className={cn("w-full p-4 rounded-3xl border flex items-center gap-4", tone === "gold" ? "border-gold" : "border-primary")}>
      <div className="p-3 rounded-full bg-surface">{icon}</div>
      <span className="font-bold">{title}</span>
    </button>
  );
}

function LoginDialog({ open, onOpenChange }: any) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const submit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) toast.error("Erro ao entrar.");
    else { window.location.href = "/"; }
    setLoading(false);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={submit} className="space-y-4">
          <Input placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
          <Input type="password" placeholder="Senha" onChange={(e) => setPassword(e.target.value)} />
          <Button className="w-full" disabled={loading}>Entrar</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function SignupFlow({ open, onOpenChange, gender }: any) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState({ name: "", email: "", password: "", dob: "" });
  
  const finish = async () => {
    const { data: auth, error } = await supabase.auth.signUp({ email: data.email, password: data.password });
    if (!error && auth.user) {
      await supabase.from("profiles").insert({ id: auth.user.id, name: data.name, gender });
      toast.success("Conta criada!");
      window.location.href = "/";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] overflow-auto">
        {step === 1 && (
          <div className="space-y-3">
            <Input placeholder="Nome" onChange={(e) => setData({...data, name: e.target.value})} />
            <Input placeholder="Email" onChange={(e) => setData({...data, email: e.target.value})} />
            <Button onClick={() => setStep(2)}>Continuar</Button>
          </div>
        )}
        {step === 2 && <Button onClick={finish}>Finalizar Cadastro</Button>}
      </DialogContent>
    </Dialog>
  );
                                              }
