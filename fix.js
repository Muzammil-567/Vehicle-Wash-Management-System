const fs = require('fs');
const path = require('path');
function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}
walkDir('frontend', function(filePath) {
    if(filePath.endsWith('.js')) {
        let content = fs.readFileSync(filePath, 'utf8');
        if(content.includes('http://localhost:5000/api')) {
            if(!content.includes('const API_URL =')) {
                content = 'const API_URL = "http://localhost:5000/api";\n\n' + content;
            }
            content = content.replace(/['"]http:\/\/localhost:5000\/api([^'"]*)['"]/g, 'API_URL + "$1"');
            content = content.replace(/`http:\/\/localhost:5000\/api([^`]*)`/g, '`${API_URL}$1`');
            fs.writeFileSync(filePath, content);
        }
    }
});
console.log("Done");
