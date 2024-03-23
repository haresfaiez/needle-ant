export class Evaluation {

  constructor(actualCount, possibleCount) {
    this.actualCount = actualCount
    this.possibleCount = possibleCount
    this.localPossibilitiesCount = 0
  }

  plus(otherEvaluation) {
    return new JointEvaluation([this, otherEvaluation])
  }

  withLocalPossibilities(localPossibilitiesCount) {
    this.localPossibilitiesCount = localPossibilitiesCount
    return this
  }

  possibilitiesCount(primitiveAndGlobalsCount = 0) {
    if (this.localPossibilitiesCount) {
      primitiveAndGlobalsCount = 1
    }

    const combinationsCount =
      this.actualCount > 1
        ? this.combination(this.possibleCount + primitiveAndGlobalsCount, this.actualCount)
        : 0
  
    const possibilitiesWeight =
      this.actualCount < this.possibleCount
        ? this.possibleCount
        : 0

    return (this.localPossibilitiesCount || possibilitiesWeight) + combinationsCount
  }

  probability() {
    return 1 / this.possibilitiesCount()
  }

  calculate() {
    if (this.actualCount === this.possibleCount)
      return 0

    if (this.probability() === 1)
      return 0

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

export class JointEvaluation extends Evaluation {
  constructor(evaluations) {
    super()
    this.evaluations = evaluations
  }

  plus(otherEvaluation) {
    this.evaluations.push(otherEvaluation)
    return this
  }

  calculate() {
    return this.evaluations.reduce((acc, eachEntropy) => acc + eachEntropy.calculate(), 0)
  }
}

export class NullEvaluation extends Evaluation {
  plus(otherEvaluation) {
    return otherEvaluation
  }

  calculate() {
    return 0
  }
}
