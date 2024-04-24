const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const port = 3000;
const bodyParser = require('body-parser');

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));

// Define the initial keyboard layout
const keyboard = [
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';'],
    ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/']
];

// Function to apply horizontal flip
function horizontalFlip(keyboard) {
    return keyboard.map(row => row.slice().reverse());
}

// Function to apply vertical flip
function verticalFlip(keyboard) {
    return keyboard.slice().reverse();
}

// Function to apply linear shift
function linearShift(keyboard, shift) {
    const result = [];
    const rows = keyboard.length;
    const cols = keyboard[0].length;
    for (let i = 0; i < rows; i++) {
        result.push([]);
        for (let j = 0; j < cols; j++) {
            let newCol = (j + shift) % cols;
            if (newCol < 0) newCol += cols;
            let newRow = Math.floor((j + shift) / cols) + i;
            if (newRow < 0) newRow += rows;
            if (newRow >= rows) newRow -= rows;
            result[i][newCol] = keyboard[i][j];
        }
    }
    return result;
}

// Function to apply transformations
function applyTransformations(text, transformations) {
    let transformedKeyboard = keyboard;
    transformations.forEach(transform => {
        if (transform === 'H') {
            transformedKeyboard = horizontalFlip(transformedKeyboard);
        } else if (transform === 'V') {
            transformedKeyboard = verticalFlip(transformedKeyboard);
        } else if (!isNaN(Number(transform))) {
            transformedKeyboard = linearShift(transformedKeyboard, parseInt(transform));
        }
    });

    // Create a map for the transformation
    const map = {};
    for (let i = 0; i < keyboard.length; i++) {
        for (let j = 0; j < keyboard[i].length; j++) {
            map[keyboard[i][j]] = transformedKeyboard[i][j];
        }
    }

    // Apply the transformation
    let transformedText = '';
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        if (map.hasOwnProperty(char)) {
            transformedText += map[char];
        } else {
            transformedText += char;
        }
    }
    return transformedText;
}

// POST method route
app.post('/encode', (req, res) => {
    let transform = [];
    if (req.body.transform) {
        transform = req.body.transform.split(',');
    }
    const textFilePath = path.join(__dirname, 'text', 'input.txt');
    try {
        const file = fs.readFileSync(textFilePath, 'utf-8');
        const transformedText = applyTransformations(file, transform);
        res.send(transformedText);
    } catch (err) {
        res.status(500).send("Error: Text file not found.");
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is listening at http://localhost:${port}`);
});
