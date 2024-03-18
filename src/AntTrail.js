import * as Acorn from 'acorn'
import * as AcornWalk from 'acorn-walk'


export class Reflexion {
  constructor(sources, footsteps) {
    this.sources = Array.isArray(sources) ? sources : [sources]
    this.footsteps = footsteps || []
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
      || ast.type === 'ImportSpecifier') {
      return new ExpressionReflexion(ast)
    }

    if (ast.type === 'ImportDeclaration') {
      return new DependenciesReflexion(ast)
    }

    if (ast.type === 'ExportNamedDeclaration') {
      return new ExpressionReflexion(ast)
    }

    throw new Error(`Ast type "${ast.type}" not handeled yet!`)
  }
}

class ProgramReflexion extends Reflexion {
  factorizeEach(ast) {
    const typesToExpand = ['ExportNamedDeclaration', 'ArrowFunctionExpression']
    return new HorizontalReflexion(ast.body, typesToExpand).factorize()
  }
}

class FunctionReflexion extends Reflexion {
  factorizeEach(ast) {
    if (!Array.isArray(ast.body.body)) {
      return [ast.body] // function without brackets.
    }

    return new HorizontalReflexion(ast.body.body, ['IfStatement']).factorize()
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
        result.add(node.declaration?.id?.name)
      }
    })
    return result
  }
}

export class DependenciesReflexion extends Reflexion {
  files = []

  add(file) {
    this.files.push(file)
    return this
  }

  odds() {
    return this.files
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

export class AntTrail extends Reflexion {
  static dependency(code, modules) {
    const ast = Reflexion.parse(code, (ast) => ast.body)
    // TODO: use instance instead of literal object
    return { importedModuleExports: ast.api(), otherModules: modules }
  }
}
