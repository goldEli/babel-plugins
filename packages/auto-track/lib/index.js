"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var path = require("path");
var parser = require("@babel/parser");
var core_1 = require("@babel/core");
var auto_track_plugin_1 = require("./plugin/auto-track-plugin");
var sourceCode = fs.readFileSync(path.join(__dirname, "./static/sourceCode.js"), {
    encoding: "utf-8"
});
var ast = parser.parse(sourceCode, {
    sourceType: "unambiguous"
});
var code = (0, core_1.transformFromAstSync)(ast, sourceCode, {
    plugins: [[auto_track_plugin_1.default, {
                trackerPath: 'tracker'
            }]]
}).code;
console.log(code);
//# sourceMappingURL=index.js.map