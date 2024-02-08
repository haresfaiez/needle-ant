export class Evaluation {

  constructor(actualCount, possibleCount) {
    this.actualCount = actualCount
    this.possibleCount = possibleCount
  }

  withLocalPossibilities(localPossibilitiesCount) {
    this.localPossibilitiesCount = localPossibilitiesCount
    return this
  }

  __possibilitiesCount(primitiveAndGlobalsCount = 1) {
    let combinationsCount = 0
    if (this.actualCount > 0) {
      combinationsCount = this.combination(this.possibleCount + primitiveAndGlobalsCount, this.actualCount)
    }

    return this.localPossibilitiesCount + combinationsCount
  }

  possibilitiesCount() {
    if (this.localPossibilitiesCount) {
      return this.__possibilitiesCount(1)
    }
    const combinationsCount =
      this.actualCount > 1
        ? this.combination(this.possibleCount, this.actualCount)
        : 0
  
    const possibilitiesWeight =
      this.actualCount < this.possibleCount
        ? this.possibleCount
        : 0
    return possibilitiesWeight + combinationsCount
  }

  probability() {
    return 1 / this.possibilitiesCount()
  }

  calculate() {
    if (this.probability() === 1)
      return 0
    // console.log('count/', this.probability() * Math.log2(this.probability()) * (-1))
    return this.probability() * Math.log2(this.probability()) * (-1)
  }

  permutation(n, k) {
    if (n < 0 || k < 0)
      throw new RangeError(`${n < 0 ? n : k} is out of range`)

    if (0 == k)
      return 1

    if (n < k)
      return 0

    let [bn, bk, bp] = [n, k, 1]
    while (bk--)
      bp *= bn--

    return bp
  }

  combination(n, k) {
    if ((0 == k) || (n == k))
      return 1

    if (n < k)
      return 0

    return this.permutation(n, k) / this.permutation(k, k)
  }
}
