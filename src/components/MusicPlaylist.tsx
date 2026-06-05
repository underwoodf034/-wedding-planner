import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Plus, Trash2, Pencil, Check, X, Music, ExternalLink } from 'lucide-react';
import type { WeddingData, MusicTrack } from '../types';
import { addHistory } from '../lib/data';

interface OutletContext {
  data: WeddingData;
  onUpdate: (data: WeddingData) => void;
}

const sceneLabels: Record<string, { label: string; color: string; icon: string }> = {
  entrance: { label: '新人入场', color: '#d4a5a5', icon: '🚪' },
  ceremony: { label: '仪式环节', color: '#c9a96e', icon: '💍' },
  recessional: { label: '退场', color: '#a8b5a0', icon: '🎊' },
  dinner: { label: '晚宴', color: '#7cb87c', icon: '🍽️' },
  'first-dance': { label: 'First Dance', color: '#d4a5d4', icon: '💃' },
  party: { label: '派对', color: '#e8d5a3', icon: '🎉' },
  'send-off': { label: '送客', color: '#a0a8b5', icon: '👋' },
  other: { label: '其他', color: '#ccc', icon: '🎵' },
};

export default function MusicPlaylist() {
  const { data, onUpdate } = useOutletContext<OutletContext>();
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterScene, setFilterScene] = useState<string>('all');
  const [newTrack, setNewTrack] = useState({ title: '', artist: '', scene: 'ceremony' as MusicTrack['scene'], url: '', notes: '' });
  const [editTrack, setEditTrack] = useState<Partial<MusicTrack>>({});

  const filtered = filterScene === 'all' ? data.music : data.music.filter(m => m.scene === filterScene);

  const addTrack = () => {
    if (!newTrack.title) return;
    const track: MusicTrack = { id: Date.now().toString(), ...newTrack };
    const updated = { ...data, music: [...data.music, track] };
    onUpdate(addHistory(updated, '添加音乐', track.title));
    setNewTrack({ title: '', artist: '', scene: 'ceremony', url: '', notes: '' });
    setShowAdd(false);
  };

  const deleteTrack = (id: string) => {
    if (!confirm('确定删除这首歌曲吗？')) return;
    const track = data.music.find(m => m.id === id);
    const updated = { ...data, music: data.music.filter(m => m.id !== id) };
    onUpdate(addHistory(updated, '删除音乐', track?.title || ''));
  };

  const startEdit = (track: MusicTrack) => {
    setEditingId(track.id);
    setEditTrack({ ...track });
  };

  const saveEdit = () => {
    if (!editingId || !editTrack.title) return;
    const updated = {
      ...data,
      music: data.music.map(m => m.id === editingId ? { ...m, ...editTrack } as MusicTrack : m),
    };
    onUpdate(addHistory(updated, '编辑音乐', editTrack.title || ''));
    setEditingId(null);
    setEditTrack({});
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--color-primary-dark)' }}>婚礼音乐</h2>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>{data.music.length} 首歌曲已安排</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> 添加歌曲
        </button>
      </div>

      {/* Scene Filter */}
      <div className="card flex flex-wrap gap-2">
        <button onClick={() => setFilterScene('all')} className={`badge cursor-pointer ${filterScene === 'all' ? 'badge-green' : 'badge-gray'}`}>全部</button>
        {Object.entries(sceneLabels).map(([key, { label, icon }]) => (
          <button key={key} onClick={() => setFilterScene(key)} className={`badge cursor-pointer ${filterScene === key ? 'badge-green' : 'badge-gray'}`}>
            {icon} {label}
          </button>
        ))}
      </div>

      {/* Add Modal */}
      {showAdd && (
        <div className="modal-overlay" onClick={() => setShowAdd(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--color-primary-dark)' }}>添加歌曲</h3>
            <div className="space-y-3">
              <input className="input-field" placeholder="歌曲名称 *" value={newTrack.title} onChange={e => setNewTrack({ ...newTrack, title: e.target.value })} />
              <input className="input-field" placeholder="艺术家" value={newTrack.artist} onChange={e => setNewTrack({ ...newTrack, artist: e.target.value })} />
              <select className="input-field" value={newTrack.scene} onChange={e => setNewTrack({ ...newTrack, scene: e.target.value as MusicTrack['scene'] })}>
                {Object.entries(sceneLabels).map(([key, { label }]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
              <input className="input-field" placeholder="音乐链接（网易云/QQ音乐/Spotify）" value={newTrack.url} onChange={e => setNewTrack({ ...newTrack, url: e.target.value })} />
              <input className="input-field" placeholder="备注（如：新娘入场）" value={newTrack.notes} onChange={e => setNewTrack({ ...newTrack, notes: e.target.value })} />
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={addTrack} className="btn-primary flex-1">添加</button>
              <button onClick={() => setShowAdd(false)} className="btn-secondary flex-1">取消</button>
            </div>
          </div>
        </div>
      )}

      {/* Track List */}
      <div className="space-y-3">
        {filtered.map(track => {
          const scene = sceneLabels[track.scene];
          return (
            <div key={track.id} className="card group">
              {editingId === track.id ? (
                <div className="space-y-2">
                  <input className="input-field text-sm" value={editTrack.title || ''} onChange={e => setEditTrack({ ...editTrack, title: e.target.value })} />
                  <input className="input-field text-sm" value={editTrack.artist || ''} onChange={e => setEditTrack({ ...editTrack, artist: e.target.value })} />
                  <select className="input-field text-sm" value={editTrack.scene || track.scene} onChange={e => setEditTrack({ ...editTrack, scene: e.target.value as MusicTrack['scene'] })}>
                    {Object.entries(sceneLabels).map(([key, { label }]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                  <div className="flex gap-2">
                    <button onClick={saveEdit} className="btn-primary text-xs flex-1 flex items-center justify-center gap-1"><Check className="w-3 h-3" /> 保存</button>
                    <button onClick={() => { setEditingId(null); setEditTrack({}); }} className="btn-secondary text-xs flex-1 flex items-center justify-center gap-1"><X className="w-3 h-3" /> 取消</button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: scene.color + '30' }}>
                    <Music className="w-5 h-5" style={{ color: scene.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-medium truncate">{track.title}</span>
                      <span className="badge text-xs" style={{ background: scene.color + '30', color: 'var(--color-text)' }}>{scene.icon} {scene.label}</span>
                    </div>
                    <div className="text-sm flex items-center gap-2" style={{ color: 'var(--color-text-muted)' }}>
                      <span>{track.artist}</span>
                      {track.notes && <span>· {track.notes}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {track.url && (
                      <a href={track.url} target="_blank" rel="noopener noreferrer" className="btn-ghost p-2">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                    <button onClick={() => startEdit(track)} className="btn-ghost p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => deleteTrack(track.id)} className="btn-ghost p-2 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="card text-center py-8">
          <Music className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--color-sage)' }} />
          <p style={{ color: 'var(--color-text-muted)' }}>暂无歌曲，点击上方按钮添加</p>
        </div>
      )}
    </div>
  );
}
