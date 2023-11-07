import daemon from "daemon";
// daemon();

import { io } from "socket.io-client";
import argsParser from 'args-parser';

import helpers from "./helpers.js";

const args = argsParser(process.argv);
console.log(args);
const vars = await helpers.retrieveVars();
console.log(vars);
console.log(vars.pid);
const socket = io('http://clipsync.ugochukwu.tech:4500', {
    transports: ["websocket", "polling"],
    autoConnect: false,
});
socket.on('sync', (clip) => {
    clipboard.writeSync(clip);
});
socket.on('end', () => {
    socket.disconnect();
    process.kill(vars.pid, signal = 'SIGTERM');
});

console.log(process.pid)
process.on('SIGHUP', () => {
    console.log("Leaving")
    process.exit(0);
});

process.on('SIGTERM', async () => {
    socket.emit('end');
    socket.on('disconnect', () => {
        console.log(`Sadly every good comes to an end 💀
        \nByyyeeeee`);
        console.log(vars.pid, "here")
        process.kill(vars.pid, 'SIGTERM');
    });
    await helpers.updateVars({});
    socket.disconnect();
    process.exit(0);
})

const start = async () => {
    vars.pid = process.pid;
    vars.sessionID = vars.sessionID || helpers.generateSessionID();
    console.log(vars.sessionID);
    socket.io.opts.query = {
        sessionID: vars.sessionID,
    }
    socket.on('connect', () => {
        socket.emit('join', vars.sessionID);
        console.log(`Your session has started with ID: ${vars.sessionID}
        \nConnect your other devices with this ID to sync your clipboards`);
        daemon();
    });
    socket.connect();
    await helpers.updateVars(vars);
    helpers.listenToClipboard(socket);
}

const join = async () => {
    vars.pid = process.pid;
    vars.sessionID = args.session;
    socket.io.opts.query = {
        sessionID: vars.sessionID,
    }
    socket.on('connect', () => {
        socket.emit('join', vars.sessionID);
        console.log(`You have joined the session with ID: ${sessionID}
        \nHappy Clipping ;)`);
    });
    socket.connect();
    await helpers.updateVars(vars);
    helpers.listenToClipboard(socket);
}

const leave = async () => {
    socket.emit('leave');
    socket.on('disconnect', () => {
        console.log(`You have left the session with ID: ${sessionID}
        \nByyyeeeee`);
        process.kill(vars.pid, 'SIGTERM');
    });
    await helpers.updateVars({});
    socket.disconnect();
}



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
    process.kill(vars.pid, 'SIGTERM')
} else {
    console.log(`Usage: clipsync [ command(start, join, leave, end) ] --session=[ Session ID ]`);
}
