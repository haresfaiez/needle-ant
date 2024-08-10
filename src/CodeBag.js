
export class CodeBag {
  constructor() {
    this.elements = new Map();
  }

  insert(anotherCodeBag) {
    [...anotherCodeBag.values()]
      .forEach(eachCodeSlices => this.putAll(eachCodeSlices))
  }

  putAll(codeSlices = []) {
    const id = codeSlices[0]?.raw
    const codeSlicesPerId = this.elements.get(id);
    this.elements.set(id, [...(codeSlicesPerId || []), ...codeSlices]);
  }

  put(codeSlice) {
    const codeSlicesPerId = this.elements.get(codeSlice.raw);
    this.elements.set(codeSlice.raw, [...(codeSlicesPerId || []), codeSlice]);
  }

  collect(sources, collector) {
    for (const eachSource of sources) {
      collector(eachSource, this);
    }
  }

  evaluate() {
    return [...this.elements.keys()];
  }
}
