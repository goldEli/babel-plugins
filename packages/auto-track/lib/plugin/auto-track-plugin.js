"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var importModule = require("@babel/helper-module-imports");
var helper_plugin_utils_1 = require("@babel/helper-plugin-utils");
var autoTrackPlugin = (0, helper_plugin_utils_1.declare)(function (api, options, dirname) {
    return {
        visitor: {
            Program: {
                enter: function (path, state) {
                    path.traverse({
                        ImportDeclaration: function (curPath) {
                            var requirePath = curPath.get('source').node.value;
                            if (requirePath === options.trackerPath) {
                                var specifierPath = curPath.get("specifiers.0");
                                if (specifierPath.isImportSpecifier()) {
                                    state.trackerImportId = specifierPath.toString();
                                }
                                else if (specifierPath.isImportNamespaceSpecifier()) {
                                    state.trackerImportId = specifierPath.get('local').toString();
                                }
                                // @ts-ignore
                                path.stop();
                            }
                        }
                    });
                    if (!(state === null || state === void 0 ? void 0 : state.trackerImportId)) {
                        state.trackerImportId = importModule.addDefault(path, 'tracker', {
                            nameHint: path.scope.generateUid('tracker')
                        }).name;
                        state.trackerAST = api.template.statement(state.trackerImportId + "()")();
                    }
                }
            },
            'ClassMethod|ArrowFunctionExpression|FunctionExpression|FunctionDeclaration': function (path, state) {
                var _a;
                var bodyPath = path.get('body');
                if ((_a = bodyPath === null || bodyPath === void 0 ? void 0 : bodyPath.isBlockStatement) === null || _a === void 0 ? void 0 : _a.call(bodyPath)) {
                    bodyPath.node.body.unshift(state.trackerAST);
                }
                else {
                    var ast = api.template.statement("{" + state.trackerImportId + "(); return PREV_BODY;}")({ PREV_BODY: bodyPath.node });
                    bodyPath.replaceWith(ast);
                }
            }
        }
    };
});
exports.default = autoTrackPlugin;
//# sourceMappingURL=auto-track-plugin.js.map