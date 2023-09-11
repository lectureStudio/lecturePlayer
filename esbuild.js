import * as esbuild from "esbuild";
import { litCssPlugin } from "esbuild-plugin-lit-css";
import { copy } from "esbuild-plugin-copy";
import CleanCSS from "clean-css";

const args = process.argv.slice(2);
const dev = args.includes("--dev");
const watch = args.includes("--watch");

const cleanCSS = new CleanCSS({
	sourceMap: true,
	returnPromise: true,
});

const outdir = "D:\\WORK\\web-backend\\src\\main\\resources\\static";
const outfile = `${outdir}/js/lecture-player.js`;

const config = {
	entryPoints: ["src/index.ts"],
	outfile: outfile,
	format: "iife",
	target: ["es2017", "chrome73", "edge79", "firefox63", "safari12"],
	bundle: true,
	sourcemap: !!dev,
	minify: !dev,
	legalComments: "linked",
	logLevel: "info",
	plugins: [
		litCssPlugin({
			include: ["src/component/**/*.css"],
			transform: source => cleanCSS.minify(source).then(x => x.styles)
		}),
		copy({
			assets: [
				{
					from: ["src/icons"],
					to: [`${outdir}/icons`],
				},
				{
					from: ["node_modules/pdfjs-dist/build/pdf.worker.min.js"],
					to: [`${outdir}/js/pdf.worker.js`],
				}
			]
		})
	]
};

if (watch) {
	const context = await esbuild.context(config);
	// Enable watch mode.
	await context.watch();

	function handleCleanup() {
		// Close the esbuild context when the process is exiting.
		context?.dispose();

		process.exit();
	}

	// Cleanup on exit.
	process.on("SIGINT", handleCleanup);
	process.on("SIGTERM", handleCleanup);
}
else {
	// Building source files.
	await esbuild.build(config);
}