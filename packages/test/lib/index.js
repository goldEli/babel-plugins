"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var babel = require("@babel/core");
var sourceCode = "\nnew Array(5).fill(\"1111\");\n";
var code = babel.transformSync(sourceCode, {
    filename: 'a.js',
    plugins: [],
    presets: [
        ['@babel/env', {
                useBuiltIns: 'usage',
                targets: {
                    browsers: "Chrome 44",
                },
                corejs: 3
            }]
    ]
}).code;
console.log(code);
//# sourceMappingURL=index.js.map