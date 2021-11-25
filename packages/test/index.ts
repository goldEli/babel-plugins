import * as babel from "@babel/core"
const sourceCode = `
new Array(5).fill("1111");
`

const {code} = babel.transformSync(sourceCode, {
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
})

console.log(code)