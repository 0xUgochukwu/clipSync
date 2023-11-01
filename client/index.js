import { io } from "socket.io-client";
import * as readline from "readline";
import clipboard from "clipboardy";



const socket = io('http://localhost:4500', {
    transports: ["websocket", "polling"],
    autoconnect: true,
});
let sessionID;

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


function listenToClipboard() {
    let lastClip = clipboard.readSync();

    function checkClipboard() {
        const clip = clipboard.readSync();
        if (clip !== lastClip) {
            socket.emit('copy', sessionID, clip);
            lastClip = clip;
        }
    }

    // Check the clipboard every half second
    setInterval(checkClipboard, 500);
}
rl.question(`1. Start Session \n2. Join Session \n`, (reply) => {
    switch (reply) {
        case '1':
            sessionID = generateSessionID();
            console.log(`This is your session ID: ${sessionID}`);
            socket.emit('start', sessionID);
            socket.auth = {
                sessionID: sessionID
            };
            listenToClipboard();
            break;
        case '2':
            rl.question(`Enter your session ID: `, (res) => {
                socket.emit('join', res);
                sessionID = res;
                listenToClipboard();
            });
            break;
    }
});
