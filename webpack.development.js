const path = require('path');

module.exports = {
    entry: {
        // This  is our entry point,
        // the main JavaScript file
        app: './src/main.ts',
    },
    output: {
        // This is our output file,
        // the one which bundles all libraries
        filename: 'main.js',

        // And this is the path of the output bundle,
        // "dist" folder
        path: path.resolve(__dirname, 'dist'),
    },
    // We are in development mode
    mode: 'development',
    // We need a source map
    devtool: 'inline-source-map',
    // Development server roo is "src" folder
    devServer: {
        static: './src'
    },
    // list of extensions to resolve, in resolve order
    resolve: {
        extensions: [ '.ts', '.tsx', '.js' ]
    },
    // loader to handle TypeScript file type
    module: {
        rules: [{
            test: /\.tsx?$/,
            use: 'ts-loader',
            exclude: /node_modules/
        }]
    }
}