const clipboard = require('clipboardy');
const fs = require('fs');
const path = require('path');

const filePath = path.resolve(__dirname, 'vars.json');
console.log(filePath);

function generateSessionID() {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';

    for (let i = 0; i < 6; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        result += charset.charAt(randomIndex);
    }

    return result;
}


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

function updateVars(data) {
    const serializedData = JSON.stringify(data);
    fs.writeFile(filePath, serializedData, (err) => {
        if (err) {
            console.error('Something went wrong... 1');
        }
    });
}



function retrieveVars() {
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            return {};
        }

        try {
            return JSON.parse(data);
        } catch (parseError) {
            return {};
        }
    });

    return {};
}

module.exports = {
    generateSessionID,
    listenToClipboard,
    updateVars,
    retrieveVars
}
