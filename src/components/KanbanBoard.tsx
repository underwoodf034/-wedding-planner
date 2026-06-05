import { useState } from 'react';
import { Plus, Trash2, GripVertical, Calendar, User } from 'lucide-react';
import type { WeddingData, Task } from '../types';
import { addHistory } from '../lib/data';

interface Props {
  data: WeddingData;
  onUpdate: (data: WeddingData) => void;
}

const COLUMNS = [
  { id: 'todo', title: '📋 待办', color: 'bg-gray-100' },
  { id: 'in-progress', title: '🔨 进行中', color: 'bg-blue-50' },
  { id: 'done', title: '✅ 已完成', color: 'bg-green-50' },
];

export default function KanbanBoard({ data, onUpdate }: Props) {
  const [showAdd, setShowAdd] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'medium' as const, assignee: '', dueDate: '' });
  const [draggedId, setDraggedId] = useState<string | null>(null);
  console.log(draggedId); // 避免未使用变量警告

  const addTask = () => {
    if (!newTask.title) return;
    const task: Task = {
      id: Date.now().toString(),
      ...newTask,
      status: 'todo',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = { ...data, tasks: [...data.tasks, task] };
    const withHistory = addHistory(updated, '创建任务', task.title);
    onUpdate(withHistory);
    setNewTask({ title: '', description: '', priority: 'medium', assignee: '', dueDate: '' });
    setShowAdd(false);
  };

  const moveTask = (taskId: string, newStatus: 'todo' | 'in-progress' | 'done') => {
    const task = data.tasks.find(t => t.id === taskId);
    if (!task || task.status === newStatus) return;
    
    const updatedTasks = data.tasks.map(t => 
      t.id === taskId ? { ...t, status: newStatus, updatedAt: new Date().toISOString() } : t
    );
    const updated = { ...data, tasks: updatedTasks };
    const withHistory = addHistory(updated, `移动到${COLUMNS.find(c => c.id === newStatus)?.title}`, task.title);
    onUpdate(withHistory);
  };

  const deleteTask = (taskId: string) => {
    if (!confirm('确定删除这个任务吗？')) return;
    const task = data.tasks.find(t => t.id === taskId);
    const updatedTasks = data.tasks.filter(t => t.id !== taskId);
    const updated = { ...data, tasks: updatedTasks };
    const withHistory = addHistory(updated, '删除任务', task?.title || '');
    onUpdate(withHistory);
  };

  const priorityColors = {
    low: 'text-green-600 bg-green-50',
    medium: 'text-yellow-600 bg-yellow-50',
    high: 'text-red-600 bg-red-50',
  };

  const priorityLabels = { low: '低', medium: '中', high: '高' };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">任务看板</h2>
        <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> 新建任务
        </button>
      </div>

      {/* Add Task Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-bold mb-4">新建任务</h3>
            <div className="space-y-3">
              <input
                className="input-field"
                placeholder="任务标题"
                value={newTask.title}
                onChange={e => setNewTask({ ...newTask, title: e.target.value })}
              />
              <textarea
                className="input-field h-20 resize-none"
                placeholder="描述"
                value={newTask.description}
                onChange={e => setNewTask({ ...newTask, description: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-3">
                <select
                  className="input-field"
                  value={newTask.priority}
                  onChange={e => setNewTask({ ...newTask, priority: e.target.value as any })}
                >
                  <option value="low">低优先级</option>
                  <option value="medium">中优先级</option>
                  <option value="high">高优先级</option>
                </select>
                <input
                  className="input-field"
                  placeholder="负责人"
                  value={newTask.assignee}
                  onChange={e => setNewTask({ ...newTask, assignee: e.target.value })}
                />
              </div>
              <input
                className="input-field"
                type="date"
                value={newTask.dueDate}
                onChange={e => setNewTask({ ...newTask, dueDate: e.target.value })}
              />
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={addTask} className="btn-primary flex-1">创建</button>
              <button onClick={() => setShowAdd(false)} className="btn-secondary flex-1">取消</button>
            </div>
          </div>
        </div>
      )}

      {/* Kanban Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {COLUMNS.map(col => (
          <div key={col.id} className={`${col.color} rounded-xl p-3 min-h-[400px]`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-700">{col.title}</h3>
              <span className="text-xs bg-white px-2 py-1 rounded-full text-gray-500">
                {data.tasks.filter(t => t.status === col.id).length}
              </span>
            </div>
            
            <div className="space-y-2">
              {data.tasks.filter(t => t.status === col.id).map(task => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={() => setDraggedId(task.id)}
                  onDragEnd={() => setDraggedId(null)}
                  className="task-card group"
                >
                  <div className="flex items-start gap-2">
                    <GripVertical className="w-4 h-4 text-gray-300 mt-1 cursor-move" />
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <p className="font-medium text-gray-800 text-sm">{task.title}</p>
                        <button onClick={() => deleteTask(task.id)} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                      {task.description && <p className="text-xs text-gray-500 mt-1">{task.description}</p>}
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <span className={`text-xs px-2 py-0.5 rounded ${priorityColors[task.priority]}`}>
                          {priorityLabels[task.priority]}
                        </span>
                        {task.assignee && (
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <User className="w-3 h-3" /> {task.assignee}
                          </span>
                        )}
                        {task.dueDate && (
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> {task.dueDate}
                          </span>
                        )}
                      </div>
                      {/* Move buttons */}
                      <div className="flex gap-1 mt-2">
                        {col.id !== 'todo' && (
                          <button onClick={() => moveTask(task.id, 'todo')} className="text-xs text-gray-400 hover:text-gray-600">
                            ← 待办
                          </button>
                        )}
                        {col.id !== 'in-progress' && (
                          <button onClick={() => moveTask(task.id, 'in-progress')} className="text-xs text-gray-400 hover:text-gray-600">
                            {col.id === 'todo' ? '开始 →' : '← 进行中'}
                          </button>
                        )}
                        {col.id !== 'done' && (
                          <button onClick={() => moveTask(task.id, 'done')} className="text-xs text-gray-400 hover:text-gray-600">
                            完成 →
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
