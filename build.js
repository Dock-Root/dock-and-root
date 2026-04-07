const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, 'data', 'machines');
const outPath = path.join(__dirname, 'data', 'labs.json');

// Get all JSON files in the machines directory
const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.json'));

let machines = [];

for (const file of files) {
    const content = fs.readFileSync(path.join(dataDir, file), 'utf8');
    try {
        const machine = JSON.parse(content);
        machines.push(machine);
    } catch (err) {
        console.error(`Error parsing ${file}:`, err);
    }
}

// Sort by ID descending (newest first, assuming higher ID = newer)
machines.sort((a, b) => b.id - a.id);

// Write the combined array
fs.writeFileSync(outPath, JSON.stringify({ machines }, null, 2));
console.log(`Successfully built data/labs.json with ${machines.length} machines.`);
