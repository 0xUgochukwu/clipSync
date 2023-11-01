export const Socket = (io: any) => {
    io.sockets.on('connection', (socket: any) => {
        console.log(socket.id, "Connected!");

        // Start Session 
        socket.on('start', (sessionID: string) => {
            socket.join(sessionID);
            socket.sessionID = sessionID
            console.log(`${socket.id}, Started Session: ${sessionID}`)
        });


        // Join Session
        socket.on('join', (sessionID: string) => {
            socket.join(sessionID);
            console.log(`${socket.id}, Joined Session: ${sessionID}`)
        });


        // Handle copy on client
        socket.on('copy', (sessionID: string, clip: any) => {
            console.log("Heyyy", socket.sessionID)
            //console.log(`${socket.id} in ${sessionID} Copied something: ${clip}`);

            socket.to(sessionID).emit('sync', clip);
        });
    });
}
