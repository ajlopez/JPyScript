
var assert = require('assert');

var Foo = (function () {
    function $obj () { }
    
    function $cons () { 
        if (!$obj.prototype.__class__)
            $obj.prototype.__class__ = Foo;
            
        var newobj = new $obj();
        return newobj;
    }
    
    function get_name(self) {
        return self.name;
    }
    
    $cons.get_name = get_name;
    $obj.prototype.get_name = function () { return get_name(this); };
    
    return $cons;
})();

var obj = Foo();

assert.ok(obj);
assert.equal(typeof obj, 'object');

assert.equal(obj.__class__, Foo);

obj.name = 'bar';

assert.ok(obj.get_name);
assert.equal(typeof obj.get_name, 'function');
assert.equal(obj.get_name(), 'bar');

assert.ok(Foo.get_name);
assert.equal(typeof Foo.get_name, 'function');
assert.equal(Foo.get_name(obj), 'bar');

