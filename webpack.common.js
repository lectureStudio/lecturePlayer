import path from "path";
import { fileURLToPath } from "url";
import webpack from "webpack";
import CopyPlugin from "copy-webpack-plugin";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default {
	entry: {
		"main": "./src/index.ts"
	},
	devServer: {
		contentBase: "./dist"
	},
	plugins: [
		new CopyPlugin({
			patterns: [
				// Copy icons to dist/icons
				{
					from: path.resolve(__dirname, "src/icons"),
					// to: path.resolve(__dirname, "./dist/icons")
					to: "D:\\WORK\\web-backend\\src\\main\\resources\\static\\icons"
				}
			]
		}),

		// janus.js does not use 'import' to access to the functionality of webrtc-adapter,
		// instead it expects a global object called 'adapter' for that.
		// Let's make that object available.
		new webpack.ProvidePlugin({ adapter: ["webrtc-adapter", "default"] }),
	],
	output: {
		filename: "js/[name].js",
		// path: path.resolve(__dirname, 'dist'),
		// clean: true,
		path: "D:\\WORK\\web-backend\\src\\main\\resources\\static",
		clean: false,
		library: {
			name: "lecturePlayer",
			type: "umd",
		},
		iife: true
	},
	resolve: {
		extensions: [".ts", ".js"]
	},
	module: {
		rules: [
			// janus.js does not use 'export' to provide its functionality to others, instead
			// it creates a global variable called 'Janus' and expects consumers to use it.
			// Let's use 'exports-loader' to simulate it uses 'export'.
			{
				test: /^node_modules\/janus-gateway\/./,
				loader: "exports-loader",
				options: {
					exports: "Janus",
				},
			},
			{
				test: /\.css$/,
				loader: "lit-css-loader",
				options: {
					specifier: "lit" // defaults to `lit`
				}
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