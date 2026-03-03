const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function setEnv(name, value) {
  const valueEscaped = value.replace(/"/g, '\\"');
  execSync(`npx convex env set -- ${name} "${valueEscaped}"`, { stdio: 'inherit' });
}

const root = __dirname;
const privatePemPath = path.join(root, 'jwt-private.pem');
const jwksPath = path.join(root, 'jwks.json');

if (!fs.existsSync(privatePemPath)) {
  throw new Error(`Missing file: ${privatePemPath}`);
}
if (!fs.existsSync(jwksPath)) {
  throw new Error(`Missing file: ${jwksPath}`);
}

let jwtPrivateKey = fs.readFileSync(privatePemPath, 'utf8').trimEnd();
// Convex env CLI is safest with single-line values for multiline data.
jwtPrivateKey = jwtPrivateKey.replace(/\r?\n/g, ' ');

let jwks = fs.readFileSync(jwksPath, 'utf8').trim();
// Ensure minified valid JSON string.
jwks = JSON.stringify(JSON.parse(jwks));

console.log('Setting JWT_PRIVATE_KEY and JWKS...');
setEnv('JWT_PRIVATE_KEY', jwtPrivateKey);
setEnv('JWKS', jwks);
console.log('Done.');
