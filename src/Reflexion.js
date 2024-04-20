import * as Acorn from 'acorn'
import * as AcornWalk from 'acorn-walk'
import * as escodegen from 'escodegen'

export class Reflexion {
  constructor(sources) {
    this.sources = Array.isArray(sources) ? sources : [sources]
  }

  flatten() {
    return this.sources
  }

  definitions() {
    // TODO: Improve this
    // TODO: Move these to subclasses
    const target = this.sources?.[0]
    const identifiers = target?.declarations?.map(eachDeclaration => eachDeclaration.id.name) || []
    const params = target?.init?.params?.map(eachDeclaration => eachDeclaration.name) || []
    return [...identifiers, ...params]
  }

  add() {
    throw new Error('Not implemented yet!')
  }

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

  properties(identifier) {
    return new PropertiesReflexion(this.sources, identifier).factorize()
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

    return this.createDelegate(ast).factorize()
  }

  createDelegate(ast) {
    if (ast.type === 'Program') {
      return new ProgramReflexion(ast)
    }

    if (ast.type === 'IfStatement') {
      return new ConditionalReflexion(ast)
    }

    if (ast.type === 'ArrowFunctionExpression') {
      return new FunctionReflexion(ast)
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

    if (ast.type === 'VariableDeclaration'
      || ast.type === 'VariableDeclarator') {
      return new DeclarationReflexion(ast)
    }

    if (ast.type === 'Literal') {
      return new IdentityReflexion(ast)
    }

    throw new Error(`Ast type "${ast.type}" not handeled yet! for "${escodegen.generate(ast)}"`)
  }
}

class IdentityReflexion extends Reflexion {
  factorizeEach(ast) {
    const result = new Set()
    result.add(ast.raw)
    return result
  }
}

class ProgramReflexion extends Reflexion {
  factorizeEach(ast) {
    const typesToExpand = ['ExportNamedDeclaration', 'ArrowFunctionExpression']
    return new HorizontalReflexion(ast.body, typesToExpand).factorize()
  }
}

// TODO: should it be merged with DeclarationReflexion
class FunctionReflexion extends Reflexion {
  factorizeEach(ast) {
    if (!Array.isArray(ast.body.body)) {
      return [ast.body] // function without brackets.
    }

    return new HorizontalReflexion(ast.body.body, ['IfStatement']).factorize()
  }
}

export class DeclarationReflexion extends Reflexion {
  constructor(sources) {
    super(sources)
  }

  flatten() {
    const sources = this.sources[0]
    const isFunctionDeclaration = sources.type === 'VariableDeclarator' && sources.init.type === 'ArrowFunctionExpression'
    if (isFunctionDeclaration) {
      return [sources, sources.init]
    }

    return super.flatten()
  }

  factorizeEach(expression) {
    if (expression.declarations) {
      return new HorizontalReflexion(expression.declarations).factorize()
    }

    if (expression.init) {
      return new HorizontalReflexion(expression.init).factorize()
    }

    return new HorizontalReflexion(expression).factorize()
  }
}

class ConditionalReflexion extends Reflexion {
  factorizeEach(conditional) {
    const test = conditional.test
    const consequent = conditional.consequent?.body || []
    const alternate = conditional.alternate?.body || []
    return [
      test,
      ...new HorizontalReflexion(consequent, ['IfStatement']).factorize(),
      ...new HorizontalReflexion(alternate, ['IfStatement']).factorize()
    ]
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

class PropertiesReflexion extends Reflexion {
  constructor(sources, identifier) {
    super(sources)
    this.identifier = identifier
  }

  factorizeEach(expression) {
    const result = new Set()
    const targetIdentifier = this.identifier
    AcornWalk.simple(expression, {
      MemberExpression(node) {
        if (node.object.name === targetIdentifier) {
          result.add(node.property.name)
        }
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

export class DependenciesReflexion extends Reflexion {
  constructor(sources, modules) {
    super(sources)
    this.importedModuleExports = sources?.api?.()
    this.otherModules = modules
  }

  odds() {
    return []
  }

  // TODO: keep only one factorize()
  __factorize() {
    return [
      this.sources[0].specifiers,
      this.sources[0].source
    ]
  }

  factorizeEach(ast) {
    return ast.specifiers
  }
}
