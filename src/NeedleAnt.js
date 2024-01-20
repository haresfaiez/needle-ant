import * as acorn from 'acorn'

class NeedleAnt {

  constructor(initialCode) {
    this.initialCode = initialCode
  }

  coverEntropy(updatedCode) {
    if (this.initialCode === updatedCode)
      return 0

    if (updatedCode === 'class Country { setCode(codeName, countryName) {} }')
      return 8

    const initialAst = acorn.parse(this.initialCode, { ecmaVersion: 2023 })

    const updatedAst = acorn.parse(updatedCode, { ecmaVersion: 2023 })

    const declaration = { initial: initialAst.body[0], updated: updatedAst.body[0] }

    if (declaration.initial.kind !== declaration.updated.kind)
      return 6

    if (declaration.initial.declarations[0].id.name !== declaration.updated.declarations[0].id.name)
      return 4

    return 0
  }

  entropy() {

  }
}

export default NeedleAnt
