#!/usr/bin/node

const fs = require('fs');
const readLine = require('readline');
const path = require('path');
const rl = readLine.createInterface({
  input: process.stdin,
  output: process.stdout
});

let SrtMerge;
let path1 = path.join(path.dirname(__filename), 'merge.js'),
    path2 = path.join(path.dirname(__filename), '..', 'merge.js');
if(fs.existsSync(path1)) {
  SrtMerge = require(path1);
} else if (fs.existsSync(path2)) {
  SrtMerge = require(path2);
} else {
  console.log("You need to place file \"merge.js\" within the same folder or its parent folder.")
  process.exit(1);
}

if(process.argv.length < 3 || process.argv[2] === '--help' || process.argv[2] === '-h') {
  console.log('Usage:');
  console.log('\t' + path.extname(__filename) + ' <srtFilepath 1> [<srtFilepath 2>] [<one-attr>] [-o [-f(force)] <outputFilepath>]');
  console.log('Description:');
  console.log('\tSrt 2 will be processed by given attributes and merged into Srt 1.');
  console.log('Attributes available:');
  console.log('\t1. top-bottom \n\t\t# This will make srt2 showed at top and srt1 showed at bottom.');
  console.log('\t2. nearest-cue-<time-in-millisecond>[-no-append] \n\t\t# This will append srt2 lines into srt1 lines within given time threshold.');
  console.log('\t3. move-<time-to-shift> \n\t\t# This will move srt2, number can be positive or negative in milliseconds.');
  console.log('Input files:');
  console.log('\tBoth srt files should be encoded in utf-8.');
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
