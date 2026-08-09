import p1 from "@/assets/p1.jpg";
import p2 from "@/assets/p2.jpg";
import p3 from "@/assets/p3.jpg";
import p4 from "@/assets/p4.jpg";

export const photos = { p1, p2, p3, p4 };

export type Profile = {
  id: string;
  name: string;
  age: number;
  distance: string;
  bio: string;
  tags: string[];
  photo: string;
  verified: boolean;
  creator: boolean;
};

export const profiles: Profile[] = [
  {
    id: "u1",
    name: "Bianca",
    age: 25,
    distance: "2 km",
    bio: "Amo noites de neon, drinks e boas conversas. Criadora de conteúdo exclusivo 🔥",
    tags: ["Balada", "Fotografia", "Vinho"],
    photo: p1,
    verified: true,
    creator: true,
  },
  {
    id: "u2",
    name: "Marina",
    age: 23,
    distance: "5 km",
    bio: "Cachos, café e pôr do sol na cobertura. Vem trocar ideia.",
    tags: ["Café", "Arte", "Rooftop"],
    photo: p2,
    verified: true,
    creator: false,
  },
  {
    id: "u3",
    name: "Helena",
    age: 27,
    distance: "1,2 km",
    bio: "Elegância é atitude. Lounge, jazz e conteúdo VIP toda semana.",
    tags: ["Jazz", "Luxo", "Viagens"],
    photo: p3,
    verified: true,
    creator: true,
  },
  {
    id: "u4",
    name: "Duda",
    age: 24,
    distance: "8 km",
    bio: "Praia, treino e risada fácil. Bora tomar um açaí?",
    tags: ["Fitness", "Praia", "Surf"],
    photo: p4,
    verified: false,
    creator: false,
  },
];

export type Post = {
  id: string;
  author: Profile;
  caption: string;
  media: string;
  type: "foto" | "vídeo";
  locked: boolean;
  price: number;
  likes: number;
  time: string;
};

export const posts: Post[] = [
  {
    id: "post1",
    author: profiles[0],
    caption: "Prévia do ensaio de ontem à noite ✨",
    media: p1,
    type: "foto",
    locked: false,
    price: 0,
    likes: 1284,
    time: "há 12 min",
  },
  {
    id: "post2",
    author: profiles[2],
    caption: "Álbum completo do lounge — só para os VIPs 🔒",
    media: p3,
    type: "foto",
    locked: true,
    price: 60,
    likes: 892,
    time: "há 40 min",
  },
  {
    id: "post3",
    author: profiles[3],
    caption: "Treino de sunset na praia 🌅",
    media: p4,
    type: "vídeo",
    locked: false,
    price: 0,
    likes: 640,
    time: "há 2 h",
  },
  {
    id: "post4",
    author: profiles[1],
    caption: "Vídeo exclusivo de 4 min gravado hoje 🔥",
    media: p2,
    type: "vídeo",
    locked: true,
    price: 120,
    likes: 2310,
    time: "há 5 h",
  },
];

export type Chat = {
  id: string;
  profile: Profile;
  last: string;
  time: string;
  unread: number;
};

export const chats: Chat[] = [
  { id: "u1", profile: profiles[0], last: "Te mandei uma mídia privada 😏", time: "19:42", unread: 2 },
  { id: "u3", profile: profiles[2], last: "Adorei o mimo, obrigada!", time: "18:10", unread: 0 },
  { id: "u2", profile: profiles[1], last: "Bora marcar aquele café?", time: "Ontem", unread: 1 },
  { id: "u4", profile: profiles[3], last: "Kkkk você é engraçado", time: "Ter", unread: 0 },
];

export type Gift = { id: string; name: string; emoji: string; price: number; color: string };

export const gifts: Gift[] = [
  { id: "g1", name: "Drink", emoji: "🍸", price: 10, color: "#60a5fa" },
  { id: "g2", name: "Chocolate", emoji: "🍫", price: 25, color: "#d97706" },
  { id: "g3", name: "Buquê", emoji: "💐", price: 50, color: "#ec4899" },
  { id: "g4", name: "Anel", emoji: "💍", price: 100, color: "#fbbf24" },
  { id: "g5", name: "Coroa VIP", emoji: "👑", price: 200, color: "#a78bfa" },
  { id: "g6", name: "Foguete", emoji: "🚀", price: 500, color: "#f87171" },
];

export type Message = {
  id: string;
  from: "me" | "them";
  kind: "text" | "audio" | "locked" | "gift";
  text?: string;
  seconds?: number;
  price?: number;
  media?: string;
  time: string;
};

export const initialMessages: Message[] = [
  { id: "m1", from: "them", kind: "text", text: "Oiê, curti muito seu perfil 😍", time: "19:20" },
  { id: "m2", from: "me", kind: "text", text: "Também curti o seu! Tudo bem?", time: "19:22" },
  { id: "m3", from: "them", kind: "audio", seconds: 14, time: "19:28" },
  {
    id: "m4",
    from: "them",
    kind: "locked",
    text: "Fiz esse só pra você 😏",
    price: 45,
    media: photos.p1,
    time: "19:42",
  },
];

export const coinPacks = [
  { id: "50", coins: 50, price: 10, bonus: 0, tag: "" },
  { id: "150", coins: 150, price: 25, bonus: 15, tag: "Mais popular" },
  { id: "400", coins: 400, price: 60, bonus: 60, tag: "Melhor valor" },
  { id: "1000", coins: 1000, price: 130, bonus: 200, tag: "Whale" },
];

export const salesHistory = [
  { id: "s1", label: "Mídia VIP desbloqueada", who: "Rafael M.", value: 24.0, time: "Hoje 20:12" },
  { id: "s2", label: "Mimo · Coroa VIP", who: "Lucas P.", value: 40.0, time: "Hoje 18:47" },
  { id: "s3", label: "Mídia privada no chat", who: "Diego S.", value: 9.0, time: "Ontem 23:05" },
  { id: "s4", label: "Mimo · Buquê", who: "André T.", value: 10.0, time: "Ontem 21:30" },
];
