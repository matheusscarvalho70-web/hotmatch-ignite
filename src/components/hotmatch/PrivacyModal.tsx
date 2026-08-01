import { useState } from "react";
import { CheckCircle2, ChevronRight, Clock, Shield, X } from "lucide-react";
import { toast } from "sonner";
import { useAppState } from "@/lib/hotmatch/store";

type Props = { open: boolean; onClose: () => void };

const BLOCKED: { name: string; avatar: string }[] = [];

export function PrivacyModal({ open, onClose }: Props) {
  const { gender } = useAppState();
  const isCreator = gender === "female";

  const [online, setOnline] = useState(true);
  const [distance, setDistance] = useState(true);
  const [readReceipts, setReadReceipts] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(true);

  function startVerification() {
    setVerifying(true);
    setTimeout(() => {
      setVerifying(false);
      setVerified(true);
      toast("Identidade verificada! ✅", {
        description: "Seu selo de Criadora Verificada está ativo.",
        className: "bg-white text-zinc-900 border border-zinc-200 shadow-xl rounded-2xl",
      });
    }, 2200);
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[30rem] overflow-y-auto rounded-t-3xl border-t border-border bg-background"
        style={{ maxHeight: "90dvh" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center pt-3">
          <div className="h-1 w-10 rounded-full bg-border" />
        </div>

        <div className="flex items-center justify-between px-5 py-4">
          <h2 className="text-lg font-extrabold">Privacidade e Verificação</h2>
          <button
            onClick={onClose}
            className="grid size-8 place-items-center rounded-full bg-surface-2"
          >
            <X className="size-4 text-muted-foreground" />
          </button>
        </div>

        <div className="space-y-6 px-5 pb-10">
          {/* Visibility toggles */}
          <Section title="Visibilidade">
            <Toggle
              label="Aparecer como online"
              description="Mostra o indicador verde no seu perfil"
              value={online}
              onChange={setOnline}
            />
            <Toggle
              label="Mostrar distância"
              description="Exibe sua proximidade para outros usuários"
              value={distance}
              onChange={setDistance}
            />
            <Toggle
              label="Confirmação de leitura"
              description="Avisa quando você lê mensagens no chat"
              value={readReceipts}
              onChange={setReadReceipts}
            />
          </Section>

          {/* Blocked accounts */}
          <Section title="Contas Bloqueadas">
            {BLOCKED.length === 0 ? (
              <p className="py-3 text-sm text-muted-foreground">
                Nenhuma conta bloqueada por enquanto.
              </p>
            ) : (
              BLOCKED.map((b) => (
                <div key={b.name} className="flex items-center gap-3 py-2.5">
                  <div className="size-9 overflow-hidden rounded-full bg-surface-2">
                    <img src={b.avatar} alt={b.name} className="size-full object-cover" />
                  </div>
                  <span className="flex-1 text-sm font-medium">{b.name}</span>
                  <button className="text-xs font-bold text-primary">Desbloquear</button>
                </div>
              ))
            )}
          </Section>

          {/* Verification (creators) */}
          {isCreator && (
            <Section title="Verificação de Identidade">
              <div className="rounded-2xl border border-border bg-surface p-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`grid size-10 place-items-center rounded-full ${verified ? "bg-emerald-500/15" : "bg-amber-500/15"}`}
                  >
                    {verified ? (
                      <CheckCircle2 className="size-5 text-emerald-400" />
                    ) : (
                      <Clock className="size-5 text-amber-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold">
                      {verified ? "Criadora Verificada ✅" : "Verificação pendente"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {verified
                        ? "Seu perfil possui o selo oficial HotMatch"
                        : "Envie um documento para ativar o selo"}
                    </p>
                  </div>
                </div>

                {!verified && (
                  <button
                    onClick={startVerification}
                    disabled={verifying}
                    className="tap-scale mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-hot py-3 text-sm font-bold text-primary-foreground shadow-hot disabled:opacity-60"
                  >
                    <Shield className="size-4" />
                    {verifying ? "Verificando..." : "Iniciar verificação de identidade"}
                  </button>
                )}

                {verified && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {["Rosto verificado", "Documento válido", "Maior de 18"].map((tag) => (
                      <span
                        key={tag}
                        className="flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-400"
                      >
                        <CheckCircle2 className="size-3" />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </Section>
          )}

          {/* Data & Privacy links */}
          <Section title="Dados e Privacidade">
            {[
              "Política de privacidade",
              "Termos de uso",
              "Solicitar exclusão de dados",
            ].map((item) => (
              <button
                key={item}
                className="flex w-full items-center justify-between py-3 text-sm text-foreground/80 active:bg-surface-2"
              >
                {item}
                <ChevronRight className="size-4 text-muted-foreground" />
              </button>
            ))}
          </Section>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
        {title}
      </p>
      <div className="overflow-hidden rounded-2xl border border-border bg-surface divide-y divide-border">
        <div className="px-4">{children}</div>
      </div>
    </div>
  );
}

function Toggle({
  label,
  description,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  description: string;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-3.5">
      <div className="min-w-0">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-[11px] text-muted-foreground">{description}</p>
      </div>
      <button
        role="switch"
        aria-checked={value}
        onClick={() => onChange(!value)}
        className={`tap-scale relative h-6 w-11 shrink-0 rounded-full transition-colors ${value ? "bg-primary" : "bg-surface-2 border border-border"}`}
      >
        <span
          className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition-transform ${value ? "translate-x-5" : "translate-x-0.5"}`}
        />
      </button>
    </div>
  );
}
