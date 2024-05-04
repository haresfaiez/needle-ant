import * as Acorn from 'acorn'
import * as AcornWalk from 'acorn-walk'
import * as escodegen from 'escodegen'

export class Reflexion {
  constructor(reflexionOrSources) {
    // TODO: Simplify this
    this.sources =
      reflexionOrSources.sources
        ? reflexionOrSources.sources
        : Array.isArray(reflexionOrSources) ? reflexionOrSources : [reflexionOrSources]
  }

  factorizeEach() {
    throw new Error('Reflexion#factorizeEach is not implemented yet!')
  }

  // TODO: Remove this
  odds() {
    return new HorizontalReflexion(this.sources).factorize()
  }

  identifiers() {
    return new IdentifiersReflexion(this.sources).factorize()
  }

  api() {
    return new ApiReflexion(this.sources).factorize()
  }

  literals() {
    return new LiteralsReflexion(this.sources).factorize()
  }

  factorize() {
    let result = new Set()
    this.sources
      .filter(source => source.type !== 'EmptyStatement')
      .map(source => this.factorizeEach(source))
      .forEach(ast => ast.forEach(result.add.bind(result)))
    return [...result]
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
      return this.createDelegate(ast.expression).factorize()
    }

    if (ast.type === 'ImportDeclaration') {
      return [
        ast.specifiers,
        ast.source
      ]
    }

    return this.createDelegate(ast).factorize()
  }

  createDelegate(ast) {
    if (ast.type === 'Program') {
      const typesToExpand = ['ExportNamedDeclaration', 'ArrowFunctionExpression']
      return new HorizontalReflexion(ast.body, typesToExpand)
    }

    if (ast.type === 'ReturnStatement'
      || ast.type === 'BinaryExpression'
      || ast.type === 'ExpressionStatement'
      || ast.type === 'ImportSpecifier'
      || ast.type === 'CallExpression'
      || ast.type === 'Identifier') {
      return new ExpressionReflexion(ast)
    }

    if (ast.type === 'ImportDeclaration') {
      return new DependenciesReflexion(ast)
    }

    if (ast.type === 'ExportNamedDeclaration') {
      return new ExpressionReflexion(ast)
    }

    throw new Error(`Ast type "${ast.type}" not handeled yet! for "${escodegen.generate(ast)}"`)
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

class IdentifiersReflexion extends Reflexion {
  factorizeEach(expression) {
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
        new IdentifiersReflexion(node)
          .factorize()
          .forEach(name => result.add(name))
      }
    })
    return result
  }
}

class DependenciesReflexion extends Reflexion {
  // TODO: Adapt this to Reflexion
  constructor(sources, modules) {
    super(sources)
    this.importedModuleExports = sources.api?.()
    this.otherModules = modules
  }

  factorizeEach(ast) {
    return ast.specifiers
  }
}
