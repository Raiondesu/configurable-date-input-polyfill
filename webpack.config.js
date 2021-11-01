const path = require('path');
const ESLintPlugin = require('eslint-webpack-plugin');


module.exports = {
    entry: './configurable-date-input-polyfill.js',
    output: {
        filename: 'configurable-date-input-polyfill.dist.js',
        path: path.resolve(__dirname, ''),
        environment: {
            arrowFunction: false, // The environment supports arrow functions.
            bigIntLiteral: false, // The environment supports BigInt as literal.
            destructuring: false, // The environment supports destructuring.
            dynamicImport: false, // The environment supports an async import() function to import EcmaScript modules.
            module: false, // The environment supports ECMAScript Module syntax to import ECMAScript modules.
            const: false, // The environment supports const and let for variable declarations.
            forOf: false, // The environment supports 'for of' iteration.
        },
    },
    plugins: [new ESLintPlugin({
        extensions: [`js`],
        exclude: [
            `/node_modules/`
        ],
    })],
    module: {
        rules: [
            {
                test: /\.m?js$/,
                exclude: /node_modules/,
                use: [{
                    loader: "babel-loader",
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }]
            },
            {
                test: /\.(s*)css$/,
                exclude: /node_modules/,
                use: ['style-loader', 'css-loader', 'sass-loader']
            }
        ]
    },
};