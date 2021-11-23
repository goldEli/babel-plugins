const acorn = require("acorn");
const Parser = acorn.Parser;
const TokenType = acorn.TokenType;
const KEY = "Hello"
Parser.acorn.keywordTypes[KEY] = new TokenType(KEY, {keyword: KEY})

module.exports = function keywordPlugin(Parser) {
  return class extends Parser {
    parse(program) {
      let newKeyWords = "break case catch continue debugger default do else finally for function if return switch throw try var while with null true false instanceof typeof void delete new in this const class extends export import super";
      newKeyWords += ` ${KEY}`
      this.keywords = new RegExp("^(?:" + newKeyWords.replace(/ /g, "|") + ")$")
      return super.parse(program)
    }
    parseStatement(context, topLevel, exports) {
      var startType = this.type;
      if (startType == Parser.acorn.keywordTypes[KEY]) {
        var node  = this.startNode()
        return this.parseKeyWordStatement(node)
      } else {
        return super.parseStatement(context, topLevel, exports)
      }
    }
    parseKeyWordStatement(node) {
      this.next()
      return this.finishNode({value: KEY}, `${KEY}Statement`)
    }
  }
}