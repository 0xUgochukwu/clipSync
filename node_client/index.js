#!/usr/bin/env node

import { io } from 'socket.io-client';
import argsParser from 'args-parser';
import clipboard from "clipboardy";
import Configstore from 'configstore';

import helpers from './helpers.js';
import daemonize from './daemonizer.js';


const config = new Configstore('clipSync', {}, { globalConfigPath: true });
const args = argsParser(process.argv);


const socket = io('ws://18.170.67.126:4500', {
    transports: ['websocket', 'polling'],
    autoConnect: false,
});
socket.on('sync', (clip) => {
    clipboard.writeSync(clip);
});
socket.on('close', () => {
    config.clear();
    socket.disconnect();
    process.exit(0);
    // process.kill(config.get('pid'), signal = 'SIGTERM');
});

socket.on('connect_error', err => {
    config.clear();
    helpers.handleErrors(err)
});
socket.on('connect_failed', err => {
    config.clear();
    helpers.handleErrors(err)
});



process.on('SIGHUP', async () => {
    if (socket.connected) {
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
            process.exit(0);
        });
        config.clear();
        socket.disconnect();
    } else {
        console.log('You are not connected to any session');
    }
})

const start = async () => {
    config.set('pid', process.pid);
    socket.io.opts.query = {
        starting: true,
    }
    socket.on('started', (sessionID) => {
        config.sessionID = config.set('sessionID', sessionID);
        console.log(`Your session has started with ID: ${config.get('sessionID')}
        \nConnect your other devices with this ID to sync your clipboards`);
        daemonize();
    });
    socket.on('connect', () => {
        socket.emit('start');
    });
    socket.connect();
}

const join = async () => {
    config.set('pid', process.pid);
    socket.io.opts.query = {
        sessionID: args.session,
    };
    socket.on('joined', (sessionID) => {
        config.set('sessionID', sessionID);
        console.log(`You have joined the session with ID: ${config.get('sessionID')}
        \nHappy Clipping ;)`);
        daemonize();
    });
    socket.on('connect', () => {
        socket.emit('join');
    });
    socket.connect();
    helpers.listenToClipboard(socket);
}

if (args.start) {
    if (process.env.__daemon) {
        args.session = config.get('sessionID');
        join();
    } else {
        const currentSession = config.get('sessionID');
        if (currentSession) {
            console.log(`You're already in session ${currentSession}`);
        } else start();
    };
} else if (args.join) {
    if (args.session) {
        if (/^[A-Z0-9]{6}$/.test(args.session)) {
            join();
        } else {
            console.log('[ClipSync]: Invalid Session ID');
        }
    } else {
        console.log('Usage: clipsync join --session=[ Session ID ]');
    }
} else if (args.session) {
    const session = config.get('sessionID');
    if (session) {
        console.log(`You're in session ${session}`);
    } else {
        console.log(`You don't have any ongoing session`);
    }
} else if (args.leave) {
    const session = config.get('sessionID');
    if (session) {
        process.kill(config.get('pid'), 'SIGHUP');
        console.log('Byeeeeee!');
    } else {
        console.log(`You don't have any ongoing session`);
    }
} else if (args.end) {
    const session = config.get('sessionID');
    if (session) {
        process.kill(config.get('pid'), 'SIGTERM');
        console.log('Byeeeeee!');
    } else {
        console.log(`You don't have any ongoing session`);
    }
} else {
    console.log(`Usage: clipsync [ command(start, join, leave, end) ] --session=[ Session ID ]`);
}
