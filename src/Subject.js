class Subject {
  constructor(ast) {
    this.ast = ast
  }

  identifiers() {
    return this.factor().filter(eachElement => eachElement.type === 'Identifier')
  }

  literalsWeight() {
    return this.factor().find(eachElement => eachElement.type === 'Literal') ? 1 : 0
  }

  factor() {
    let elements = []

    if (this.ast.type === 'BinaryExpression') {
      let left = [this.ast.left]
      if (left[0].type === 'BinaryExpression') {
        left = [left[0].left, left[0].right]
      }
      elements = [...left, this.ast.right].filter(e => !!e)
    }
  
    if (this.ast.type === 'Literal') {
      elements = [this.ast]
    }

    return elements
  }
}

export default Subject
