import { merge } from "webpack-merge";
import common from "./webpack.common.js";
import TerserPlugin from "terser-webpack-plugin";

export default merge(common, {
	mode: "production",
	optimization: {
		minimize: true,
		minimizer: [
			new TerserPlugin({
				terserOptions: {
					ecma: 2019,
					module: true,
					warnings: true,
					mangle: {
						properties: {
							regex: /^__/,
						},
					},
				},
			})
		],
		splitChunks: {
			cacheGroups: {
				vendors: false,
				vendor: false
			}
		}
	},
});