
var py2script = (function() {
    var TokenType = { Name: 1 };

    function Token(value, type)
    {
        this.value = value;
        this.type = type;
    };

    function Lexer(text) {
        var length = text ? text.length : 0;
        var position = 0;
        
        this.nextToken = function() {
            var ch = nextChar();
            
            if (ch == null)
                return null;
            
            if (isLetter(ch))
                return nextName(ch);
                
            throw "unexpected '" + ch + "'";
         };

        function nextName(letter)
        {
            var name = letter;
            
            for (var ch = nextChar(); ch && isLetter(ch); ch = nextChar())
                name += ch;

            pushChar(ch);
            
            return new Token(name, TokenType.Name);
        }
        
        function pushChar(ch)
        {
            if (ch != null)
                position--;
        }
        
        function nextChar() {
            if (position >= length)
                return null;
            return text[position++];
        }
    };
    
    function isLetter(ch) {
        return (ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z');
    }
        
    return {
        Lexer : Lexer,
        TokenType: TokenType
    };
})();

if (typeof(window) === 'undefined') {
	module.exports = py2script;
}
