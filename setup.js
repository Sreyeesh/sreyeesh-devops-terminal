const fs = require('fs');
const path = require('path');

// Define the project structure
const projectStructure = {
  folders: [
    'assets',
    'assets/resumes',
  ],
  files: [
    'index.html',
    'styles.css',
    'script.js',
    'README.md',
  ],
};

// Create folders
projectStructure.folders.forEach((folder) => {
  const folderPath = path.join(__dirname, folder);
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
    console.log(`Created folder: ${folder}`);
  } else {
    console.log(`Folder already exists: ${folder}`);
  }
});

// Create files
projectStructure.files.forEach((file) => {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, '');
    console.log(`Created file: ${file}`);
  } else {
    console.log(`File already exists: ${file}`);
  }
});

console.log('Project structure setup complete.');
