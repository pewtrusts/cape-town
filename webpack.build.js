const webpack = require('webpack');
const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const PrerenderSPAPlugin = require('prerender-spa-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

module.exports = env => {
    return merge(common(), {
        devtool: 'source-map',
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
        optimization: {
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
        },
        plugins: [
            new HtmlWebpackPlugin({
                title: 'title title title',
                inject: false,
                template: './src/index.html'
            }),
            new PrerenderSPAPlugin({
                // Required - The path to the webpack-outputted app to prerender.
                staticDir: path.join(__dirname, 'dist'),
                // Required - Routes to render.
                routes: ['/'],
            }),
            new webpack.EnvironmentPlugin({
                'NODE_ENV': env
            })

        ],
        output: {
            filename: '[name].js',
            path: path.resolve(__dirname, 'dist'),
            //publicPath: '/~/media/data-visualizations/interactives/2018/test/' // <<== set this for each project
        }
    });
};