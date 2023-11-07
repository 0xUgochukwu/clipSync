import daemon from 'daemon';
// daemon();

import { io } from 'socket.io-client';
import argsParser from 'args-parser';
import Configstore from 'configstore';

const config = new Configstore('clipSync', {}, { globalConfigPath: true });

import helpers from "./helpers.js";

const args = argsParser(process.argv);
console.log(args);
console.log(config);
console.log(config.get('pid'));
const socket = io('http://clipsync.ugochukwu.tech:4500', {
    transports: ["websocket", "polling"],
    autoConnect: false,
});
socket.on('sync', (clip) => {
    clipboard.writeSync(clip);
});
socket.on('close', () => {
    socket.disconnect();
    process.kill(config.pid, signal = 'SIGTERM');
});



console.log(process.pid)
process.on('SIGHUP', async () => {
    if (socket.connected) {
        console.log("Leaving")
        socket.emit('leave');
        socket.on('disconnect', () => {
            console.log(`You have left the session with ID: ${config.sessionID}
        \nByyyeeeee`);
            process.exit(0);
        });
        config.clear();
        socket.disconnect();
    } else {
        console.log("You are not connected to any session");
    }
});

process.on('SIGTERM', async () => {
    if (socket.connected) {
        socket.emit('end');
        socket.on('disconnect', () => {
            console.log(`Sadly every good thing comes to an end 💀
        \nByyyeeeee`);
            console.log(config.get('pid'), "here")
            process.exit(0);
        });
        config.clear();
        socket.disconnect();
    } else {
        console.log("You are not connected to any session");
    }
})

const start = async () => {
    config.set('pid', process.pid);
    config.sessionID = config.get('sessionID') || config.set(
        'sessionID',
        helpers.generateSessionID()
    );
    console.log(config.get('sessionID'));
    socket.io.opts.query = {
        sessionID: config.get('sessionID'),
    }
    socket.on('connect', () => {
        socket.emit('join', config.get('sessionID'));
        console.log(`Your session has started with ID: ${config.sessionID}
        \nConnect your other devices with this ID to sync your clipboards`);
        daemon();
    });
    socket.connect();
    helpers.listenToClipboard(socket);
}

const join = async () => {
    config.set('pid', process.pid);
    config.set('sessionID', args.session);
    socket.io.opts.query = {
        sessionID: config.get('sessionID'),
    }
    socket.on('connect', () => {
        socket.emit('join');
        console.log(`You have joined the session with ID: ${config.sessionID}
        \nHappy Clipping ;)`);
        daemon();
    });
    socket.connect();
    helpers.listenToClipboard(socket);
}

if (args.start) {
    start();
} else if (args.join) {
    if (args.session && args.session.length === 6) {
        join();
    } else {
        console.log(`Usage: clipsync join --session=[ Session ID ]`);
    }
} else if (args.leave) {
    process.kill(config.get('pid'), 'SIGHUP');
} else if (args.end) {
    process.kill(config.get('pid'), 'SIGTERM')
} else {
    console.log(`Usage: clipsync [ command(start, join, leave, end) ] --session=[ Session ID ]`);
}
