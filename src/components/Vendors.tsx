import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Plus, Trash2, Pencil, Check, X, Star, Phone, Mail, FileText, User } from 'lucide-react';
import type { WeddingData, Vendor } from '../types';
import { addHistory } from '../lib/data';

interface OutletContext {
  data: WeddingData;
  onUpdate: (data: WeddingData) => void;
}

const categoryLabels: Record<string, string> = {
  venue: '场地', catering: '餐饮', photography: '摄影', videography: '摄像',
  makeup: '化妆', florist: '花艺', music: '音乐', mc: '司仪',
  transport: '交通', other: '其他',
};

const statusLabels: Record<string, { text: string; class: string }> = {
  contacted: { text: '已联系', class: 'vendor-status-contacted' },
  quoted: { text: '已报价', class: 'vendor-status-quoted' },
  booked: { text: '已预订', class: 'vendor-status-booked' },
  completed: { text: '已完成', class: 'vendor-status-booked' },
  cancelled: { text: '已取消', class: 'vendor-status-contacted' },
};

export default function Vendors() {
  const { data, onUpdate } = useOutletContext<OutletContext>();
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [newVendor, setNewVendor] = useState({ category: 'venue' as Vendor['category'], name: '', contact: '', phone: '', email: '', price: 0, deposit: 0, notes: '', rating: 3, status: 'contacted' as Vendor['status'] });
  const [editVendor, setEditVendor] = useState<Partial<Vendor>>({});

  const filtered = filterCategory === 'all' ? data.vendors : data.vendors.filter(v => v.category === filterCategory);
  const totalCommitted = data.vendors.filter(v => v.status === 'booked' || v.status === 'completed').reduce((s, v) => s + v.price, 0);
  const totalPaid = data.vendors.filter(v => v.paid).reduce((s, v) => s + v.price, 0);

  const addVendor = () => {
    if (!newVendor.name) return;
    const vendor: Vendor = {
      id: Date.now().toString(),
      ...newVendor,
      paid: false,
    };
    const updated = { ...data, vendors: [...data.vendors, vendor] };
    onUpdate(addHistory(updated, '添加供应商', vendor.name));
    setNewVendor({ category: 'venue', name: '', contact: '', phone: '', email: '', price: 0, deposit: 0, notes: '', rating: 3, status: 'contacted' });
    setShowAdd(false);
  };

  const togglePaid = (id: string) => {
    const vendor = data.vendors.find(v => v.id === id);
    if (!vendor) return;
    const updated = {
      ...data,
      vendors: data.vendors.map(v => v.id === id ? { ...v, paid: !v.paid } as Vendor : v),
    };
    onUpdate(addHistory(updated, vendor.paid ? '取消付款标记' : '标记已付款', vendor.name));
  };

  const updateStatus = (id: string, status: Vendor['status']) => {
    const vendor = data.vendors.find(v => v.id === id);
    if (!vendor) return;
    const updated = {
      ...data,
      vendors: data.vendors.map(v => v.id === id ? { ...v, status } as Vendor : v),
    };
    onUpdate(addHistory(updated, `状态更新为${statusLabels[status].text}`, vendor.name));
  };

  const deleteVendor = (id: string) => {
    if (!confirm('确定删除这个供应商吗？')) return;
    const vendor = data.vendors.find(v => v.id === id);
    const updated = { ...data, vendors: data.vendors.filter(v => v.id !== id) };
    onUpdate(addHistory(updated, '删除供应商', vendor?.name || ''));
  };

  const startEdit = (vendor: Vendor) => {
    setEditingId(vendor.id);
    setEditVendor({ ...vendor });
  };

  const saveEdit = () => {
    if (!editingId || !editVendor.name) return;
    const updated = {
      ...data,
      vendors: data.vendors.map(v => v.id === editingId ? { ...v, ...editVendor } as Vendor : v),
    };
    onUpdate(addHistory(updated, '编辑供应商', editVendor.name || ''));
    setEditingId(null);
    setEditVendor({});
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--color-primary-dark)' }}>供应商管理</h2>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
            已确认 {data.vendors.filter(v => v.status === 'booked').length} 家 · 已付 ¥{totalPaid.toLocaleString()}
          </p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> 添加供应商
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="card text-center">
          <div className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>{data.vendors.length}</div>
          <div className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>总供应商</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold" style={{ color: 'var(--color-accent-dark)' }}>{data.vendors.filter(v => v.status === 'booked').length}</div>
          <div className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>已预订</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold" style={{ color: 'var(--color-primary-light)' }}>¥{totalCommitted.toLocaleString()}</div>
          <div className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>已确认金额</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold" style={{ color: 'var(--color-rose)' }}>¥{totalPaid.toLocaleString()}</div>
          <div className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>已付款</div>
        </div>
      </div>

      {/* Filter */}
      <div className="card flex flex-wrap gap-2">
        <button onClick={() => setFilterCategory('all')} className={`badge cursor-pointer ${filterCategory === 'all' ? 'badge-green' : 'badge-gray'}`}>全部</button>
        {Object.entries(categoryLabels).map(([key, label]) => (
          <button key={key} onClick={() => setFilterCategory(key)} className={`badge cursor-pointer ${filterCategory === key ? 'badge-green' : 'badge-gray'}`}>{label}</button>
        ))}
      </div>

      {/* Add Modal */}
      {showAdd && (
        <div className="modal-overlay" onClick={() => setShowAdd(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--color-primary-dark)' }}>添加供应商</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <select className="input-field" value={newVendor.category} onChange={e => setNewVendor({ ...newVendor, category: e.target.value as Vendor['category'] })}>
                  {Object.entries(categoryLabels).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
                <input className="input-field" placeholder="供应商名称 *" value={newVendor.name} onChange={e => setNewVendor({ ...newVendor, name: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input className="input-field" placeholder="联系人" value={newVendor.contact} onChange={e => setNewVendor({ ...newVendor, contact: e.target.value })} />
                <input className="input-field" placeholder="电话" value={newVendor.phone} onChange={e => setNewVendor({ ...newVendor, phone: e.target.value })} />
              </div>
              <input className="input-field" placeholder="邮箱" value={newVendor.email} onChange={e => setNewVendor({ ...newVendor, email: e.target.value })} />
              <div className="grid grid-cols-2 gap-3">
                <input className="input-field" type="number" placeholder="报价金额" value={newVendor.price || ''} onChange={e => setNewVendor({ ...newVendor, price: Number(e.target.value) })} />
                <input className="input-field" type="number" placeholder="定金" value={newVendor.deposit || ''} onChange={e => setNewVendor({ ...newVendor, deposit: Number(e.target.value) })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <select className="input-field" value={newVendor.rating} onChange={e => setNewVendor({ ...newVendor, rating: Number(e.target.value) })}>
                  {[1, 2, 3, 4, 5].map(r => <option key={r} value={r}>{r} 星</option>)}
                </select>
                <select className="input-field" value={newVendor.status} onChange={e => setNewVendor({ ...newVendor, status: e.target.value as Vendor['status'] })}>
                  {Object.entries(statusLabels).map(([key, { text }]) => (
                    <option key={key} value={key}>{text}</option>
                  ))}
                </select>
              </div>
              <textarea className="input-field h-16 resize-none" placeholder="备注" value={newVendor.notes} onChange={e => setNewVendor({ ...newVendor, notes: e.target.value })} />
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={addVendor} className="btn-primary flex-1">添加</button>
              <button onClick={() => setShowAdd(false)} className="btn-secondary flex-1">取消</button>
            </div>
          </div>
        </div>
      )}

      {/* Vendor Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(vendor => (
          <div key={vendor.id} className="vendor-card">
            {editingId === vendor.id ? (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <select className="input-field text-sm" value={editVendor.category || vendor.category} onChange={e => setEditVendor({ ...editVendor, category: e.target.value as Vendor['category'] })}>
                    {Object.entries(categoryLabels).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                  <input className="input-field text-sm" value={editVendor.name || ''} onChange={e => setEditVendor({ ...editVendor, name: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input className="input-field text-sm" placeholder="联系人" value={editVendor.contact || ''} onChange={e => setEditVendor({ ...editVendor, contact: e.target.value })} />
                  <input className="input-field text-sm" placeholder="电话" value={editVendor.phone || ''} onChange={e => setEditVendor({ ...editVendor, phone: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input className="input-field text-sm" type="number" value={editVendor.price || 0} onChange={e => setEditVendor({ ...editVendor, price: Number(e.target.value) })} />
                  <input className="input-field text-sm" type="number" value={editVendor.deposit || 0} onChange={e => setEditVendor({ ...editVendor, deposit: Number(e.target.value) })} />
                </div>
                <div className="flex gap-2">
                  <button onClick={saveEdit} className="btn-primary text-xs flex-1 flex items-center justify-center gap-1"><Check className="w-3 h-3" /> 保存</button>
                  <button onClick={() => { setEditingId(null); setEditVendor({}); }} className="btn-secondary text-xs flex-1 flex items-center justify-center gap-1"><X className="w-3 h-3" /> 取消</button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="badge badge-gray text-xs">{categoryLabels[vendor.category]}</span>
                      <span className={`badge text-xs ${statusLabels[vendor.status].class}`}>{statusLabels[vendor.status].text}</span>
                    </div>
                    <h3 className="font-bold" style={{ color: 'var(--color-primary-dark)' }}>{vendor.name}</h3>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => startEdit(vendor)} className="btn-ghost p-1"><Pencil className="w-3 h-3" /></button>
                    <button onClick={() => deleteVendor(vendor.id)} className="btn-ghost p-1 text-red-400 hover:text-red-600"><Trash2 className="w-3 h-3" /></button>
                  </div>
                </div>

                <div className="space-y-1.5 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                  {vendor.contact && <div className="flex items-center gap-2"><User className="w-3.5 h-3.5" /> {vendor.contact}</div>}
                  {vendor.phone && <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5" /> {vendor.phone}</div>}
                  {vendor.email && <div className="flex items-center gap-2"><Mail className="w-3.5 h-3.5" /> {vendor.email}</div>}
                </div>

                <div className="flex items-center gap-1 mt-2">
                  {[1, 2, 3, 4, 5].map(r => (
                    <Star key={r} className={`w-4 h-4 ${r <= vendor.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                  ))}
                </div>

                <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: '1px solid var(--color-border)' }}>
                  <div>
                    <span className="text-lg font-bold" style={{ color: 'var(--color-primary)' }}>¥{vendor.price.toLocaleString()}</span>
                    {vendor.deposit > 0 && <span className="text-xs ml-2" style={{ color: 'var(--color-text-muted)' }}>定金 ¥{vendor.deposit.toLocaleString()}</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      className="input-field text-xs w-auto py-1"
                      value={vendor.status}
                      onChange={e => updateStatus(vendor.id, e.target.value as Vendor['status'])}
                    >
                      {Object.entries(statusLabels).map(([key, { text }]) => (
                        <option key={key} value={key}>{text}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => togglePaid(vendor.id)}
                      className={`badge cursor-pointer ${vendor.paid ? 'badge-green' : 'badge-gray'}`}
                    >
                      {vendor.paid ? '✓ 已付' : '未付'}
                    </button>
                  </div>
                </div>

                {vendor.notes && (
                  <div className="mt-2 text-xs flex items-start gap-1" style={{ color: 'var(--color-text-muted)' }}>
                    <FileText className="w-3 h-3 mt-0.5 flex-shrink-0" /> {vendor.notes}
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="card text-center py-8">
          <p style={{ color: 'var(--color-text-muted)' }}>暂无供应商，点击上方按钮添加</p>
        </div>
      )}
    </div>
  );
}
