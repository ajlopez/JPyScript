
var assert = require('assert');

// http://docs.python.org/3/reference/simple_stmts.html#assignment-statements
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty

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

var Foo = (function () {
    var $class = makeClass(__init__);
    var $cons = $class.cons;
    var $obj = $class.obj;
    
    var x = 3;
    
    function __init__(self, name) {
        self.name = name;
        
        var self_x = undefined;
        
        Object.defineProperty(self, 'x', {
            get: function () { if (self_x === undefined) return x;  return self_x; },
            set: function ($newvalue) { self_x = $newvalue; }
        });
    }
    
    function get_name(self) {
        return self.name;
    }
    
    $cons.get_name = get_name;
    $obj.prototype.get_name = function () { return get_name(this); };
    
    Object.defineProperty($cons, 'x', {
        get: function () { return x; },
        set: function ($value) { x = $value; }
    });
    
    return $cons;
})();

var obj = Foo('bar');

assert.ok(obj);
assert.equal(typeof obj, 'object');

assert.equal(obj.__class__, Foo);

assert.ok(obj.get_name);
assert.equal(typeof obj.get_name, 'function');
assert.equal(obj.get_name(), 'bar');
assert.equal(obj.get_age, null);

assert.ok(Foo.get_name);
assert.equal(typeof Foo.get_name, 'function');
assert.equal(Foo.get_name(obj), 'bar');

assert.equal(Foo.x, 3);

assert.equal(obj.x, 3);

Foo.x = 5;

assert.equal(obj.x, 5);

obj.x = 4;

assert.equal(obj.x, 4);
assert.ok(obj.hasOwnProperty('x'));
assert.equal(Foo.x, 5);

