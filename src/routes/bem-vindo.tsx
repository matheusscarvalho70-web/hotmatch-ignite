import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Crown, ShieldCheck, Sparkles, User, UserRound, Wallet } from "lucide-react";
import { toast } from "sonner";
import { HotMark } from "@/components/hotmatch/HotMark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { actions, useAppState } from "@/lib/hotmatch/store";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/bem-vindo")({
  component: WelcomePage,
});

type Gender = "male" | "female";

function WelcomePage() {
  const [signupOpen, setSignupOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [gender, setGender] = useState<Gender>("male");
  const navigate = useNavigate();
  const { profileId } = useAppState();

  useEffect(() => {
    if (profileId) navigate({ to: "/", replace: true });
  }, [profileId, navigate]);

  return (
    <div className="min-h-screen pb-16">
      <header className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <HotMark className="size-6" />
          <span className="font-extrabold">HotMatch</span>
        </div>
        <button onClick={() => setLoginOpen(true)} className="text-xs font-semibold text-muted-foreground">
          Já tenho conta
        </button>
      </header>

      <main className="px-5 pt-10 text-center">
        <h1 className="text-2xl font-extrabold">
          Conexões Reais e Mídias Exclusivas 🔥
        </h1>
        <div className="mt-8 space-y-3">
          <Button onClick={() => { setGender("male"); setSignupOpen(true); }} className="w-full h-14 rounded-2xl font-bold">
            Quero Paquerar
          </Button>
          <Button onClick={() => { setGender("female"); setSignupOpen(true); }} className="w-full h-14 rounded-2xl font-bold variant-outline">
            Quero Ser Criadora VIP
          </Button>
        </div>
      </main>

      <LoginDialog open={loginOpen} onOpenChange={setLoginOpen} />
      <SimpleSignup open={signupOpen} onOpenChange={setSignupOpen} gender={gender} />
    </div>
  );
}

function LoginDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { toast.error(error.message); return; }
    if (data.user) {
      const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single();
      if (profile) {
        actions.setProfile({ profileId: profile.id, gender: profile.gender, name: profile.name, avatarUrl: profile.avatar_url, coins: 0, earnings: 0, xp: 0, level: "bronze", vip: false });
        navigate({ to: "/" });
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-5 rounded-3xl">
        <DialogTitle>Entrar</DialogTitle>
        <form onSubmit={submit} className="space-y-3 mt-4">
          <Input placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input type="password" placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)} />
          <Button type="submit" className="w-full">Entrar</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function SimpleSignup({ open, onOpenChange, gender }: { open: boolean; onOpenChange: (v: boolean) => void; gender: Gender }) {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) { toast.error(error.message); return; }
    if (data.user) {
      await supabase.from("profiles").insert({ id: data.user.id, gender, name, age: 18, location: "Brasil" });
      actions.setProfile({ profileId: data.user.id, gender, name, avatarUrl: null, coins: 0, earnings: 0, xp: 0, level: "bronze", vip: false });
      navigate({ to: "/" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-5 rounded-3xl">
        <DialogTitle>Criar Conta</DialogTitle>
        <form onSubmit={submit} className="space-y-3 mt-4">
          <Input placeholder="Nome" value={name} onChange={(e) => setName(e.target.value)} />
          <Input placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input type="password" placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)} />
          <Button type="submit" className="w-full">Cadastrar</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
