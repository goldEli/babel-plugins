import * as importModule from "@babel/helper-module-imports"
import { declare } from "@babel/helper-plugin-utils";
import { NodePath } from "@babel/traverse";
import { TState } from "../type";

const autoTrackPlugin =  declare((api, options, dirname) => {
  return {
		visitor: {
			Program: {
				enter(path: NodePath, state: TState) {
					path.traverse({
						ImportDeclaration(curPath) {
							const requirePath = curPath.get('source').node.value;
							if (requirePath === options.trackerPath) {
								const specifierPath = curPath.get("specifiers.0");
								
							}
						}
					})
					if (!state?.trackerImportId) {
						state.trackerImportId = importModule.addDefault(path, 'tracker', {
							nameHint: path.scope.generateUid('tracker')
						}).name;
						state.trackerAST = api.template.statement(`${state.trackerImportId}()`)();
					}
				}
				
			},
			'ClassMethod|ArrowFunctionExpression|FunctionExpression|FunctionDeclaration'(path: any, state: TState) {
				const bodyPath = path.get('body');
				if (bodyPath?.isBlockStatement?.()) {
					bodyPath.node.body.unshift(state.trackerAST)
				} else {
					const ast = api.template.statement(`{${state.trackerImportId}(); return PREV_BODY;}`)({PREV_BODY: bodyPath.node});
					bodyPath.replaceWith(ast)
				}
			}
		}
	};
});
export default autoTrackPlugin