
# Module dependencies

import express
import http

app = express()

app.engine('ejs', require('ejs-locals'))

# all environments

app.set('port', process.env.PORT || 3000)
app.set('views', './views')
app.set('view engine', 'ejs')
app.use(express.favicon())
app.use(express.logger('dev'))
app.use(express.bodyParser())
app.use(express.methodOverride())
app.use(express.cookieParser('your secret here'))
app.use(express.session())
app.use(app.router)
app.use(express.static('./public')))

// development only
if ('development' == app.get('env')):
    app.use(express.errorHandler())
    
def index(request, response):
    response.render('index', { 'title': 'Bootstrap Sample' })

app.get('/', routes.index)

def started():
    console.log('Express server listening on port ' + app.get('port'))

http.createServer(app).listen(app.get('port'), started);
