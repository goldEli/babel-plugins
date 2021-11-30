import { declare } from "@babel/helper-plugin-utils";
// import { TState } from "../type";
import * as fse from "fs-extra";
import * as path from "path";
import * as doctrine from "doctrine";
import * as renderer from "./renderer";

const autoApiDocPlugin = declare((api, options, dirname) => {
  return {
    pre(file) {
      file.set("docs", []);
    },
    visitor: {
      FunctionDeclaration(path, state) {
        const docs = state.file.get("docs");
        docs.push({
          type: "function",
          name: path.get("id").toString(),
          params: path.get("params").map((paramPath) => {
            return {
              name: paramPath.toString(),
              type: resolveType(paramPath.getTypeAnnotation()),
            };
          }),
          return: resolveType(path.get("returnType").getTypeAnnotation()),
          doc:
            path.node.leadingComments &&
            parseComment(path.node.leadingComments[0].value),
        });
        state.file.set("docs", docs);
      },
      ClassDeclaration(path, state) {
        const docs = state.file.get("docs");
        const classInfo = {
          type: "class",
          name: path.get("id").toString(),
          constructorInfo: {},
          methodsInfo: [],
          propertiesInfo: [],
          doc: "",
        };
        if (path.node.leadingComments) {
          classInfo.doc = parseComment(path.node.leadingComments[0].value);
        }
        path.traverse({
          ClassProperty(path) {
            classInfo.propertiesInfo.push({
              name: path.get("key").toString(),
              type: resolveType(path.getTypeAnnotation()),
              doc: [path.node.leadingComments, path.node.trailingComments]
                .filter(Boolean)
                .map((comment) => {
                  return parseComment(comment.value);
                })
                .filter(Boolean),
            });
          },
          ClassMethod(path) {
            if (path.node.kind === "constructor") {
              classInfo.constructorInfo = {
                params: path.get("params").map((paramPath) => {
                  return {
                    name: paramPath.toString(),
                    type: resolveType(paramPath.getTypeAnnotation()),
                    doc: parseComment(path.node.leadingComments[0].value),
                  };
                }),
              };
            } else {
              classInfo.methodsInfo.push({
                name: path.get("key").toString(),
                doc: parseComment(path.node.leadingComments[0].value),
                params: path.get("params").map((paramPath) => {
                  return {
                    name: paramPath.toString(),
                    type: resolveType(paramPath.getTypeAnnotation()),
                  };
                }),
                return: resolveType(path.getTypeAnnotation()),
              });
            }
          },
        });
        docs.push(classInfo);
        state.file.set("docs", docs);
      },
    },
    post(file) {
      const docs = file.get("docs");
      const res = generate(docs, options.format);
      fse.ensureDirSync(options.outputDir);
      fse.writeFileSync(
        path.join(options.outputDir, "docs" + res.ext),
        res.content
      );
    },
  };
});

function resolveType(tsType) {
  const typeAnnotation = tsType.typeAnnotation;
  if (!typeAnnotation) {
    return;
  }
  switch (typeAnnotation.type) {
    case "TSStringKeyword":
      return "string";
    case "TSNumberKeyword":
      return "number";
    case "TSBooleanKeyword":
      return "boolean";
  }
}

function parseComment(commentStr) {
  if (!commentStr) {
    return;
  }
  return doctrine.parse(commentStr, {
    unwrap: true,
  });
}

function generate(docs, format = "json") {
  if (format === "markdown") {
    return {
      ext: ".md",
      content: renderer.markdown(docs),
    };
  } else if (format === "html") {
    return {
      ext: "html",
      content: renderer.html(docs),
    };
  } else {
    return {
      ext: "json",
      content: renderer.json(docs),
    };
  }
}

export default autoApiDocPlugin;
