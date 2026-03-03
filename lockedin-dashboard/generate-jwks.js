const { importSPKI, exportJWK } = require('jose');
const fs = require('fs');
const path = require('path');

async function run() {
  const publicPem = fs.readFileSync(path.join(__dirname, 'jwt-public.pem'), 'utf8');
  const key = await importSPKI(publicPem, 'RS256');
  const jwk = await exportJWK(key);
  const jwks = { keys: [{ use: 'sig', ...jwk }] };

  const jwksJson = JSON.stringify(jwks);
  fs.writeFileSync(path.join(__dirname, 'jwks.json'), jwksJson, 'utf8');
  console.log('Generated JWKS file:', path.join(__dirname, 'jwks.json'));
  console.log(jwksJson);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
