const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const autoprefixer = require('autoprefixer');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

const mode = process.env.NODE_ENV || 'development';
const prod = mode === 'production';

module.exports = {
	entry: {
		'build/main': ['./src/main.js']
	},
	resolve: {
		alias: {
			svelte: path.dirname(require.resolve('svelte/package.json'))
		},
		extensions: ['.mjs', '.js', '.svelte'],
		mainFields: ['svelte', 'browser', 'module', 'main']
	},
	output: {
		path: path.join(__dirname, '/public'),
		filename: '[name].[fullhash:8].js',
	},
	module: {
		rules: [
			{
				test: /\.svelte$/,
				use: {
					loader: 'svelte-loader',
					options: {
						compilerOptions: {
							dev: !prod
						},
						emitCss: prod,
						hotReload: !prod
					}
				}
			},
      {
        test: /\.(sass|scss|css)$/,
        use: [
          ...(prod ? [MiniCssExtractPlugin.loader] : []),
          ...(!prod ? ['style-loader'] : []),
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: [
                  autoprefixer,
                ],
              },
            },
          },
          'sass-loader',
        ],
      },
			{
				// required to prevent errors from Svelte on Webpack 5+
				test: /node_modules\/svelte\/.*\.mjs$/,
				resolve: {
					fullySpecified: false
				}
			}
		]
	},
	mode,
	plugins: [
    new HtmlWebpackPlugin({
      template: 'src/index.html',
      minify: prod,
    }),
    ...(prod ? [new MiniCssExtractPlugin({ filename: '[name].[contenthash:8].css' })] : [])
	],
  optimization: {
    minimize: prod,
    minimizer: [
      new CssMinimizerPlugin(),
      new TerserPlugin({
        terserOptions: {
          format: {
            comments: false,
          },
        },
        extractComments: false,
      }),
    ],
  },
	devtool: prod ? false : 'source-map',
	devServer: {
		hot: true,
	}
};
