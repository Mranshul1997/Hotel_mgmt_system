const fs = require('fs');
const path = require('path');

function logFolderStructure(dir, prefix = '') {
  // Read files and folders in directory
  const items = fs.readdirSync(dir);

  items.forEach((item, index) => {
    if (item === 'node_modules') {
      // Skip node_modules
      return;
    }

    const fullPath = path.join(dir, item);
    const isDir = fs.lstatSync(fullPath).isDirectory();

    // Log folder or file name with prefix formatting
    if (isDir) {
      console.log(`${prefix}📁 ${item}`);
      // Recursively log inside folder with increased indentation
      logFolderStructure(fullPath, prefix + '  ');
    } else {
      console.log(`${prefix}📄 ${item}`);
    }
  });
}

// Run the function from current working directory or specify path here
const projectRoot = process.cwd();
console.log(`Project folder structure at: ${projectRoot}`);
logFolderStructure(projectRoot);
