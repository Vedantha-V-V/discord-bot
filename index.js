import { Client, Events, GatewayIntentBits } from 'discord.js';
import { config } from 'dotenv';
import connectDB from './db.js';
import * as hello from './commands/hello.js';
import * as time from './commands/help.js';
import { GoogleGenAI, Type } from '@google/genai';
import { addEvent, getEvents, getEventByDate, updateEvent, deleteEvent } from './crud.js';

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

    let msgResponse = "";
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
        msgResponse = await getEvents();
      }else if(functionCall.name=="getAnEvent"){
        // Get an event
        const dateArg = functionCall.args && (functionCall.args.date || functionCall.args);
        msgResponse = await getEventByDate(dateArg);
      }else if(functionCall.name=="addAnEvent"){
        // add an event
        msgResponse = addEvent(functionCall.args);
      }else if(functionCall.name=="updateAnEvent"){
        // Update an event
        msgResponse = await updateEvent(functionCall.args);
      }else{
        //Delete an event
        msgResponse = await deleteEvent(functionCall.args || {});
      }
    } else {
      msgResponse = `${response.text} for further help you can use the /help command for more info.`;
    }

    // Ensure we never send an empty or non-string message to Discord
    if (Array.isArray(msgResponse)) {
      if (msgResponse.length === 0) {
        msgResponse = 'No events found.';
      } else {
        // Tabulate the events
        const headers = ['name','date'];
        
        const formattedEvents = msgResponse.map((item) => ({
            name: item.name,
            date: new Date(item.date).toISOString().split('T')[0].split('-').reverse().join('/')
        }));
        
        msgResponse = formattedEvents;

        // Determine max width for each column (simple approach)
        const columnWidths = {};
        headers.forEach(header => {
          columnWidths[header] = header.length;
        });

        msgResponse.forEach(item => {
          headers.forEach(header => {
            const valueLength = String(item[header]).length;
            if (valueLength > columnWidths[header]) {
              columnWidths[header] = valueLength;
            }
          });
        });

        // Build the header row string
        let res = "|";
        headers.forEach(header => {
          res += ` ${header.padEnd(columnWidths[header])} |`;
        });
        res += "\n";

        // Build the separator row string (for markdown table style look)
        res += "|";
        headers.forEach(header => {
          res += `-${''.padEnd(columnWidths[header], '-')}-|`;
        });
        res += "\n";
        
        // Build the data rows string
        msgResponse.forEach(item => {
          res += "|";
          headers.forEach(header => {
            res += ` ${String(item[header]).padEnd(columnWidths[header])} |`;
          });
          res += "\n";
        });
        msgResponse = `\`\`\`\n${res}\`\`\``;
      }
    } else if (msgResponse === undefined || msgResponse === null) {
      msgResponse = 'No response available.';
    } else if (typeof msgResponse !== 'string') {
      msgResponse = String(msgResponse);
    }

    await message.channel.send(msgResponse)
})

client.on(Events.InteractionCreate,handleInteraction)