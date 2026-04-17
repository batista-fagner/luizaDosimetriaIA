import { Client } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  const { rows } = await client.query(`
    SELECT
      routine_schema,
      routine_name,
      routine_type
    FROM information_schema.routines
    WHERE routine_name = 'match_documents'
  `);

  if (rows.length === 0) {
    console.log('❌ Função match_documents NÃO existe no banco');
  } else {
    console.log('✅ Função match_documents EXISTS:');
    rows.forEach((row) => {
      console.log(`   - Schema: ${row.routine_schema}`);
      console.log(`   - Nome: ${row.routine_name}`);
      console.log(`   - Tipo: ${row.routine_type}`);
    });
  }

  await client.end();
}

main().catch((err) => {
  console.error('❌ Erro:', err.message);
  process.exit(1);
});
