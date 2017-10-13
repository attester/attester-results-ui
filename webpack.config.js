const path = require("path");
const ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {
  entry: ["./app/index.html", "./app/main.js"],
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "app.js"
  },
  module: {
    rules: [
      {
        resource: path.resolve(__dirname, "app/index.html"),
        use: [
          {
            loader: "file-loader",
            options: {
              name: "index.html"
            }
          },
          {
            loader: "extract-loader"
          },
          {
            loader: "html-loader",
            options: {
              minimize: true,
              attrs: []
            }
          }
        ]
      },
      {
        test: /\.html$/,
        exclude: /index\.html$/,
        use: [
          {
            loader: "html-loader",
            options: {
              minimize: true
            }
          }
        ]
      },
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          use: ["css-loader"]
        })
      },
      {
        test: /\.(gif|svg|ttf|woff|woff2|eot)$/,
        use: [
          {
            loader: "file-loader"
          }
        ]
      }
    ]
  },
  plugins: [new ExtractTextPlugin("app.css")]
};
