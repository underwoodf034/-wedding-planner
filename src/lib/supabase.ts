import { createClient } from '@supabase/supabase-js';
import type { WeddingData } from '../types';

// 使用环境变量或占位符 - 用户需要配置自己的 Supabase 项目
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// 检查 Supabase 是否已配置
export const isSupabaseConfigured = (): boolean => {
  return supabaseUrl !== 'https://your-project.supabase.co' && supabaseKey !== 'your-anon-key';
};

export const syncToSupabase = async (data: WeddingData, projectId: string): Promise<boolean> => {
  if (!isSupabaseConfigured()) return false;
  try {
    const { error } = await supabase
      .from('wedding_projects')
      .upsert({ id: projectId, data, updated_at: new Date().toISOString() });
    return !error;
  } catch {
    return false;
  }
};

export const loadFromSupabase = async (projectId: string): Promise<WeddingData | null> => {
  if (!isSupabaseConfigured()) return null;
  try {
    const { data, error } = await supabase
      .from('wedding_projects')
      .select('data')
      .eq('id', projectId)
      .single();
    if (error || !data) return null;
    return data.data as WeddingData;
  } catch {
    return null;
  }
};

export const generateInviteLink = (projectId: string): string => {
  return `${window.location.origin}/join?project=${projectId}`;
};
