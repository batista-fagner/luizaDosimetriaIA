import { Client } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const [,, email, name] = process.argv;

if (!email) {
  console.error('Uso: npm run add-student -- email@exemplo.com "Nome Completo"');
  process.exit(1);
}

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  const { rows } = await client.query(
    `INSERT INTO students (email, name) VALUES ($1, $2)
     ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, active = true
     RETURNING email, name`,
    [email.trim().toLowerCase(), name ?? null]
  );

  console.log(`✅ Aluno adicionado: ${rows[0].email}${rows[0].name ? ` (${rows[0].name})` : ''}`);
  await client.end();
}

main().catch((err) => {
  console.error('❌ Erro:', err.message);
  process.exit(1);
});
