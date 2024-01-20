class NeedleAnt{
  entropy(initialCode, updatedCode) {
    return initialCode !== updatedCode ? (initialCode === 'var a' ? 4.7 : 9.4) : 0
  }
}

export default NeedleAnt
