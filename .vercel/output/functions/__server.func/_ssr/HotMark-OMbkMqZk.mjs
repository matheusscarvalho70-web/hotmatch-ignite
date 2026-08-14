import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { n as clsx } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/HotMark-OMbkMqZk.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
/**
* Ícone oficial HotMatch: duas linhas fluídas em gradiente (Ouro VIP + Rosa Neon)
* que se cruzam formando um "H" minimalista com uma faísca central de conexão.
*/
function HotMark({ className, strokeWidth = 7 }) {
	const uid = (0, import_react.useId)().replace(/:/g, "");
	const gold = `hm-gold-${uid}`;
	const hot = `hm-hot-${uid}`;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: "0 0 64 64",
		fill: "none",
		className: cn("size-6", className),
		"aria-hidden": "true",
		role: "presentation",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("defs", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("linearGradient", {
				id: gold,
				x1: "0",
				y1: "0",
				x2: "1",
				y2: "1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
					offset: "0%",
					stopColor: "#FFD700"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
					offset: "100%",
					stopColor: "#E5A93C"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("linearGradient", {
				id: hot,
				x1: "1",
				y1: "0",
				x2: "0",
				y2: "1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
					offset: "0%",
					stopColor: "#FF2A5F"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
					offset: "100%",
					stopColor: "#FF7A3C"
				})]
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M19 10C14 24 24 40 19 54",
				stroke: `url(#${gold})`,
				strokeWidth,
				strokeLinecap: "round"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M45 10c5 14-5 30 0 44",
				stroke: `url(#${hot})`,
				strokeWidth,
				strokeLinecap: "round"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M19 34h26",
				stroke: `url(#${gold})`,
				strokeWidth: strokeWidth - 1,
				strokeLinecap: "round",
				opacity: "0.75"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M32 22.5l3.2 6.3 6.3 3.2-6.3 3.2-3.2 6.3-3.2-6.3L22.5 32l6.3-3.2z",
				fill: `url(#${hot})`
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "32",
				cy: "32",
				r: "2.4",
				fill: "#FFD700"
			})
		]
	});
}
//#endregion
export { cn as n, HotMark as t };
