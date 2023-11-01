import { io } from "socket.io-client";
import * as readline from "readline";
import clipboard from "clipboardy";



const socket = io('http://18.170.67.126', {
    transports: ["websocket", "polling"],
    autoconnect: false,
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
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';

    for (let i = 0; i < 6; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        result += charset.charAt(randomIndex);
    }

    return result;
}


function listenToClipboard() {
    let lastClip = clipboard.readSync();

    function checkClipboard() {
        const clip = clipboard.readSync();
        if (clip !== lastClip) {
            socket.emit('copy', clip);
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
            socket.io.opts.query = {
                sessionID,
            }
            socket.connect();
            socket.emit('join', sessionID);
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
