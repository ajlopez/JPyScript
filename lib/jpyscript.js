
if (typeof jpyparser === 'undefined')
    var jpyparser = require('./jpyparser');

if (typeof util === 'undefined')
    var util = require('util');

if (typeof path === 'undefined')
    var path = require('path');

if (typeof fs === 'undefined')
    var fs = require('fs');

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
            
        var code = parser.parseCommand().compile({ withvars: withvars });
          
        return eval(code);
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
    
    function makeClass(init) {
        function obj() { }

        function cons() {
            var newobj = new obj();
            var initargs = [];
            initargs[0] = newobj;
            
            for (var k = 0; k < arguments.length; k++)
                initargs[k + 1] = arguments[k];
            
            init.apply(null, initargs);
            return newobj;
        }
        
        obj.prototype.__class__ = cons;
        
        return { obj: obj, cons: cons }
    }

    var importcache = { };
    var configuration = {
        require: require
    };

    function importModule(name) {
        if (importcache[name])
            return importcache[name];
            
        var filename = name + '.py';
        
        if (fs.existsSync(filename))
            return importFileModule(filename, name);
    
        var filename = path.join(__dirname, 'modules', name + '.py');
        
        if (fs.existsSync(filename))
            return importFileModule(filename, name);

        var result = configuration.require(name);        
        importcache[name] = result;
        
        return result;
    }
    
    function importFileModule(filename, name) {
        var text = fs.readFileSync(filename).toString();
        var result = executeModule(text);
        importcache[name] = result;
        return result;
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
    
    function configure(conf) {
        Object.keys(conf).forEach(function (key) {
            configuration[key] = conf[key];
        });
        
        if (conf.require)
            require = conf.require;
    }

    return {
        evaluate: evaluate,
        execute: execute,
        executeModule: executeModule,
        configure: configure
    };
})();

if (typeof module !== 'undefined' && module && module.exports)
	module.exports = jpyscript;
