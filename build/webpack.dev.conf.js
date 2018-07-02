const Webpack = require('webpack')
const path = require('path')
const ip = require('ip')

module.exports = {
	module: {
		rules: [
			{
				test: /\.scss$/,
				use: [
					{
						loader: 'style-loader'
					},
					{
						loader: 'css-loader'
					},
					{
						loader: 'sass-loader'
					}
				]
			},
			{
				test: /\.(woff|svg|eot|ttf)\??.*$/,
				use: [
					{
						loader: 'file-loader',
						options: {
							name: 'fonts/[name].[ext]'
						}
					}
				]
			},
			{
				test: /\.(jpg|png|gif)\??.*$/,
				use: [
					{
						loader: 'url-loader',
						options: {
							name: 'images/[name].[ext]'
						}
					}
				]
			},
			{
				test: /\.js$/,
				exclude: /(node_modules)/,
				use: {
					loader: 'babel-loader',
					options: {
						presets: ['env'],
						plugins: ['transform-runtime']
					}
				}
			}
		]
	},
	plugins: [
		new Webpack.optimize.CommonsChunkPlugin({
			async: 'async-common',
			children: true,
			minChunks: 2
		}),
		new Webpack.optimize.CommonsChunkPlugin({
			name: 'vendor',
			minChunks: Infinity
		})
	]
}