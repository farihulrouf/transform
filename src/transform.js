const fs = require('fs');

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

// Read the transformations and text file
let transformations;
try {
    transformations = fs.readFileSync('transformations.txt', 'utf-8').trim().split(',');
} catch (err) {
    console.error("Error reading transformations file:", err.message);
    process.exit(1);
}
const text = fs.readFileSync('text.txt', 'utf-8');

// Apply transformations to the text
const transformedText = applyTransformations(text, transformations);

// Print the transformed text
console.log(transformedText);
