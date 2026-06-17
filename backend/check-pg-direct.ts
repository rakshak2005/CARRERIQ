import dotenv from 'dotenv';
dotenv.config({ path: 'c:/PROJECTS/CareerIQ/backend/.env' });
import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL || '');

async function main() {
  const result = await sql`SELECT id, github_repositories FROM student_profiles WHERE id = 1`;
  console.log(result);
  await sql.end();
}
main().catch(console.error);
