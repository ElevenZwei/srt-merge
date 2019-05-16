#!/usr/bin/node
(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const Subtitle = require('subtitle');

function merge(srtPrimary, srtSecondary, attrs, noString) {
  if (typeof srtPrimary === 'string') {
    srtPrimary = Subtitle.parse(srtPrimary);
  }
  if (typeof srtSecondary === 'string') {
    srtSecondary = Subtitle.parse(srtSecondary);
  }
  if (typeof srtPrimary !== 'object' || typeof srtSecondary !== 'object') {
    throw new Error('cannot parse srt file');
  }
  if(attrs) {
    if (typeof attrs === 'string') { attrs = [attrs]; }
    // top-bottom and move-merge must be performed before nearest-cue, so here is a sort
    attrs.sort((attr1, attr2) => {
      const order = ['s', 't', 'm', 'n'];
      return order.indexOf(attr1[0]) - order.indexOf(attr2[0]);
    });
    attrs.forEach(attr => {
      if (attr) { attr = attr.trim(); }
      if (attr === 'top-bottom') {
        srtPrimary = clearPosition(srtPrimary);
        srtSecondary = clearPosition(srtSecondary);
        srtSecondary.forEach(caption => {
          caption.text = '{\\an8}' + caption.text;
        });
      } else if (/^nearest-cue-[0-9]+(-no-append)?$/.test(attr)) {
        const threshold = parseInt(attr.substring(attr.lastIndexOf('cue-') + 4));
        const srtPrimaryTimeArray = srtPrimary.map(caption => caption.start);
        const noAppend = attr.indexOf('-no-append') > -1;
        const append = function(captionA, captionB) {
          if(noAppend) {
            captionB.start = captionA.start;
            if(Math.abs(captionB.end - captionA.end) <= threshold) {
              captionB.end = captionA.end;
            }
            return captionB;
          } else {
            captionA.text = captionA.text + '\n' + captionB.text;
            return undefined;
          }
        };
        // try to merge srtSecondary into srtPrimary, failed captions stay in srtSecondary
        srtPrimary = copySrt(srtPrimary);
        srtSecondary = srtSecondary.map(caption => {
          let index = binarySearch(caption.start, srtPrimaryTimeArray);
          if (index === -1) {
            if (srtPrimary[0].start - caption.start <= threshold) {
              return append(srtPrimary[0], caption);
            } else { return caption; }
          } else if (caption.start - srtPrimary[index].start <= threshold) {
            return append(srtPrimary[index], caption);
          } else if (index === srtPrimary.length - 1) {
            return caption;
          } else if (srtPrimary[index + 1].start - caption.start <= threshold) {
            return append(srtPrimary[index+1], caption);
          } else {
            return caption;
          }
        }).filter(caption => (caption !== undefined));
      } else if (/^move-[-]?[0-9]+$/.test(attr)) {
        const delay = parseInt(attr.substring(attr.lastIndexOf('e-') + 2));
        srtSecondary = Subtitle.resync(srtSecondary, delay);
      } else if (attr !== undefined && attr !== 'simple' && attr !== '') {
        throw new Error('Cannot parse attr');
      }
    });
  }
  let srt3 = srtPrimary.concat(srtSecondary);
  srt3.sort((caption1, caption2) => {
    return caption1.start - caption2.start;
  });
  return noString ? srt3 : Subtitle.stringify(srt3);
}

function clearPosition(srt) {
  return srt.map(caption => {
    caption = Object.assign({}, caption);
    caption.text = caption.text.replace(/{\\a[n]?[0-9]}/g, '');
    caption.text = caption.text.replace(/{\\pos\([0-9]+,[0-9]+\)}/g, '');
    return caption;
  });
}

function copySrt(srt) {
  return srt.map(caption => Object.assign({}, caption));
}

function binarySearch(value, array, comp) {
  let left = 0, right = array.length;
  while(right > left) {
    let mid = Math.floor((left + right) / 2);
    let result;
    if(comp) {
      result = comp(array[mid], value);
    } else {
      result = array[mid] < value ? -1 : array[mid] > value ? 1 : 0;
    }
    if(result === 0) { return mid; }
    if(result < 0) { left = mid + 1; }
    else { right = mid; }
  }
  return left - 1;
}

module.exports = {
  merge
};
},{"subtitle":2}],2:[function(require,module,exports){
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["Subtitle"] = factory();
	else
		root["Subtitle"] = factory();
})(typeof self !== 'undefined' ? self : this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 5);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = toMS;
/**
 * Return the given SRT timestamp as milleseconds.
 * @param {string|number} timestamp
 * @returns {number} milliseconds
 */

function toMS(timestamp) {
  if (!isNaN(timestamp)) {
    return timestamp;
  }

  var match = timestamp.match(/^(?:(\d{2,}):)?(\d{2}):(\d{2})[,.](\d{3})$/);

  if (!match) {
    throw new Error('Invalid SRT or VTT time format: "' + timestamp + '"');
  }

  var hours = match[1] ? parseInt(match[1], 10) * 3600000 : 0;
  var minutes = parseInt(match[2], 10) * 60000;
  var seconds = parseInt(match[3], 10) * 1000;
  var milliseconds = parseInt(match[4], 10);

  return hours + minutes + seconds + milliseconds;
}

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = toSrtTime;

var _zeroFill = __webpack_require__(2);

var _zeroFill2 = _interopRequireDefault(_zeroFill);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Return the given milliseconds as SRT timestamp.
 * @param timestamp
 * @returns {string}
 */

function toSrtTime(timestamp) {
  if (isNaN(timestamp)) {
    return timestamp;
  }

  var date = new Date(0, 0, 0, 0, 0, 0, timestamp);

  var hours = (0, _zeroFill2.default)(2, date.getHours());
  var minutes = (0, _zeroFill2.default)(2, date.getMinutes());
  var seconds = (0, _zeroFill2.default)(2, date.getSeconds());
  var ms = timestamp - (hours * 3600000 + minutes * 60000 + seconds * 1000);

  return hours + ':' + minutes + ':' + seconds + ',' + (0, _zeroFill2.default)(3, ms);
} /**
   * Module dependencies.
   */

/***/ }),
/* 2 */
/***/ (function(module, exports) {

/**
 * Given a number, return a zero-filled string.
 * From http://stackoverflow.com/questions/1267283/
 * @param  {number} width
 * @param  {number} number
 * @return {string}
 */
module.exports = function zeroFill (width, number, pad) {
  if (number === undefined) {
    return function (number, pad) {
      return zeroFill(width, number, pad)
    }
  }
  if (pad === undefined) pad = '0'
  width -= number.toString().length
  if (width > 0) return new Array(width + (/\./.test(number) ? 2 : 1)).join(pad) + number
  return number + ''
}


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = toVttTime;

var _zeroFill = __webpack_require__(2);

var _zeroFill2 = _interopRequireDefault(_zeroFill);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Return the given milliseconds as WebVTT timestamp.
 * @param timestamp
 * @returns {string}
 */

function toVttTime(timestamp) {
  if (isNaN(timestamp)) {
    return timestamp;
  }

  var date = new Date(0, 0, 0, 0, 0, 0, timestamp);

  var hours = (0, _zeroFill2.default)(2, date.getHours());
  var minutes = (0, _zeroFill2.default)(2, date.getMinutes());
  var seconds = (0, _zeroFill2.default)(2, date.getSeconds());
  var ms = timestamp - (hours * 3600000 + minutes * 60000 + seconds * 1000);

  return hours + ':' + minutes + ':' + seconds + '.' + (0, _zeroFill2.default)(3, ms);
} /**
   * Module dependencies.
   */

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = parseTimestamps;

var _toMS = __webpack_require__(0);

var _toMS2 = _interopRequireDefault(_toMS);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Timestamp regex
 * @type {RegExp}
 */

var RE = /^((?:\d{2,}:)?\d{2}:\d{2}[,.]\d{3}) --> ((?:\d{2,}:)?\d{2}:\d{2}[,.]\d{3})(?: (.*))?$/;

/**
 * parseTimestamps
 * @param value
 * @returns {{start: Number, end: Number}}
 */

/**
 * Module dependencies.
 */

function parseTimestamps(value) {
  var match = RE.exec(value);
  if (match) {
    var cue = {
      start: (0, _toMS2.default)(match[1]),
      end: (0, _toMS2.default)(match[2])
    };
    if (match[3]) {
      cue.settings = match[3];
    }
    return cue;
  }
}

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _toMS = __webpack_require__(0);

Object.defineProperty(exports, 'toMS', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_toMS).default;
  }
});

var _toSrtTime = __webpack_require__(1);

Object.defineProperty(exports, 'toSrtTime', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_toSrtTime).default;
  }
});

var _toVttTime = __webpack_require__(3);

Object.defineProperty(exports, 'toVttTime', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_toVttTime).default;
  }
});

var _parse = __webpack_require__(6);

Object.defineProperty(exports, 'parse', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_parse).default;
  }
});

var _stringify = __webpack_require__(7);

Object.defineProperty(exports, 'stringify', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_stringify).default;
  }
});

var _stringifyVtt = __webpack_require__(8);

Object.defineProperty(exports, 'stringifyVtt', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_stringifyVtt).default;
  }
});

var _resync = __webpack_require__(9);

Object.defineProperty(exports, 'resync', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_resync).default;
  }
});

var _parseTimestamps = __webpack_require__(4);

Object.defineProperty(exports, 'parseTimestamps', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_parseTimestamps).default;
  }
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = parse;

var _parseTimestamps = __webpack_require__(4);

var _parseTimestamps2 = _interopRequireDefault(_parseTimestamps);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Parse a SRT or WebVTT string.
 * @param {String} srtOrVtt
 * @return {Array} subtitles
 */

function parse(srtOrVtt) {
  if (!srtOrVtt) return [];

  var source = srtOrVtt.trim().concat('\n').replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n').replace(/^WEBVTT.*\n(?:.*: .*\n)*\n/, '').split('\n');

  return source.reduce(function (captions, row, index) {
    var caption = captions[captions.length - 1];

    if (!caption.index) {
      if (/^\d+$/.test(row)) {
        caption.index = parseInt(row, 10);
        return captions;
      }
    }

    if (!caption.hasOwnProperty('start')) {
      var timestamp = (0, _parseTimestamps2.default)(row);
      if (timestamp) {
        Object.assign(caption, timestamp);
      } else if (captions.length > 1) {
        captions[captions.length - 2].text += '\n' + row;
      }
      return captions;
    }

    if (row === '') {
      delete caption.index;
      if (index !== source.length - 1) {
        captions.push({});
      }
    } else {
      caption.text = caption.text ? caption.text + '\n' + row : row;
    }

    return captions;
  }, [{}]);
} /**
   * Module dependencies.
   */

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = stringify;

var _toSrtTime = __webpack_require__(1);

var _toSrtTime2 = _interopRequireDefault(_toSrtTime);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Stringify the given array of captions.
 * @param {Array} captions
 * @return {String} srt
 */

function stringify(captions) {
  return captions.map(function (caption, index) {
    return (index > 0 ? '\n' : '') + [index + 1, (0, _toSrtTime2.default)(caption.start) + ' --> ' + (0, _toSrtTime2.default)(caption.end), caption.text].join('\n');
  }).join('\n') + '\n';
} /**
   * Module dependencies.
   */

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = stringifyVtt;

var _toVttTime = __webpack_require__(3);

var _toVttTime2 = _interopRequireDefault(_toVttTime);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Stringify the given array of captions to WebVTT format.
 * @param {Array} captions
 * @return {String} webVtt
 */

function stringifyVtt(captions) {
  return 'WEBVTT\n\n' + captions.map(function (caption, index) {
    return (index > 0 ? '\n' : '') + [index + 1, (0, _toVttTime2.default)(caption.start) + ' --> ' + (0, _toVttTime2.default)(caption.end) + (caption.settings ? ' ' + caption.settings : ''), caption.text].join('\n');
  }).join('\n') + '\n';
} /**
   * Module dependencies.
   */

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = resync;

var _toMS = __webpack_require__(0);

var _toMS2 = _interopRequireDefault(_toMS);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Resync the given subtitles.
 * @param captions
 * @param time
 * @returns {Array|*}
 */

function resync(captions, time) {
  return captions.map(function (caption) {
    var start = (0, _toMS2.default)(caption.start) + time;
    var end = (0, _toMS2.default)(caption.end) + time;

    return Object.assign({}, caption, {
      start: start,
      end: end
    });
  });
} /**
   * Module dependencies.
   */

/***/ })
/******/ ]);
});
},{}],3:[function(require,module,exports){
(function (__filename){


const fs = require('fs');
const readLine = require('readline');
const path = require('path');
const rl = readLine.createInterface({
  input: process.stdin,
  output: process.stdout
});
const SrtMerge = require('../merge');

if(process.argv.length < 3 || process.argv[2] === '--help' || process.argv[2] === '-h') {
  console.log('Usage:');
  console.log('  ' + path.basename(__filename) + ' <srtFilepath 1> [<srtFilepath 2>] [<one-attr>] [-o [-f(force)] <outputFilepath>]');
  console.log('Description:');
  console.log('  Srt 2 will be processed by given attributes and merged into Srt 1.');
  console.log('Attributes available:');
  console.log('  1. top-bottom \n    # This will make srt2 showed at top and srt1 showed at bottom.');
  console.log('  2. nearest-cue-<time-in-millisecond>[-no-append] \n    # This will append srt2 lines into srt1 lines within given time threshold.');
  console.log('  3. move-<time-to-shift> \n    # This will move srt2, number can be positive or negative in milliseconds.');
  console.log('Input files:');
  console.log('  Both srt files should be encoded in utf-8.');
  process.exit(0);
}

let argv = process.argv.slice(2);
argv.reverse();
const files = [argv.pop(), argv.pop()];
// if second argument is not a existing file, take it as attribute input
if(!fs.existsSync(files[1])) {
    argv.push(files[1]);
    files[1] = files[0];
    files[0] = '';
}
// read files
let srts = files.map(file => file.trim().length > 0 ? fs.readFileSync(file, 'utf-8') : '');

let attr = undefined;
if(argv[argv.length - 1][0] !== '-') {
  attr = argv.pop();
}
let output = undefined;
let force = false;
if(argv[argv.length - 1] === '-o' || argv[argv.length - 1] === '-of' || argv[argv.length - 1] === '-fo') {
  if(argv[argv.length - 1] === '-of' || argv[argv.length - 1] === '-fo') { force = true; }
  argv.pop();
  if(argv[argv.length - 1] === '-f') { force = true; argv.pop(); }
  output = argv.pop();
}

let result = SrtMerge.merge(srts[0], srts[1], attr);
if(output) {
  if(fs.existsSync(output)) {
    if (force) {
      fs.writeFileSync(output, result);
      console.log('Successfully written.');
      process.exit(0);
    } else {
      rl.question('File \'' + output + '\' already exists, overwrite? [y/N] ', answer => {
        answer = answer.toLowerCase();
        if (answer[0] === 'y') {
          fs.writeFileSync(output, result);
          console.log('Successfully written.')
        } else {
          console.log('Abort.')
        }
        process.exit(0);
      });
    }
  } else {
    fs.writeFileSync(output, result);
    console.log('Successfully written.');
    process.exit(0);
  }
} else {
  console.log(result);
  process.exit(0);
}

}).call(this,require("path").join(__dirname,"scripts","merge-script.js"))
},{"../merge":1,"fs":undefined,"path":undefined,"readline":undefined}]},{},[3]);
