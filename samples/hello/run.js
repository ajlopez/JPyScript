
var py2script = require('../..'),
    util = require('util'),
    fs = require('fs');
    
function compileFileCommand(filename) {
    var text = fs.readFileSync(filename).toString();
    var parser = new py2script.Parser(text);
    var cmd = parser.parseCommand();
    if (!cmd)
        return '';
    return cmd.compile();
};

function print() {
    var n = arguments.length;
    
    for (var k = 0; k < n; k++)
        if (arguments[k] !== null)
            util.print(arguments[k]);
            
    util.print('\n');
}

process.argv.forEach(function(val) {
    if (val.slice(-3) == ".py")
        eval(compileFileCommand(val));
});

