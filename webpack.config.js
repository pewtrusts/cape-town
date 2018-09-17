const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const webpack = require('webpack');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyWebpackPlugin = require('copy-webpack-plugin');
const DynamicImport = require('babel-plugin-syntax-dynamic-import');

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
    devServer: {
        contentBase: './dist',
        hot: true
    },
    mode: 'development',
    module: {
        rules: [
            {
                test: /\.scss$/,
                exclude: /exclude/,
                use: [{
                    loader: 'style-loader'
                },{
                    loader: 'css-loader',
                    options: {
                        modules: true,
                        localIdentName: '[path][local]', // in dev mode hash not necessary to brak caches but incuding path
                                                           // should avoid collisions of classes with same names
                        sourceMap: true
                    }
                },
                ...scssSharedLoaders.slice(1)]
            }, // any scss files to be excluded from renaming the classes
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
            /*{
                  test: /\.js$/,
                  exclude: [/node_modules/, /src\/index\.js/],
                  use: ['eslint-loader'] // lints the es6 
            },*/
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
                test: /\.csv$/, //converts csv files into json, treats as javascript
                loader: 'csv-loader',
                options: {
                    dynamicTyping: true,
                    header: true,
                    skipEmptyLines: true,
                    trimHeaders: true,
                }
            },
           {
                // images under limit converted to data url. above the limit falls back to file-loader to emit file
                // as specified in options (options are passed to file-loader)
                test: /\.(png|jp(e?)g|gif)$/,
                loader: 'url-loader',
                options: {
                    limit: 10,
                    name: '[name].[ext]',
                    outputPath: 'images/',
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
    plugins: [
        new CleanWebpackPlugin(['dist']),
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
                context: 'src'
            },{
                from: 'data/**/*.*',
                context: 'src'
            }

        ]),
        new webpack.HotModuleReplacementPlugin()
    ],
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist')
    },
    resolve: {
        alias: {
            "@UI": path.join(__dirname, '../../UI/'),
            "@Project": path.join(__dirname, 'src'),
            "@Helpers": path.join(__dirname, '../../helpers/'),
        }
    }
};