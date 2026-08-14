import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { i as X, n as ZoomIn, t as ZoomOut } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/Lightbox-DdL36lPv.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Lightbox({ src, onClose }) {
	const [scale, setScale] = (0, import_react.useState)(1);
	const [pos, setPos] = (0, import_react.useState)({
		x: 0,
		y: 0
	});
	const [dragging, setDragging] = (0, import_react.useState)(false);
	const dragStart = (0, import_react.useRef)({
		x: 0,
		y: 0,
		posX: 0,
		posY: 0
	});
	const reset = (0, import_react.useCallback)(() => {
		setScale(1);
		setPos({
			x: 0,
			y: 0
		});
	}, []);
	(0, import_react.useEffect)(() => {
		const onKey = (e) => {
			if (e.key === "Escape") onClose();
		};
		window.addEventListener("keydown", onKey);
		document.body.style.overflow = "hidden";
		return () => {
			window.removeEventListener("keydown", onKey);
			document.body.style.overflow = "";
		};
	}, [onClose]);
	const onPointerDown = (e) => {
		if (scale <= 1) return;
		setDragging(true);
		dragStart.current = {
			x: e.clientX,
			y: e.clientY,
			posX: pos.x,
			posY: pos.y
		};
		e.target.setPointerCapture(e.pointerId);
	};
	const onPointerMove = (e) => {
		if (!dragging) return;
		setPos({
			x: dragStart.current.posX + (e.clientX - dragStart.current.x),
			y: dragStart.current.posY + (e.clientY - dragStart.current.y)
		});
	};
	const onPointerUp = () => setDragging(false);
	const toggleZoom = () => {
		if (scale > 1) reset();
		else setScale(2.5);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "fixed inset-0 z-[70] flex items-center justify-center bg-black/95 touch-none",
		onClick: onClose,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "absolute top-4 right-4 z-10 flex items-center gap-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: (e) => {
						e.stopPropagation();
						setScale((s) => Math.min(s + .5, 5));
					},
					className: "grid size-10 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 transition",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ZoomIn, { className: "size-5" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: (e) => {
						e.stopPropagation();
						const next = Math.max(scale - .5, 1);
						setScale(next);
						if (next <= 1) setPos({
							x: 0,
							y: 0
						});
					},
					className: "grid size-10 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 transition",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ZoomOut, { className: "size-5" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: onClose,
					className: "grid size-10 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 transition",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-5" })
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
			src,
			alt: "Visualização",
			className: "max-h-[90vh] max-w-[95vw] rounded-2xl object-contain select-none transition-transform duration-200",
			style: {
				transform: `translate(${pos.x}px, ${pos.y}px) scale(${scale})`,
				cursor: scale > 1 ? dragging ? "grabbing" : "grab" : "default"
			},
			onClick: (e) => e.stopPropagation(),
			onDoubleClick: (e) => {
				e.stopPropagation();
				toggleZoom();
			},
			onPointerDown,
			onPointerMove,
			onPointerUp,
			onPointerLeave: onPointerUp,
			draggable: false
		})]
	});
}
//#endregion
export { Lightbox as t };
