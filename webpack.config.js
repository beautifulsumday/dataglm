const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin'); 

const staticPath = "/static/";

module.exports = {
    entry: './frontend/src/index.js',
    mode: 'development',

    

    output: {
        path: path.join(__dirname, 'dist'), 
        filename: 'bundle.js',
        publicPath: staticPath
    },

    module: {
        rules: [
            {
                test: /\.css$/, // 正则表达式，表示所有以.css结尾的文件
                use: [ // 顺序不能变，webpack默认是从后往前加载，也就是先css-loader,在style-loader
                    'style-loader', // 将css commonjs对象，注入到html的<style>标签中
                    'css-loader'    // 用于加载.css文件，并且转换成commonjs对象
                ],

                exclude: /node_modules/ // 排除node_modules目录
            },
            {
                test: /.js$/, // 正则表达式，表示所有以.js结尾的文件
                use: {
                    loader: 'babel-loader',
                    options: {
                        // @babel/preset-env 是Babel 的一个预设模块，用于根据当前的运行环境自动确定需要转换的 JavaScript 语法和特性
                        presets: ['@babel/preset-env'] // 将ES6转换成ES5
                    }
                },
            },
            {
                test: /\.less$/,
                use: [
                    'style-loader',
                    'css-loader',
                    'less-loader',
                ],
                exclude: /node_modules/
            },
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-react'],
                    },
                },
            }
        ]
    },

    plugins: [
        new HtmlWebpackPlugin({ // 用于自动生成html文件
            title: 'Chat App',
            meta: {
                viewport: 'width=device-width'
            },
            template: './frontend/public/index.html',
            staticPath,
        })
    ],

    resolve: {
        extensions: [".js", ".jsx", ".ts", ".tsx", ".mjs"],
        alias: {
            '@': path.resolve(__dirname, 'frontend/src'),
        },
        fallback: {
            "react/jsx-runtime": require.resolve("react/jsx-runtime.js"),
            "react/jsx-dev-runtime": require.resolve("react/jsx-dev-runtime.js"),
        }
    },

    // 开了代理之后http流式传输失效了，所以暂时不用，后面再研究
    // devServer: {   
    //     proxy: [
    //       {
    //         context: ["/api/**"],
    //         target: "http://127.0.0.1:60006/",
    //         changeOrigin: true,
    //         stream: true
    //       }
    //     ],
    // }
}