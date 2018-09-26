const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const webpack = require('webpack');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const DynamicImport = require('babel-plugin-syntax-dynamic-import');

module.exports = env => { // module.exports is function now to pass in env variable from cli defined in package.json
        return {
            entry: {
                'js/index': './src/index.js',
            },
            module: {
                rules: [{
                        test: /\.js$/,
                        exclude: [/node_modules/, /\.min\./],
                        use: [{
                                loader: 'babel-loader',
                                options: {
                                    plugins: [DynamicImport]
                                }
                            },
                            {
                                loader: 'eslint-loader'
                            }
                        ]
                    },
                    {
                        test: /exclude\.scss/, // these styles should not be renamed bc the html would no longer match
                        use: [{ 
                                loader: MiniCssExtractPlugin.loader,
                            },
                            {
                                loader: 'css-loader',
                                options: {
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
                            }, {
                                loader: 'sass-loader',
                                options: {
                                    sourceMap: true
                                }
                            }
                            ]
                        },
                        {
                            test: /\.csv$/,
                            loader: 'file-loader',
                            options: {
                                name: 'data/[name].[ext]', // no hashing bc content editors might upload csv without going through build process
                            }
                        },
                        /* {
                              // images under limit converted to data url. above the limit falls back to file-loader to emit file
                              // as specified in options (options are passed to file-loader)
                              test: /\.(png|jp(e?)g|gif)$/,
                              loader: 'url-loader',
                              options: {
                                  limit: 10,
                                  name: '[name].[ext]',
                                  outputPath: 'images/',
                              }
                          },*/ // not in use but might be later
                        {
                            test: /\.svg$/,
                            use: [{
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
                            use: ['html-loader', {
                                loader: 'markdown-loader',
                                options: {
                                    smartypants: true
                                }
                            }]
                        }

                    ]
                },
                plugins: [
                    new CleanWebpackPlugin(['dist']),
                    
                    new MiniCssExtractPlugin({
                        // Options similar to the same options in webpackOptions.output
                        // both options are optional
                        filename: "css/styles.css",
                        chunkFilename: "[id].css",
                    })
                ],
                resolve: {
                    alias: {
                        "@App": path.join(__dirname, '../../PCTApp/'), 
                        "@UI": path.join(__dirname, '../../UI/'),
                        "@Project": path.join(__dirname, 'src'),
                        "@Helpers": path.join(__dirname, '../../helpers/'),
                    }
                }
            }
        };