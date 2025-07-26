import { Client, Events, GatewayIntentBits } from 'discord.js'
import { config } from 'dotenv'
import * as hello from './commands/hello.js'
import * as time from './commands/time.js'

config()

const client = new Client({
    intents:[GatewayIntentBits.Guilds],
})

function readyDiscord(){
    console.log(`Bot ${client.user.tag} is running`)
}

async function handleInteraction(interaction){
    if(!interaction.isCommand()) return
    if(interaction.commandName === 'hello'){
        await hello.execute(interaction)
    }
    if(interaction.commandName === 'time'){
        await time.execute(interaction)
    }
}


client.once(Events.ClientReady, readyDiscord)

client.login(process.env.TOKEN)

// Events that occur multiple times
client.on(Events.InteractionCreate,handleInteraction)