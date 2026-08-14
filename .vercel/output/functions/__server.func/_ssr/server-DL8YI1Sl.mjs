import { createStartHandler, defaultStreamHandler } from "./server-BG61NXV5.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/server-DL8YI1Sl.js
var fetch = createStartHandler(defaultStreamHandler);
function createServerEntry(entry) {
	return { async fetch(...args) {
		return await entry.fetch(...args);
	} };
}
var server_default = createServerEntry({ fetch });
//#endregion
export { createServerEntry, server_default as default };
