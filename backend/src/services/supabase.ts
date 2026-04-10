import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

const DAILY_LIMIT = 40;

export async function getUsageCount(studentEmail: string): Promise<number> {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  const { count, error } = await supabase
    .from('usage')
    .select('*', { count: 'exact', head: true })
    .eq('student_email', studentEmail)
    .gte('created_at', `${today}T00:00:00`)
    .lte('created_at', `${today}T23:59:59`);

  if (error) throw error;
  return count ?? 0;
}

export async function isWithinDailyLimit(studentEmail: string): Promise<boolean> {
  const count = await getUsageCount(studentEmail);
  return count < DAILY_LIMIT;
}

export async function registerUsage(studentEmail: string, conversationId: string): Promise<void> {
  const { error } = await supabase.from('usage').insert({
    student_email: studentEmail,
    conversation_id: conversationId,
  });

  if (error) throw error;
}

export async function saveMessage(
  conversationId: string,
  role: 'user' | 'assistant',
  content: string
): Promise<void> {
  const { error } = await supabase.from('messages').insert({
    conversation_id: conversationId,
    role,
    content,
  });

  if (error) throw error;
}

export async function upsertConversation(
  conversationId: string,
  studentEmail: string,
  title: string
): Promise<void> {
  const { error } = await supabase.from('conversations').upsert(
    { id: conversationId, student_email: studentEmail, title },
    { onConflict: 'id', ignoreDuplicates: true }
  );
  if (error) throw error;
}

export async function getStudentConversations(studentEmail: string) {
  const { data, error } = await supabase
    .from('conversations')
    .select('id, title, created_at')
    .eq('student_email', studentEmail)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getConversationMessages(conversationId: string) {
  const { data, error } = await supabase
    .from('messages')
    .select('role, content')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function getSystemPromptFromDB(): Promise<string | null> {
  const { data, error } = await supabase
    .from('settings')
    .select('value')
    .eq('key', 'system_prompt')
    .single();

  if (error || !data) return null;
  return data.value;
}

export async function saveSystemPromptToDB(prompt: string): Promise<void> {
  const { error } = await supabase.from('settings').upsert(
    { key: 'system_prompt', value: prompt, updated_at: new Date().toISOString() },
    { onConflict: 'key' }
  );
  if (error) throw error;
}
