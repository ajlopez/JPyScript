
var assert = require('assert');

var Foo = (function () {
    function $obj () { }
    
    function $cons () { 
        if (!$obj.prototype.__class__)
            $obj.prototype.__class__ = Foo;
            
        var newobj = new $obj();
        return newobj;
    }
    
    return $cons;
})();

var obj = Foo();

assert.ok(obj);
assert.equal(typeof obj, 'object');

assert.equal(obj.__class__, Foo);