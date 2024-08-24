# Needleant

Needleant is a source code static analyzer that calculates the entropy of code as message between developers.

Read more about the motivation behind [here](https://haresfaiez.github.io/2024/08/24/Code-entropy-in-action-needleant-alpha-release.html).

## Usage

```javascript
const code = 'const a = 4;'
const analysis = new NeedleAnt(code).entropy()
const entropyValue = analysis.calculate()
```

## Release
  * Increase version in `package.json`
  * run `npm run build`
  * run `cd dist/ && npm publish`

## Roadmap
  * Handle undefined variable (`a`, `let b; b + 1; a;`)
  * Handle undefined variable inside function (to which scope to add)
  * Handle string literal templates
  * Add available scope to divisor (instead of just already-defined variables): Fix `const f = x => x; class C {}`
  * Handle member access properly (instead of counting already-encountered accesses)
  * Handle inter-modules dependencies (tests are commented for now)
  * Check TODO s
  * Add weighted probabilities/entropies
  * Add property tests
