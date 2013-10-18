
if (typeof jpyparser === 'undefined')
    var jpyparser = require('./jpyparser');

if (typeof util === 'undefined')
    var util = require('util');

var jpyscript = (function() {
    function evaluate(text) {
        var parser = jpyparser.createParser(text);

        return eval(parser.parseExpression().compile());
    }
    
    function execute(text, novars) {
        var parser = jpyparser.createParser(text);

        var withvars = true;
        
        if (novars)
            withvars = false;
            
        return eval(parser.parseCommand().compile({ withvars: withvars }));
    }

    function executeModule(text) {
        var parser = jpyparser.createParser(text);
        var code = parser.parseCommand().compile({ withvars: true, exports: true });
        return eval('(function () { ' + code + ' })()');
    }

    function getIndex(value, index) {
        if (index < 0)
            return value[value.length + index];

        return value[index];
    }

    function len(value) {
        return value.length;
    }

    function print() {
        var n = arguments.length;
        var np = 0;
        
        for (var k = 0; k < n; k++)
            if (arguments[k] !== null) {
                if (np)
                    util.print(' ');
                util.print(arguments[k]);
                np++;
            }
                
        util.print('\n');
    }

    function forEach(list, fn) {
        if (list == null)
            return;

        if (typeof list == 'string') {
            var l = list.length;

            for (var k = 0; k < l; k++)
                fn(list[k]);

            return;
        }

        if (list instanceof Array) {
            for (var n in list)
                fn(list[n]);

            return;
        }

        for (var item in list)
            fn(item);
    }

    function evaluate(text) {
        var parser = jpyparser.createParser(text);
        return eval(parser.parseExpression().compile());
    }
    
    function imports(text) {
    }

    return {
        evaluate: evaluate,
        execute: execute,
        executeModule: executeModule
    };
})();

if (typeof module !== 'undefined' && module && module.exports)
	module.exports = jpyscript;
