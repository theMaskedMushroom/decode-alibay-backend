let vm = require('vm');
let fs = require('fs');

vm.runInThisContext(fs.readFileSync('andy.js'));

vm.runInThisContext(fs.readFileSync('martin.js'));