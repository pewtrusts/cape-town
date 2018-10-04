const webpack = require('webpack');
const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const PrerenderSPAPlugin = require('prerender-spa-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = env => {
    return merge(common(), {
        devtool: 'inline-source-map', // may be too slow an option; set to another if so
        mode: 'production',
        module: {
            rules: [{
                    test: /\.scss$/,
                    exclude: /exclude/,
                    use: [{
                        loader: MiniCssExtractPlugin.loader,
                    },
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
                    {
                        loader: 'postcss-loader',
                        options: {
                            sourceMap: true
                        }
                    },
                    {
                        loader: 'sass-loader',
                        options: {
                            sourceMap: true
                        }
                    },
                ]
            }]
        },
        plugins: [
            new HtmlWebpackPlugin({
                title: 'title title title',
                template: './src/interactive-100.html',
            }),
            new CopyWebpackPlugin([{
                from: '-/**/*.*',
                context: 'src'
            }, {
                from: 'assets/**/*.*',
                exclude: 'assets/Pew/css/',
                context: 'src',
                ignore: ['assets/countries/*.*']
            }, {
                from: 'assets/Pew/css/*.*',
                context: 'src',
                transform(content, path) {
                    return content.toString().replace(/url\("\/([^/])/g, 'url("/preview/' + __dirname.match(/[^/]+$/)[0] + '/$1');
                }
            }]),
            new PrerenderSPAPlugin({
                // Required - The path to the webpack-outputted app to prerender.
                staticDir: path.join(__dirname, '../../preview/' + __dirname.match(/[^/]+$/)[0]),
                // Required - Routes to render.
                routes: ['/'],
            }),
            new webpack.EnvironmentPlugin({
                'NODE_ENV': env
            })
        ],
        output: {
            filename: '[name].js',
            path: path.join(__dirname, '../../preview/' + __dirname.match(/[^/]+$/)[0]),
        }
      });
  };
   