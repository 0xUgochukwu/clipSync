import { io } from "socket.io-client";
import * as readline from "readline";
import clipBoardListener from "./listener.js";
import clipboard from "clipboardy";

const socket = io('http://localhost:4500', {
    transports: ["websocket", "polling"],
    autoConnect: true,
});

socket.on('sync', (clip) => {
    clipboard.writeSync(clip);
});

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

function generateSessionID() {
    const code = Math.floor(1000 + Math.random() * 9000);
    return code.toString();
}

let sessionID;

rl.question(`1. Start Session \n2. Join Session \n`, (reply) => {
    switch (reply) {
        case '1':
            sessionID = generateSessionID();
            console.log(`This is your session ID: ${sessionID}`);
            socket.emit('start', sessionID);
            clipBoardListener.startListening();
            break;
        case '2':
            rl.question(`Enter your session ID: `, (res) => {
                socket.emit('join', res);
                sessionID = res;
                clipBoardListener.startListening();
            });
            break;
    }
});

clipBoardListener.on('change', () => {
    const clip = clipboard.readSync();
    console.log(clip);
    socket.emit('copy', sessionID, clip);
});

