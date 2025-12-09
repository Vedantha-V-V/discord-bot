import { Client, Events, GatewayIntentBits } from 'discord.js';
import { config } from 'dotenv';
import connectDB from './db.js';
import * as hello from './commands/hello.js';
import * as time from './commands/help.js';
import { GoogleGenAI, Type } from '@google/genai';

// Google client configuration
const ai = new GoogleGenAI({});

config()
connectDB()

// Function Declaration
const getAllEventsDeclaration = {
  name: 'getAllEvents',
  description: 'Gets all the events that are in the database',
};

const getAnEventDeclaration = {
  name: 'getAnEvent',
  description: 'Get the event based on the required date',
  parameters: {
    type: Type.OBJECT,
    properties: {
      date: {
        type: Type.STRING,
        description: 'The date of the event name in the format DD/MM/YYYY',
      }
    },
    required: ['date'],
  },
};

const addAnEventDeclaration = {
  name: 'addAnEvent',
  description: 'Adding an event to the database',
  parameters: {
    type: Type.OBJECT,
    properties: {
      name: {
        type: Type.STRING,
        description: 'The event name',
      },
      date: {
        type: Type.STRING,
        description: 'The date of the event in the format DD/MM/YYYY',
      }
    },
    required: ['name','date'],
  },
};

const updateAnEventDeclaration = {
  name: 'updateAnEvents',
  description: 'Updates the name or date of the event',
  parameters: {
    type: Type.OBJECT,
    properties: {
      name: {
        type: Type.STRING,
        description: 'The updated event name',
      },
      date: {
        type: Type.STRING,
        description: 'The updated date of the event in the format DD/MM/YYYY',
      }
    },
    required: ['name','date'],
  },
};

const deleteEventsDeclaration = {
  name: 'deleteEvents',
  description: 'Deletes all events before today',
};


const client = new Client({
    intents:[GatewayIntentBits.Guilds,GatewayIntentBits.GuildMessages,GatewayIntentBits.MessageContent],
})

function readyDiscord(){
    console.log(`Bot ${client.user.tag} is running`)
}

async function handleInteraction(interaction){
    if(!interaction.isCommand()) return
    if(interaction.commandName === 'hello'){
        await hello.execute(interaction)
    }
    if(interaction.commandName === 'help'){
        await time.execute(interaction)
    }
}

client.once(Events.ClientReady, readyDiscord)

client.login(process.env.TOKEN)

client.on(Events.MessageCreate,async(message)=>{
    if(message.author.bot){
        return;
    }

    const prompt = `You are an expert event manager and I need your help to convert the below message into an argument and map it to a specific function for me, 
    remove any typos and neatly format the required message. If the year is not specified in the message then assume it is the ${new Date().getFullYear()} and the message:${message.content}`
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        tools: [{
          functionDeclarations: [getAllEventsDeclaration,getAnEventDeclaration,addAnEventDeclaration,updateAnEventDeclaration,deleteEventsDeclaration]
        }],
      },
    });

    // Check for function calls in the response
    if (response.functionCalls && response.functionCalls.length > 0) {
      const functionCall = response.functionCalls[0];
      console.log(`Function to call: ${functionCall.name}`);
      console.log(`Arguments: ${JSON.stringify(functionCall.args)}`);
      if(functionCall.name=="getAllEvents"){
        // Get all events
        console.log("Get all events")

      }else if(functionCall.name=="getAnEvent"){
        // Get an event
        console.log("Get an event")

      }else if(functionCall.name=="addAnEvent"){
        // add an event
        console.log("Add an event")

      }else if(functionCall.name=="updateAnEvent"){
        // Update an event
        console.log("Update an event")

      }else{
        //Delete an event
        console.log("Delete all events before today")
      }
    } else {
      const message = `${response.text} for further help you can use the /help command for more info.`;
    }
    message.channel.send(message)
})




client.on(Events.InteractionCreate,handleInteraction)