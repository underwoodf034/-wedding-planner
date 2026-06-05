import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Plus, Trash2, Pencil, Check, X, Clock, MapPin, User } from 'lucide-react';
import type { WeddingData, TimelineEvent } from '../types';
import { addHistory } from '../lib/data';

interface OutletContext {
  data: WeddingData;
  onUpdate: (data: WeddingData) => void;
}

const typeLabels: Record<string, { label: string; color: string; icon: string }> = {
  preparation: { label: '准备', color: '#e8d5a3', icon: '✨' },
  ceremony: { label: '仪式', color: '#d4a5a5', icon: '💍' },
  reception: { label: '迎宾', color: '#a8b5a0', icon: '🤝' },
  photo: { label: '摄影', color: '#c9a96e', icon: '📸' },
  meal: { label: '用餐', color: '#7cb87c', icon: '🍽️' },
  entertainment: { label: '娱乐', color: '#d4a5d4', icon: '🎉' },
  transport: { label: '交通', color: '#a0a8b5', icon: '🚗' },
};

export default function Timeline() {
  const { data, onUpdate } = useOutletContext<OutletContext>();
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newEvent, setNewEvent] = useState({ time: '', title: '', description: '', duration: 30, location: '', responsible: '', type: 'ceremony' as TimelineEvent['type'] });
  const [editEvent, setEditEvent] = useState<Partial<TimelineEvent>>({});

  const addEvent = () => {
    if (!newEvent.title || !newEvent.time) return;
    const event: TimelineEvent = {
      id: Date.now().toString(),
      ...newEvent,
    };
    const updated = { ...data, timeline: [...data.timeline, event].sort((a, b) => a.time.localeCompare(b.time)) };
    onUpdate(addHistory(updated, '添加日程', event.title));
    setNewEvent({ time: '', title: '', description: '', duration: 30, location: '', responsible: '', type: 'ceremony' });
    setShowAdd(false);
  };

  const deleteEvent = (id: string) => {
    if (!confirm('确定删除这个环节吗？')) return;
    const event = data.timeline.find(e => e.id === id);
    const updated = { ...data, timeline: data.timeline.filter(e => e.id !== id) };
    onUpdate(addHistory(updated, '删除日程', event?.title || ''));
  };

  const startEdit = (event: TimelineEvent) => {
    setEditingId(event.id);
    setEditEvent({ ...event });
  };

  const saveEdit = () => {
    if (!editingId || !editEvent.title || !editEvent.time) return;
    const updated = {
      ...data,
      timeline: data.timeline.map(e => e.id === editingId ? { ...e, ...editEvent } as TimelineEvent : e).sort((a, b) => a.time.localeCompare(b.time)),
    };
    onUpdate(addHistory(updated, '编辑日程', editEvent.title || ''));
    setEditingId(null);
    setEditEvent({});
  };

  const sortedEvents = [...data.timeline].sort((a, b) => a.time.localeCompare(b.time));

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--color-primary-dark)' }}>婚礼日程</h2>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>草坪婚礼当天完整流程安排</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> 添加环节
        </button>
      </div>

      {/* Legend */}
      <div className="card flex flex-wrap gap-2">
        {Object.entries(typeLabels).map(([key, { label, color }]) => (
          <span key={key} className="badge text-xs" style={{ background: color + '30', color: 'var(--color-text)' }}>
            <span className="inline-block w-2 h-2 rounded-full mr-1" style={{ background: color }} />{label}
          </span>
        ))}
      </div>

      {/* Add Modal */}
      {showAdd && (
        <div className="modal-overlay" onClick={() => setShowAdd(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--color-primary-dark)' }}>添加环节</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input className="input-field" type="time" value={newEvent.time} onChange={e => setNewEvent({ ...newEvent, time: e.target.value })} />
                <input className="input-field" type="number" placeholder="时长(分钟)" value={newEvent.duration} onChange={e => setNewEvent({ ...newEvent, duration: Number(e.target.value) })} />
              </div>
              <input className="input-field" placeholder="环节名称 *" value={newEvent.title} onChange={e => setNewEvent({ ...newEvent, title: e.target.value })} />
              <textarea className="input-field h-16 resize-none" placeholder="描述" value={newEvent.description} onChange={e => setNewEvent({ ...newEvent, description: e.target.value })} />
              <div className="grid grid-cols-2 gap-3">
                <input className="input-field" placeholder="地点" value={newEvent.location} onChange={e => setNewEvent({ ...newEvent, location: e.target.value })} />
                <input className="input-field" placeholder="负责人" value={newEvent.responsible} onChange={e => setNewEvent({ ...newEvent, responsible: e.target.value })} />
              </div>
              <select className="input-field" value={newEvent.type} onChange={e => setNewEvent({ ...newEvent, type: e.target.value as TimelineEvent['type'] })}>
                {Object.entries(typeLabels).map(([key, { label }]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={addEvent} className="btn-primary flex-1">添加</button>
              <button onClick={() => setShowAdd(false)} className="btn-secondary flex-1">取消</button>
            </div>
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="card">
        <div className="space-y-0">
          {sortedEvents.map(event => {
            const typeInfo = typeLabels[event.type];
            const isEditing = editingId === event.id;
            return (
              <div key={event.id} className="timeline-item">
                <div className={`timeline-dot ${event.type === 'ceremony' ? 'ceremony' : ''}`} style={event.type === 'ceremony' ? {} : { background: typeInfo.color }} />
                {isEditing ? (
                  <div className="card mb-2">
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <input className="input-field text-sm" type="time" value={editEvent.time || ''} onChange={e => setEditEvent({ ...editEvent, time: e.target.value })} />
                        <input className="input-field text-sm" type="number" value={editEvent.duration || 0} onChange={e => setEditEvent({ ...editEvent, duration: Number(e.target.value) })} />
                      </div>
                      <input className="input-field text-sm" value={editEvent.title || ''} onChange={e => setEditEvent({ ...editEvent, title: e.target.value })} />
                      <textarea className="input-field text-sm h-12 resize-none" value={editEvent.description || ''} onChange={e => setEditEvent({ ...editEvent, description: e.target.value })} />
                      <div className="grid grid-cols-2 gap-2">
                        <input className="input-field text-sm" placeholder="地点" value={editEvent.location || ''} onChange={e => setEditEvent({ ...editEvent, location: e.target.value })} />
                        <input className="input-field text-sm" placeholder="负责人" value={editEvent.responsible || ''} onChange={e => setEditEvent({ ...editEvent, responsible: e.target.value })} />
                      </div>
                      <div className="flex gap-2">
                        <button onClick={saveEdit} className="btn-primary text-xs flex-1 flex items-center justify-center gap-1"><Check className="w-3 h-3" /> 保存</button>
                        <button onClick={() => { setEditingId(null); setEditEvent({}); }} className="btn-secondary text-xs flex-1 flex items-center justify-center gap-1"><X className="w-3 h-3" /> 取消</button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="group">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-sm" style={{ color: 'var(--color-primary-dark)' }}>{event.time}</span>
                          <span className="badge text-xs" style={{ background: typeInfo.color + '30', color: 'var(--color-text)' }}>
                            {typeInfo.icon} {typeInfo.label}
                          </span>
                          <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                            <Clock className="w-3 h-3 inline mr-0.5" />{event.duration}分钟
                          </span>
                        </div>
                        <h4 className="font-medium" style={{ color: 'var(--color-text)' }}>{event.title}</h4>
                        {event.description && <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>{event.description}</p>}
                        <div className="flex flex-wrap gap-3 mt-2 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                          {event.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {event.location}</span>}
                          {event.responsible && <span className="flex items-center gap-1"><User className="w-3 h-3" /> {event.responsible}</span>}
                        </div>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => startEdit(event)} className="btn-ghost p-1"><Pencil className="w-3 h-3" /></button>
                        <button onClick={() => deleteEvent(event.id)} className="btn-ghost p-1 text-red-400 hover:text-red-600"><Trash2 className="w-3 h-3" /></button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
