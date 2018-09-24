const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const PrerenderSPAPlugin = require('prerender-spa-plugin');
const webpack = require('webpack');

module.exports = env => {
    return merge(common(), {
        entry: {
            'js/index': './src/index.js'
        },
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
           /* splitChunks: {
              chunks: 'all'
            }*/
        },
        plugins: [
            new HtmlWebpackPlugin({
                title: 'title title tiel',
                inject: false,
                template: './src/index.html'
            }),
            new MiniCssExtractPlugin({
                // Options similar to the same options in webpackOptions.output
                // both options are optional
                filename: "css/[name].css",
                chunkFilename: "[id].css",
            }),
            new CopyWebpackPlugin([{
                from: '-/**/*.*',
                context: 'src'
            }, {
                from: 'assets/**/*.*',
                context: 'src'
            }]),
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
            publicPath: '/~/media/data-visualizations/interactives/2018/test/' // <<== set this for each project
        },
        resolve: {
            alias: {
                "@UI": path.join(__dirname, '../../UI/'),
                "@Project": path.join(__dirname, 'src'),
                "@Helpers": path.join(__dirname, '../../helpers/'),
            }
        }
    });

};