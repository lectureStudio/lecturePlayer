const path = require('path');
const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {
	entry: {
		'main': './src/index.ts',
		'pdf.worker': 'pdfjs-dist/build/pdf.worker.entry',
	},
	devServer: {
		contentBase: './dist'
	},
	plugins: [
		new CleanWebpackPlugin(['dist']),

		// janus.js does not use 'import' to access to the functionality of webrtc-adapter,
		// instead it expects a global object called 'adapter' for that.
		// Let's make that object available.
		new webpack.ProvidePlugin({ adapter: ['webrtc-adapter', 'default'] })
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
				test: /\.(woff|woff2|eot|ttf|otf)$/i,
				type: 'asset/inline',
			},
			// Process the global stylesheet
			{
				test: /\.(s?)css$/,
				use: [
					'style-loader',
					'css-loader',
					'postcss-loader'
				],
				exclude: [
					/node_modules/,
					path.resolve(__dirname, "src/view"),
					path.resolve(__dirname, "src/component")
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
			}
		]
	}
};