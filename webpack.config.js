const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCssAssetsWebpackPlugin = require('optimize-css-assets-webpack-plugin');
const TerserWebpackPlugin = require('terser-webpack-plugin');

const isDevMode = process.env.NODE_ENV === 'development';
const isProdMode = !isDevMode;

const fileName = ext => isDevMode ? `[name].${ext}` : `[name].[hash].${ext}`;

const optimization = () => {
    const config = {
        splitChunks: {
            chunks: "all",
        }
    };

    if(isProdMode) {
        config.minimizer = [
            new OptimizeCssAssetsWebpackPlugin(),
            new TerserWebpackPlugin()
        ]
    }

    return config;
};

const cssLoaders = extra => {
    let loaders = [
        {
            loader: MiniCssExtractPlugin.loader,
            options: {
                hmr: isDevMode,
                reloadAll: true,
            },
        },
        'css-loader'
    ];

    if(extra) {
        loaders.push(extra)
    }

    return loaders;
};

const babelLoader = preset => {
    const opts = {
        presets: [
            '@babel/preset-env',
        ],
        plugins: [
            '@babel/plugin-proposal-class-properties'
        ]
    };

    if(preset) {
        opts.presets.push(preset)
    }

    return opts
};


module.exports = {
    context: path.resolve(__dirname, 'src'),
    entry: {
        main: ['@babel/polyfill', './index.js']
    },
    output: {
        filename: fileName('js'),
        path: path.resolve(__dirname, 'dist')
    },
    resolve: {
        alias: {
            '@fonts': path.resolve(__dirname, 'src/fonts'),
            '@img': path.resolve(__dirname, 'src/img')
        }
    },
    mode: "development",
    devServer: {
        port: 4400,
        hot: isDevMode
    },
    optimization: optimization(),
    devtool: isDevMode ? 'source-map' : '',
    plugins: [
        new HtmlWebpackPlugin({
            template: './index.html'
        }),
        new CleanWebpackPlugin(),
        new CopyWebpackPlugin([
            {
                from: path.resolve(__dirname, 'src/assets'),
                to: path.resolve(__dirname, 'dist/assets'),
            }
        ]),
        new MiniCssExtractPlugin({
            filename: fileName('css')
        })
    ],
    module: {
        rules: [
            {
                test: /\.css$/,
                use: cssLoaders()
            },
            {
                test: /\.s[ac]ss$/,
                use: cssLoaders('sass-loader')
            },
            {
                test: /\.(png|jpg|jpeg|svg|webp|ico|gif)$/,
                use: ['file-loader']
            },
            {
                test: /\.(ttf|woff|woff2|eot)$/,
                use: ['file-loader']
            },
            {
                test: /\.xml$/,
                use: ['xml-loader']
            },
            {
                test: /\.csv$/,
                use: ['csv-loader']
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: {
                    loader: 'babel-loader',
                    options: babelLoader()
                }
            },
            {
                test: /\.ts$/,
                exclude: /node_modules/,
                loader: {
                    loader: 'babel-loader',
                    options: babelLoader('@babel/preset-typescript')
                }
            }
        ]
    }
};
