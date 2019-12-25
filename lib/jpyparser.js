
if (typeof jpylexer === 'undefined')
    var jpylexer = require('./jpylexer');

const jpyparser = (function() {
    const TokenType = jpylexer.TokenType;
    
    function ConstantExpression(value) {
        this.compile = function () {
            return value;
        }
    }

    function NewExpression(expr) {
        this.compile = function () {
            return 'new ' + expr.compile();
        }
    }

    function MinusExpression(expr) {
        this.compile = function () {
            return '-' + expr.compile();
        }
    }

    function VariableExpression(name) {
        this.compile = function () {
            return name;
        }
        
        this.getName = function () { return name; }
    }

    function GlobalVariableCommand(name) {
        this.compile = function () {
            return '';
        }
        
        this.collectNames = function (names) {
            addGlobalName(name, names);
        }
    }

    function StringExpression(value) {
        const quote = "'";

        if (value && value.indexOf(quote) >= 0)
            quote = '"';

        this.compile = function () {
            return quote + value + quote;
        }
    }

    function DottedExpression(left, right) {
        this.compile = function () {
            return left.compile() + '.' + right.compile();
        }
    }

    function BinaryExpression(oper, left, right) {
        this.compile = function () {
            return left.compile() + ' ' + oper + ' ' + right.compile();
        }
    }

    function CallExpression(func, expressions) {
        const n = expressions.length;

        this.compile = function () {
            let code = func.compile() + '(';

            for (let k = 0; k < n; k++) {
                if (k)
                    code += ', ';
                code += expressions[k].compile();
            }

            return code + ')';
        }
    }

    function ListExpression(expressions) {
        const n = expressions.length;

        this.compile = function () {
            let code = '[';

            for (let k = 0; k < n; k++) {
                if (k)
                    code += ', ';
                code += expressions[k].compile();
            }

            return code + ']';
        }
    }

    function DictionaryExpression(keyvalues) {
        const n = keyvalues.length;

        this.compile = function () {
            let code = '{ ';

            for (let k = 0; k < n; k++) {
                if (k)
                    code += ', ';
                code += keyvalues[k].key.compile() + ': ' + keyvalues[k].value.compile();
            }
            
            if (k)
                code += ' ';

            return code + '}';
        }
    }

    function GroupExpression(expr) {
        this.compile = function () {
            return '(' + expr.compile() + ')';
        }
    }

    function IndexExpression(expr, index) {
        this.compile = function () {
            return expr.compile() + '[' + index.compile() + ']';
        };
    }

    function BreakCommand() {
        this.compile = function () {
            return 'break;';
        };
    }

    function ContinueCommand() {
        this.compile = function () {
            return 'continue;';
        };
    }

    function PassCommand() {
        this.compile = function () {
            return '';
        };
    }

    function ForInCommand(name, expr, cmd) {
        this.compile = function (options) {
            options = options || { };
            let code = '';
            
            if (options.withvars)
                code += compileVars(this, options.names);
                
            code += 'forEach(' + expr.compile() + ', function($item) { ' + name + ' = $item; ' + cmd.compile() + ' });';
            
            return code;
        };
        
        this.collectNames = function (names) {
            addVarName(name, names);
            if (cmd.collectNames)
                cmd.collectNames(names);
        }
    }

    function ExpressionCommand(expr) {
        this.compile = function () {
            return expr.compile() + ';';
        };
    }

    function ReturnCommand(expr) {
        this.compile = function () {
            return 'return ' + expr.compile() + ';';
        };
    }
    
    function ImportCommand(name) {
        this.compile = function (options) {
            options = options || { };
            let code = '';
            
            if (!options.names)
                options.names = { };
            
            if (options.withvars)
                code += compileVars(this, options.names);
            else if (options.exports)
                this.collectNames(options.names);
                
            code += name + " = importModule('" + name + "');";
            
            if (options.exports)
                code += compileExports(options.names);
            
            return code;
        }
        
        this.collectNames = function (names) {
            addVarName(name, names);
        }
    }

    function AssignmentCommand(left, expr, oper) {
        oper = oper || '=';
        
        this.compile = function (options) {
            options = options || { };
            let code = '';
            
            if (!options.names)
                options.names = { };
            
            if (options.withvars)
                code += compileVars(this, options.names);
            else if (options.exports)
                this.collectNames(options.names);
            
            code += left.compile() + ' ' + oper + ' ' + expr.compile() + ';';
            
            if (options.exports)
                code += compileExports(options.names);
            
            return code;
        };
        
        this.collectNames = function (names) {
            if (left.getName)
                addVarName(left.getName(), names);
        }
    }
    
    function AssertCommand(expr) {
        this.compile = function (options) {
            let code = "if (__debug__ && !(" + expr.compile(options) + ")) { throw 'assert error' }";
            return code;
        }
    }
    
    function RaiseCommand(expr) {
        this.compile = function (options) {
            let code = "throw " + expr.compile(options) + ";";
            return code;
        }
    }

    function IfCommand(cond, thencmd, elsecmd) {
        this.compile = function (options) {
            options = options || { };
            let code = '';
            
            if (options.withvars)
                code += compileVars(this, options.names);
                
            code += 'if (' + cond.compile(options) + ') { ' + thencmd.compile(options) + ' }';

            if (elsecmd)
                code += ' else { ' + elsecmd.compile(options) + ' }';
                
            return code;
        };
        
        this.collectNames = function (names) {
            if (thencmd.collectNames)
                thencmd.collectNames(names);
            if (elsecmd && elsecmd.collectNames)
                elsecmd.collectNames(names);
        }
    }

    function WhileCommand(cond, body) {
        this.compile = function (options) {
            options = options || { };
            let code = '';
            
            if (options.withvars)
                code += compileVars(this, options.names);
                
            code += 'while (' + cond.compile() + ') { ' + body.compile() + ' }';
            
            return code;
        }
        
        this.collectNames = function (names) {
            if (body.collectNames)
                body.collectNames(names);
        }
    }

    function DefCommand(name, args, body) {
        const nargs = args.length;

        this.compile = function(options) {
            options = options || { };
            let code = 'function ' + name + '(';
            
            if (options.exports) {
                if (!options.names)
                    options.names = { };
                addDefName(name, args, options.names);
            }

            for (let k = 0; k < nargs; k++) {
                if (k)
                    code += ', ';
                code += args[k];
            }

            code += ') { ' + body.compile({ withvars: true, names: { vars: [], defs: [], args: args.slice() } }) + ' }';
            
            if (options.exports)
                code += compileExports(options.names);

            return code;
        }
        
        this.collectNames = function (names) {
            addDefName(name, args, names);
        }
    }

    function ClassCommand(name, body) {
        this.compile = function(options) {
            options = options || { };
            
            if (!options.names)
                options.names = { };

            if (options.exports)
                addDefName(name, [], options.names);

            let code = 'const ' + name + ' = (function() { const $class = makeClass(__init__); const $obj = $class.obj; const $cons = $class.cons; ';

            const newoptions = { withvars: true, names: { } };
            
            code += body.compile(newoptions);
            
            if (body.collectNames)
                body.collectNames(newoptions.names);
                
            code += compileSelfDefs(newoptions.names);
            
            if (!newoptions.names || !newoptions.names.defs || newoptions.names.defs.indexOf('__init__') < 0)
                code += ' function __init__() { }';
                
            code += ' return $cons;'
            code += ' })();';
            
            if (options.exports)
                code += compileExports(options.names);

            return code;
        }
        
        this.collectNames = function (names) {
            addDefName(name, [], names);
        }
    }

    function CompositeCommand(cmds) {
        const n = cmds.length;
        
        this.compile = function(options) {
            options = options || { };
            let code = '';
            
            if (!options.names)
                options.names = { };
                
            if (options.withvars)
                code += compileVars(this, options.names);
            else if (options.exports)
                this.collectNames(options.names);
            
            for (let k = 0; k < n; k++) {
                if (k && code != '')
                    code += ' ';
                code += cmds[k].compile();
            }
            
            if (options.exports)
                code += compileExports(options.names);
            
            return code;
        }
        
        this.collectNames = function (names) {
            for (let k = 0; k < n; k++)
                if (cmds[k].collectNames)
                    cmds[k].collectNames(names);
        }
    }
    
    function addGlobalName(name, names) {
        if (!names.globals)
            names.globals = [ ];
            
        if (names.globals.indexOf(name) >= 0)
            return;
            
        names.globals.push(name);
    }
    
    function addVarName(name, names) {
        if (names.globals && names.globals.indexOf(name) >= 0)
            return;
            
        if (names.args && names.args.indexOf(name) >= 0)
            return;

        if (names.defs && names.defs.indexOf(name) >= 0)
            return;
            
        if (names.vars && names.vars.indexOf(name) >= 0)
            return;
            
        if (!names.vars)
            names.vars = [ ];
            
        names.vars.push(name);
    }
    
    function addDefName(name, args, names) {
        if (names.globals && names.globals.indexOf(name) >= 0)
            return;
            
        if (names.args && names.args.indexOf(name) >= 0)
            return;

        if (names.defs && names.defs.indexOf(name) >= 0)
            return;
            
        if (names.vars && names.vars.indexOf(name) >= 0)
            return;
            
        if (!names.defs)
            names.defs = [ ];
            
        if (!names.defargs)
            names.defargs = { };
            
        names.defs.push(name);
        names.defargs[name] = args;
    }
    
    function compileExports(names) {
        let code = ' return { ';
        
        for (let k = 0; names.vars && k < names.vars.length; k++) {
            if (k)
                code += ', ';
            code += names.vars[k] + ': ' + names.vars[k];
        }
        
        for (let j = 0; names.defs && j < names.defs.length; j++) {
            if (k + j)
                code += ', ';
            code += names.defs[j] + ': ' + names.defs[j];
        }
        
        code += ' };';
        
        return code;
    }
    
    function compileSelfDefs(names) {
        let code = '';
        
        if (!names || !names.defs || !names.defargs)
            return code;
            
        names.defs.forEach(function (defname) {
            if (!names.defargs[defname] || names.defargs[defname][0] != 'self')
                return;
            
            if (code != '')
                code += ' ';
                
            code += '$cons.' + defname + ' = ' + defname + ';';
            code += ' $obj.prototype.' + defname + ' = function (';
            
            const arglist = '';
            
            for (let k = 1; k < names.defargs[defname].length; k++) {
                if (arglist != '')
                    arglist += ', ';
                arglist += names.defargs[defname][k];
            }
            
            code += arglist + ') { return ' + defname + '(this';
            
            if (arglist != '')
                code += ', ' + arglist;
                
            code += '); };';
        });
        
        return code;
    }
    
    function compileVars(cmd, names) {
        if (!cmd.collectNames)
            return '';
        
        if (!names)
            names = {};
            
        if (!names.vars)
            names.vars = [];
            
        if (!names.defs)
            names.defs = [];
            
        if (!names.args)
            names.args = [];
        
        cmd.collectNames(names);
        
        let code = '';
        
        names.vars.forEach(function(varname) { code += 'const ' + varname + '; ' });
        
        return code;
    }
    
    function Parser(text) {
        const lexer = jpylexer.createLexer(text);
        const self = this;
        const skipnewline = false;

        this.parseExpression = function () {
            const expr = parseSimpleExpression();

            if (expr == null)
                return null;

            for (let oper = tryParseOperator(); oper; oper = tryParseOperator())
                expr = new BinaryExpression(oper, expr, parseSimpleExpression());

            return expr;
        }

        this.parseCommand = function (indent) {
            indent = indent || 0;
            const cmd = parseSimpleCommand(indent);

            if (cmd == null)
                return null;

            const cmds = [ cmd ];

            while (tryParseEndOfCommand()) {
                cmd = parseSimpleCommand(indent);
                if (cmd == null)
                    break;                
                cmds.push(cmd);
            }

            if (cmds.length == 1)
                return cmds[0];

            return new CompositeCommand(cmds);
        }

        function parseSimpleExpression() {
            const expr = parseTerm();

            if (expr == null)
                return null;

            while (true) {
                if (tryParseToken('[', TokenType.Separator)) {
                    const index = self.parseExpression();
                    parseToken(']', TokenType.Separator);
                    
                    expr = new IndexExpression(expr, index);
                }
                else if (tryParseToken('(', TokenType.Separator)) {
                    const exprs = parseExpressionList();
                    parseToken(')', TokenType.Separator);

                    expr = new CallExpression(expr, exprs);
                }
                else if (tryParseToken('.', TokenType.Operator)) {
                    expr = new DottedExpression(expr, parseTerm());
                }
                else
                    break;
            }

            return expr;
        }

        function parseSimpleCommand(indent) {
            const token = nextToken();

            while (token != null && token.type == TokenType.EndOfLine)
                token = nextToken();

            if (token == null)
                return null;            

            if (token.type != TokenType.Name) {
                lexer.pushToken(token);
                return parseExpressionCommand();
            }

            if (token.value === 'break')
                return new BreakCommand();
            if (token.value === 'continue')
                return new ContinueCommand();
            if (token.value === 'pass')
                return new PassCommand();
                
            if (token.value === 'import') {
                const name = parseName();
                return new ImportCommand(name);
            }

            if (token.value === 'def') {
                const name = parseName();
                parseToken('(', TokenType.Separator);
                const originalskip = skipnewline;
                skipnewline = true;
                const names = parseNames();
                parseToken(')', TokenType.Separator);
                skipnewline = originalskip;
                parseToken(':', TokenType.Separator);
                const cmd = parseSuite(indent);
                return new DefCommand(name, names, cmd);
            }
            
            if (token.value === 'class') {
                const name = parseName();
                parseToken(':', TokenType.Separator);
                const cmd = parseSuite(indent);
                return new ClassCommand(name, cmd);
            }
            
            if (token.value === 'return')
                return new ReturnCommand(self.parseExpression());

            if (token.value === 'if') {
                const cond = self.parseExpression();
                parseToken(':', TokenType.Separator);
                const thencmd = parseSuite(indent);
                const elsecmd = null;

                token = nextToken();

                if (token && token.type == TokenType.EndOfLine && lexer.getIndent() === indent && tryParseToken("else", TokenType.Name)) {
                    parseToken(':', TokenType.Separator);
                    elsecmd = parseSuite(indent);
                }
                else
                    lexer.pushToken(token);

                return new IfCommand(cond, thencmd, elsecmd);
            }
            
            if (token.value === 'assert') {
                const expr = self.parseExpression();
                
                return new AssertCommand(expr);
            }
            
            if (token.value === 'raise') {
                const expr = self.parseExpression();
                
                return new RaiseCommand(expr);
            }
            
            if (token.value === 'global' || token.value === 'nonlocal') {
                const name = parseName();
                
                return new GlobalVariableCommand(name);
            }

            if (token.value === 'for') {
                const name = parseName();
                parseToken('in', TokenType.Name);
                const expr = self.parseExpression();
                parseToken(':', TokenType.Separator);
                const cmd = parseSuite(indent);

                return new ForInCommand(name, expr, cmd);
            }

            if (token.value === 'while') {
                const cond = self.parseExpression();
                parseToken(':', TokenType.Separator);
                const cmd = parseSuite(indent);

                return new WhileCommand(cond, cmd);
            }

            lexer.pushToken(token);
            const expr = self.parseExpression();

            const assign = tryParseAssignment();

            if (assign)
                return new AssignmentCommand(expr, self.parseExpression(), assign);

            return new ExpressionCommand(expr);
        }

        function parseSuite(indent) {
            if (tryParseEndOfLine())
                return parseMultiLineSuite(indent);

            return parseSingleLineSuite(indent);
        }

        function parseSingleLineSuite(indent) {
            const cmd = parseSimpleCommand(indent);

            if (!tryParseToken(';', TokenType.Separator))
                return cmd;

            const cmds = [ cmd ];

            for (cmds.push(parseSimpleCommand()); tryParseToken(';', TokenType.Separator); )
                cmds.push(parseSimpleCommand(indent));

            return new CompositeCommand(cmds);
        }

        function parseMultiLineSuite(indent) {
            const cmds = [];
            const newindent = lexer.getIndent();

            if (newindent <= indent)
                throw "invalid indent";

            while (true) {
                cmds.push(parseSingleLineSuite(newindent));
                const token = parseEndOfLine();
                const nextindent = lexer.getIndent();
                if (nextindent > newindent)
                    throw "invalid indent";
                if (nextindent < newindent)
                    break;
            }

            if (token)
                lexer.pushToken(token);

            return new CompositeCommand(cmds);
        }

        function parseExpressionCommand() {
            return new ExpressionCommand(self.parseExpression());
        }

        function parseExpressionList() {
            const list = [];

            for (let token = nextToken(); token != null && !(token.type === TokenType.Separator && [')', ']'].indexOf(token.value) >= 0); token = nextToken()) {
                lexer.pushToken(token);
                const expr = self.parseExpression();
                list.push(expr);
                
                if (!tryParseToken(',', TokenType.Separator))
                    return list;
            }

            if (token == null)
                throw "unexpected end of input";

            lexer.pushToken(token);

            return list;
        }

        function parseKeyValueList() {
            const list = [];

            for (let token = nextToken(); token != null && !(token.type === TokenType.Separator && token.value === '}'); token = nextToken()) {
                lexer.pushToken(token);
                const key = self.parseExpression();
                parseToken(':', TokenType.Separator);
                const value = self.parseExpression();                
                list.push({ key: key, value: value });
                
                if (!tryParseToken(',', TokenType.Separator))
                    return list;
            }

            if (token === null)
                throw "unexpected end of input";

            lexer.pushToken(token);

            return list;
        }
        
        function parseTerm() {
            const token = nextToken();
            
            if (token == null)
                return null;
                
            if (token.type === TokenType.Integer)
                return new ConstantExpression(token.value);
                
            if (token.type === TokenType.Real)
                return new ConstantExpression(token.value);
                
            if (token.type === TokenType.String)
                return new StringExpression(token.value);
                
            if (token.type === TokenType.Name) {
                if (token.value == "None")
                    return new ConstantExpression("null");
                if (token.value == "True")
                    return new ConstantExpression("true");
                if (token.value == "False")
                    return new ConstantExpression("false");
                    
                if (token.value == 'new')
                    return new NewExpression(self.parseExpression())
                    
                return new VariableExpression(token.value);
            }

            if (token.type === TokenType.Separator && token.value === "(") {
                const originalskip = skipnewline;
                skipnewline = true;
                const expr = self.parseExpression();
                parseToken(')', TokenType.Separator);
                skipnewline = originalskip;
                return new GroupExpression(expr);
            }

            if (token.type === TokenType.Separator && token.value === "[") {
                const originalskip = skipnewline;
                skipnewline = true;
                const exprs = parseExpressionList();
                parseToken(']', TokenType.Separator);
                skipnewline = originalskip;
                return new ListExpression(exprs);
            }

            if (token.type === TokenType.Separator && token.value === "{") {
                const originalskip = skipnewline;
                skipnewline = true;
                const keyvalues = parseKeyValueList();
                parseToken('}', TokenType.Separator);
                skipnewline = originalskip;
                return new DictionaryExpression(keyvalues);
            }

            if (token.type === TokenType.Operator && token.value === '-')
                return new MinusExpression(parseTerm());
        }
        
        function tryParseOperator() {
            const token = nextToken();
            
            if (token === null)
                return null;
                
            if (token.type === TokenType.Operator)
                return token.value;
                
            lexer.pushToken(token);
            
            return null;
        }
        
        function tryParseAssignment() {
            const token = nextToken();
            
            if (token === null)
                return null;
                
            if (token.type === TokenType.Assignment)
                return token.value;
                
            lexer.pushToken(token);
            
            return null;
        }

        function parseNames() {
            const names = [];

            for (let name = tryParseName(); name; name = tryParseName()) {
                names.push(name);
                if (!tryParseToken(',', TokenType.Separator))
                    break;
            }

            return names;
        }
        
        function tryParseName() {
            const token = nextToken();
            
            if (token === null)
                return null;
                
            if (token.type === TokenType.Name)
                return token.value;
                
            lexer.pushToken(token);
            
            return null;
        }

        function parseName() {
            const token = nextToken();

            if (token !== null && token.type === TokenType.Name)
                return token.value;

            throw "name expected";
        }
        
        function parseToken(value, type) {
            if (!tryParseToken(value, type))
                throw "expected '" + value + "'";
        }
        
        function tryParseEndOfCommand() {
            return tryParseToken(';', TokenType.Separator) || tryParseEndOfLine();
        }

        function parseEndOfLine() {
            const token = nextToken();

            if (token === null)
                return null;

            if (token.type === TokenType.EndOfLine)
                return token;

            lexer.pushToken(token);

            throw 'end of line expected';
        }

        function tryParseEndOfLine() {
            const token = nextToken();

            if (token === null)
                return false;

            if (token.type === TokenType.EndOfLine)
                return true;

            lexer.pushToken(token);

            return false;
        }
        
        function tryParseToken(value, type) {
            const token = nextToken();
            
            if (token === null)
                return false;

            if (token.type === type && token.value === value)
                return true;
                
            lexer.pushToken(token);
            
            return false;
        }

        function nextToken() {
            const token = lexer.nextToken();

            if (skipnewline)
                while (token && token.type == TokenType.EndOfLine)
                    token = lexer.nextToken();

            return token;
        }
    }

    return {
        createParser: function (text) { return new Parser(text); }
    };
})();

if (typeof module !== 'undefined' && module && module.exports)
	module.exports = jpyparser;
