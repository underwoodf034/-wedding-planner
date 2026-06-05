import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Plus, Trash2, Pencil, Check, X, Search, Download } from 'lucide-react';
import type { WeddingData, Guest } from '../types';
import { addHistory, exportGuestsToCSV } from '../lib/data';

interface OutletContext {
  data: WeddingData;
  onUpdate: (data: WeddingData) => void;
}

const sideLabels: Record<string, string> = { bride: '新娘方', groom: '新郎方', mutual: '共同' };
const rsvpLabels: Record<string, { text: string; class: string }> = {
  attending: { text: '确认出席', class: 'badge-green' },
  pending: { text: '待定', class: 'badge-gold' },
  declined: { text: '缺席', class: 'badge-gray' },
};

export default function GuestList() {
  const { data, onUpdate } = useOutletContext<OutletContext>();
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterSide, setFilterSide] = useState<string>('all');
  const [filterRsvp, setFilterRsvp] = useState<string>('all');
  const [newGuest, setNewGuest] = useState({ name: '', side: 'bride' as const, phone: '', email: '', dietary: '', plusOne: false, notes: '' });
  const [editGuest, setEditGuest] = useState<Partial<Guest>>({});

  const stats = {
    total: data.guests.length,
    attending: data.guests.filter(g => g.rsvp === 'attending').length,
    pending: data.guests.filter(g => g.rsvp === 'pending').length,
    declined: data.guests.filter(g => g.rsvp === 'declined').length,
    plusOnes: data.guests.filter(g => g.rsvp === 'attending' && g.plusOne).length,
    totalAttending: data.guests.reduce((sum, g) => sum + (g.rsvp === 'attending' ? 1 + (g.plusOne ? 1 : 0) : 0), 0),
  };

  const filtered = data.guests.filter(g => {
    const matchSearch = g.name.toLowerCase().includes(search.toLowerCase()) || g.phone.includes(search);
    const matchSide = filterSide === 'all' || g.side === filterSide;
    const matchRsvp = filterRsvp === 'all' || g.rsvp === filterRsvp;
    return matchSearch && matchSide && matchRsvp;
  });

  const addGuest = () => {
    if (!newGuest.name) return;
    const guest: Guest = {
      id: Date.now().toString(),
      ...newGuest,
      rsvp: 'pending',
      table: null,
      createdAt: new Date().toISOString(),
    } as Guest;
    const updated = { ...data, guests: [...data.guests, guest] };
    onUpdate(addHistory(updated, '添加来宾', guest.name));
    setNewGuest({ name: '', side: 'bride', phone: '', email: '', dietary: '', plusOne: false, notes: '' });
    setShowAdd(false);
  };

  const updateGuest = (id: string, changes: Partial<Guest>) => {
    const guest = data.guests.find(g => g.id === id);
    if (!guest) return;
    const updated = {
      ...data,
      guests: data.guests.map(g => g.id === id ? { ...g, ...changes } as Guest : g),
    };
    const action = changes.rsvp && changes.rsvp !== guest.rsvp
      ? `RSVP更新为${rsvpLabels[changes.rsvp]?.text || changes.rsvp}`
      : '更新来宾';
    onUpdate(addHistory(updated, action, guest.name));
  };

  const deleteGuest = (id: string) => {
    if (!confirm('确定删除这位来宾吗？')) return;
    const guest = data.guests.find(g => g.id === id);
    const updated = { ...data, guests: data.guests.filter(g => g.id !== id) };
    onUpdate(addHistory(updated, '删除来宾', guest?.name || ''));
  };

  const startEdit = (guest: Guest) => {
    setEditingId(guest.id);
    setEditGuest({ ...guest });
  };

  const saveEdit = () => {
    if (!editingId || !editGuest.name) return;
    updateGuest(editingId, editGuest);
    setEditingId(null);
    setEditGuest({});
  };

  const exportCSV = () => {
    const csv = exportGuestsToCSV(data.guests);
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = '婚礼来宾名单.csv';
    link.click();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--color-primary-dark)' }}>来宾管理</h2>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>预计 {data.settings.guestEstimate} 人 · 已录入 {stats.total} 人</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportCSV} className="btn-secondary flex items-center gap-2 text-sm">
            <Download className="w-4 h-4" /> 导出
          </button>
          <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> 添加来宾
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="card text-center">
          <div className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>{stats.attending}</div>
          <div className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>确认出席</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold" style={{ color: 'var(--color-accent-dark)' }}>{stats.pending}</div>
          <div className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>待定</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold" style={{ color: 'var(--color-text-muted)' }}>{stats.declined}</div>
          <div className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>缺席</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold" style={{ color: 'var(--color-rose)' }}>{stats.plusOnes}</div>
          <div className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>携带+1</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold" style={{ color: 'var(--color-primary-dark)' }}>{stats.totalAttending}</div>
          <div className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>预计到场</div>
        </div>
      </div>

      {/* Filters */}
      <div className="card flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
          <input
            className="input-field pl-9"
            placeholder="搜索姓名或电话..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select className="input-field w-auto" value={filterSide} onChange={e => setFilterSide(e.target.value)}>
          <option value="all">全部归属</option>
          <option value="bride">新娘方</option>
          <option value="groom">新郎方</option>
          <option value="mutual">共同</option>
        </select>
        <select className="input-field w-auto" value={filterRsvp} onChange={e => setFilterRsvp(e.target.value)}>
          <option value="all">全部RSVP</option>
          <option value="attending">确认出席</option>
          <option value="pending">待定</option>
          <option value="declined">缺席</option>
        </select>
      </div>

      {/* Add Modal */}
      {showAdd && (
        <div className="modal-overlay" onClick={() => setShowAdd(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--color-primary-dark)' }}>添加来宾</h3>
            <div className="space-y-3">
              <input className="input-field" placeholder="姓名 *" value={newGuest.name} onChange={e => setNewGuest({ ...newGuest, name: e.target.value })} />
              <div className="grid grid-cols-2 gap-3">
                <select className="input-field" value={newGuest.side} onChange={e => setNewGuest({ ...newGuest, side: e.target.value as any })}>
                  <option value="bride">新娘方</option>
                  <option value="groom">新郎方</option>
                  <option value="mutual">共同朋友</option>
                </select>
                <input className="input-field" placeholder="电话" value={newGuest.phone} onChange={e => setNewGuest({ ...newGuest, phone: e.target.value })} />
              </div>
              <input className="input-field" placeholder="邮箱" value={newGuest.email} onChange={e => setNewGuest({ ...newGuest, email: e.target.value })} />
              <input className="input-field" placeholder="饮食禁忌/过敏" value={newGuest.dietary} onChange={e => setNewGuest({ ...newGuest, dietary: e.target.value })} />
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={newGuest.plusOne} onChange={e => setNewGuest({ ...newGuest, plusOne: e.target.checked })} className="rounded" />
                <span style={{ color: 'var(--color-text)' }}>携带+1</span>
              </label>
              <input className="input-field" placeholder="备注" value={newGuest.notes} onChange={e => setNewGuest({ ...newGuest, notes: e.target.value })} />
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={addGuest} className="btn-primary flex-1">添加</button>
              <button onClick={() => setShowAdd(false)} className="btn-secondary flex-1">取消</button>
            </div>
          </div>
        </div>
      )}

      {/* Guest Table */}
      <div className="card overflow-x-auto">
        <table className="table-wedding">
          <thead>
            <tr>
              <th>姓名</th>
              <th>归属</th>
              <th>RSVP</th>
              <th>+1</th>
              <th>座位</th>
              <th>饮食</th>
              <th>电话</th>
              <th>备注</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(guest => (
              <tr key={guest.id}>
                {editingId === guest.id ? (
                  <>
                    <td><input className="input-field text-sm" value={editGuest.name || ''} onChange={e => setEditGuest({ ...editGuest, name: e.target.value })} /></td>
                    <td>
                      <select className="input-field text-sm" value={editGuest.side || 'bride'} onChange={e => setEditGuest({ ...editGuest, side: e.target.value as any })}>
                        <option value="bride">新娘方</option>
                        <option value="groom">新郎方</option>
                        <option value="mutual">共同</option>
                      </select>
                    </td>
                    <td>
                      <select className="input-field text-sm" value={editGuest.rsvp || 'pending'} onChange={e => setEditGuest({ ...editGuest, rsvp: e.target.value as any })}>
                        <option value="pending">待定</option>
                        <option value="attending">确认出席</option>
                        <option value="declined">缺席</option>
                      </select>
                    </td>
                    <td>
                      <input type="checkbox" checked={editGuest.plusOne || false} onChange={e => setEditGuest({ ...editGuest, plusOne: e.target.checked })} />
                    </td>
                    <td><input className="input-field text-sm w-16" type="number" value={editGuest.table || ''} onChange={e => setEditGuest({ ...editGuest, table: e.target.value ? Number(e.target.value) : null })} /></td>
                    <td><input className="input-field text-sm" value={editGuest.dietary || ''} onChange={e => setEditGuest({ ...editGuest, dietary: e.target.value })} /></td>
                    <td><input className="input-field text-sm" value={editGuest.phone || ''} onChange={e => setEditGuest({ ...editGuest, phone: e.target.value })} /></td>
                    <td><input className="input-field text-sm" value={editGuest.notes || ''} onChange={e => setEditGuest({ ...editGuest, notes: e.target.value })} /></td>
                    <td>
                      <div className="flex gap-1">
                        <button onClick={saveEdit} className="btn-primary text-xs px-2 py-1"><Check className="w-3 h-3" /></button>
                        <button onClick={() => { setEditingId(null); setEditGuest({}); }} className="btn-secondary text-xs px-2 py-1"><X className="w-3 h-3" /></button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="font-medium">{guest.name}</td>
                    <td><span className="badge badge-gray">{sideLabels[guest.side]}</span></td>
                    <td>
                      <select
                        className={`badge cursor-pointer border-0 ${rsvpLabels[guest.rsvp].class}`}
                        value={guest.rsvp}
                        onChange={e => updateGuest(guest.id, { rsvp: e.target.value as Guest['rsvp'] })}
                      >
                        <option value="pending">待定</option>
                        <option value="attending">确认出席</option>
                        <option value="declined">缺席</option>
                      </select>
                    </td>
                    <td className="text-center">{guest.plusOne ? '✓' : '-'}</td>
                    <td>
                      <input
                        className="input-field text-sm w-16 text-center"
                        type="number"
                        placeholder="-"
                        value={guest.table || ''}
                        onChange={e => updateGuest(guest.id, { table: e.target.value ? Number(e.target.value) : null })}
                      />
                    </td>
                    <td className="text-sm">{guest.dietary || '-'}</td>
                    <td className="text-sm">{guest.phone}</td>
                    <td className="text-sm max-w-[120px] truncate">{guest.notes || '-'}</td>
                    <td>
                      <div className="flex gap-1 opacity-0 hover:opacity-100 transition-opacity">
                        <button onClick={() => startEdit(guest)} className="btn-ghost p-1"><Pencil className="w-3 h-3" /></button>
                        <button onClick={() => deleteGuest(guest.id)} className="btn-ghost p-1 text-red-400 hover:text-red-600"><Trash2 className="w-3 h-3" /></button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-8 text-sm" style={{ color: 'var(--color-text-muted)' }}>没有找到匹配的来宾</div>
        )}
      </div>
    </div>
  );
}
