const path = require('path');
const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
	entry: {
		'main': './src/index.ts'
	},
	devServer: {
		contentBase: './dist'
	},
	plugins: [
		new CleanWebpackPlugin(['dist']),

		new MiniCssExtractPlugin(),

		// janus.js does not use 'import' to access to the functionality of webrtc-adapter,
		// instead it expects a global object called 'adapter' for that.
		// Let's make that object available.
		new webpack.ProvidePlugin({ adapter: ['webrtc-adapter', 'default'] }),
	],
	output: {
		path: path.resolve(__dirname, '../resources/web-player-js'),
		filename: '[name].js',
		library: "lect",
		libraryTarget: 'umd',
	},
	resolve: {
		extensions: ['.ts', '.js']
	},
	module: {
		rules: [
			// janus.js does not use 'export' to provide its functionality to others, instead
			// it creates a global variable called 'Janus' and expects consumers to use it.
			// Let's use 'exports-loader' to simulate it uses 'export'.
			{
				test: require.resolve('janus-gateway'),
				loader: 'exports-loader',
				options: {
					exports: 'Janus',
				},
			},
			{
				test: /\.css$/,
				loader: 'lit-css-loader',
				options: {
					specifier: 'lit' // defaults to `lit`
				}
			},
			// Bundle styles into main.css
			{
				test: /\.css$/i,
				use: [MiniCssExtractPlugin.loader, 'css-loader']
			},
			{
				test: /\.scss$/,
				exclude: /node_modules/,
				use: [
					{
						loader: "lit-css-loader"
					},
					{
						loader: "sass-loader",
						options: {
							sassOptions: {
								outputStyle: "compressed"
							},
						},
					}
				],
			},
			{
				test: /\.worker\.ts$/,
				use: {
					loader: 'worker-loader',
					options: { inline: true }
				},
			},
			{
				test: /\.(ts|js)x?$/,
				exclude: /node_modules/,
				use: [
					'babel-loader',
				]
			},
			{
				test: /locales/,
				loader: '@alienfast/i18next-loader',
				options: {
					basenameAsNamespace: true
				}
			}
		]
	}
};