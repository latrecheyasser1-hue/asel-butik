const { execSync } = require('child_process');

try {
    const env = Object.assign({}, process.env, {
        NETLIFY_AUTH_TOKEN: 'nfp_eYAMGPxFTnPsouToWhe13nEWDoLcAjy5b9d8'
    });
    const output = execSync('npx netlify-cli api updateSite --data "{ \\"site_id\\": \\"a1edf696-dd38-41fb-8556-5d522b250a82\\", \\"body\\": { \\"name\\": \\"asel-butik\\" } }"', { encoding: 'utf8', env });
    console.log(output);
} catch (e) {
    console.error('Rename failed:', e.message);
    if (e.stdout) console.log(e.stdout);
    if (e.stderr) console.error(e.stderr);
}
