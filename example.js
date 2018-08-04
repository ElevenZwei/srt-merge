const index = require('./index');
const fs = require('fs');
const srt1 = fs.readFileSync('test_files/jpn_short.srt', 'utf-8');
const srt2 = fs.readFileSync('test_files/chi_short.srt', 'utf-8');

// merge attribution can be '', 'top-bottom', 'nearest-cue-<time-in-millisecond>', 'move-merge-<time-to-shift>'.

// You can use srt text as input
const simpleInString = index.merge(srt1, srt2);
const simpleInObject = index.merge(srt1, srt2, '', true);
const topBottom = index.merge(srt1, srt2, 'top-bottom', true);

// You can also use objects from npm-module subtitle as input
const Subtitle = require('subtitle');
const srt01 = Subtitle.parse(srt1);
const srt02 = Subtitle.parse(srt2);
const nearestCue = index.merge(srt01, srt2, 'nearest-cue-1000', true); // srt2 is inserted into srt1
const endToEnd = index.merge(srt1, srt02, 'move-merge-50000', true); // srt2 is postponed 10 seconds and merged with srt1
const endToEnd2 = index.merge(srt01, srt02, 'move-merge--50000', true); // srt2 is moved back 10 seconds and merged with srt1

console.log('Simple merge srt text:');
console.log(simpleInString);
console.log('\nTo be more readable, displaying in object:');
console.log(simpleInObject);
console.log('\nTop bottom merge:');
console.log(topBottom);
console.log('\nNearest cue merge:');
console.log(nearestCue);
console.log('\nMove merge forward:');
console.log(endToEnd);
console.log('\nMove merge back:');
console.log(endToEnd2);

