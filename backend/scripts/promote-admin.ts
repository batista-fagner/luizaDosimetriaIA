import { Client } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const [,, email] = process.argv;

if (!email) {
  console.error('Uso: npm run promote-admin -- email@exemplo.com');
  process.exit(1);
}

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  await client.query(
    `UPDATE students SET role = 'admin' WHERE email = $1`,
    [email.trim().toLowerCase()]
  );

  console.log(`✅ Usuário promovido a admin: ${email}`);
  await client.end();
}

main().catch((err) => {
  console.error('❌ Erro:', err.message);
  process.exit(1);
});
