
var py2script = (function() {   
    function Lexer(text) {
    };
    
    return {
        Lexer : Lexer
    };
})();

if (typeof(window) === 'undefined') {
	module.exports = py2script;
}
