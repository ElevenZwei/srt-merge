const index = require('./index');
const fs = require('fs');
const srt1 = fs.readFileSync('test_files/jpn_short.srt', 'utf-8');
const srt2 = fs.readFileSync('test_files/chi_short.srt', 'utf-8');

// merge attribution can be '', 'top-bottom', 'nearest-cue-<time-in-millisecond>[-no-append]', 'move-<time-to-shift>'.
// or an array of them.
// But, performing order will always be 'top-bottom'->'move'->'nearest-cue'!

// You can use srt text as input
const simpleInString = index.merge(srt1, srt2);
const simpleInObject = index.merge(srt1, srt2, '', true);
const topBottom = index.merge(srt1, srt2, 'top-bottom', true);

// You can also use objects from npm-module subtitle as input
const Subtitle = require('subtitle');
const srt01 = Subtitle.parse(srt1);
const srt02 = Subtitle.parse(srt2);
const nearestCueMerge = index.merge(srt01, srt2, 'nearest-cue-1000', true); // srt2 is appended to srt1
const nearestCueOnlyAlign = index.merge(srt1, srt02, ['nearest-cue-1000-no-append', 'top-bottom'], true); // srt2 is aligned with srt1 at top of screen

// If you want to edit only one file, just leave another one with an empty string.
const moveMergeA = index.merge('', srt02, 'move-50000', true); // srt2 is postponed 50 seconds
const moveMergeB = index.merge(srt01, srt02, ['move--2000', 'nearest-cue-1000'], true); // srt2 is moved back 2 seconds and merged with srt1

console.log('Simple merge srt text:');
console.log(simpleInString);
console.log('\nTo be more readable, displaying in object:');
console.log(simpleInObject);
console.log('\nTop bottom merge:');
console.log(topBottom);
console.log('\nNearest cue merge:');
console.log(nearestCueMerge);
console.log('\nNearest cue align and top bottom:');
console.log(nearestCueOnlyAlign);
console.log('\nMove forward:');
console.log(moveMergeA);
console.log('\nMove backward and nearest cue merge:');
console.log(moveMergeB);

