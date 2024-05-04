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

  factorizeEachApi(expression) {
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

  factorizeEachLiteral(expression) {
    const result = new Set()
    AcornWalk.simple(expression, {
      Literal(node) {
        result.add(node.value)
      }
    })
    return result
  }

  factorizeEachOdd(expression) {
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

  identifiers() {
    return this.useSources(eachSource => this.factorizeEachIdentifier(eachSource))
  }

  api() {
    return this.useSources((eachSource) => this.factorizeEachApi(eachSource))
  }

  literals() {
    return this.useSources((eachSource) => this.factorizeEachLiteral(eachSource))
  }

  // TODO: Remove this
  odds() {
    return this.useSources((eachSource) => this.factorizeEachOdd(eachSource))
  }

  static parse(sourceCode, transformer) {
    const ast = Acorn.parse(sourceCode, { ecmaVersion: 2023, sourceType: 'module' })
    return new Reflexion(transformer ? transformer(ast) : ast)
  }
}
