const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    if (!fs.existsSync(dir)) return;
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
    });
}

// 1. Fix Admin HTML
const adminHtml = 'frontend/admin/html/index.html';
if (fs.existsSync(adminHtml)) {
    let content = fs.readFileSync(adminHtml, 'utf8');
    content = content.replace(/href="\.\.\/\.\.\/assets\/css\/sections\/admin\//g, 'href="../css/');
    content = content.replace(/href="\.\.\/\.\.\/assets\/css\/global\.css"/g, 'href="../../shared/css/global.css"');
    content = content.replace(/href="admin-style\.css"/g, 'href="../css/admin-style.css"');
    content = content.replace(/src="/g, 'src="../js/');
    // Fix src that got over-replaced
    content = content.replace(/src="\.\.\/js\/admin_components\//g, 'src="admin_components/');
    content = content.replace(/src="\.\.\/js\/https:\/\//g, 'src="https://');
    fs.writeFileSync(adminHtml, content);
}

// 2. Fix Customer HTML
const customerHtml = 'frontend/customer/html/index.html';
if (fs.existsSync(customerHtml)) {
    let content = fs.readFileSync(customerHtml, 'utf8');
    content = content.replace(/href="\.\.\/\.\.\/assets\/images\/logo\/favicon\.png"/g, 'href="../../shared/images/logo/favicon.png"');
    content = content.replace(/href="\.\.\/\.\.\/assets\/css\/global\.css"/g, 'href="../../shared/css/global.css"');
    content = content.replace(/href="dashboard\.css"/g, 'href="../css/dashboard.css"');
    content = content.replace(/src="/g, 'src="../js/');
    content = content.replace(/src="\.\.\/js\/https:\/\//g, 'src="https://');
    fs.writeFileSync(customerHtml, content);
}

// 3. Fix Employee HTML
const employeeHtml = 'frontend/employee/html/index.html';
if (fs.existsSync(employeeHtml)) {
    let content = fs.readFileSync(employeeHtml, 'utf8');
    content = content.replace(/href="\.\.\/\.\.\/assets\/css\/global\.css"/g, 'href="../../shared/css/global.css"');
    content = content.replace(/href="employee-style\.css"/g, 'href="../css/employee-style.css"');
    content = content.replace(/src="/g, 'src="../js/');
    content = content.replace(/src="\.\.\/js\/https:\/\//g, 'src="https://');
    fs.writeFileSync(employeeHtml, content);
}

// 4. Fix Website HTMLs
const websiteHtmls = ['frontend/website/html/index.html', 'frontend/website/html/details.html'];
websiteHtmls.forEach(f => {
    if (fs.existsSync(f)) {
        let content = fs.readFileSync(f, 'utf8');
        content = content.replace(/\.\.\/assets\/css\//g, '../css/');
        content = content.replace(/\.\.\/css\/global\.css/g, '../../shared/css/global.css');
        fs.writeFileSync(f, content);
    }
});

// 5. Fix Auth HTMLs
const authHtmls = ['frontend/auth/html/login.html', 'frontend/auth/html/customer-auth.html'];
authHtmls.forEach(f => {
    if (fs.existsSync(f)) {
        let content = fs.readFileSync(f, 'utf8');
        content = content.replace(/\.\.\/assets\/css\//g, '../css/');
        content = content.replace(/\/frontend\/assets\/css\//g, '/frontend/auth/css/');
        content = content.replace(/\.\.\/css\/global\.css/g, '../../shared/css/global.css');
        content = content.replace(/\/frontend\/auth\/css\/global\.css/g, '/frontend/shared/css/global.css');
        
        content = content.replace(/\.\.\/assets\/js\/auth-logic\//g, '../js/');
        
        content = content.replace(/\/frontend\/modules\/admin\/index\.html/g, '/frontend/admin/html/index.html');
        content = content.replace(/\/frontend\/modules\/employee\/index\.html/g, '/frontend/employee/html/index.html');
        content = content.replace(/\/frontend\/modules\/customer\/index\.html/g, '/frontend/customer/html/index.html');
        fs.writeFileSync(f, content);
    }
});

// 6. Fix Redirects in JS files
walkDir('frontend', function(filePath) {
    if(filePath.endsWith('.js')) {
        let content = fs.readFileSync(filePath, 'utf8');
        let changed = false;
        
        if (content.includes('/frontend/modules/admin/index.html')) {
            content = content.replace(/\/frontend\/modules\/admin\/index\.html/g, '/frontend/admin/html/index.html');
            changed = true;
        }
        if (content.includes('/frontend/modules/employee/index.html')) {
            content = content.replace(/\/frontend\/modules\/employee\/index\.html/g, '/frontend/employee/html/index.html');
            changed = true;
        }
        if (content.includes('/frontend/modules/customer/index.html')) {
            content = content.replace(/\/frontend\/modules\/customer\/index\.html/g, '/frontend/customer/html/index.html');
            changed = true;
        }
        if (content.includes('/frontend/auth/login.html')) {
            content = content.replace(/\/frontend\/auth\/login\.html/g, '/frontend/auth/html/login.html');
            changed = true;
        }
        
        // Also fix the loadComponent paths
        if (content.includes('admin_components/')) {
            content = content.replace(/admin_components\//g, '/frontend/admin/html/admin_components/');
            changed = true;
        }
        if (content.includes('customer_components/')) {
            content = content.replace(/customer_components\//g, '/frontend/customer/html/customer_components/');
            changed = true;
        }
        if (content.includes('employee_components/')) {
            content = content.replace(/employee_components\//g, '/frontend/employee/html/employee_components/');
            changed = true;
        }

        if (changed) fs.writeFileSync(filePath, content);
    }
});
console.log('Links updated');
