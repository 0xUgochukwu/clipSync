import clipboard from "clipboardy";




function listenToClipboard(socket) {
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

function handleErrors(error) {
    console.log(`ClipSync experienced an issue while syncing your clipboards
        \nPlease try again :\ `);
    process.exit(127);
}



export default {
    listenToClipboard,
    handleErrors
}
