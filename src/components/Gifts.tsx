import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Plus, Trash2, Pencil, Check, X, Banknote, Package, Heart } from 'lucide-react';
import type { WeddingData, Gift } from '../types';
import { addHistory } from '../lib/data';

interface OutletContext {
  data: WeddingData;
  onUpdate: (data: WeddingData) => void;
}

export default function Gifts() {
  const { data, onUpdate } = useOutletContext<OutletContext>();
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [newGift, setNewGift] = useState({ from: '', amount: 0, item: '', type: 'cash' as Gift['type'], notes: '' });
  const [editGift, setEditGift] = useState<Partial<Gift>>({});

  const filtered = filterType === 'all' ? data.gifts : data.gifts.filter(g => g.type === filterType);
  const totalCash = data.gifts.filter(g => g.type === 'cash').reduce((s, g) => s + (g.amount || 0), 0);
  const totalGifts = data.gifts.filter(g => g.type === 'gift').length;
  const thankedCount = data.gifts.filter(g => g.thanked).length;

  const addGift = () => {
    if (!newGift.from) return;
    const gift: Gift = {
      id: Date.now().toString(),
      ...newGift,
      receivedAt: new Date().toISOString(),
      thanked: false,
    };
    const updated = { ...data, gifts: [...data.gifts, gift] };
    onUpdate(addHistory(updated, '添加礼物', gift.from));
    setNewGift({ from: '', amount: 0, item: '', type: 'cash', notes: '' });
    setShowAdd(false);
  };

  const toggleThanked = (id: string) => {
    const gift = data.gifts.find(g => g.id === id);
    if (!gift) return;
    const updated = {
      ...data,
      gifts: data.gifts.map(g => g.id === id ? { ...g, thanked: !g.thanked } as Gift : g),
    };
    onUpdate(addHistory(updated, gift.thanked ? '取消感谢标记' : '标记已感谢', gift.from));
  };

  const deleteGift = (id: string) => {
    if (!confirm('确定删除这条记录吗？')) return;
    const gift = data.gifts.find(g => g.id === id);
    const updated = { ...data, gifts: data.gifts.filter(g => g.id !== id) };
    onUpdate(addHistory(updated, '删除礼物记录', gift?.from || ''));
  };

  const startEdit = (gift: Gift) => {
    setEditingId(gift.id);
    setEditGift({ ...gift });
  };

  const saveEdit = () => {
    if (!editingId || !editGift.from) return;
    const updated = {
      ...data,
      gifts: data.gifts.map(g => g.id === editingId ? { ...g, ...editGift } as Gift : g),
    };
    onUpdate(addHistory(updated, '编辑礼物', editGift.from || ''));
    setEditingId(null);
    setEditGift({});
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--color-primary-dark)' }}>礼物登记</h2>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>记录收到的礼金和礼物，方便后续感谢</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> 添加记录
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="card text-center">
          <div className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>{data.gifts.length}</div>
          <div className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>总记录</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold" style={{ color: 'var(--color-accent-dark)' }}>¥{totalCash.toLocaleString()}</div>
          <div className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>礼金总额</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold" style={{ color: 'var(--color-rose)' }}>{totalGifts}</div>
          <div className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>实物礼物</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold" style={{ color: 'var(--color-primary-light)' }}>{thankedCount}</div>
          <div className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>已感谢</div>
        </div>
      </div>

      {/* Filter */}
      <div className="card flex flex-wrap gap-2">
        <button onClick={() => setFilterType('all')} className={`badge cursor-pointer ${filterType === 'all' ? 'badge-green' : 'badge-gray'}`}>全部</button>
        <button onClick={() => setFilterType('cash')} className={`badge cursor-pointer ${filterType === 'cash' ? 'badge-green' : 'badge-gray'}`}><Banknote className="w-3 h-3 inline mr-1" />礼金</button>
        <button onClick={() => setFilterType('gift')} className={`badge cursor-pointer ${filterType === 'gift' ? 'badge-green' : 'badge-gray'}`}><Package className="w-3 h-3 inline mr-1" />实物</button>
      </div>

      {/* Add Modal */}
      {showAdd && (
        <div className="modal-overlay" onClick={() => setShowAdd(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--color-primary-dark)' }}>添加礼物记录</h3>
            <div className="space-y-3">
              <input className="input-field" placeholder="送礼人 *" value={newGift.from} onChange={e => setNewGift({ ...newGift, from: e.target.value })} />
              <div className="flex gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" checked={newGift.type === 'cash'} onChange={() => setNewGift({ ...newGift, type: 'cash' })} />
                  <span className="text-sm flex items-center gap-1"><Banknote className="w-4 h-4" /> 礼金</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" checked={newGift.type === 'gift'} onChange={() => setNewGift({ ...newGift, type: 'gift' })} />
                  <span className="text-sm flex items-center gap-1"><Package className="w-4 h-4" /> 实物</span>
                </label>
              </div>
              {newGift.type === 'cash' ? (
                <input className="input-field" type="number" placeholder="金额" value={newGift.amount || ''} onChange={e => setNewGift({ ...newGift, amount: Number(e.target.value) })} />
              ) : (
                <input className="input-field" placeholder="礼物名称" value={newGift.item} onChange={e => setNewGift({ ...newGift, item: e.target.value })} />
              )}
              <input className="input-field" placeholder="备注" value={newGift.notes} onChange={e => setNewGift({ ...newGift, notes: e.target.value })} />
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={addGift} className="btn-primary flex-1">添加</button>
              <button onClick={() => setShowAdd(false)} className="btn-secondary flex-1">取消</button>
            </div>
          </div>
        </div>
      )}

      {/* Gift List */}
      <div className="card overflow-x-auto">
        <table className="table-wedding">
          <thead>
            <tr>
              <th>送礼人</th>
              <th>类型</th>
              <th>金额/物品</th>
              <th>备注</th>
              <th>感谢</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(gift => (
              <tr key={gift.id}>
                {editingId === gift.id ? (
                  <>
                    <td><input className="input-field text-sm" value={editGift.from || ''} onChange={e => setEditGift({ ...editGift, from: e.target.value })} /></td>
                    <td>
                      <select className="input-field text-sm" value={editGift.type || 'cash'} onChange={e => setEditGift({ ...editGift, type: e.target.value as Gift['type'] })}>
                        <option value="cash">礼金</option>
                        <option value="gift">实物</option>
                      </select>
                    </td>
                    <td>
                      {editGift.type === 'cash' || (!editGift.type && gift.type === 'cash') ? (
                        <input className="input-field text-sm" type="number" value={editGift.amount || 0} onChange={e => setEditGift({ ...editGift, amount: Number(e.target.value) })} />
                      ) : (
                        <input className="input-field text-sm" value={editGift.item || ''} onChange={e => setEditGift({ ...editGift, item: e.target.value })} />
                      )}
                    </td>
                    <td><input className="input-field text-sm" value={editGift.notes || ''} onChange={e => setEditGift({ ...editGift, notes: e.target.value })} /></td>
                    <td colSpan={2}>
                      <div className="flex gap-1">
                        <button onClick={saveEdit} className="btn-primary text-xs px-2 py-1"><Check className="w-3 h-3" /></button>
                        <button onClick={() => { setEditingId(null); setEditGift({}); }} className="btn-secondary text-xs px-2 py-1"><X className="w-3 h-3" /></button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="font-medium">{gift.from}</td>
                    <td>
                      <span className={`badge ${gift.type === 'cash' ? 'badge-gold' : 'badge-rose'}`}>
                        {gift.type === 'cash' ? <Banknote className="w-3 h-3 inline mr-1" /> : <Package className="w-3 h-3 inline mr-1" />}
                        {gift.type === 'cash' ? '礼金' : '实物'}
                      </span>
                    </td>
                    <td className="font-medium">
                      {gift.type === 'cash' ? `¥${(gift.amount || 0).toLocaleString()}` : gift.item}
                    </td>
                    <td className="text-sm">{gift.notes || '-'}</td>
                    <td>
                      <button
                        onClick={() => toggleThanked(gift.id)}
                        className={`badge cursor-pointer transition-all ${gift.thanked ? 'badge-green' : 'badge-gray'}`}
                      >
                        {gift.thanked ? <Heart className="w-3 h-3 inline fill-current" /> : <Heart className="w-3 h-3 inline" />}
                        {gift.thanked ? ' 已感谢' : ' 未感谢'}
                      </button>
                    </td>
                    <td>
                      <div className="flex gap-1 opacity-0 hover:opacity-100 transition-opacity">
                        <button onClick={() => startEdit(gift)} className="btn-ghost p-1"><Pencil className="w-3 h-3" /></button>
                        <button onClick={() => deleteGift(gift.id)} className="btn-ghost p-1 text-red-400 hover:text-red-600"><Trash2 className="w-3 h-3" /></button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-8 text-sm" style={{ color: 'var(--color-text-muted)' }}>暂无记录</div>
        )}
      </div>
    </div>
  );
}
