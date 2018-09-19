const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const webpack = require('webpack');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyWebpackPlugin = require('copy-webpack-plugin');
const PrerenderSPAPlugin = require('prerender-spa-plugin');
const DynamicImport = require('babel-plugin-syntax-dynamic-import');

const previewSubfolder = 'cape-town';

const scssSharedLoaders = [{ // defining array of css loaders here to avoid duplication below
		loader: MiniCssExtractPlugin.loader,
	},{
		loader: 'postcss-loader',
		options: {
			sourceMap: true
		}
	},{
		loader: 'sass-loader',
		options: {
			sourceMap: true
		}
}];

module.exports = {
	entry: {
      	'js/index': './src/index.js',
        'js/webAnimation': './src/web-animations.min.js',
        'js/fetchPolyfill': './src/fetch-polyfill.min.js'
    },
    devtool: 'inline-source-map', // may be too slow an option; set to another if so
    mode: 'production',
    module: {
    	rules: [
	       /*	{
	        	test: /\.scss$/,
	        	exclude: /main\.scss/,
	         	use: [scssSharedLoaders[0], 
	         		{
						loader: 'css-loader',
						options: {
							modules: true,
							localIdentName: '[name]_[local]',
							sourceMap: true,
							minimize: true,
							importLoaders: 1		
						}
					},
					...scssSharedLoaders.slice(1)]
	        }, */{
	        	test: /\.scss$/, 
  					exclude: /exclude/,
	         	use: [scssSharedLoaders[0], //MiniCssExtractPlugin
	         		{
						loader: 'css-loader',
						options: {
							modules: true,
							localIdentName: '[local]--[hash:base64:5]', // hash to avoid collisions
							sourceMap: true,
							minimize: true,
							importLoaders: 1		
						}
					},
					...scssSharedLoaders.slice(1)]
	        },
          {
                test: /exclude\.scss/, // these styles should not be renamed bc the html would no longer match
                use: [scssSharedLoaders[0],
                    {
                        loader: 'css-loader',
                        options: {
                            sourceMap: true,
                            minimize: true,
                            importLoaders: 1        
                        }
                    },
                    ...scssSharedLoaders.slice(1)]
            },
           {
                  test: /\.js$/,
                  exclude: [/node_modules/,/\.min\./],
                  use: [
                    {
                        loader: 'babel-loader',
                        options: {
                          plugins: [DynamicImport]
                        }
                    },
                    {
                        loader: 'eslint-loader'
                    }]
            },
            {
                test: /\.csv$/,
                loader: 'csv-loader',
                options: {
                    dynamicTyping: true,
                    header: true,
                    skipEmptyLines: true
                }
            },
            {
                // images under limit converted to data url. above the limit falls back to file-loader to emit file
                // as specified in options (options are passed to file-loader)
                test: /\.(png|jp(e?)g|gif)$/,
                loader: 'url-loader',
                options: {
                    limit: 10 * 1024,
                    name: '[name].[ext]?[hash]', //hash for cache busting
                    outputPath: 'images/',
                    //publicPath: '/shale-v0/dist/images/' USE publicPath if the public URL to '/' is not '/'
                }
            },
            {
                test: /\.svg$/,
                use: [
                    {
                        loader: 'svg-inline-loader',
                        options: {
                            removeSVGTagAttrs: false
                        }
                    },
                    {
                        loader: 'svgo-loader'
                    }
                ]
            },
            {
                test: /\.md$/,
                use: ['html-loader', 'markdown-loader']
            }
     	]
   },
    /*optimization: {
      minimizer: [
        new UglifyJSPlugin({
          uglifyOptions: {
            compress: {
              drop_console: true
            },
            output: {
              comments: false
            }
          },
        }),
      ],
    },*/
    plugins: [
    	new CleanWebpackPlugin([previewSubfolder], { root: path.join(__dirname, '../../preview/')}),
    	new HtmlWebpackPlugin({
    		title: 'title title title',
    		//inject: false,
		    template: './src/interactive-100.html',
        excludeChunks: [ 'js/webAnimation', 'js/fetchPolyfill' ]
		}),
     	new MiniCssExtractPlugin({
	      // Options similar to the same options in webpackOptions.output
	      // both options are optional
	      filename: "css/styles.css",
	      chunkFilename: "[id].css",
	    }),
        new CopyWebpackPlugin([
            {
                from: '-/**/*.*',
                context: 'src'
            },{
                from: 'assets/**/*.*',
                exclude: 'assets/Pew/css/',
                context: 'src'
            },{
                from: 'assets/Pew/css/*.*',
                context: 'src',
                transform(content,path){
                  return content.toString().replace(/url\("\/([^/])/g, 'url("/preview/' + previewSubfolder + '/$1');
                }
            },{
                from: 'data/**/*.*',
                context: 'src'
            }
        ]),
       new PrerenderSPAPlugin({
          // Required - The path to the webpack-outputted app to prerender.
          staticDir: path.join(__dirname, '../../preview/' + previewSubfolder),
          // Required - Routes to render.
          routes: ['/'],
        })
    ],
  	output: {
    	filename: '[name].js',
    	path: path.join(__dirname, '../../preview/' + previewSubfolder),
       // publicPath: '/~/media/data-visualizations/interactives/2018/test/' // <<== set this for each project
  	},
    resolve: {
        alias: {
            "@UI": path.join(__dirname, '../../UI/'),
            "@Project": path.join(__dirname, 'src'),
            "@Helpers": path.join(__dirname, '../../helpers/'),
        }
    }
};