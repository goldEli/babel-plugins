import * as fs from "fs"
import * as path from "path"
import * as parser from "@babel/parser"
import {transformFromAstSync} from "@babel/core"
import i18nPlugin from "./plugins/i18n-plugin"

const sourceCode = fs.readFileSync(path.join(__dirname, "./static/sourceCode.js"), {
	encoding: "utf-8"
})

const ast = parser.parse(sourceCode, {
	sourceType: "unambiguous",
	plugins: ['jsx']
})

const {code} = transformFromAstSync(ast, sourceCode, {
	plugins: [[i18nPlugin, {
		outputDir: path.resolve(__dirname, './output')
	}]]
})

console.log(code)