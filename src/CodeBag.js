
export class CodeBag {
  constructor(sources) {
    this.sources = sources;
    this.elements = new Map();
  }

  put(codeSlice) {
    const codeSlicesPerId = this.elements.get(codeSlice.raw);
    this.elements.set(codeSlice.raw, [...(codeSlicesPerId || []), codeSlice]);
  }

  collect(collector) {
    for (const eachSource of this.sources) {
      collector(eachSource, this);
    }
  }

  evaluate() {
    return [...this.elements.keys()];
  }
}
