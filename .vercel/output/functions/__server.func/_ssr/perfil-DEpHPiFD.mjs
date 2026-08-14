import { g as createFileRoute, h as lazyRouteComponent } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as stringType, t as objectType } from "../_libs/zod.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/perfil-DEpHPiFD.js
var $$splitComponentImporter = () => import("./perfil-CVwrAaS_.mjs");
var Route = createFileRoute("/perfil")({
	validateSearch: objectType({
		uid: stringType().optional(),
		from: stringType().optional()
	}),
	head: () => ({ meta: [{ title: "Meu Perfil — HotMatch" }, {
		name: "description",
		content: "Gerencie seu perfil e fotos na HotMatch."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
//#endregion
export { Route as t };
