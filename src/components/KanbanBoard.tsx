import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Plus, Trash2, GripVertical, Calendar, User, Pencil, X, Check } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { WeddingData, Task } from '../types';
import { addHistory } from '../lib/data';

interface OutletContext {
  data: WeddingData;
  onUpdate: (data: WeddingData) => void;
}

const COLUMNS = [
  { id: 'todo', title: '📋 待办', color: '#f0ece3', borderColor: '#d4c4a8' },
  { id: 'in-progress', title: '🔨 进行中', color: '#e8f0e8', borderColor: '#a8c4a8' },
  { id: 'done', title: '✅ 已完成', color: '#e8f0e8', borderColor: '#7cb87c' },
];

const priorityColors: Record<string, string> = {
  low: 'badge-green',
  medium: 'badge-gold',
  high: 'badge-rose',
};
const priorityLabels: Record<string, string> = { low: '低', medium: '中', high: '高' };

export default function KanbanBoard() {
  const { data, onUpdate } = useOutletContext<OutletContext>();
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'medium' as const, assignee: '', dueDate: '' });
  const [editTask, setEditTask] = useState<Partial<Task>>({});
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

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
    onUpdate(addHistory(updated, '创建任务', task.title));
    setNewTask({ title: '', description: '', priority: 'medium', assignee: '', dueDate: '' });
    setShowAdd(false);
  };

  const moveTask = (taskId: string, newStatus: Task['status']) => {
    const task = data.tasks.find(t => t.id === taskId);
    if (!task || task.status === newStatus) return;
    const updatedTasks = data.tasks.map(t =>
      t.id === taskId ? { ...t, status: newStatus, updatedAt: new Date().toISOString() } : t
    );
    const updated = { ...data, tasks: updatedTasks };
    onUpdate(addHistory(updated, `移动到${COLUMNS.find(c => c.id === newStatus)?.title}`, task.title));
  };

  const deleteTask = (taskId: string) => {
    if (!confirm('确定删除这个任务吗？')) return;
    const task = data.tasks.find(t => t.id === taskId);
    const updatedTasks = data.tasks.filter(t => t.id !== taskId);
    const updated = { ...data, tasks: updatedTasks };
    onUpdate(addHistory(updated, '删除任务', task?.title || ''));
  };

  const startEdit = (task: Task) => {
    setEditingId(task.id);
    setEditTask({ ...task });
  };

  const saveEdit = () => {
    if (!editingId || !editTask.title) return;
    const updatedTasks = data.tasks.map(t =>
      t.id === editingId ? { ...t, ...editTask, updatedAt: new Date().toISOString() } as Task : t
    );
    const updated = { ...data, tasks: updatedTasks };
    onUpdate(addHistory(updated, '编辑任务', editTask.title || ''));
    setEditingId(null);
    setEditTask({});
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    const activeTask = data.tasks.find(t => t.id === active.id);
    if (!activeTask) return;

    // 如果拖放到列上
    const overColumn = COLUMNS.find(c => c.id === over.id);
    if (overColumn && activeTask.status !== overColumn.id) {
      moveTask(active.id, overColumn.id as Task['status']);
      return;
    }

    // 如果拖放到另一个任务上（同列排序）
    const overTask = data.tasks.find(t => t.id === over.id);
    if (overTask && activeTask.status === overTask.status) {
      const colTasks = data.tasks.filter(t => t.status === activeTask.status);
      const oldIndex = colTasks.findIndex(t => t.id === active.id);
      const newIndex = colTasks.findIndex(t => t.id === over.id);
      const reordered = arrayMove(colTasks, oldIndex, newIndex);
      const otherTasks = data.tasks.filter(t => t.status !== activeTask.status);
      onUpdate({ ...data, tasks: [...otherTasks, ...reordered] });
    }
  };

  const activeTask = activeId ? data.tasks.find(t => t.id === activeId) : null;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--color-primary-dark)' }}>任务看板</h2>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>拖拽任务卡片可移动状态，点击编辑修改详情</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> 新建任务
        </button>
      </div>

      {/* Add Task Modal */}
      {showAdd && (
        <div className="modal-overlay" onClick={() => setShowAdd(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--color-primary-dark)' }}>新建任务</h3>
            <div className="space-y-3">
              <input className="input-field" placeholder="任务标题 *" value={newTask.title} onChange={e => setNewTask({ ...newTask, title: e.target.value })} />
              <textarea className="input-field h-20 resize-none" placeholder="描述" value={newTask.description} onChange={e => setNewTask({ ...newTask, description: e.target.value })} />
              <div className="grid grid-cols-2 gap-3">
                <select className="input-field" value={newTask.priority} onChange={e => setNewTask({ ...newTask, priority: e.target.value as any })}>
                  <option value="low">低优先级</option>
                  <option value="medium">中优先级</option>
                  <option value="high">高优先级</option>
                </select>
                <input className="input-field" placeholder="负责人" value={newTask.assignee} onChange={e => setNewTask({ ...newTask, assignee: e.target.value })} />
              </div>
              <input className="input-field" type="date" value={newTask.dueDate} onChange={e => setNewTask({ ...newTask, dueDate: e.target.value })} />
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={addTask} className="btn-primary flex-1">创建</button>
              <button onClick={() => setShowAdd(false)} className="btn-secondary flex-1">取消</button>
            </div>
          </div>
        </div>
      )}

      {/* Kanban Columns */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={e => setActiveId(e.active.id as string)} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {COLUMNS.map(col => (
            <SortableContext key={col.id} items={data.tasks.filter(t => t.status === col.id).map(t => t.id)} strategy={verticalListSortingStrategy}>
              <div
                className="kanban-column"
                style={{ background: col.color, borderColor: col.borderColor }}
                data-column={col.id}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-sm" style={{ color: 'var(--color-primary-dark)' }}>{col.title}</h3>
                  <span className="badge badge-gray">{data.tasks.filter(t => t.status === col.id).length}</span>
                </div>

                <div className="space-y-2 min-h-[100px]">
                  {data.tasks.filter(t => t.status === col.id).map(task => (
                    <SortableTaskCard
                      key={task.id}
                      task={task}
                      isEditing={editingId === task.id}
                      editData={editTask}
                      onEditChange={setEditTask}
                      onStartEdit={() => startEdit(task)}
                      onSaveEdit={saveEdit}
                      onCancelEdit={() => { setEditingId(null); setEditTask({}); }}
                      onMove={(status) => moveTask(task.id, status)}
                      onDelete={() => deleteTask(task.id)}
                    />
                  ))}
                </div>
              </div>
            </SortableContext>
          ))}
        </div>

        <DragOverlay>
          {activeTask ? (
            <div className="task-card" style={{ opacity: 0.9, transform: 'rotate(2deg)', boxShadow: 'var(--shadow-lg)' }}>
              <p className="font-medium text-sm">{activeTask.title}</p>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

function SortableTaskCard({ task, isEditing, editData, onEditChange, onStartEdit, onSaveEdit, onCancelEdit, onMove, onDelete }: {
  task: Task;
  isEditing: boolean;
  editData: Partial<Task>;
  onEditChange: (d: Partial<Task>) => void;
  onStartEdit: () => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onMove: (s: Task['status']) => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  if (isEditing) {
    return (
      <div className="task-card" style={{ borderColor: 'var(--color-primary-light)', boxShadow: '0 0 0 2px rgba(45,90,61,0.15)' }}>
        <div className="space-y-2">
          <input className="input-field text-sm" value={editData.title || ''} onChange={e => onEditChange({ ...editData, title: e.target.value })} />
          <textarea className="input-field text-sm h-16 resize-none" value={editData.description || ''} onChange={e => onEditChange({ ...editData, description: e.target.value })} />
          <div className="grid grid-cols-2 gap-2">
            <select className="input-field text-sm" value={editData.priority || 'medium'} onChange={e => onEditChange({ ...editData, priority: e.target.value as any })}>
              <option value="low">低</option>
              <option value="medium">中</option>
              <option value="high">高</option>
            </select>
            <input className="input-field text-sm" placeholder="负责人" value={editData.assignee || ''} onChange={e => onEditChange({ ...editData, assignee: e.target.value })} />
          </div>
          <input className="input-field text-sm" type="date" value={editData.dueDate || ''} onChange={e => onEditChange({ ...editData, dueDate: e.target.value })} />
          <div className="flex gap-2">
            <button onClick={onSaveEdit} className="btn-primary text-xs flex-1 flex items-center justify-center gap-1"><Check className="w-3 h-3" /> 保存</button>
            <button onClick={onCancelEdit} className="btn-secondary text-xs flex-1 flex items-center justify-center gap-1"><X className="w-3 h-3" /> 取消</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className={`task-card group ${isDragging ? 'dragging' : ''}`}>
      <div className="flex items-start gap-2">
        <GripVertical className="w-4 h-4 mt-0.5 cursor-move flex-shrink-0" style={{ color: 'var(--color-sage)' }} />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="font-medium text-sm truncate" style={{ color: 'var(--color-text)' }}>{task.title}</p>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
              <button onClick={(e) => { e.stopPropagation(); onStartEdit(); }} className="btn-ghost p-1">
                <Pencil className="w-3 h-3" />
              </button>
              <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="btn-ghost p-1 text-red-400 hover:text-red-600">
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
          {task.description && <p className="text-xs mt-1 line-clamp-2" style={{ color: 'var(--color-text-muted)' }}>{task.description}</p>}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className={`badge ${priorityColors[task.priority]}`}>{priorityLabels[task.priority]}</span>
            {task.assignee && (
              <span className="text-xs flex items-center gap-1" style={{ color: 'var(--color-text-muted)' }}>
                <User className="w-3 h-3" /> {task.assignee}
              </span>
            )}
            {task.dueDate && (
              <span className="text-xs flex items-center gap-1" style={{ color: 'var(--color-text-muted)' }}>
                <Calendar className="w-3 h-3" /> {task.dueDate}
              </span>
            )}
          </div>
          {/* Move buttons */}
          <div className="flex gap-2 mt-2">
            {task.status !== 'todo' && (
              <button onClick={() => onMove('todo')} className="text-xs hover:underline" style={{ color: 'var(--color-sage)' }}>← 待办</button>
            )}
            {task.status !== 'in-progress' && (
              <button onClick={() => onMove('in-progress')} className="text-xs hover:underline" style={{ color: 'var(--color-sage)' }}>
                {task.status === 'todo' ? '开始 →' : '← 进行中'}
              </button>
            )}
            {task.status !== 'done' && (
              <button onClick={() => onMove('done')} className="text-xs hover:underline" style={{ color: 'var(--color-primary-light)' }}>完成 →</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
