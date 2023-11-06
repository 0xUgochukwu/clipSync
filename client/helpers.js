import clipboard from "clipboardy";
import fs from 'fs';
import path from 'path';


const filePath = path.resolve('vars.json');
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

async function updateVars(data) {
    return new Promise((resolve, reject) => {
        const serializedData = JSON.stringify(data);
        fs.writeFile(filePath, serializedData, (err) => {
            if (err) {
                console.error('Something went wrong... 1');
                reject(err);
            } else {
                resolve();
            }
        });
    });
}


async function retrieveVars() {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                resolve({});
            } else {
                try {
                    const parsedData = JSON.parse(data);
                    resolve(parsedData);
                } catch (parseError) {
                    resolve({});
                }
            }
        });
    });
}



export default {
    generateSessionID,
    listenToClipboard,
    updateVars,
    retrieveVars
}
