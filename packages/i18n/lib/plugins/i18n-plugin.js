"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var helper_plugin_utils_1 = require("@babel/helper-plugin-utils");
var generator_1 = require("@babel/generator");
// import { TState } from "../type";
var fse = require("fs-extra");
var path = require("path");
var i18nPlugin = (0, helper_plugin_utils_1.declare)(function (api, options, dirname) {
    api.assertVersion(7);
    if (!options.outputDir) {
        throw new Error("outputDir is empty");
    }
    function getReplaceExpression(path, value, intlUid) {
        var expressionParams = path.isTemplateLiteral()
            ? path.node.expressions.map(function (item) { return (0, generator_1.default)(item).code; })
            : null;
        // @ts-ignore
        var replaceExpression = api.template.ast(intlUid + ".t('" + value + "'" + (expressionParams ? "," + expressionParams.join(",") : "") + ")").expression;
        if (path.findParent(function (p) { return p.isJSXAttribute(); }) &&
            !path.findParent(function (p) { return p.isJSXExpressionContainer(); })) {
            // @ts-ignore
            replaceExpression = api.types.JSXExpressionContainer(replaceExpression);
        }
        return replaceExpression;
    }
    return {
        pre: function (file) {
            file.set("allText", []);
        },
        visitor: {
            Program: {
                enter: function (path, state) {
                    var imported = false;
                    path.traverse({
                        ImportDeclaration: function (p) {
                            var source = p.node.source.value;
                            if (source === "intl") {
                                imported = true;
                            }
                        },
                    });
                    if (!imported) {
                        var uid = path.scope.generateUid("intl");
                        var importAst = api.template.ast("import " + uid + " from \"intl\"");
                        // @ts-ignore
                        path.node.body.unshift(importAst);
                        state.intlUid = uid;
                    }
                    path.traverse({
                        //@ts-ignore
                        "StringLiteral|TemplateLiteral": function (curPath) {
                            // @ts-ignore
                            if (curPath.node.leadingComments) {
                                curPath.node.leadingComments =
                                    curPath.node.leadingComments.filter(function (comment, index) {
                                        if (comment.value.includes("i18n-disable")) {
                                            // @ts-ignore
                                            path.node.skipTransform = true;
                                            return false;
                                        }
                                        return true;
                                    });
                            }
                            if (curPath.findParent(function (p) { return p.isImportDeclaration(); })) {
                                // @ts-ignore
                                curPath.node.skipTransform = true;
                            }
                        },
                    });
                },
            },
            StringLiteral: function (path, state) {
                if (path.node.skipTransform) {
                    return;
                }
                var key = nextIntlKey();
                save(state.file, key, path.node.value);
                var replaceExpression = getReplaceExpression(path, key, state.intlUid);
                path.replaceWith(replaceExpression);
                path.skip();
            },
            TemplateLiteral: function (path, state) {
                if (path.node.skipTransform) {
                    return;
                }
                var value = path
                    .get("quasis")
                    .map(function (item) { return item.node.value.raw; })
                    .join("{placeholder}");
                if (value) {
                    var key = nextIntlKey();
                    save(state.file, key, value);
                    var replaceExpression = getReplaceExpression(path, key, state.intlUid);
                    path.replaceWith(replaceExpression);
                    path.skip();
                }
            },
        },
        post: function (file) {
            var allText = file.get("allText");
            var initData = allText.reduce(function (obj, item) {
                obj[item.key] = item.value;
                return obj;
            }, {});
            var content = "const resource = " + JSON.stringify(initData, null, 4) + "; \n export default resource";
            fse.ensureDirSync(options.outputDir);
            fse.writeFileSync(path.join(options.outputDir, "zh_CN.js"), content);
            fse.writeFileSync(path.join(options.outputDir, "en_US.js"), content);
        },
    };
});
var nextIntlKey = (function () {
    var key = 0;
    return function () {
        return "intl" + key++;
    };
})();
function save(file, key, value) {
    var allText = file.get("allText");
    allText.push({
        key: key,
        value: value,
    });
    file.set("allText", allText);
}
exports.default = i18nPlugin;
//# sourceMappingURL=i18n-plugin.js.map