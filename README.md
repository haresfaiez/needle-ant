# Needle-ant

## Usage

## Demo

## Roadmap
  * Handle undefined variable (`a`, `let b; b + 1; a;`)
  * Handle undefined variable inside function (to which scope to add)
  * Handle string literal templates
  * Add available scope to divisor (instead of just already-defined variables): Fix `const f = x => x; class C {}`
  * Handle member access properly (instead of counting already-encountered accesses)
  * Handle inter-modules dependencies (tests are commented for now)
  * check TODO s
  * Add weighted probabilities/entropies
  * Add property tests
