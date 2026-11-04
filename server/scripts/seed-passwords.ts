import bcrypt from 'bcryptjs';
import { pool } from '../config/database';

async function updatePasswords() {
  const hash = await bcrypt.hash('Admin@123456', 10);
  console.log('Generated bcrypt hash:', hash);
  const result = await pool.query('UPDATE users SET password_hash = $1 RETURNING email, role;', [hash]);
  console.log('Updated users:', result.rows);
  await pool.end();
}

updatePasswords().catch(console.error);
