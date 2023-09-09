import { fileURLToPath } from "url";
import { playwrightLauncher } from "@web/test-runner-playwright";
import { esbuildPlugin } from "@web/dev-server-esbuild";
import { fromRollup } from "@web/dev-server-rollup";
import rollupReplace from "@rollup/plugin-replace";
import litCssPlugin from "rollup-plugin-lit-css";

const litcss = fromRollup(litCssPlugin);
const replace = fromRollup(rollupReplace);

const filteredLogs = ["Running in dev mode", "Lit is in dev mode"];

export default {
	files: "test/**/*.test.ts",
	nodeResolve: true,
	mimeTypes: {
		// Serve .css files as js module.
		"**/*.css": "js",
	},
	browsers: [
		playwrightLauncher({ product: "chromium" }),
		// playwrightLauncher({ product: "webkit" }),
		playwrightLauncher({ product: "firefox" }),
	],
	plugins: [
		esbuildPlugin({
			ts: true,
			tsconfig: fileURLToPath(new URL("./tsconfig.json", import.meta.url))
		}),
		replace({
			preventAssignment: true,
			"process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
		}),
		litcss(),
	],

	filterBrowserLogs(log) {
		for (const arg of log.args) {
			if (typeof arg === "string" && filteredLogs.some(l => arg.includes(l))) {
				return false;
			}
		}
		return true;
	},
};