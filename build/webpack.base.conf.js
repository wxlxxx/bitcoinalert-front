const path = require('path')
const Webpack = require('webpack')
const merge = require('webpack-merge')
const ip = require('ip')
const glob = require('glob-all')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const developmentConfig = require('./webpack.dev.conf.js')
const productionConfig = require('./webpack.prod.conf.js')
const CopyWebpackPlugin = require('copy-webpack-plugin')


const generateConfig = {
	entry: {
		app: path.resolve(__dirname, '../src/main.js'),
		vendor: ['jquery']
	},
	output: {
		path: path.resolve(__dirname, '../dist'),
		filename: "assets/[name].bundle.js",
		chunkFilename:'assets/[name].chunk.js',
		publicPath: public_Path
	},
	devServer: {
	    contentBase: path.resolve(__dirname, '../src'),
	    inline: true,
	    hot: true,
	    // host: ip.address(),
	    port: 80,
	    allowedHosts: [
	    	'admin.bitcoinalert.io'
	    ]
	}
}
const htmlFiles = glob.sync([
	'src/*.html','src/*/*.html'
])
htmlFiles.forEach(function(file) {
	if(file.search('/common/') == -1){
		const conf = {
	        filename: file.substring(file.indexOf('src/')+('src/').length),
	        template: file,
	        inject: true
	    }
	    developmentConfig.plugins.push(new HtmlWebpackPlugin(conf))
	    productionConfig.plugins.push(new HtmlWebpackPlugin(conf))
	}
})

productionConfig.plugins.push(
	new CopyWebpackPlugin([
		{
			from: path.resolve(__dirname, '../src/static'),
			to: path.resolve(__dirname, '../dist/static')
		}
	])
)


module.exports = env => {
	let config = env === 'production' ? productionConfig : developmentConfig
	return merge(generateConfig, config)
}