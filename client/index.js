// process.cwd = process.cwd();
// import daemon from "daemon";
// daemon();

import { io } from "socket.io-client";
import argsParser from 'args-parser';

import helpers from "./helpers.js";

const args = argsParser(process.argv);
console.log(args);
const vars = helpers.retrieveVars();
console.log(vars);
vars.pid = process.pid;
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



const start = () => {
    vars.sessionID = helpers.generateSessionID();
    console.log(vars.sessionID);
    socket.io.opts.query = {
        sessionID: vars.sessionID,
    }
    socket.on('connect', () => {
        socket.emit('join', vars.sessionID);
        console.log(`Your session has started with ID: ${vars.sessionID}
        \nConnect your other devices with this ID to sync your clipboards`);
    });
    socket.connect();
    helpers.updateVars(vars);
    helpers.listenToClipboard(socket);
}

const join = () => {
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
    helpers.updateVars(vars);
    helpers.listenToClipboard(socket);
}

const leave = () => {
    socket.emit('leave');
    socket.on('disconnect', () => {
        console.log(`You have left the session with ID: ${sessionID}
        \nByyyeeeee`);
        process.kill(vars.pid, signal = 'SIGTERM');
    });
    socket.disconnect();
}

const end = () => {
    socket.emit('end');
    socket.on('disconnect', () => {
        console.log(`Sadly every good comes to an end 💀
        \nByyyeeeee`);
        process.kill(vars.pid, signal = 'SIGTERM');
    });
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
    end();
} else {
    console.log(`Usage: clipsync [ command(start, join, leave, end) ] --session=[ Session ID ]`);
}
