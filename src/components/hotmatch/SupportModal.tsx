import { useState } from "react";
import { ChevronDown, ChevronUp, HelpCircle, MessageCircle, X } from "lucide-react";

import { useAppState } from "@/lib/hotmatch/store";

type Props = { open: boolean; onClose: () => void };

const FAQS = [
  {
    q: "Como faço um saque Pix?",
    a: "Acesse 'Dashboard de ganhos' no seu perfil, informe sua chave Pix e o valor (mínimo R$ 50,00). O pagamento é processado em até 2 horas.",
  },
  {
    q: "Como ativar o VIP?",
    a: "Acesse 'Gerenciar assinatura VIP' ou clique no badge de moedas no topo. O VIP custa 200 moedas/mês e libera recursos exclusivos.",
  },
  {
    q: "Minha verificação facial falhou. O que fazer?",
    a: "Certifique-se de usar boa iluminação e posicionar o rosto centralmente. Se o problema persistir, entre em contato com o suporte.",
  },
  {
    q: "Como denunciar um perfil suspeito?",
    a: "Acesse o perfil da pessoa, toque no menu '...' e selecione 'Denunciar'. Nossa equipe analisa em até 24 horas.",
  },
  {
    q: "Posso usar o HotMatch em mais de um dispositivo?",
    a: "Sim. Sua conta sincroniza automaticamente. Por segurança, você será desconectado de sessões antigas ao fazer login em um novo aparelho.",
  },
];

export function SupportModal({ open, onClose }: Props) {
  const { gender } = useAppState();
  const isCreator = gender === "female";
  const visibleFaqs = isCreator ? FAQS.filter((f) => !f.q.includes("VIP")) : FAQS;
  const [expanded, setExpanded] = useState<number | null>(null);

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
          <div className="flex items-center gap-2">
            <HelpCircle className="size-5 text-primary" />
            <h2 className="text-lg font-extrabold">Suporte HotMatch</h2>
          </div>
          <button
            onClick={onClose}
            className="grid size-8 place-items-center rounded-full bg-surface-2"
          >
            <X className="size-4 text-muted-foreground" />
          </button>
        </div>

        <div className="space-y-5 px-5 pb-10">
          {/* Contact CTA */}
          <div className="flex gap-3">
            <a
              href="mailto:suporte@hotmatch.app"
              className="tap-scale flex flex-1 items-center justify-center gap-2 rounded-2xl border border-border bg-surface py-3.5 text-sm font-bold text-foreground"
            >
              <span>✉️</span>
              E-mail
            </a>
            <a
              href="https://wa.me/5511999999999?text=Preciso+de+ajuda+no+HotMatch"
              target="_blank"
              rel="noopener noreferrer"
              className="tap-scale flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#25D366] py-3.5 text-sm font-bold text-white"
            >
              <MessageCircle className="size-4" />
              WhatsApp
            </a>
          </div>

          <p className="text-[11px] text-center text-muted-foreground">
            Atendimento disponível das 9h às 22h (horário de Brasília)
          </p>

          {/* FAQ */}
          <div>
            <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
              Perguntas frequentes
            </p>
            <ul className="overflow-hidden rounded-2xl border border-border bg-surface divide-y divide-border">
              {visibleFaqs.map((faq, i) => (
                <li key={i}>
                  <button
                    onClick={() => setExpanded(expanded === i ? null : i)}
                    className="flex w-full items-start gap-3 px-4 py-4 text-left"
                  >
                    <span className="mt-0.5 flex-1 text-sm font-semibold">{faq.q}</span>
                    {expanded === i ? (
                      <ChevronUp className="size-4 shrink-0 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
                    )}
                  </button>
                  {expanded === i && (
                    <p className="px-4 pb-4 text-sm leading-relaxed text-muted-foreground">
                      {faq.a}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* App version */}
          <p className="text-center text-[10px] text-muted-foreground/50">
            HotMatch v1.0.0 · Todos os direitos reservados
          </p>
        </div>
      </div>
    </div>
  );
}
