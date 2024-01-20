import * as acorn from 'acorn'

class NeedleAnt {

  constructor() {
  }

  coverEntropy(initialCode, updatedCode) {
    if (initialCode === updatedCode)
      return 0

    const initialAst = acorn.parse(initialCode, { ecmaVersion: 2023 })

    const updatedAst = acorn.parse(updatedCode, { ecmaVersion: 2023 })

    const declaration = { initial: initialAst.body[0], updated: updatedAst.body[0] }

    if (declaration.initial.kind !== declaration.updated.kind)
      return 6

    if (declaration.initial.declarations[0].id.name !== declaration.updated.declarations[0].id.name)
      return 4

    return 0
  }
}

export default NeedleAnt
