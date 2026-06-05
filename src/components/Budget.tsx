import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { WeddingData, BudgetItem } from '../types';
import { addHistory } from '../lib/data';

interface Props {
  data: WeddingData;
  onUpdate: (data: WeddingData) => void;
}

export default function Budget({ data, onUpdate }: Props) {
  const [showAdd, setShowAdd] = useState(false);
  const [newItem, setNewItem] = useState({ category: '', item: '', planned: 0 });

  const totalPlanned = data.budget.reduce((sum, b) => sum + b.planned, 0);
  const totalActual = data.budget.reduce((sum, b) => sum + b.actual, 0);
  const totalPaid = data.budget.filter(b => b.paid).reduce((sum, b) => sum + b.actual, 0);
  const remaining = totalPlanned - totalActual;

  const addItem = () => {
    if (!newItem.item) return;
    const item: BudgetItem = {
      id: Date.now().toString(),
      ...newItem,
      actual: 0,
      paid: false,
    };
    const updated = { ...data, budget: [...data.budget, item] };
    const withHistory = addHistory(updated, '添加预算项', item.item);
    onUpdate(withHistory);
    setNewItem({ category: '', item: '', planned: 0 });
    setShowAdd(false);
  };

  const updateActual = (id: string, actual: number) => {
    const updated = {
      ...data,
      budget: data.budget.map(b => b.id === id ? { ...b, actual } : b),
    };
    onUpdate(updated);
  };

  const togglePaid = (id: string) => {
    const item = data.budget.find(b => b.id === id);
    const updated = {
      ...data,
      budget: data.budget.map(b => b.id === id ? { ...b, paid: !b.paid } : b),
    };
    const withHistory = addHistory(updated, item?.paid ? '标记未付' : '标记已付', item?.item || '');
    onUpdate(withHistory);
  };

  const deleteItem = (id: string) => {
    if (!confirm('确定删除吗？')) return;
    const item = data.budget.find(b => b.id === id);
    const updated = { ...data, budget: data.budget.filter(b => b.id !== id) };
    const withHistory = addHistory(updated, '删除预算项', item?.item || '');
    onUpdate(withHistory);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">💰 预算管理</h2>
        <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> 添加项目
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="text-sm text-gray-500">总预算</div>
          <div className="text-xl font-bold text-gray-900">¥{totalPlanned.toLocaleString()}</div>
        </div>
        <div className="card">
          <div className="text-sm text-gray-500">已支出</div>
          <div className="text-xl font-bold text-red-600">¥{totalActual.toLocaleString()}</div>
        </div>
        <div className="card">
          <div className="text-sm text-gray-500">剩余</div>
          <div className={`text-xl font-bold ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ¥{remaining.toLocaleString()}
          </div>
        </div>
        <div className="card">
          <div className="text-sm text-gray-500">已结清</div>
          <div className="text-xl font-bold text-gray-900">¥{totalPaid.toLocaleString()}</div>
        </div>
      </div>

      {/* Add Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-bold mb-4">添加预算项目</h3>
            <div className="space-y-3">
              <input className="input-field" placeholder="类别（如：场地、餐饮）" value={newItem.category} onChange={e => setNewItem({ ...newItem, category: e.target.value })} />
              <input className="input-field" placeholder="项目名称" value={newItem.item} onChange={e => setNewItem({ ...newItem, item: e.target.value })} />
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
        <table className="w-full">
          <thead>
            <tr className="text-left text-sm text-gray-500 border-b border-gray-100">
              <th className="pb-3">类别</th>
              <th className="pb-3">项目</th>
              <th className="pb-3 text-right">预算</th>
              <th className="pb-3 text-right">实际</th>
              <th className="pb-3 text-center">状态</th>
              <th className="pb-3"></th>
            </tr>
          </thead>
          <tbody>
            {data.budget.map(item => (
              <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="py-3 text-sm">{item.category}</td>
                <td className="py-3 font-medium">{item.item}</td>
                <td className="py-3 text-right text-sm">¥{item.planned.toLocaleString()}</td>
                <td className="py-3 text-right">
                  <input
                    type="number"
                    className="w-24 text-right input-field text-sm"
                    value={item.actual || ''}
                    onChange={e => updateActual(item.id, Number(e.target.value))}
                  />
                </td>
                <td className="py-3 text-center">
                  <button
                    onClick={() => togglePaid(item.id)}
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      item.paid ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {item.paid ? '已付' : '未付'}
                  </button>
                </td>
                <td className="py-3">
                  <button onClick={() => deleteItem(item.id)} className="text-red-400 hover:text-red-600">
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
