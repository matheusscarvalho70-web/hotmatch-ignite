import { useState } from "react";
import { AlertTriangle, CheckCircle2, ChevronRight, Clock, Shield, X } from "lucide-react";
import { toast } from "sonner";
import { useAppState, actions } from "@/lib/hotmatch/store";
import { supabase } from "@/lib/supabase";

type Props = { open: boolean; onClose: () => void };

const BLOCKED: { name: string; avatar: string }[] = [];

const PRIVACY_POLICY_TEXT = `Política de Privacidade – HotMatch

Última atualização: agosto de 2026

A sua privacidade é fundamental para nós. Esta política descreve como coletamos, usamos e protegemos seus dados no HotMatch, um aplicativo de relacionamento e conexão entre pessoas.

1. Dados que coletamos
- Informações de cadastro: nome, idade, e-mail, gênero e localização aproximada.
- Fotos e mídias enviadas por você (públicas e VIP).
- Dados de atividade: curtidas, matches, mensagens e interações.
- Dados de pagamento: transações de moedas e saques (processados de forma segura).

2. Como usamos seus dados
- Para conectar você com outras pessoas próximas.
- Para exibir e recomendar perfis compatíveis.
- Para garantir a segurança da plataforma e prevenir abusos.
- Para processar pagamentos e saques de criadoras.

3. Compartilhamento
Seus dados não são vendidos a terceiros. Compartilhamos apenas informações necessárias com prestadores de serviço (ex: infraestrutura e pagamentos), sempre sob sigilo.

4. Armazenamento e segurança
Utilizamos criptografia e boas práticas de segurança. Seus dados são armazenados em servidores protegidos.

5. Seus direitos
Você pode solicitar acesso, correção ou exclusão dos seus dados a qualquer momento através da opção "Excluir conta" no aplicativo.

6. Menores de idade
O HotMatch é destinado exclusivamente a maiores de 18 anos.

Para dúvidas, entre em contato através do suporte no aplicativo.`;

const TERMS_OF_USE_TEXT = `Termos de Uso – HotMatch

Última atualização: agosto de 2026

Ao utilizar o HotMatch, você concorda com os seguintes termos:

1. Elegibilidade
Você declara ter 18 anos ou mais e fornecer informações verdadeiras no cadastro.

2. Conduta do usuário
- É proibido publicar conteúdo ilegal, ofensivo, sexual explícito não consentido, ou que viole direitos de terceiros.
- É proibido assediar, ameaçar ou discriminar outros usuários.
- É proibido criar perfis falsos ou se passar por outra pessoa.

3. Conteúdo e mídia
Você é responsável por todo conteúdo que publica. Conteúdo VIP é de responsabilidade da criadora, que define o preço e o acesso.

4. Moedas e pagamentos
- Moedas virtuais não têm valor fora do aplicativo.
- Saques estão sujeitos a verificação de identidade e regras internas.
- Compras de moedas não são reembolsáveis, exceto em casos previstos em lei.

5. Verificação de identidade
Criadoras podem solicitar verificação para obter o selo "Criadora Verificada", garantindo mais segurança para todos.

6. Suspensão de contas
O descumprimento destes termos pode resultar em suspensão ou exclusão permanente da conta.

7. Limitação de responsabilidade
O HotMatch é uma plataforma de intermediação. Não nos responsabilizamos por encontros, conversas ou acordos entre usuários.

8. Alterações
Estes termos podem ser atualizados a qualquer momento. Recomendamos revisá-los periodicamente.

Para dúvidas, entre em contato através do suporte no aplicativo.`;

export function PrivacyModal({ open, onClose }: Props) {
  const { gender, profileId } = useAppState();
  const isCreator = gender === "female";

  const [readReceipts, setReadReceipts] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(true);
  const [legalModal, setLegalModal] = useState<null | "privacy" | "terms">(null);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

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

  async function handleDeleteAccount() {
    if (!profileId) return;
    setDeleting(true);
    try {
      const { error } = await supabase.from("profiles").delete().eq("id", profileId);
      if (error) throw error;
      actions.signOut();
      toast("Conta excluída permanentemente", {
        description: "Todos os seus dados foram removidos.",
        className: "bg-white text-zinc-900 border border-zinc-200 shadow-xl rounded-2xl",
      });
      onClose();
    } catch {
      toast("Erro ao excluir conta", {
        description: "Tente novamente ou contate o suporte.",
        className: "bg-red-50 text-red-900 border border-red-200 shadow-xl rounded-2xl",
      });
    } finally {
      setDeleting(false);
    }
  }

  if (!open) return null;

  return (
    <>
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

            {/* Verification (creators only) */}
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
              <button
                onClick={() => setLegalModal("privacy")}
                className="flex w-full items-center justify-between py-3 text-sm text-foreground/80 active:bg-surface-2"
              >
                Política de privacidade
                <ChevronRight className="size-4 text-muted-foreground" />
              </button>
              <button
                onClick={() => setLegalModal("terms")}
                className="flex w-full items-center justify-between py-3 text-sm text-foreground/80 active:bg-surface-2"
              >
                Termos de uso
                <ChevronRight className="size-4 text-muted-foreground" />
              </button>
              <button
                onClick={() => setDeleteModal(true)}
                className="flex w-full items-center justify-between py-3 text-sm font-semibold text-red-500 active:bg-surface-2"
              >
                Excluir conta
                <ChevronRight className="size-4 text-red-400" />
              </button>
            </Section>
          </div>
        </div>
      </div>

      {/* Legal modal */}
      {legalModal && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={() => setLegalModal(null)}
        >
          <div
            className="w-full max-w-[30rem] overflow-y-auto rounded-3xl border border-border bg-background"
            style={{ maxHeight: "85dvh" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 flex items-center justify-between border-b border-border bg-background px-5 py-4">
              <h3 className="text-base font-extrabold">
                {legalModal === "privacy" ? "Política de Privacidade" : "Termos de Uso"}
              </h3>
              <button
                onClick={() => setLegalModal(null)}
                className="grid size-8 place-items-center rounded-full bg-surface-2"
              >
                <X className="size-4 text-muted-foreground" />
              </button>
            </div>
            <div className="whitespace-pre-line px-5 py-5 text-[13px] leading-relaxed text-foreground/80">
              {legalModal === "privacy" ? PRIVACY_POLICY_TEXT : TERMS_OF_USE_TEXT}
            </div>
          </div>
        </div>
      )}

      {/* Delete account confirmation */}
      {deleteModal && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => !deleting && setDeleteModal(false)}
        >
          <div
            className="w-full max-w-[26rem] rounded-3xl border border-red-500/30 bg-background p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-4 grid size-14 place-items-center rounded-full bg-red-500/15">
              <AlertTriangle className="size-7 text-red-500" />
            </div>
            <h3 className="mb-2 text-center text-lg font-extrabold text-red-500">
              Excluir conta permanentemente
            </h3>
            <p className="mb-5 text-center text-sm text-muted-foreground">
              Esta ação é <span className="font-bold text-red-500">irreversível</span>. Leia com atenção:
            </p>
            <ul className="mb-6 space-y-2.5 text-sm text-foreground/80">
              <li className="flex items-start gap-2">
                <span className="mt-1 size-1.5 shrink-0 rounded-full bg-red-400" />
                Seu perfil, fotos e mídias serão apagados permanentemente.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 size-1.5 shrink-0 rounded-full bg-red-400" />
                Todos os seus matches e conexões serão perdidos.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 size-1.5 shrink-0 rounded-full bg-red-400" />
                O histórico de mensagens e conversas será excluído.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 size-1.5 shrink-0 rounded-full bg-red-400" />
                Moedas e saldo de saques não poderão ser recuperados.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 size-1.5 shrink-0 rounded-full bg-red-400" />
                Não será possível reativar a conta após a exclusão.
              </li>
            </ul>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteModal(false)}
                disabled={deleting}
                className="flex-1 rounded-full border border-border bg-surface-2 py-3 text-sm font-bold text-foreground disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="flex-1 rounded-full bg-red-500 py-3 text-sm font-bold text-white shadow-lg shadow-red-500/30 disabled:opacity-60"
              >
                {deleting ? "Excluindo..." : "Excluir definitivamente"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
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
