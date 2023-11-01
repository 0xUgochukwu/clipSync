export const Socket = (io: any) => {

    io.use((socket: any, next: any) => {
        if (socket.handshake.query && socket.handshake.query.sessionID) {
            socket.sessionID = socket.handshake.query.sessionID;
            return next();
        } else {
            next(new Error("Error Joining Session!"));
        }
    }).on('connection', (socket: any) => {
        console.log(socket.id, "Connected!");
        console.log(socket.sessionID);

        // Join Session
        socket.on('join', () => {
            socket.join(socket.sessionID);
            console.log(`${socket.id}, Joined Session: ${socket.sessionID}`)
        });


        // Handle copy on client
        socket.on('copy', (clip: any) => {
            console.log(socket.sessionID);
            console.log(`${socket.id} in ${socket.sessionID} Copied something: ${clip}`);

            socket.to(socket.sessionID).emit('sync', clip);
        });
    });
}
