# HotMatch Ignite

Crie o Web App PWA completo e responsivo (mobile-first) do aplicativo "HotMatch" — um Aplicativo de Relacionamento Híbrido de Alta Conversão que combina Paquera Local (estilo Tinder) com Monetização de Criadores e Mídias Exclusivas (estilo OnlyFans/Privacy).



IDENTIDADE VISUAL & DESIGN SYSTEM:

- Nome da aplicação: HotMatch

- Tema: Dark Premium Moderno

- Cores de destaque: Fundo preto profundeza (#0B0B0E / #121218), destaques em Dourado Ouro (#FFD700 / #E5A93C) para elementos VIP/Moedas, e acentos em Neon Quente (Rosa/Vermelho Hot #FF2A5F) para ações de Match/Like.

- Layout 100% otimizado para celular, com navegação fluida, microinterações elegantes, bordas levemente arredondadas e cards sem poluição visual.



ESTRUTURA DAS 5 ABAS NATIVAS (Menu Inferior Flutuante com Ícones Minimalistas):



1. Aba "Descobrir" (Tinder Style HotMatch):

   - Header superior com o logo HotMatch (com um ícone discreto de chama dourada/neon) e indicador do saldo de moedas no canto superior direito.

   - Cards de perfis deslizantes (Swipe interativo para esquerda/direita) com foto principal em destaque, nome, idade, distância, biografia curta e tags de interesse.

   - Badge "Verificada / Criadora VIP" em selo dourado nos perfis femininos.

   - Barra de botões de ação na parte inferior do card: Botão Pass (X), Super Like (Estrela Dourada) e Like (Coração Neon HotMatch).



2. Aba "Feed Exclusivo" (OnlyFans Style HotMatch):

   - Feed vertical infinito de postagens (fotos e vídeos) das criadoras da plataforma.

   - Suporte a mídias públicas e mídias privadas/VIP.

   - Mídias privadas/VIP exibidas com um filtro borrado (blur intenso), um ícone de cadeado dourado em destaque no centro e um botão de ação rápida: "Desbloquear por X Moedas" (ou botão Pix).

   - Para perfis de criadoras: Botão flutuante (FAB) "Postar Mídia VIP" que abre um modal para upload de imagem/vídeo e definição do preço em moedas.



3. Aba "Mensagens & Mimos":

   - Seção superior horizontal com a lista de "Matches Recentes" (avatares redondos com borda gradiente neon/dourada).

   - Seção inferior com a lista de conversas/chats ativos com indicador de mensagens não lidas.

   - Na tela interna do Chat de Mensagens:

     * Envio de mensagens de texto e áudio em tempo real.

     * Recurso de "Enviar Mídia Privada Paga": a criadora pode enviar uma foto/vídeo trancada por valor em moedas diretamente no bate-papo.

     * Botão "Enviar Mimo / Presente Virtual" (Ícone de Presente Dourado) com menu pop-up contendo opções de presentes com valores variados (ex: Drink = 10 moedas, Buquê = 50 moedas, Coroa VIP = 200 moedas) que transferem saldo do usuário para a criadora.



4. Aba "Loja & Carteira VIP":

   - Visão Dinâmica adaptada ao perfil do usuário:

     * Para Usuários Masculinos / Compradores:

       - Saldo atual de Moedas HotMatch em destaque.

       - Pacotes de Moedas para compra rápida via Pix (ex: 50 Moedas por R$ 10,00 | 150 Moedas por R$ 25,00 + Bônus VIP).

       - Opções de Assinatura "Plano HotMatch VIP Gold" com vantagens exclusivas (Super Likes ilimitados, ver quem curtiu, desconto em mimos).

     * Para Criadoras / Mulheres:

       - Painel financeiro com Saldo Acumulado (R$) gerado por vendas de mídias e recebimento de mimos.

       - Botão de "Solicitar Saque Pix" com formulário para chave Pix e valor.

       - Histórico de transações e vendas recentes.



5. Aba "Perfil":

   - Foto de capa e avatar com badge VIP.

   - Estatísticas do perfil (Visualizações, Curtidas, Mimos Recebidos).

   - Abas internas de galeria:

     * Galeria Pública (fotos visíveis para todos no app).

     * Galeria Trancada / VIP (mídias que exigem moedas para desbloqueio).

   - Configurações da conta, gerenciamento de perfil e atalho para suporte.



Requisitos Adicionais:

- Monte toda a interface visual e os fluxos navegáveis de transição entre as 5 abas e telas internas (chat, checkout da loja e modal de postagem) de forma limpa, elegante, moderna e altamente focada em conversão!

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/33688347-6fc9-470e-826c-6339cc4b764c).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
