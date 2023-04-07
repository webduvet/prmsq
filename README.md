# promise-q
controlled queue for promise resolution


## 
[![npm version](https://badge.fury.io/js/angular2-expandable-list.svg)](https://badge.fury.io/js/angular2-expandable-list)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

# Deferable

> Wrapper for promises to allow to defer the execution.

## Prerequisites

None. It only requires Promise capable version javascript interpreter.
e.g. Node version(8 and higher)

```sh
$ npm -v && node -v
6.4.1
v8.16.0
```

## Table of contents

- [Project Name](#deferable)
  - [Prerequisites](#prerequisites)
  - [Table of contents](#table-of-contents)
  - [Getting Started](#getting-started)
  - [Installation](#installation)
  - [Usage](#usage)
    - [Factory flavor](#factory-flavor)
    - [Class Flavor](#class-flavor)
    - [Running the tests](#running-the-tests)
    - [Building a distribution version](#building-a-distribution-version)
  - [Contributing](#contributing)
  - [Credits](#credits)
  - [Built With](#built-with)
  - [Versioning](#versioning)
  - [Authors](#authors)
  - [License](#license)

## Getting Started

clone the repository
```bash
git clone git@github.com:webduvet/promise-q.git
```
and from inside run the usual.
```sh
$ npm run test
$ npm run build
```

## Installation

**BEFORE YOU INSTALL:** please read the [prerequisites](#prerequisites)

It is standard npm package:

```sh
$ cd npm-project
$ npm install promise-q
```

## Usage

Inside your project:
```js
import {
    PromiseQ
} from 'promise-q'

const promiseArray = new Array(...new Array(50)).map(fnReturningPromise);

// 0.1s between calls and max 5 pending promises
const pq = new PromiseQ(promiseArray, 100, 5)

pq.start();
```



### Running the tests

```sh
$ npm test
```

### Building a distribution version

```sh
$ npm run build
```

This task will create a distribution version of the project
inside your local `dist/` folder


## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

1.  Fork it!
2.  Create your feature branch: `git checkout -b my-new-feature`
3.  Add your changes: `git add .`
4.  Commit your changes: `git commit -am 'Add some feature'`
5.  Push to the branch: `git push origin my-new-feature`
6.  Submit a pull request :sunglasses:

## Credits

TODO: Write credits

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/your/project/tags).

## Authors

* **Andrej Bartko** - *Initial work* - [AndrejBartko](https://github.com/webduvet)

See also the list of [contributors](https://github.com/webduvet/deferable/contributors) who participated in this project.

## License

[MIT License](https://github.com/git/git-scm.com/blob/main/MIT-LICENSE.txt) © 2012-2022 Scott Chacon and others
