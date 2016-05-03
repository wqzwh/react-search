
module.exports={
	entry:{
		wqtest:'./js/SearchPanel.jsx',
	},
	output:{
		path: '../cable/WebRoot/js/',
		filename: '[name].js',
	},
	module: {
		loaders: [
			{
				test: /\.jsx$/,
				loader: 'jsx-loader',
			}
		]
	}
}