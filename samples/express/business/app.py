
# Module dependencies

import express
import path
import http
import customer

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
app.use(express.static('./public'))

# development only
if 'development' == app.get('env'):
    app.use(express.errorHandler())
    
def index(request, response):
    response.render('index', { 'title': 'My Business' })

def about(request, response):
    response.render('index', { 'title': 'About' })

def contact(request, response):
    response.render('index', { 'title': 'Contact' })

app.get('/', index)
app.get('/about', about)
app.get('/customer', customer.index)
app.get('/customer/:id', customer.view)
app.get('/contact', contact)

def started():
    console.log('Express server listening on port ' + app.get('port'))

server = http.createServer(app)
server.listen(app.get('port'), started)

