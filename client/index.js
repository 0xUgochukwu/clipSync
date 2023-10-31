import { io } from "socket.io-client";
import * as readline from "readline";
import clipboardListener from "clipboard-event";
import clipboard from "clipboardy";


const socket = io('http://172.20.10.2:4500', {
    transports: ["websocket", "polling"],
    autoconnect: true,
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

function listenToClipboard() {
    let lastClip = clipboard.readSync();

    function checkClipboard() {
        const clip = clipboard.readSync();
        if (clip !== lastClip) {
            // Clipboard content has changed
            socket.emit('copy', sessionID, clip);
            lastClip = clip;
        }
    }

    // Check the clipboard every second
    setInterval(checkClipboard, 500);
}
rl.question(`1. Start Session \n2. Join Session \n`, (reply) => {
    switch (reply) {
        case '1':
            sessionID = generateSessionID();
            console.log(`This is your session ID: ${sessionID}`);
            socket.emit('start', sessionID);
            clipboardListener.startListening();
            listenToClipboard();
            break;
        case '2':
            rl.question(`Enter your session ID: `, (res) => {
                socket.emit('join', res);
                sessionID = res;
                clipboardListener.startListening();
                listenToClipboard();
            });
            break;
    }
});

clipboardListener.on('change', () => {
    const clip = clipboard.readSync();
    console.log(clip);
    socket.emit('copy', sessionID, clip);
});

