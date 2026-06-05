import { useState } from 'react';
import { Plus, Trash2, Search } from 'lucide-react';
import type { WeddingData, Guest } from '../types';
import { addHistory } from '../lib/data';

interface Props {
  data: WeddingData;
  onUpdate: (data: WeddingData) => void;
}

export default function GuestList({ data, onUpdate }: Props) {
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState('');
  const [newGuest, setNewGuest] = useState({
    name: '', side: 'bride' as const, rsvp: 'pending' as const, plusOne: false, phone: '', dietary: '', table: null as number | null,
  });

  const addGuest = () => {
    if (!newGuest.name) return;
    const guest: Guest = {
      id: Date.now().toString(),
      ...newGuest,
    };
    const updated = { ...data, guests: [...data.guests, guest] };
    const withHistory = addHistory(updated, '添加来宾', guest.name);
    onUpdate(withHistory);
    setNewGuest({ name: '', side: 'bride', rsvp: 'pending', plusOne: false, phone: '', dietary: '', table: null });
    setShowAdd(false);
  };

  const updateGuest = (id: string, updates: Partial<Guest>) => {
    const guest = data.guests.find(g => g.id === id);
    const updated = {
      ...data,
      guests: data.guests.map(g => g.id === id ? { ...g, ...updates } : g),
    };
    if (guest && updates.rsvp && updates.rsvp !== guest.rsvp) {
      const withHistory = addHistory(updated, `RSVP变更为${updates.rsvp === 'attending' ? '出席' : updates.rsvp === 'declined' ? '缺席' : '待定'}`, guest.name);
      onUpdate(withHistory);
      return;
    }
    onUpdate(updated);
  };

  const deleteGuest = (id: string) => {
    if (!confirm('确定删除吗？')) return;
    const guest = data.guests.find(g => g.id === id);
    const updated = { ...data, guests: data.guests.filter(g => g.id !== id) };
    const withHistory = addHistory(updated, '删除来宾', guest?.name || '');
    onUpdate(withHistory);
  };

  const filtered = data.guests.filter(g =>
    g.name.toLowerCase().includes(search.toLowerCase()) ||
    g.phone.includes(search)
  );

  const stats = {
    attending: data.guests.filter(g => g.rsvp === 'attending').length,
    declined: data.guests.filter(g => g.rsvp === 'declined').length,
    pending: data.guests.filter(g => g.rsvp === 'pending').length,
    plusOnes: data.guests.filter(g => g.rsvp === 'attending' && g.plusOne).length,
    total: data.guests.filter(g => g.rsvp === 'attending').length + data.guests.filter(g => g.rsvp === 'attending' && g.plusOne).length,
  };

  const rsvpColors = { pending: 'bg-yellow-100 text-yellow-700', attending: 'bg-green-100 text-green-700', declined: 'bg-red-100 text-red-700' };
  const sideLabels = { bride: '新娘方', groom: '新郎方', mutual: '共同' };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">👥 来宾管理</h2>
        <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> 添加来宾
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="card text-center">
          <div className="text-2xl font-bold text-green-600">{stats.attending}</div>
          <div className="text-xs text-gray-500">确认出席</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          <div className="text-xs text-gray-500">待定</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-red-500">{stats.declined}</div>
          <div className="text-xs text-gray-500">缺席</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-gray-700">{stats.plusOnes}</div>
          <div className="text-xs text-gray-500">携带+1</div>
        </div>
        <div className="card text-center bg-gray-900">
          <div className="text-2xl font-bold text-white">{stats.total}</div>
          <div className="text-xs text-gray-400">预计到场</div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input className="input-field pl-10" placeholder="搜索来宾姓名或电话" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Add Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-bold mb-4">添加来宾</h3>
            <div className="space-y-3">
              <input className="input-field" placeholder="姓名" value={newGuest.name} onChange={e => setNewGuest({ ...newGuest, name: e.target.value })} />
              <div className="grid grid-cols-2 gap-3">
                <select className="input-field" value={newGuest.side} onChange={e => setNewGuest({ ...newGuest, side: e.target.value as any })}>
                  <option value="bride">新娘方</option>
                  <option value="groom">新郎方</option>
                  <option value="mutual">共同</option>
                </select>
                <select className="input-field" value={newGuest.rsvp} onChange={e => setNewGuest({ ...newGuest, rsvp: e.target.value as any })}>
                  <option value="pending">待定</option>
                  <option value="attending">出席</option>
                  <option value="declined">缺席</option>
                </select>
              </div>
              <input className="input-field" placeholder="电话" value={newGuest.phone} onChange={e => setNewGuest({ ...newGuest, phone: e.target.value })} />
              <input className="input-field" placeholder="饮食禁忌（如：素食、过敏）" value={newGuest.dietary} onChange={e => setNewGuest({ ...newGuest, dietary: e.target.value })} />
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={newGuest.plusOne} onChange={e => setNewGuest({ ...newGuest, plusOne: e.target.checked })} />
                <span className="text-sm">携带+1</span>
              </label>
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
        <table className="w-full">
          <thead>
            <tr className="text-left text-sm text-gray-500 border-b border-gray-100">
              <th className="pb-3">姓名</th>
              <th className="pb-3">归属</th>
              <th className="pb-3">RSVP</th>
              <th className="pb-3">+1</th>
              <th className="pb-3">座位</th>
              <th className="pb-3">饮食</th>
              <th className="pb-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(guest => (
              <tr key={guest.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="py-3 font-medium">{guest.name}</td>
                <td className="py-3 text-sm text-gray-500">{sideLabels[guest.side]}</td>
                <td className="py-3">
                  <select
                    className={`text-xs px-2 py-1 rounded border-0 cursor-pointer ${rsvpColors[guest.rsvp]}`}
                    value={guest.rsvp}
                    onChange={e => updateGuest(guest.id, { rsvp: e.target.value as any })}
                  >
                    <option value="pending">待定</option>
                    <option value="attending">出席</option>
                    <option value="declined">缺席</option>
                  </select>
                </td>
                <td className="py-3 text-sm">{guest.plusOne ? '✓' : '-'}</td>
                <td className="py-3">
                  <input
                    type="number"
                    className="w-16 text-center input-field text-sm py-1"
                    value={guest.table || ''}
                    onChange={e => updateGuest(guest.id, { table: e.target.value ? Number(e.target.value) : null })}
                  />
                </td>
                <td className="py-3 text-sm text-gray-500">{guest.dietary || '-'}</td>
                <td className="py-3">
                  <button onClick={() => deleteGuest(guest.id)} className="text-red-400 hover:text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
