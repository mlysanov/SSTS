const path = require('path');

module.exports = {
    entry: './src/MarkupToolWithRender.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'markupToolWithRender.bundle.js',
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env', '@babel/preset-react'],
                    },
                },
            },
        ],
    },
};
