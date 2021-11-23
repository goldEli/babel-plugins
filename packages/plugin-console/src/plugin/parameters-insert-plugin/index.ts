import { NodePath } from "@babel/traverse";
import { TState } from "../../type";

const targetCalleeName = ["log", "info", "error", "debug"].map(
  (item) => `console.${item}`
);
export default function insertParametersPlugin({ types, template }) {
  const visitor = {
    CallExpression(path: NodePath, state: TState) {
        console.log(state)
      // @ts-ignore
      if (path.node?.isNew) {
        return;
      }
      const calleeName = path.get("callee").toString();
      if (targetCalleeName.includes(calleeName)) {
        const { line, column } = path.node.loc.start;
        const newNode = template.expression(
          `console.log("${
            state.filename || "unkown filename"
          }: (${line}, ${column})")`
        )();
        newNode.isNew = true;

        if (path.findParent((path) => path.isJSXElement())) {
          path.replaceWith(types.arrayExpression([newNode, path.node]));
          path.skip();
        } else {
          path.insertBefore(newNode);
        }
      }
    },
  };
  return {
    visitor,
  };
}
