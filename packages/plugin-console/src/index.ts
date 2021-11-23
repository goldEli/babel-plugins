import { transformFileSync } from '@babel/core'
import * as path from "path"
import insertParametersPlugin from './plugin/parameters-insert-plugin';
const { code } = transformFileSync(path.join(__dirname, './static/sourceCode.js'), {
    plugins: [insertParametersPlugin],
    parserOpts: {
        sourceType: 'unambiguous',
        plugins: ['jsx']       
    }
});

console.log(code);