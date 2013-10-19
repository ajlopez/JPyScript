
var assert = require('assert');

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
    
    function __init__(self, name) {
        self.name = name;
    }
    
    function get_name(self) {
        return self.name;
    }
    
    $cons.get_name = get_name;
    $obj.prototype.get_name = function () { return get_name(this); };
    
    return $cons;
})();

var Bar = (function () {
    var $class = makeClass(__init__);
    var $cons = $class.cons;
    var $obj = $class.obj;
    
    function __init__(self, age) {
        self.age = age;
    }
    
    function get_age(self) {
        return self.age;
    }
    
    $cons.get_age = get_age;
    $obj.prototype.get_age = function () { return get_age(this); };
    
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

var obj2 = Bar(800);

assert.ok(obj2);
assert.equal(typeof obj2, 'object');

assert.equal(obj2.__class__, Bar);

assert.ok(obj2.get_age);
assert.equal(typeof obj2.get_age, 'function');
assert.equal(obj2.get_age(), 800);
assert.equal(obj2.get_name, null);

assert.ok(Bar.get_age);
assert.equal(typeof Bar.get_age, 'function');
assert.equal(Bar.get_age(obj2), 800);
assert.equal(Bar.get_name, null);

