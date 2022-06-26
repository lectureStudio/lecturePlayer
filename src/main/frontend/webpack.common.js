const path = require('path');
const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const SpriteLoaderPlugin = require('svg-sprite-loader/plugin');

module.exports = {
	entry: {
		'main': './src/index.ts'
	},
	devServer: {
		contentBase: './dist'
	},
	plugins: [
		new CleanWebpackPlugin(['dist']),

		// janus.js does not use 'import' to access to the functionality of webrtc-adapter,
		// instead it expects a global object called 'adapter' for that.
		// Let's make that object available.
		new webpack.ProvidePlugin({ adapter: ['webrtc-adapter', 'default'] }),

		new SpriteLoaderPlugin()
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
			{
				test: /\.svg$/,
				loader: 'svg-sprite-loader',
				options: {
					extract: true,
					spriteFilename: 'icons.svg',
				}
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
			}
		]
	}
};