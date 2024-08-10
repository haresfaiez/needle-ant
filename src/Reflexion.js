import * as Acorn from 'acorn'
import * as AcornWalk from 'acorn-walk'

export class Reflexion {
  constructor(acornNodes) {
    this.sources =
      acornNodes.filter(eachSource => eachSource.type !== 'EmptyStatement')
  }

  collectExports(expression, result) {
    AcornWalk.simple(expression, {
      ExportNamedDeclaration(node) {
        Reflexion.fromAcornNodes([node])
          .identifiers()
          .forEach(name => result.add(name))
      }
    })
  }

  collectLiterals(expression, result) {
    AcornWalk.simple(expression, {
      Literal(node) {
        result.add(node.value)
      }
    })
  }

  collectProperties(expression, result) {
    AcornWalk.simple(expression, {
      Property(node) {
        result.add(node.key.name)
      },
    })
  }

  collectIdentifiers(expression, result) {
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
  }

  properties() {
    const bag = new Bag(this.sources)
    bag.collect(this.collectProperties)
    return bag.evaluate()
  }

  identifiers() {
    const bag = new Bag(this.sources)
    bag.collect(this.collectIdentifiers)
    return bag.evaluate()
  }

  api() {
    const bag = new Bag(this.sources)
    bag.collect(this.collectExports)
    return bag.evaluate()
  }

  literals() {
    const bag = new Bag(this.sources)
    bag.collect(this.collectLiterals)
    return bag.evaluate()
  }

  // Factories
  static fromAcornNodes(nodes = []) {
    return new Reflexion(nodes)
  }

  static parse(sourceCode, transformer) {
    const ast = Acorn.parse(sourceCode, { ecmaVersion: 2023, sourceType: 'module' })
    const astForReflexion = transformer ? transformer(ast) : ast
    return Array.isArray(astForReflexion)
      ? Reflexion.fromAcornNodes(astForReflexion)
      : Reflexion.fromAcornNodes([astForReflexion])
  }
}

class Bag {
  constructor(sources) {
    this.sources = sources
    this.elements = new Set()
  }

  collect(collector) {
    for (const eachSource of this.sources) {
      collector(eachSource, this.elements)
    }
  }

  evaluate() {
    return [...this.elements]
  }
}
