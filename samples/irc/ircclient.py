
import irc

server = process.argv[2]
channel = process.argv[3]
botname = process.argv[4]

var bot = new irc.Client(server, botname,{ channels: [ channel ] })

def on_join(channel, who):
    console.log('join', channel, who)
    
def on_message(from, to, text, message):
    if from:
        console.log('from', from)
    if to:
        console.log('to', to)
    if text:
        console.log('text', text)
    if message:
        console.log('message', message)
        

bod.addListener('join', on_join)

bot.addListener('message', on_message)