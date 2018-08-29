const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const webpack = require('webpack');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyWebpackPlugin = require('copy-webpack-plugin');

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
        'js/index': './src/index.js'
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
                //exclude: /main\.scss/,
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
            /*{
                test: /main\.scss/, // the html refering to classes in main.scss is hard-coded in the index.ejs template
                                    // and therefore these styles should not be renamed bc the html would no longer match
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
            },*/
            /*{
                  test: /\.js$/,
                  exclude: [/node_modules/, /src\/index\.js/],
                  use: ['eslint-loader'] // lints the es6 
            },*/
            {
                  test: /\.js$/,
                  exclude: /node_modules/,
                  use: ['babel-loader','eslint-loader'] // lints the es6 and then transpiles
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
                    limit: 10 * 1024,
                    name: '[name].[ext]',
                    outputPath: 'images/',
                }
            },
            {
                // SVGs under limit converted to data url. svg-url-loader converts to utf-8 instead of hex, shorter for human-readable code.
                // above the limit falls back to file-loader to emit file as specified in options (options are passed to file-loader)
                test: /\.svg$/,
                loader: 'svg-url-loader',
                options: {
                    limit: 10 * 1024,
                    name: '[name].[ext]',
                    outputPath: 'images/',
                }
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