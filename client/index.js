import { io } from "socket.io-client";
import argsParser from 'args-parser';

import * as helpers from "./helpers.js";

const args = argsParser(process.argv);
console.log(args);
const socket = io('clipsync.ugochukwu.tech:4500', {
    transports: ["websocket", "polling"],
    autoconnect: false,
});
socket.on('sync', (clip) => {
    clipboard.writeSync(clip);
});
socket.on('end', () => {
    socket.disconnect();
    process.kill(process.pid, signal = 'SIGTERM');
});
let sessionID;

if (args.start) {
    start();
} else if (args.join) {
    if (args.session) {
        join();
    } else {
        console.log(`Usage: clipsync join --session=[ Session ID ]`);
    }
} else if (args.leave) {
    leave();
} else if (args.end) {
    end();
} else {
    console.log(`Usage: clipsync [ command(start, join, leave, end) ] --session=[ Session ID ]`);
}


const start = () => {
    sessionID = helpers.generateSessionID();
    socket.io.opts.query = {
        sessionID,
    }
    socket.connect();
    socket.on('connect', () => {
        socket.emit('join', sessionID);
        console.log(`Your session has started with ID: ${sessionID}
        \n Connect your other devices with this ID to sync your clipboards`);
    });
    helpers.listenToClipboard();
}

const join = () => {
    sessionID = args.session;
    socket.io.opts.query = {
        sessionID,
    }
    socket.on('connect', () => {
        socket.emit('join', sessionID);
        console.log(`You have joined the session with ID: ${sessionID}
        \n Happy Clipping ;)`);
    });
    socket.connect();
    helpers.listenToClipboard();
}

const leave = () => {
    socket.emit('leave');
    socket.on('disconnect', () => {
        console.log(`You have left the session with ID: ${sessionID}
        \n Byyyeeeee`);
        process.kill(process.pid, signal = 'SIGTERM');
    });
    socket.disconnect();
}

const end = () => {
    socket.emit('end');
    socket.on('disconnect', () => {
        console.log(`Sadly every good comes to an end 💀
        \n Byyyeeeee`);
        process.kill(process.pid, signal = 'SIGTERM');
    });
    socket.disconnect();

}
