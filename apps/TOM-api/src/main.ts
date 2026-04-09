/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import 'dotenv/config';
import express from 'express';
import * as path from 'path';
import { createClient } from '@supabase/supabase-js';

const app = express();
const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Missing SUPABASE_URL and/or SUPABASE_SERVICE_ROLE_KEY in apps/TOM-api/.env');
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    persistSession: false,
  },
});

app.use('/assets', express.static(path.join(__dirname, 'assets')));

app.get('/api', (req, res) => {
  res.send({ message: 'Welcome to api! TOM!' });
});

app.get('/api/todos', async (_req, res) => {
  const { data, error } = await supabaseAdmin
    .from('todos')
    .select('id, name')
    .order('id', { ascending: true });

  if (error) {
    console.error('Failed to fetch todos from Supabase:', error.message);
    res.status(500).json({ error: 'Failed to fetch todos' });
    return;
  }

  res.json({ todos: data ?? [] });
});

const port = process.env.PORT || 3333;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});
server.on('error', console.error);
