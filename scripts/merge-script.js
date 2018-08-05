const SrtMerge = require('../index');
const fs = require('fs');
const readLine = require('readline');
const rl = readLine.createInterface({
  input: process.stdin,
  output: process.stdout
});

if(process.argv.length < 3 || process.argv[2] === '--help' || process.argv[2] === '-h') {
  console.log('Usage:');
  console.log('node ' + __filename.substring(Math.max(__filename.lastIndexOf("\\"), __filename.lastIndexOf("/")) + 1)
    + ' <srtFilepath 1> <srtFilepath 2> [<attr>] [-o [-f(force)] <outputFilepath>]');
  console.log('All files should be encoded with utf-8.');
  process.exit();
}

let argv = process.argv.slice(2);
argv.reverse();
const files = [argv.pop(), argv.pop()];
let srts = files.map(file => fs.readFileSync(file, 'utf-8'));
let attr = undefined;
if(argv[argv.length - 1] !== '-o') {
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
      process.exit();
    } else {
      rl.question('File \'' + output + '\' already exists, overwrite? [y/N] ', answer => {
        answer = answer.toLowerCase();
        if (answer[0] === 'y') {
          fs.writeFileSync(output, result);
          console.log('Successfully written.')
        } else {
          console.log('Abort.')
        }
        process.exit();
      });
    }
  } else {
    fs.writeFileSync(output, result);
    console.log('Successfully written.');
    process.exit();
  }
} else {
  console.log(result);
  process.exit();
}
