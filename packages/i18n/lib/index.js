"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var path = require("path");
var parser = require("@babel/parser");
var core_1 = require("@babel/core");
var i18n_plugin_1 = require("./plugins/i18n-plugin");
var sourceCode = fs.readFileSync(path.join(__dirname, "./static/sourceCode.js"), {
    encoding: "utf-8"
});
var ast = parser.parse(sourceCode, {
    sourceType: "unambiguous",
    plugins: ['jsx']
});
var code = (0, core_1.transformFromAstSync)(ast, sourceCode, {
    plugins: [[i18n_plugin_1.default, {
                outputDir: path.resolve(__dirname, './output')
            }]]
}).code;
console.log(code);
//# sourceMappingURL=index.js.map