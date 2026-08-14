import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { _ as createRootRoute, d as HeadContent, g as createFileRoute, h as lazyRouteComponent, m as Outlet, p as createRouter, u as Scripts } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as Toaster } from "../_libs/sonner.mjs";
import { t as Route$7 } from "./perfil-DEpHPiFD.mjs";
import { t as QueryClient } from "../_libs/tanstack__query-core.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/router-DUrgRv7G.js
var import_jsx_runtime = require_jsx_runtime();
var Toaster$1 = ({ ...props }) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster, {
		className: "toaster group",
		toastOptions: { classNames: {
			toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
			description: "group-[.toast]:text-muted-foreground",
			actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
			cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground"
		} },
		...props
	});
};
var Route$6 = createRootRoute({
	head: () => ({ meta: [
		{ charSet: "utf-8" },
		{
			name: "viewport",
			content: "width=device-width, initial-scale=1.0"
		},
		{ title: "HotMatch" }
	] }),
	component: RootComponent
});
function RootComponent() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(RootDocument, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster$1, {
		position: "top-center",
		richColors: true
	})] });
}
function RootDocument({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "pt-BR",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})] })]
	});
}
var $$splitComponentImporter$5 = () => import("./routes-BlefmVqZ.mjs");
var Route$5 = createFileRoute("/")({
	head: () => ({ meta: [
		{ title: "HotMatch — Paquera local com match instantâneo" },
		{
			name: "description",
			content: "Deslize, dê match com pessoas perto de você e desbloqueie conteúdos exclusivos das criadoras no HotMatch."
		},
		{
			property: "og:title",
			content: "HotMatch — Paquera local com match instantâneo"
		},
		{
			property: "og:description",
			content: "Match, feed exclusivo, mimos em moedas e criadoras verificadas."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
var $$splitComponentImporter$4 = () => import("./bem-vindo-CmRkvkyR.mjs");
var Route$4 = createFileRoute("/bem-vindo")({ component: lazyRouteComponent($$splitComponentImporter$4, "component") });
var $$splitComponentImporter$3 = () => import("./feed-BIuJsyGd.mjs");
var Route$3 = createFileRoute("/feed")({
	head: () => ({ meta: [{ title: "Feed Exclusivo — HotMatch" }, {
		name: "description",
		content: "Fotos e vídeos das criadoras HotMatch."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
var $$splitComponentImporter$2 = () => import("./loja-CVgR1lmb.mjs");
var Route$2 = createFileRoute("/loja")({
	head: () => ({ meta: [
		{ title: "Loja & Carteira VIP — HotMatch" },
		{
			name: "description",
			content: "Compre moedas HotMatch via Pix, assine o plano VIP Gold ou solicite o saque dos seus ganhos como criadora."
		},
		{
			property: "og:title",
			content: "Loja & Carteira VIP — HotMatch"
		},
		{
			property: "og:description",
			content: "Pacotes de moedas, plano VIP Gold e saque Pix para criadoras."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
var $$splitComponentImporter$1 = () => import("./mensagens.index-Bxgn-Ker.mjs");
var Route$1 = createFileRoute("/mensagens/")({ component: lazyRouteComponent($$splitComponentImporter$1, "component") });
var $$splitComponentImporter = () => import("./mensagens._chatId-u5-R3FnN.mjs");
var Route = createFileRoute("/mensagens/$chatId")({ component: lazyRouteComponent($$splitComponentImporter, "component") });
var IndexRoute = Route$5.update({
	id: "/",
	path: "/",
	getParentRoute: () => Route$6
});
var BemVindoRoute = Route$4.update({
	id: "/bem-vindo",
	path: "/bem-vindo",
	getParentRoute: () => Route$6
});
var FeedRoute = Route$3.update({
	id: "/feed",
	path: "/feed",
	getParentRoute: () => Route$6
});
var LojaRoute = Route$2.update({
	id: "/loja",
	path: "/loja",
	getParentRoute: () => Route$6
});
var PerfilRoute = Route$7.update({
	id: "/perfil",
	path: "/perfil",
	getParentRoute: () => Route$6
});
var MensagensIndexRoute = Route$1.update({
	id: "/mensagens/",
	path: "/mensagens/",
	getParentRoute: () => Route$6
});
var rootRouteChildren = {
	IndexRoute,
	BemVindoRoute,
	FeedRoute,
	LojaRoute,
	PerfilRoute,
	MensagensChatIdRoute: Route.update({
		id: "/mensagens/$chatId",
		path: "/mensagens/$chatId",
		getParentRoute: () => Route$6
	}),
	MensagensIndexRoute
};
var routeTree = Route$6._addFileChildren(rootRouteChildren)._addFileTypes();
function getRouter() {
	const queryClient = new QueryClient();
	return createRouter({
		routeTree,
		context: { queryClient },
		defaultPreload: "intent"
	});
}
//#endregion
export { getRouter };
