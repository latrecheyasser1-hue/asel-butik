const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const sourceDir = __dirname;
const targetDir = path.join(__dirname, '_site');

// Create _site dir
if (fs.existsSync(targetDir)) {
    fs.rmSync(targetDir, { recursive: true, force: true });
}
fs.mkdirSync(targetDir);

// Files and folders to copy
const filesToCopy = [
    'index.html',
    'style.css',
    'main.js',
    'cart.html',
    'checkout.html',
    'success.html',
    'config.js',
    'app.js',
    'admin.js',
    'admin.css',
    'images',
    'admin',
    'sw.js',
    'manifest.json',
    'register',
    'print-receipt.html'
];

function copyRecursiveSync(src, dest) {
    const exists = fs.existsSync(src);
    const stats = exists && fs.statSync(src);
    const isDirectory = exists && stats.isDirectory();
    if (isDirectory) {
        fs.mkdirSync(dest, { recursive: true });
        fs.readdirSync(src).forEach((childItemName) => {
            copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
        });
    } else {
        fs.copyFileSync(src, dest);
    }
}

for (const file of filesToCopy) {
    const src = path.join(sourceDir, file);
    const dest = path.join(targetDir, file);
    if (fs.existsSync(src)) {
        copyRecursiveSync(src, dest);
    }
}

console.log('Files copied to _site. Starting deployment...');

try {
    const env = Object.assign({}, process.env, {
        NETLIFY_AUTH_TOKEN: 'nfp_eYAMGPxFTnPsouToWhe13nEWDoLcAjy5b9d8',
        NETLIFY_SITE_ID: '8c1dc26d-851e-4c44-95cc-71384d4dda58',
        NETLIFY_CLI_DISABLE_TELEMETRY: '1'
    });
    const output = execSync('npx -y netlify-cli deploy --prod --dir=_site --site=8c1dc26d-851e-4c44-95cc-71384d4dda58 --auth=nfp_eYAMGPxFTnPsouToWhe13nEWDoLcAjy5b9d8', { encoding: 'utf8', env });
    console.log(output);
    console.log('Deployment successful!');
} catch (e) {
    console.error('Deployment failed:', e.message);
}

// Cleanup
fs.rmSync(targetDir, { recursive: true, force: true });
console.log('Cleaned up _site directory.');

