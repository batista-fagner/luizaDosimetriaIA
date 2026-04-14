import { Client } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  const { rows } = await client.query(`SELECT * FROM settings WHERE key = 'system_prompt'`);

  if (rows.length === 0) {
    console.log('❌ Tabela vazia - nenhum prompt salvo no banco');
  } else {
    console.log('✅ Prompt encontrado no banco:');
    console.log('\nPrimeiras 300 caracteres:');
    console.log(rows[0].value.substring(0, 300) + '...');
  }

  await client.end();
}

main().catch((err) => {
  console.error('❌ Erro:', err.message);
  process.exit(1);
});
