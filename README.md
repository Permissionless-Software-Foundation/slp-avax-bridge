# npm-lib-boilerplate

This repository is a code 'boilerplate' for starting a new npm library. It
contains the following features:

- [Semantic Release](https://github.com/semantic-release/semantic-release) configured to work with [Travis CI](https://travis-ci.org/).
- Automatic linting using [Standard](https://www.npmjs.com/package/standard) JavaScript.
- Unit and integration tests using Mocha and Chai, following the best practices and design patterns in [this YouTube video](https://www.youtube.com/watch?v=lE3RYnchHps):
  - Uses ECMAScript 2015 `Class` for business logic and utility libraries.
  - Follows [TDD](https://builttoadapt.io/why-tdd-489fdcdda05e) best practices.
  - Uses `_this` to maintain context to the instance of the class.
  - Uses [Sinon stubs](https://sinonjs.org/releases/latest/stubs/) to mock external dependencies for unit tests.
  - Each function is wrapped in try/catch statements, allowing thrown errors to 'bubble up' to the top-level function, and give every function along the way an opportunity to handle exceptions.
  - Testing assertions focus on properties and structure, not values.


# Licence
[MIT](LICENSE.md)
