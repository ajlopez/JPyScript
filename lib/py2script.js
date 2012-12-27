
var py2script = (function() {
    var TokenType = { Name: 1, Integer: 2, String: 3, Operator: 4 };
    var operators = "+-*/=.><";

    function Token(value, type)
    {
        this.value = value;
        this.type = type;
    };

    function Lexer(text) {
        var length = text ? text.length : 0;
        var position = 0;
        
        this.nextToken = function() {
            var ch = nextFirstChar();
            
            if (ch == null)
                return null;
            
            if (isLetter(ch))
                return nextName(ch);

            if (isDigit(ch))
                return nextInteger(ch);

            if (isOperator(ch))
                return nextOperator(ch);
                
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

        function nextInteger(digit)
        {
            var number = digit;
            
            for (var ch = nextChar(); ch && isDigit(ch); ch = nextChar())
                number += ch;

            pushChar(ch);
            
            return new Token(number, TokenType.Integer);
        }

        function nextOperator(ch)
        {
            return new Token(ch, TokenType.Operator);
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

        function nextFirstChar() {
            skipSpaces();
            
            if (position >= length)
                return null;
                
            return nextChar();
        }

        function skipSpaces() {
            while (position < length && isSpace(text[position]))
                position++;
        }
        
        function isSpace(ch) {
            if (ch <= ' ')
                return true;
                
            return false;
        }
    };
    
    function isLetter(ch) {
        return (ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z');
    }
    
    function isDigit(ch) {
        return ch >= '0' && ch <= '9';
    }

    function isOperator(ch) {
        return operators.indexOf(ch) >= 0;
    }

    return {
        Lexer : Lexer,
        TokenType: TokenType
    };
})();

if (typeof(window) === 'undefined') {
	module.exports = py2script;
}
