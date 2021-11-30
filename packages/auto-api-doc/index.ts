import * as fs from "fs"
import * as path from "path"
import * as parser from "@babel/parser"
import {transformFromAstSync} from "@babel/core"
import autoApiDocPlugin from "./plugins/autoApiDocPlugin"

const sourceCode = fs.readFileSync(path.join(__dirname, "./static/sourceCode.ts"), {
	encoding: "utf-8"
})

const ast = parser.parse(sourceCode, {
	sourceType: "unambiguous",
	plugins: ['typescript']
})

const {code} = transformFromAstSync(ast, sourceCode, {
	plugins: [[autoApiDocPlugin, {
		outputDir: path.resolve(__dirname, './docs'),
		format: 'markdown'// html / json
}]]
})

console.log(code)