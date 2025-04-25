const { merge } = require('webpack-merge')
const commonConfiguration = require('./webpack.common.js')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')

const path = require('path')

module.exports = merge(
    commonConfiguration,
    {
        mode: 'production',
        plugins:
        [
            new CleanWebpackPlugin(),
            new CopyWebpackPlugin({
                patterns: [
                    { 
                        from: path.resolve(__dirname, '../Loading_Page'),
                        to: 'Loading_Page'
                    }
                ]
            })
        ]
    }
)
