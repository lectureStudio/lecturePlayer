const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const TerserPlugin = require("terser-webpack-plugin");

module.exports = merge(common, {
	mode: 'production',
	optimization: {
		minimize: true,
		minimizer: [
			new TerserPlugin({
				terserOptions: {
					ecma: 2017,
					module: true,
					warnings: true,
					mangle: {
						properties: {
							regex: /^__/,
						},
					},
				},
			}),
		],
		splitChunks: {
			cacheGroups: {
				vendors: false,
				vendor: false
			}
		}
	},
});