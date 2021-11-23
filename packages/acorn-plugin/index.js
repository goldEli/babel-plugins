const {Parser} = require("acorn")

const MyParser = Parser.extend(
  require("./keywordPlugin"),
)



console.log(MyParser.parse(`
Hello;
const a = 1;
`))