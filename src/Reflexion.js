import * as Acorn from 'acorn'
import * as AcornWalk from 'acorn-walk'

export class Reflexion {
  constructor(reflexionOrSources) {
    // TODO: Simplify this
    this.sources =
      reflexionOrSources.sources
        ? reflexionOrSources.sources
        : Array.isArray(reflexionOrSources) ? reflexionOrSources : [reflexionOrSources]
    // TODO: Should we uncomment this?
    // this.sources = this.sources.filter(eachSource => eachSource.type !== 'EmptyStatement')
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
    const bag = new Bag(this.sources)
    bag.collect(eachSource => this.factorizeEachIdentifier(eachSource))
    return bag.toArray()
  }

  api() {
    const bag = new Bag(this.sources)
    bag.collect(eachSource => this.factorizeEachApi(eachSource))
    return bag.toArray()
  }

  literals() {
    const bag = new Bag(this.sources)
    bag.collect(eachSource => this.factorizeEachLiteral(eachSource))
    return bag.toArray()
  }

  // TODO: Remove this
  odds() {
    const bag = new Bag(this.sources)
    bag.collect(eachSource => this.factorizeEachOdd(eachSource))
    return bag.toArray()
  }

  static parse(sourceCode, transformer) {
    const ast = Acorn.parse(sourceCode, { ecmaVersion: 2023, sourceType: 'module' })
    return new Reflexion(transformer ? transformer(ast) : ast)
  }
}

class Bag {
  constructor(elements) {
    this.sources = elements
    this.elements = new Set()
  }

  collect(collector) {
    this.sources
      .map(eachSource => collector(eachSource))
      .forEach(ast => ast.forEach(this.elements.add.bind(this.elements)))
  }

  toArray() {
    return [...this.elements]
  }
}
