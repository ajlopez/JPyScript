
var py2script = require('../..'),
    fs = require('fs');
    
function executeFile(filename) {
    var text = fs.readFileSync(filename).toString();
    py2script.execute(text);
};

process.argv.forEach(function(val) {
    if (val.slice(-3) == ".py")
        executeFile(val);
});

