
var jpylexer = (function() {
    var TokenType = { Name: 1, Integer: 2, Real: 3, String: 4, Operator: 5, Separator: 6, EndOfLine: 7, Assignment: 8 };
    var operators = ["+" , "-", "*", "/", ".", ">", "<", "<=", ">=", "!=", "<>", "**", "==", "%"];
    var assignments = ["=" , "+=", "-=", "*=", "/="];
    var separators = "()[]{},:;";

    function Token(value, type)
    {
        this.value = value;
        this.type = type;
    };

    function Lexer(text) {
        var length = text ? text.length : 0;
        var position = 0;
        var next = [];

        this.nextToken = function() {
            if (next.length)
                return next.pop();

            var ch = nextFirstChar();

            if (ch == null)
                return null;

            if (isNameFirstCharacter(ch))
                return nextName(ch);

            if (isDigit(ch))
                return nextInteger(ch);

            if (isOperator(ch))
                return nextOperator(ch);

            if (isAssignment(ch))
                return nextAssignment(ch);

            if (isSeparator(ch))
                return nextSeparator(ch);

            if (ch === '"' || ch === "'")
                return nextString(ch);

            var ch2 = nextChar();

            if (ch2 && isOperator(ch + ch2))
                return new Token(ch + ch2, TokenType.Operator); 
            else if (ch2 && isAssignment(ch + ch2))
                return new Token(ch + ch2, TokenType.Assignment);
            else
                pushChar(ch2);

            if (isEndOfLine(ch))
                return nextEndOfLine(ch);

            throw "unexpected '" + ch + "'";
        };

        this.pushToken = function (token) {
            if (token)
                next.push(token);
        };

        this.getIndent = function () {
            var indent = 0;
            var ch;
            var pos = position;

            while (pos < length) {
                ch = text[pos];

                if (isEndOfLine(ch)) {
                    indent = 0;
                    pos++;
                    continue;
                }

                if (!isSpace(text[pos]))
                    break;

                indent++;
                pos++;
            }

            if (pos >= length)
                return 0;

            return indent;
        };

        function nextName(letter)
        {
            var name = letter;

            for (var ch = nextChar(); ch && isNameCharacter(ch); ch = nextChar())
                name += ch;

            pushChar(ch);

            return new Token(name, TokenType.Name);
        }

        function nextString(quote)
        {
            var value = '';

            for (var ch = nextChar(); ch && ch != quote; ch = nextChar())
                value += ch;

            return new Token(value, TokenType.String);
        }

        function nextInteger(digit)
        {
            var number = digit;

            for (var ch = nextChar(); ch && isDigit(ch); ch = nextChar())
                number += ch;

            if (ch === '.')
                return nextReal(number + '.');

            pushChar(ch);

            return new Token(number, TokenType.Integer);
        }

        function nextReal(number)
        {
            for (var ch = nextChar(); ch && isDigit(ch); ch = nextChar())
                number += ch;

            pushChar(ch);

            return new Token(number, TokenType.Real);
        }

        function nextEndOfLine(ch)
        {
            if (ch === '\r') {
                var ch2 = nextChar();
                if (ch2 === '\n')
                    ch += ch2;
                else
                    pushChar(ch2);
            }

            return new Token(ch, TokenType.EndOfLine);
        }

        function nextOperator(ch)
        {
            var ch2 = nextChar();
            if (ch2 && !isSpace(ch2) && isOperator(ch + ch2))
                return new Token(ch + ch2, TokenType.Operator);
            else if (ch2 && !isSpace(ch2) && isAssignment(ch + ch2))
                return new Token(ch + ch2, TokenType.Assignment);
            else
                pushChar(ch2);
            return new Token(ch, TokenType.Operator);
        }

        function nextAssignment(ch)
        {
            var ch2 = nextChar();
            if (ch2 && !isSpace(ch2) && isAssignment(ch + ch2))
                return new Token(ch + ch2, TokenType.Assignment);
            else if (ch2 && !isSpace(ch2) && isOperator(ch + ch2))
                return new Token(ch + ch2, TokenType.Operator);
            else
                pushChar(ch2);
            return new Token(ch, TokenType.Assignment);
        }

        function nextSeparator(ch)
        {
            return new Token(ch, TokenType.Separator);
        }

        function pushChar(ch)
        {
            if (ch != null)
                position--;
        }

        function nextChar() {
            while (true) {
                if (position >= length)
                    return null;

                var ch = text[position++];

                if (ch === '\\' && isEndOfLine(text[position])) {
                    if (text[position] == '\n') {
                        position++;
                        continue;
                    }
                    if (text[position] == '\r' && text[position+1] == '\n') {
                        position += 2;
                        continue;
                    }
                }

                if (ch === '#') {
                    for (ch = nextChar(); ch && !isEndOfLine(ch);)
                        ch = nextChar();
                    if (ch)
                        return ch;
                    return null;
                }

                break;
            }

            return ch;
        }

        function nextFirstChar() {
            skipSpaces();
            
            if (position >= length)
                return null;
                
            return nextChar();
        }

        function skipSpaces() {
            for (var ch = nextChar(); ch && isSpace(ch);)
                ch = nextChar();

            if (ch)
                pushChar(ch);
        }

        function isSpace(ch) {
            if (ch <= ' ' && ch !== '\n' && ch !== '\r')
                return true;
                
            return false;
        }

        function isEndOfLine(ch) {
            return ch === '\r' || ch === '\n';
        }
    }

    function isLetter(ch) {
        return (ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z');
    }

    function isDigit(ch) {
        return ch >= '0' && ch <= '9';
    }

    function isNameFirstCharacter(ch) {
        return isLetter(ch) || ch === '_';
    }

    function isNameCharacter(ch) {
        return isLetter(ch) || isDigit(ch) || ch === '_';
    }

    function isOperator(ch) {
        return operators.indexOf(ch) >= 0;
    }

    function isAssignment(ch) {
        return assignments.indexOf(ch) >= 0;
    }

    function isSeparator(ch) {
        return separators.indexOf(ch) >= 0;
    }

    return {
        createLexer : function (text) { return new Lexer(text); },
        TokenType: TokenType
    };
})();

if (typeof(window) === 'undefined') {
	module.exports = jpylexer;
}
