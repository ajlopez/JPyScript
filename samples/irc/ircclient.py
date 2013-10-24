
import irc

server = process.argv[3] # irc.freenode.net
channel = process.argv[4] # #pyar
botname = process.argv[5] # jpybot

bot = new irc.Client(server, botname,{ channels: [ channel ] })

def on_join(channel, who):
    console.log('join', channel, who)
    
def on_message(from, to, text, message):
    console.log('from', from)
    console.log('to', to)
    console.log('text', text)
    console.log('message', message)        

bot.addListener('join', on_join)

bot.addListener('message', on_message)

