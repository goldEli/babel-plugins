import * as importModule from "@babel/helper-module-imports";
import { declare } from "@babel/helper-plugin-utils";
import { NodePath } from "@babel/traverse";
import generate from "@babel/generator";
// import { TState } from "../type";
import * as fse from "fs-extra";
import * as path from "path";

const i18nPlugin = declare((api, options, dirname) => {
  api.assertVersion(7);
  if (!options.outputDir) {
    throw new Error("outputDir is empty");
  }
  function getReplaceExpression(path, value, intlUid) {
    const expressionParams = path.isTemplateLiteral()
      ? path.node.expressions.map((item) => generate(item).code)
      : null;
    // @ts-ignore
    let replaceExpression = api.template.ast(
      `${intlUid}.t('${value}'${
        expressionParams ? "," + expressionParams.join(",") : ""
      })`
    ).expression;
    if (
      path.findParent((p) => p.isJSXAttribute()) &&
      !path.findParent((p) => p.isJSXExpressionContainer())
    ) {
      // @ts-ignore
      replaceExpression = api.types.JSXExpressionContainer(replaceExpression);
    }
    return replaceExpression;
  }

  return {
    pre(file) {
      file.set("allText", []);
    },
    visitor: {
      Program: {
        enter(path: NodePath, state) {
          let imported: boolean = false;

          path.traverse({
            ImportDeclaration(p) {
              const source = p.node.source.value;
              if (source === "intl") {
                imported = true;
              }
            },
          });
          if (!imported) {
            const uid = path.scope.generateUid("intl");
            const importAst = api.template.ast(`import ${uid} from "intl"`);
            // @ts-ignore
            path.node.body.unshift(importAst);
            state.intlUid = uid;
          }

          path.traverse({
            //@ts-ignore
            "StringLiteral|TemplateLiteral"(curPath: NodePath) {
              // @ts-ignore
              if (curPath.node.leadingComments) {
                curPath.node.leadingComments =
                  curPath.node.leadingComments.filter((comment, index) => {
                    if (comment.value.includes("i18n-disable")) {
                      // @ts-ignore
                      path.node.skipTransform = true;
                      return false;
                    }
                    return true;
                  });
              }
              if (curPath.findParent((p) => p.isImportDeclaration())) {
                // @ts-ignore
                curPath.node.skipTransform = true;
              }
            },
          });
        },
      },
      StringLiteral(path: any, state: any) {
        if (path.node.skipTransform) {
          return;
        }
        let key = nextIntlKey();
        save(state.file, key, path.node.value);

        const replaceExpression = getReplaceExpression(
          path,
          key,
          state.intlUid
        );
        path.replaceWith(replaceExpression);
        path.skip();
      },
      TemplateLiteral(path: any, state: any) {
        if (path.node.skipTransform) {
          return;
        }
        const value = path
          .get("quasis")
          .map((item) => item.node.value.raw)
          .join("{placeholder}");
        if (value) {
          let key = nextIntlKey();
          save(state.file, key, value);

          const replaceExpression = getReplaceExpression(
            path,
            key,
            state.intlUid
          );
          path.replaceWith(replaceExpression);
          path.skip();
        }
      },
    },
    post(file) {
      const allText = file.get("allText");
      const initData = allText.reduce((obj, item) => {
        obj[item.key] = item.value;
        return obj;
      }, {});

      const content = `const resource = ${JSON.stringify(
        initData,
        null,
        4
      )}; \n export default resource`;
      fse.ensureDirSync(options.outputDir);
      fse.writeFileSync(path.join(options.outputDir, "zh_CN.js"), content);
      fse.writeFileSync(path.join(options.outputDir, "en_US.js"), content);
    },
  };
});

const nextIntlKey = (function () {
  let key = 0;
  return function () {
    return `intl${key++}`;
  };
})();

function save(file, key, value) {
  const allText = file.get("allText");
  allText.push({
    key,
    value,
  });
  file.set("allText", allText);
}
export default i18nPlugin;
