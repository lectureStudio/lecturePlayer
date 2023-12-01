import path from "path";
import { fileURLToPath } from "url";
import CopyPlugin from "copy-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const build_dir = path.resolve(__dirname, "build");

export default {
	entry: {
		"lecture-player": [
			"./src/index.ts",
			"./node_modules/@shoelace-style/shoelace/dist/themes/light.css",
			"./node_modules/@shoelace-style/shoelace/dist/themes/dark.css"
		]
	},
	devServer: {
		contentBase: "./build"
	},
	plugins: [
		new CopyPlugin({
			patterns: [
				// Copy pdf-worker to build.
				{
					from: path.resolve(__dirname, "node_modules/pdfjs-dist/build/pdf.worker.min.mjs"),
					to: path.resolve(__dirname, `${build_dir}/js/pdf.worker.js`)
				},
				// Copy icons to build/icons.
				{
					from: path.resolve(__dirname, "src/icons"),
					to: path.resolve(__dirname, `${build_dir}/icons`)
				}
			]
		}),
		new MiniCssExtractPlugin({
			filename: "css/[name].css",
		})
	],
	output: {
		filename: "js/[name].js",
		path: build_dir,
		clean: false,
		library: {
			name: "lecture-player",
			type: "umd",
		},
		iife: true
	},
	resolve: {
		extensions: [".ts", ".js"]
	},
	module: {
		rules: [
			{
				test: /\.css$/,
				loader: "lit-css-loader"
			},
			// Copy css theme files.
			{
				test: /[\\/]node_modules[\\/].*\.css$/,
				use: [MiniCssExtractPlugin.loader, "css-loader"],
			},
			{
				test: /\.(ts|js)x?$/,
				exclude: /node_modules/,
				use: [
					"babel-loader",
				]
			},
			{
				test: /locales/,
				loader: "@alienfast/i18next-loader",
				options: {
					basenameAsNamespace: true
				}
			}
		]
	}
};