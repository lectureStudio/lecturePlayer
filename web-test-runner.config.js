import { fileURLToPath } from "url";
import { playwrightLauncher } from "@web/test-runner-playwright";
import { esbuildPlugin } from "@web/dev-server-esbuild";
import { fromRollup } from "@web/dev-server-rollup";
import rollupCommonjs from "@rollup/plugin-commonjs";
import rollupReplace from "@rollup/plugin-replace";
import litCssPlugin from "rollup-plugin-lit-css";
import path from "path";
import fs from "fs";

const commonjs = fromRollup(rollupCommonjs);
const litcss = fromRollup(litCssPlugin);
const replace = fromRollup(rollupReplace);

const filteredLogs = [
	"Running in dev mode",
	"Lit is in dev mode",
	"Setting up fake worker",
	// Expected error handling test logs
	"Participant with user ID not found",
	"Permission denied",
	"Device not readable",
	// Async errors in tests that are expected
	"An error was thrown in a Promise outside a test",
	// Debug logs from player controller
	"* on course state",
	"** update state:",
	"* on user info",
	"* on chat",
	"* on media devices",
	"~ on stream state",
	"~ fetch",
	"new state",
	"******** recording state",
	"User moderation event for user",
	"User banned",
	"EventService closes",
	// Expected modal/Shoelace errors in controller tests
	"this.dialog.show is not a function",
	// Expected fullscreen errors (no user gesture in test)
	"Fullscreen request denied",
	"Cannot request fullscreen without transient activation",
	"Permissions check failed",
	// Expected stream connection errors in tests
	"User id is not set",
	"navigator.mediaDevices.enumerateDevices",
	// STOMP client logs
	"STOMP disconnected",
];

export default {
	files: "src/**/*.test.ts",
	nodeResolve: {
		exportConditions: ["browser", "import", "default"],
	},
	concurrentBrowsers: 3,
	mimeTypes: {
		// Serve .css files as a js module.
		"**/*.css": "js",
	},
	browsers: [
		playwrightLauncher({ product: "chromium" }),
		playwrightLauncher({ product: "webkit" }),
		playwrightLauncher({ product: "firefox" }),
	],
	middleware: [
		// Mock API endpoints for tests
		function mockApiEndpoints(ctx, next) {
			// Mock course state API
			if (ctx.url.includes("/api/v1/course/state/")) {
				ctx.type = "application/json";
				ctx.body = JSON.stringify({
					courseId: 77,
					title: "Test Course",
					description: "Test Description",
					timeStarted: Date.now(),
					conference: false,
					recorded: false,
					userPrivileges: [],
					messageFeature: { enabled: false },
					quizFeature: { enabled: false },
					activeDocument: null,
					documentMap: {},
				});
				return;
			}
			// Mock user API
			if (ctx.url.includes("/api/v1/user")) {
				ctx.type = "application/json";
				ctx.body = JSON.stringify({
					userId: "test-user",
					firstName: "Test",
					familyName: "User",
				});
				return;
			}
			return next();
		},
		// Serve PDF.js worker from node_modules
		function servePdfWorker(ctx, next) {
			if (ctx.url === "/pdf.worker.mjs") {
				const workerPath = path.resolve("node_modules/pdfjs-dist/build/pdf.worker.mjs");
				ctx.type = "application/javascript";
				ctx.body = fs.readFileSync(workerPath, "utf-8");
				return;
			}
			return next();
		},
		// Transform the sdp module to add default export
		function transformSdpModule(ctx, next) {
			if (ctx.url.includes("/node_modules/sdp/sdp.js")) {
				const sdpPath = path.resolve("node_modules/sdp/sdp.js");
				let code = fs.readFileSync(sdpPath, "utf-8");
				// Transform CommonJS to ESM with default export
				code = code.replace(
					"if (typeof module === 'object') {\n  module.exports = SDPUtils;\n}",
					"export default SDPUtils;\nexport { SDPUtils };"
				);
				ctx.type = "application/javascript";
				ctx.body = code;
				return;
			}
			return next();
		},
	],
	plugins: [
		commonjs({
			include: [
				// CommonJS modules that need transformation
				"**/node_modules/sdp/**/*",
				"**/node_modules/webrtc-adapter/**/*",
			],
		}),
		esbuildPlugin({
			ts: true,
			tsconfig: fileURLToPath(new URL("./tsconfig.json", import.meta.url))
		}),
		replace({
			preventAssignment: true,
			"process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
		}),
		litcss({
			include: ["src/component/**/*.css"]
		}),
	],

	filterBrowserLogs(log) {
		for (const arg of log.args) {
			if (typeof arg === "string" && filteredLogs.some(l => arg.includes(l))) {
				return false;
			}
			// Filter out 404 response objects from API tests
			if (typeof arg === "object" && arg !== null && arg.status === 404) {
				return false;
			}
		}
		return true;
	},

	// Suppress 404 network request logs for expected API calls in tests
	filterLogs(log) {
		if (log && log.message && log.message.includes("404")) {
			return false;
		}
		return true;
	},
};