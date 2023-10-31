export const Socket = (io: any) => {
    io.sockets.on('connection', (socket: any) => {
        console.log(socket.id, "Connected!");
        socket.on('start', (sessionID: string) => {
            socket.join(sessionID);
            console.log(`${socket.id}, Joined Session: ${sessionID}`)
        });
    });
}
