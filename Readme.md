# AjFabriq

AjFabriq is a Node.JS project that helps to write a distributed application, based on applications, nodes
and actions. It uses JSON message passing and Net Socket for communication.

## Posts

[AjFabriq on NodeJs (Part 1) Introduction](http://ajlopez.wordpress.com/2011/08/25/ajfabriq-on-nodejs-part-1-introduction/)

[AjFabriq on NodeJs (Part 2) A local Simple Application](http://ajlopez.wordpress.com/2011/09/08/ajfabriq-on-nodejs-part-2-a-local-simple-application/)

[AjFabriq on NodeJs (Part 3) A Distributed Simple Application](http://ajlopez.wordpress.com/2011/09/09/ajfabriq-on-nodejs-part-3-a-distributed-simple-application/)

## Installation

Via npm on Node:

```
npm install ajfabriq
```


## Usage

Reference in your program:

```js
var ajfabriq = require('ajfabriq');
```

TBD

## Development

```
git clone git://github.com/ajlopez/AjFabriqNode.git
cd AjFabriqNode
npm install
npm test
```

## Samples

- [Numbers](https://github.com/ajlopez/AjFabriqNode/tree/master/samples/numbers) Sending numbers to processors.

- [Web Crawler](https://github.com/ajlopez/AjFabriqNode/tree/master/samples/WebCrawler) Distributed Web Crawler.

## To do

- More samples
- README.md for samples
- Update posts for version 0.0.2
- Complete usage

## Versions

- 0.0.1: Published
- 0.0.2: Published. Create processor giving an object as filter. New Web Crawler samples.

## Contribution

Feel free to [file issues](https://github.com/ajlopez/AjFabriqNode) and submit
[pull requests](https://github.com/ajlopez/AjFabriqNode/pulls) — contributions are
welcome.

If you submit a pull request, please be sure to add or update corresponding
test cases, and ensure that `npm test` continues to pass.
