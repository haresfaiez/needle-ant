import * as Acorn from 'acorn'
import * as AcornWalk from 'acorn-walk'

export class Reflexion {
  constructor(reflexionOrSources) {
    // TODO: Simplify this (next. release)
    this.sources =
      reflexionOrSources.sources
        ? reflexionOrSources.sources
        : Array.isArray(reflexionOrSources) ? reflexionOrSources : [reflexionOrSources]
    this.sources = this.sources.filter(eachSource => eachSource.type !== 'EmptyStatement')
  }

  collectExports(expression) {
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

  collectLiterals(expression) {
    const result = new Set()
    AcornWalk.simple(expression, {
      Literal(node) {
        result.add(node.value)
      }
    })
    return result
  }

  collectProperties(expression) {
    const result = new Set()
    AcornWalk.simple(expression, {
      Property(node) {
        result.add(node.key.name)
      },
    })
    return result
  }

  collectIdentifiers(expression) {
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
      ImportDefaultSpecifier(node) {
        result.add(node.local.name)
      },
      ImportNamespaceSpecifier(node) {
        result.add(node.local.name)
      },
      ImportSpecifier(node) {
        result.add(node.imported.name)
      },
      FunctionDeclaration(node) {
        result.add(node.id.name)
      },
      VariableDeclarator(node) {
        result.add(node.id.name)
      },
    })
    return result
  }

  properties() {
    const bag = new Bag(this.sources)
    bag.collect(eachSource => this.collectProperties(eachSource))
    return bag.toArray()
  }

  identifiers() {
    const bag = new Bag(this.sources)
    bag.collect(eachSource => this.collectIdentifiers(eachSource))
    return bag.toArray()
  }

  api() {
    const bag = new Bag(this.sources)
    bag.collect(eachSource => this.collectExports(eachSource))
    return bag.toArray()
  }

  literals() {
    const bag = new Bag(this.sources)
    bag.collect(eachSource => this.collectLiterals(eachSource))
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
