import { generateSessionID } from "../utils/helpers";


export const Socket = (io: any) => {

    // Authenticate Client
    io.use((socket: any, next: any) => {
        const query = socket.handshake.query;
        if (query.starting) {
            socket.sessionID = generateSessionID();
            return next();
        }
        if (query.sessionID && /^[A-Z0-9]{6}$/.test(query.sessionID)) {
            socket.sessionID = query.sessionID;
            return next();
        } else {
            next(new Error("Error Joining Session!"));
        }
    }).on('connection', (socket: any) => {
        console.log(socket.id, "Connected!");
        console.log(socket.sessionID);

        // Start Session
        socket.on('start', () => {
            console.log(`${socket.id} Started Session: ${socket.sessionID}`);
            socket.join(socket.sessionID);
            socket.emit('started', socket.sessionID);
            console.log(socket.sessionID, socket.id)
        });


        // Join Session
        socket.on('join', () => {
            socket.join(socket.sessionID);
            socket.emit('joined', socket.sessionID);
            console.log(`${socket.id}, Joined Session: ${socket.sessionID}`);
        });

        // Leave Session
        socket.on('leave', () => {
            socket.leave(socket.sessionID);
            console.log(`${socket.id}, Left Session: ${socket.sessionID}`);
        });

        // End Session
        socket.on('end', () => {
            socket.to(socket.sessionID).emit('close');
            io.socketsLeave(socket.sessionID);
            console.log(`Everything dies, session ${socket.sessionID} just did`);
        });


        // Handle copy event on client
        socket.on('copy', (clip: any) => {
            socket.emit('copied');
            console.log(`${socket.id} in ${socket.sessionID} Copied something: ${clip}`);

            socket.to(socket.sessionID).emit('sync', clip);
        });
    });
}
