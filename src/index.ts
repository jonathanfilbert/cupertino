import {Client,  middleware, TextEventMessage, MessageEvent, WebhookEvent} from '@line/bot-sdk';
import {STORES, DIGIMAP_GR_CODE, DIGIMAP_PB_CODE, G_URL, PB_URL} from './utils/constants';
import {DigimapCheckProductType, Command, Store} from './utils/types';
import * as dotenv from 'dotenv';
import express from 'express';
import axios from 'axios';
import {table} from 'table';
import moment from 'moment';

dotenv.config();

export const config = {
    channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN as string,
    channelSecret: process.env.CHANNEL_SECRET as string
}


// New Line SDK Client
const client = new Client(config);

const app = express();

const handleEvent = (event:WebhookEvent) => {
    if(event.type ==="message"){
        return Promise.resolve((event as MessageEvent));
    }
    else{
        return Promise.reject(event);
    }
}

const sendMessage = (message:string) => {
    client.pushMessage(process.env.USER_ID as string, {type:'text', text:message});
}

const getProductStatusFromIbox = (url:string) => {
    return axios.get(url);
}


const getProductStatusFromDigimap = (product_code:string) => {
    const config:DigimapCheckProductType = {
        product_code:product_code,
        quantity:1,
        store_code:null,
        store_group_code:null,
    }
    return axios.post(PB_URL.digimap, config, {headers: {origin: "https://www.digimap.co.id", referrer:"https://www.digimap.co.id", project_code:"digimap"}})
}

const fetchDataFromIbox = async () => {
    const pacificBlue = await getProductStatusFromIbox(PB_URL.ibox).then((res:any) => res.quantity_status ? "Ada" : "Habis");
    const graphite = await getProductStatusFromIbox(G_URL.ibox).then((res:any) => res.quantity_status ? "Ada" : "Habis");
    const data = [
        ["Pacific Blue", "Graphite"],
        [pacificBlue, graphite]
    ]
    return `Kondisi Ibox untuk iPhone 12 Pro 128 Gb: \n ${table(data)}`;
}

const fetchDataFromDigimap = async () => {
     // do digimap
     const pacificBlue = await getProductStatusFromDigimap(DIGIMAP_PB_CODE).then((res:any) => res.data.result_data.inventory_available ? "Ada" : "Habis");
     const graphite = await getProductStatusFromDigimap(DIGIMAP_GR_CODE).then((res:any) => res.data.result_data.inventory_available ? "Ada" : "Habis");
     const data = [
         ["Pacific Blue", "Graphite"],
         [pacificBlue, graphite]
     ]
     return `Kondisi Digimap untuk iPhone 12 Pro 128 Gb: \n ${table(data)}`;
}

const fetchAll = async () => {
    let res = "";
    res = await fetchDataFromIbox();
    res += "\n";
    res += await fetchDataFromDigimap();
    return res
}

const getMessageByCommand = async (command:Command) => {
    let message = ""
    if(command === "ibox"){
       message = await fetchDataFromIbox();
    }
    else if (command === "digimap"){
       message = await fetchDataFromDigimap();
    }
    else if (command === "all"){
        message = await fetchAll();
    }
    else{
        return "Wrong Command";
    }
    return `${message} \n time: \n ${moment().format("DD MMMM YYYY, h:mm:ss a")}`;
}

const HELPER_MESSAGE = `Welcome to the bot \n 
Here are the command(s) that you can use:
1. /ibox ===> check the ibox stock status
2. /digimap ===> check digimap status
3. /all ===> check both ibox and digimap status
4. help ===> show this help
`;

const handleMessage = async (message:MessageEvent[]) => {
    const msg:TextEventMessage = message[0].message as TextEventMessage;
    try{
        const parsedCommand:string = msg.text.split("/")[1];
        if(parsedCommand === "help"){
            sendMessage(HELPER_MESSAGE);
            return;
        }
        if(!STORES.includes(parsedCommand)){
            throw new Error();
        }
        else{
        return await getMessageByCommand(parsedCommand as Store);
    }
            
    }
    catch(e){
        throw new Error(e);
    }
}

app.post("/message/",middleware(config),(req,res) => {
    Promise.all(req.body.events.map((event:WebhookEvent) => handleEvent(event))).then(async (result:any) => {
        const message = await handleMessage(result);
        sendMessage(message as string);
        return res.sendStatus(200);
    }).catch(() => {
        sendMessage(`Maaf, tipe pesan tidak disupport\n ${HELPER_MESSAGE}`);
    });
})

app.post("/all/", async (_ , res) => {
    const result = await fetchAll();
    const message = `${result} \n time: \n ${moment().format("DD MMMM YYYY, h:mm:ss a")}`;
    sendMessage(message as string);
    return res.sendStatus(200);
})

app.get("/", (_,res) => {
    return res.send("All work and no play makes Jack a dull boy.");
})

app.listen(3003, () => {console.log("Listening on port 3000...")});
