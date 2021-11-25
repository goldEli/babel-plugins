import * as fs from "fs"
import * as path from "path"
import * as parser from "@babel/parser"
import {transformFromAstSync} from "@babel/core"
import autoTrackPlugin from "./plugin/auto-track-plugin"

const sourceCode = fs.readFileSync(path.join(__dirname, "./static/sourceCode.js"), {
	encoding: "utf-8"
})

const ast = parser.parse(sourceCode, {
	sourceType: "unambiguous"
})

const {code} = transformFromAstSync(ast, sourceCode, {
	plugins: [[autoTrackPlugin, {
		trackerPath: 'tracker'
	}]]
})

console.log(code)