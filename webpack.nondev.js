const webpack = require('webpack');
const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const PrerenderSPAPlugin = require('prerender-spa-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = env => {
    return merge(common(), {
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
            new CleanWebpackPlugin(['dist']),
            
        ]
      });
  };
