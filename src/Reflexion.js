import * as Acorn from 'acorn'
import * as AcornWalk from 'acorn-walk'

export class Reflexion {
  constructor(reflexionOrSources) {
    // TODO: Simplify this
    this.sources =
      reflexionOrSources.sources
        ? reflexionOrSources.sources
        : Array.isArray(reflexionOrSources) ? reflexionOrSources : [reflexionOrSources]
  }

  useSources(collector) {
    let result = new Set()
    this.sources
      .filter(eachSource => eachSource.type !== 'EmptyStatement')
      .map(eachSource => collector(eachSource))
      .forEach(ast => ast.forEach(result.add.bind(result)))
    return [...result]
  }

  factorizeEachIdentifier(expression) {
    const result = new Set()
    AcornWalk.simple(expression, {
      ObjectExpression(node) {
        node.properties
          .map(e => e.key.name)
          .forEach(eachPropertyIdentifier => result.add(eachPropertyIdentifier))
      },
      Identifier(node) {
        result.add(node.name)
      },
      ImportSpecifier(node) {
        result.add(node.imported.name)
      },
      FunctionDeclaration(node) {
        result.add(node.id.name)
      },
      VariableDeclarator(node) {
        result.add(node.id.name)
      }
    })
    return result
  }

  identifiers() {
    return this.useSources(eachSource => this.factorizeEachIdentifier(eachSource))
  }


  // TODO: Remove the methods below

  factorizeEach() {
    throw new Error('Reflexion#factorizeEach is not implemented yet!')
  }

  // TODO: Remove this
  odds() {
    return new HorizontalReflexion(this.sources).factorize()
  }
  api() {
    return new ApiReflexion(this.sources).factorize()
  }

  literals() {
    return new LiteralsReflexion(this.sources).factorize()
  }

  factorize() {
    return this.useSources((eachSource) => this.factorizeEach(eachSource))
  }

  static parse(sourceCode, transformer) {
    const ast = Acorn.parse(sourceCode, { ecmaVersion: 2023, sourceType: 'module' })
    return new Reflexion(transformer ? transformer(ast) : ast)
  }
}

class HorizontalReflexion extends Reflexion {
  constructor(source, typesToExpand) {
    super(source)
    this.typesToExpand = typesToExpand
  }

  shouldKeep(ast) {
    if (!this.typesToExpand) {
      return false
    }

    if (ast.type === 'ExpressionStatement') {
      return !this.typesToExpand.includes(ast.expression.type)
    }

    return !this.typesToExpand.includes(ast.type)
  }

  factorizeEach(ast) {
    if (this.shouldKeep(ast)) {
      return [ast]
    }

    if (ast.type === 'ExpressionStatement') {
      return new ExpressionReflexion(ast.expression).factorize()
    }

    if (ast.type === 'ImportDeclaration') {
      return [
        ast.specifiers,
        ast.source
      ]
    }

    return new ExpressionReflexion(ast).factorize()
  }
}

class ExpressionReflexion extends Reflexion {
  factorizeEach(expression) {
    const result = new Set()
    AcornWalk.simple(expression, {
      Identifier(node) {
        result.add(node)
      },
      Literal(node) {
        result.add(node)
      },
      ExportNamedDeclaration(node) {
        result.add(node)
      },
      ImportSpecifier(node) {
        result.add(node.imported.name)
      }
    })
    return result
  }
}

class LiteralsReflexion extends Reflexion {
  factorizeEach(expression) {
    const result = new Set()
    AcornWalk.simple(expression, {
      Literal(node) {
        result.add(node.value)
      }
    })
    return result
  }
}

class ApiReflexion extends Reflexion {
  factorizeEach(expression) {
    const result = new Set()
    AcornWalk.simple(expression, {
      ExportNamedDeclaration(node) {
        new Reflexion(node)
          .identifiers()
          .forEach(name => result.add(name))
      }
    })
    return result
  }
}
