import * as Acorn from 'acorn'
import * as AcornWalk from 'acorn-walk'

import { CodeSlice } from './CodeSlice.js'

export class Reflexion {
  constructor(acornNodes) {
    this.sources =
      acornNodes.filter(eachSource => eachSource.type !== 'EmptyStatement')
  }

  collectExports(expression, bag) {
    AcornWalk.simple(expression, {
      ExportNamedDeclaration(node) {
        Reflexion.fromAcornNodes([node])
          .identifiers()
          // TODO: Add start/end to CodeSlice constructor
          .forEach(name => bag.put(new CodeSlice(name)))
      }
    })
  }

  collectLiterals(expression, bag) {
    AcornWalk.simple(expression, {
      Literal(node) {
        bag.put(new CodeSlice(node.value, node.start, node.end))
      }
    })
  }

  collectProperties(expression, bag) {
    AcornWalk.simple(expression, {
      Property(node) {
        bag.put(new CodeSlice(node.key.name, node.start, node.end))
      },
    })
  }

  collectIdentifiers(expression, bag) {
    // TODO: find out why the following commented node names are so
    AcornWalk.simple(expression, {
      // ObjectExpression(node) {
      //   console.log('ObjectExpr/', node)
      //   node.properties
      //     .map(e => e.key.name)
      //      // TODO: this new CodeSlice(... start end)
      //     .forEach(eachPropertyIdentifier => bag.put(new CodeSlice(eachPropertyIdentifier)))
      // },
      Identifier(node) {
        bag.put(new CodeSlice(node.name, node.start, node.end))
      },
      ImportDefaultSpecifier(node) {
        bag.put(new CodeSlice(node.local.name, node.start, node.end))
      },
      ImportNamespaceSpecifier(node) {
        bag.put(new CodeSlice(node.local.name, node.start, node.end))
      },
      ImportSpecifier(node) {
        bag.put(new CodeSlice(node.imported.name, node.start, node.end))
      },
      FunctionDeclaration(node) {
        bag.put(new CodeSlice(node.id.name, node.start, node.end))
      },
      // VariableDeclarator(node) {
      //   bag.put(new CodeSlice(node.id.name, node.start, node.end))
      // },
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

  put(codeSlice) {
    this.elements.add(codeSlice)
  }

  collect(collector) {
    for (const eachSource of this.sources) {
      collector(eachSource, this)
    }
  }

  evaluate() {
    return [...this.elements].map(eachCodeSlice => eachCodeSlice.raw)
  }
}
