
var assert = require('assert');

var Foo = (function () {
    function $obj () { }
    
    function $cons () { 
        var newobj = new $obj();
        var initargs = [];
        initargs[0] = newobj;
        
        for (var k = 0; k < arguments.length; k++)
            initargs[k + 1] = arguments[k];
        
        __init__.apply(null, initargs);
        return newobj;
    }
    
    function __init__(self, name) {
        self.name = name;
    }
    
    function get_name(self) {
        return self.name;
    }
    
    $cons.get_name = get_name;
    $obj.prototype.get_name = function () { return get_name(this); };
    $obj.prototype.__class__ = $cons;
    
    return $cons;
})();

var obj = Foo('bar');

assert.ok(obj);
assert.equal(typeof obj, 'object');

assert.equal(obj.__class__, Foo);

assert.ok(obj.get_name);
assert.equal(typeof obj.get_name, 'function');
assert.equal(obj.get_name(), 'bar');

assert.ok(Foo.get_name);
assert.equal(typeof Foo.get_name, 'function');
assert.equal(Foo.get_name(obj), 'bar');

