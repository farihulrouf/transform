// src/app.js
const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const port = 3000;

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, '../public')));

// Encoding function
function applyTransforms(text, transforms) {
    let keyboard = [
        ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
        ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
        ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';'],
        ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/']
    ];

    for (let transform of transforms) {
        switch (transform[0]) {
            case 'H':
                keyboard = horizontalFlip(keyboard);
                break;
            case 'V':
                keyboard = verticalFlip(keyboard);
                break;
            default:
                keyboard = shiftKeyboard(keyboard, parseInt(transform));
                break;
        }
    }

    let result = '';
    for (let char of text) {
        if (char === ' ') {
            result += ' ';
            continue;
        }
        for (let i = 0; i < keyboard.length; i++) {
            let index = keyboard[i].indexOf(char.toLowerCase());
            if (index !== -1) {
                result += keyboard[i][index];
                break;
            }
        }
    }
    return result;
}

// Function to flip the keyboard horizontally
function horizontalFlip(keyboard) {
    for (let i = 0; i < keyboard.length; i++) {
        keyboard[i].reverse();
    }
    return keyboard;
}

// Function to flip the keyboard vertically
function verticalFlip(keyboard) {
    return keyboard.reverse();
}

// Function to shift the keyboard
function shiftKeyboard(keyboard, n) {
    let newKeyboard = [];
    for (let i = 0; i < keyboard.length; i++) {
        let row = [];
        for (let j = 0; j < keyboard[i].length; j++) {
            let newRow = Math.floor((i * 10 + j + n) / 10);
            let newCol = (i * 10 + j + n) % 10;
            if (newRow < 0) {
                newRow += 4;
            }
            if (newRow > 3) {
                newRow -= 4;
            }
            if (newCol < 0) {
                newCol += 10;
            }
            if (newCol > 9) {
                newCol -= 10;
            }
            row.push(keyboard[newRow][newCol]);
        }
        newKeyboard.push(row);
    }
    return newKeyboard;
}

// POST method route
app.post('/encode', (req, res) => {
    const textFilePath = path.join(__dirname, '../text/input.txt');
    const transform = req.body.transform.split(',');
    const file = fs.readFileSync(textFilePath, 'utf-8');
    const transformedText = applyTransforms(file, transform);
    res.send(transformedText);
});

// Start the server
app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});
