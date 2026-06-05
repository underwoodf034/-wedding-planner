import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Copy, Check, Download, Upload, Settings, User, Heart, Calendar, MapPin, Wallet, Users, AlertTriangle } from 'lucide-react';
import type { WeddingData } from '../types';
import { addHistory, exportToJSON, importFromJSON } from '../lib/data';
import { isSupabaseConfigured, generateInviteLink } from '../lib/supabase';

interface OutletContext {
  data: WeddingData;
  onUpdate: (data: WeddingData) => void;
}

export default function SettingsPage() {
  const { data, onUpdate } = useOutletContext<OutletContext>();
  const [copied, setCopied] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState('');
  const [editSettings, setEditSettings] = useState(false);
  const [settings, setSettings] = useState(data.settings);

  const inviteLink = generateInviteLink(data.settings.projectId);
  const supabaseReady = isSupabaseConfigured();

  const copyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const exportData = () => {
    const json = exportToJSON(data);
    const blob = new Blob([json], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `wedding-data-${data.settings.projectId}.json`;
    link.click();
    onUpdate(addHistory(data, '导出数据', '完整项目备份'));
  };

  const importData = () => {
    const imported = importFromJSON(importText);
    if (!imported) {
      alert('导入失败：JSON 格式不正确');
      return;
    }
    if (confirm('导入将覆盖当前所有数据，确定继续吗？')) {
      onUpdate(addHistory(imported, '导入数据', '从JSON文件恢复'));
      setShowImport(false);
      setImportText('');
    }
  };

  const saveSettings = () => {
    const updated = { ...data, settings };
    onUpdate(addHistory(updated, '更新设置', '婚礼基本信息'));
    setEditSettings(false);
  };

  const clearAllData = () => {
    if (confirm('⚠️ 警告：这将清除所有数据且无法恢复！确定要继续吗？')) {
      if (confirm('再次确认：你真的要删除所有婚礼筹备数据吗？')) {
        localStorage.removeItem('wedding-planner-data');
        window.location.reload();
      }
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold" style={{ color: 'var(--color-primary-dark)' }}>设置</h2>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>管理婚礼项目信息和协作</p>
      </div>

      {/* Wedding Info Card */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold flex items-center gap-2" style={{ color: 'var(--color-primary-dark)' }}>
            <Heart className="w-5 h-5" style={{ color: 'var(--color-rose)' }} /> 婚礼信息
          </h3>
          <button onClick={() => setEditSettings(!editSettings)} className="btn-secondary text-sm">
            {editSettings ? '取消' : '编辑'}
          </button>
        </div>

        {editSettings ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs mb-1 block" style={{ color: 'var(--color-text-muted)' }}>新郎姓名</label>
                <input className="input-field" value={settings.groomName} onChange={e => setSettings({ ...settings, groomName: e.target.value })} />
              </div>
              <div>
                <label className="text-xs mb-1 block" style={{ color: 'var(--color-text-muted)' }}>新娘姓名</label>
                <input className="input-field" value={settings.brideName} onChange={e => setSettings({ ...settings, brideName: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="text-xs mb-1 block" style={{ color: 'var(--color-text-muted)' }}>婚礼日期</label>
              <input className="input-field" type="date" value={settings.weddingDate} onChange={e => setSettings({ ...settings, weddingDate: e.target.value })} />
            </div>
            <div>
              <label className="text-xs mb-1 block" style={{ color: 'var(--color-text-muted)' }}>场地</label>
              <input className="input-field" value={settings.venue} onChange={e => setSettings({ ...settings, venue: e.target.value })} />
            </div>
            <div>
              <label className="text-xs mb-1 block" style={{ color: 'var(--color-text-muted)' }}>主题</label>
              <input className="input-field" value={settings.theme} onChange={e => setSettings({ ...settings, theme: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs mb-1 block" style={{ color: 'var(--color-text-muted)' }}>总预算</label>
                <input className="input-field" type="number" value={settings.budgetTotal} onChange={e => setSettings({ ...settings, budgetTotal: Number(e.target.value) })} />
              </div>
              <div>
                <label className="text-xs mb-1 block" style={{ color: 'var(--color-text-muted)' }}>预计来宾</label>
                <input className="input-field" type="number" value={settings.guestEstimate} onChange={e => setSettings({ ...settings, guestEstimate: Number(e.target.value) })} />
              </div>
            </div>
            <button onClick={saveSettings} className="btn-primary w-full">保存设置</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(212,165,165,0.15)' }}>
                <User className="w-5 h-5" style={{ color: 'var(--color-rose)' }} />
              </div>
              <div>
                <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>新人</div>
                <div className="font-medium">{data.settings.groomName} & {data.settings.brideName}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(201,169,110,0.15)' }}>
                <Calendar className="w-5 h-5" style={{ color: 'var(--color-accent-dark)' }} />
              </div>
              <div>
                <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>婚礼日期</div>
                <div className="font-medium">{data.settings.weddingDate}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(74,124,89,0.15)' }}>
                <MapPin className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
              </div>
              <div>
                <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>场地</div>
                <div className="font-medium">{data.settings.venue}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(168,181,160,0.2)' }}>
                <Settings className="w-5 h-5" style={{ color: 'var(--color-sage)' }} />
              </div>
              <div>
                <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>主题</div>
                <div className="font-medium">{data.settings.theme}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(201,169,110,0.15)' }}>
                <Wallet className="w-5 h-5" style={{ color: 'var(--color-accent-dark)' }} />
              </div>
              <div>
                <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>总预算</div>
                <div className="font-medium">¥{data.settings.budgetTotal.toLocaleString()}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(74,124,89,0.15)' }}>
                <Users className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
              </div>
              <div>
                <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>预计来宾</div>
                <div className="font-medium">{data.settings.guestEstimate} 人</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Invite Collaboration */}
      <div className="card">
        <h3 className="font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--color-primary-dark)' }}>
          <Users className="w-5 h-5" style={{ color: 'var(--color-primary)' }} /> 邀请协作
        </h3>
        <p className="text-sm mb-3" style={{ color: 'var(--color-text-muted)' }}>
          复制下方链接发送给伴侣，对方打开后即可查看和编辑婚礼筹备内容。
        </p>
        <div className="flex gap-2">
          <input className="input-field flex-1 text-sm" value={inviteLink} readOnly />
          <button onClick={copyLink} className="btn-primary flex items-center gap-2">
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? '已复制' : '复制'}
          </button>
        </div>
        {!supabaseReady && (
          <div className="mt-3 p-3 rounded-lg text-sm" style={{ background: 'rgba(201,169,110,0.1)', color: 'var(--color-accent-dark)' }}>
            <AlertTriangle className="w-4 h-4 inline mr-1" />
            当前使用本地存储。如需多人实时协作，请在 Vercel 环境变量中配置 Supabase 项目 URL 和匿名密钥。
          </div>
        )}
      </div>

      {/* Data Management */}
      <div className="card">
        <h3 className="font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--color-primary-dark)' }}>
          <Download className="w-5 h-5" style={{ color: 'var(--color-primary)' }} /> 数据管理
        </h3>
        <div className="flex flex-wrap gap-3">
          <button onClick={exportData} className="btn-secondary flex items-center gap-2">
            <Download className="w-4 h-4" /> 导出备份
          </button>
          <button onClick={() => setShowImport(true)} className="btn-secondary flex items-center gap-2">
            <Upload className="w-4 h-4" /> 导入恢复
          </button>
        </div>

        {showImport && (
          <div className="mt-4 space-y-3">
            <textarea
              className="input-field h-32 resize-none font-mono text-xs"
              placeholder="粘贴之前导出的 JSON 数据..."
              value={importText}
              onChange={e => setImportText(e.target.value)}
            />
            <div className="flex gap-2">
              <button onClick={importData} className="btn-primary flex-1">确认导入</button>
              <button onClick={() => { setShowImport(false); setImportText(''); }} className="btn-secondary flex-1">取消</button>
            </div>
          </div>
        )}
      </div>

      {/* Danger Zone */}
      <div className="card" style={{ borderColor: '#fecaca' }}>
        <h3 className="font-bold mb-3 flex items-center gap-2 text-red-600">
          <AlertTriangle className="w-5 h-5" /> 危险区域
        </h3>
        <p className="text-sm mb-3" style={{ color: 'var(--color-text-muted)' }}>以下操作不可逆，请谨慎使用。</p>
        <button onClick={clearAllData} className="w-full py-2.5 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 transition-colors text-sm font-medium">
          清除所有数据
        </button>
      </div>
    </div>
  );
}
