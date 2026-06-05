import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Plus, Trash2, Pencil, Check, X, Download } from 'lucide-react';
import type { WeddingData, BudgetItem } from '../types';
import { addHistory } from '../lib/data';

interface OutletContext {
  data: WeddingData;
  onUpdate: (data: WeddingData) => void;
}

export default function Budget() {
  const { data, onUpdate } = useOutletContext<OutletContext>();
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newItem, setNewItem] = useState({ category: '', item: '', planned: 0 });
  const [editItem, setEditItem] = useState<Partial<BudgetItem>>({});

const totalActual = data.budget.reduce((sum, b) => sum + b.actual, 0);
  const totalPaid = data.budget.filter(b => b.paid).reduce((sum, b) => sum + b.actual, 0);
  const remaining = data.settings.budgetTotal - totalActual;

  const addItem = () => {
    if (!newItem.item || !newItem.category) return;
    const item: BudgetItem = {
      id: Date.now().toString(),
      ...newItem,
      actual: 0,
      paid: false,
    };
    const updated = { ...data, budget: [...data.budget, item] };
    onUpdate(addHistory(updated, '添加预算', item.item));
    setNewItem({ category: '', item: '', planned: 0 });
    setShowAdd(false);
  };

  const updateActual = (id: string, actual: number) => {
    const updated = {
      ...data,
      budget: data.budget.map(b => b.id === id ? { ...b, actual } : b),
    };
    onUpdate(addHistory(updated, '更新支出', data.budget.find(b => b.id === id)?.item || ''));
  };

  const togglePaid = (id: string) => {
    const item = data.budget.find(b => b.id === id);
    if (!item) return;
    const updated = {
      ...data,
      budget: data.budget.map(b => b.id === id ? { ...b, paid: !b.paid } : b),
    };
    onUpdate(addHistory(updated, item.paid ? '取消结清' : '标记结清', item.item));
  };

  const deleteItem = (id: string) => {
    if (!confirm('确定删除这个预算项目吗？')) return;
    const item = data.budget.find(b => b.id === id);
    const updated = { ...data, budget: data.budget.filter(b => b.id !== id) };
    onUpdate(addHistory(updated, '删除预算', item?.item || ''));
  };

  const startEdit = (item: BudgetItem) => {
    setEditingId(item.id);
    setEditItem({ ...item });
  };

  const saveEdit = () => {
    if (!editingId || !editItem.item || !editItem.category) return;
    const updated = {
      ...data,
      budget: data.budget.map(b => b.id === editingId ? { ...b, ...editItem } as BudgetItem : b),
    };
    onUpdate(addHistory(updated, '编辑预算', editItem.item || ''));
    setEditingId(null);
    setEditItem({});
  };

  const exportCSV = () => {
    const headers = ['类别', '项目', '预算', '实际', '差额', '状态'];
    const rows = data.budget.map(b => [
      b.category, b.item, b.planned, b.actual, b.planned - b.actual, b.paid ? '已结清' : '未结清',
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = '婚礼预算.csv';
    link.click();
  };

  const categories = [...new Set(data.budget.map(b => b.category))];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--color-primary-dark)' }}>预算管理</h2>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>总预算 ¥{data.settings.budgetTotal.toLocaleString()}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportCSV} className="btn-secondary flex items-center gap-2 text-sm">
            <Download className="w-4 h-4" /> 导出
          </button>
          <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> 添加
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="card">
          <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>总预算</div>
          <div className="text-xl font-bold" style={{ color: 'var(--color-primary)' }}>¥{data.settings.budgetTotal.toLocaleString()}</div>
        </div>
        <div className="card">
          <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>已支出</div>
          <div className="text-xl font-bold" style={{ color: 'var(--color-accent-dark)' }}>¥{totalActual.toLocaleString()}</div>
        </div>
        <div className="card">
          <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>剩余</div>
          <div className={`text-xl font-bold ${remaining >= 0 ? '' : 'text-red-500'}`} style={remaining >= 0 ? { color: 'var(--color-primary)' } : {}}>
            ¥{remaining.toLocaleString()}
          </div>
        </div>
        <div className="card">
          <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>已结清</div>
          <div className="text-xl font-bold" style={{ color: 'var(--color-primary-light)' }}>¥{totalPaid.toLocaleString()}</div>
        </div>
      </div>

      {/* Progress */}
      <div className="card">
        <div className="flex justify-between text-sm mb-2">
          <span style={{ color: 'var(--color-text)' }}>预算使用进度</span>
          <span style={{ color: 'var(--color-primary)' }}>{Math.round((totalActual / data.settings.budgetTotal) * 100)}%</span>
        </div>
        <div className="progress-bar">
          <div className="progress-bar-fill" style={{ width: `${Math.min((totalActual / data.settings.budgetTotal) * 100, 100)}%` }} />
        </div>
      </div>

      {/* Add Modal */}
      {showAdd && (
        <div className="modal-overlay" onClick={() => setShowAdd(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--color-primary-dark)' }}>添加预算项目</h3>
            <div className="space-y-3">
              <input className="input-field" placeholder="类别（如：场地、餐饮）" value={newItem.category} onChange={e => setNewItem({ ...newItem, category: e.target.value })} />
              <input className="input-field" placeholder="项目名称 *" value={newItem.item} onChange={e => setNewItem({ ...newItem, item: e.target.value })} />
              <input className="input-field" type="number" placeholder="预算金额" value={newItem.planned || ''} onChange={e => setNewItem({ ...newItem, planned: Number(e.target.value) })} />
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={addItem} className="btn-primary flex-1">添加</button>
              <button onClick={() => setShowAdd(false)} className="btn-secondary flex-1">取消</button>
            </div>
          </div>
        </div>
      )}

      {/* Budget Table */}
      <div className="card overflow-x-auto">
        <table className="table-wedding">
          <thead>
            <tr>
              <th>类别</th>
              <th>项目</th>
              <th>预算</th>
              <th>实际</th>
              <th>差额</th>
              <th>状态</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {data.budget.map(item => (
              <tr key={item.id}>
                {editingId === item.id ? (
                  <>
                    <td><input className="input-field text-sm" value={editItem.category || ''} onChange={e => setEditItem({ ...editItem, category: e.target.value })} /></td>
                    <td><input className="input-field text-sm" value={editItem.item || ''} onChange={e => setEditItem({ ...editItem, item: e.target.value })} /></td>
                    <td><input className="input-field text-sm" type="number" value={editItem.planned || 0} onChange={e => setEditItem({ ...editItem, planned: Number(e.target.value) })} /></td>
                    <td><input className="input-field text-sm" type="number" value={editItem.actual || 0} onChange={e => setEditItem({ ...editItem, actual: Number(e.target.value) })} /></td>
                    <td>¥{((editItem.planned || 0) - (editItem.actual || 0)).toLocaleString()}</td>
                    <td colSpan={2}>
                      <div className="flex gap-1">
                        <button onClick={saveEdit} className="btn-primary text-xs px-2 py-1"><Check className="w-3 h-3" /></button>
                        <button onClick={() => { setEditingId(null); setEditItem({}); }} className="btn-secondary text-xs px-2 py-1"><X className="w-3 h-3" /></button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td><span className="badge badge-gray">{item.category}</span></td>
                    <td className="font-medium">{item.item}</td>
                    <td>¥{item.planned.toLocaleString()}</td>
                    <td>
                      <input
                        className="input-field text-sm w-24"
                        type="number"
                        value={item.actual}
                        onChange={e => updateActual(item.id, Number(e.target.value))}
                      />
                    </td>
                    <td className={item.planned - item.actual < 0 ? 'text-red-500 font-medium' : ''}>
                      ¥{(item.planned - item.actual).toLocaleString()}
                    </td>
                    <td>
                      <button
                        onClick={() => togglePaid(item.id)}
                        className={`badge cursor-pointer transition-all ${item.paid ? 'badge-green' : 'badge-gray'}`}
                      >
                        {item.paid ? '✓ 已结清' : '未结清'}
                      </button>
                    </td>
                    <td>
                      <div className="flex gap-1 opacity-0 hover:opacity-100 transition-opacity">
                        <button onClick={() => startEdit(item)} className="btn-ghost p-1"><Pencil className="w-3 h-3" /></button>
                        <button onClick={() => deleteItem(item.id)} className="btn-ghost p-1 text-red-400 hover:text-red-600"><Trash2 className="w-3 h-3" /></button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Category Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {categories.map(cat => {
          const catItems = data.budget.filter(b => b.category === cat);
          const catPlanned = catItems.reduce((s, b) => s + b.planned, 0);
          const catActual = catItems.reduce((s, b) => s + b.actual, 0);
          return (
            <div key={cat} className="card">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-sm" style={{ color: 'var(--color-primary-dark)' }}>{cat}</span>
                <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{catItems.length} 项</span>
              </div>
              <div className="flex justify-between text-sm">
                <span style={{ color: 'var(--color-text-muted)' }}>预算 ¥{catPlanned.toLocaleString()}</span>
                <span style={{ color: catActual > catPlanned ? 'red' : 'var(--color-primary)' }}>实际 ¥{catActual.toLocaleString()}</span>
              </div>
              <div className="progress-bar mt-2">
                <div className="progress-bar-fill" style={{ width: `${Math.min((catActual / catPlanned) * 100, 100)}%`, background: catActual > catPlanned ? '#ef4444' : undefined }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
