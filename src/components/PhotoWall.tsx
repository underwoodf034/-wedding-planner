import { useState, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Plus, Trash2, Image, Camera } from 'lucide-react';
import type { WeddingData, Photo } from '../types';
import { addHistory } from '../lib/data';

interface OutletContext {
  data: WeddingData;
  onUpdate: (data: WeddingData) => void;
}

const categoryLabels: Record<string, string> = {
  engagement: '订婚',
  'pre-wedding': '婚纱照',
  'wedding-day': '婚礼当天',
  honeymoon: '蜜月',
  other: '其他',
};

export default function PhotoWall() {
  const { data, onUpdate } = useOutletContext<OutletContext>();
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showAdd, setShowAdd] = useState(false);
  const [newPhoto, setNewPhoto] = useState({ url: '', caption: '', category: 'wedding-day' as Photo['category'] });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered = filterCategory === 'all' ? data.photos : data.photos.filter(p => p.category === filterCategory);

  const addPhoto = () => {
    if (!newPhoto.url) return;
    const photo: Photo = {
      id: Date.now().toString(),
      ...newPhoto,
      uploadedAt: new Date().toISOString(),
    };
    const updated = { ...data, photos: [...data.photos, photo] };
    onUpdate(addHistory(updated, '添加照片', photo.caption || '新照片'));
    setNewPhoto({ url: '', caption: '', category: 'wedding-day' });
    setShowAdd(false);
  };

  const deletePhoto = (id: string) => {
    if (!confirm('确定删除这张照片吗？')) return;
    const photo = data.photos.find(p => p.id === id);
    const updated = { ...data, photos: data.photos.filter(p => p.id !== id) };
    onUpdate(addHistory(updated, '删除照片', photo?.caption || ''));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const url = event.target?.result as string;
      setNewPhoto({ ...newPhoto, url });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--color-primary-dark)' }}>照片墙</h2>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>{data.photos.length} 张照片</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> 添加照片
        </button>
      </div>

      {/* Category Filter */}
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
            <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--color-primary-dark)' }}>添加照片</h3>
            <div className="space-y-3">
              <div className="flex gap-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="btn-secondary flex-1 flex items-center justify-center gap-2 py-3"
                >
                  <Camera className="w-5 h-5" /> 上传图片
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </div>
              <p className="text-xs text-center" style={{ color: 'var(--color-text-muted)' }}>或粘贴图片链接</p>
              <input className="input-field" placeholder="图片URL" value={newPhoto.url} onChange={e => setNewPhoto({ ...newPhoto, url: e.target.value })} />
              {newPhoto.url && (
                <div className="rounded-lg overflow-hidden" style={{ maxHeight: '200px' }}>
                  <img src={newPhoto.url} alt="预览" className="w-full h-full object-cover" />
                </div>
              )}
              <input className="input-field" placeholder="描述" value={newPhoto.caption} onChange={e => setNewPhoto({ ...newPhoto, caption: e.target.value })} />
              <select className="input-field" value={newPhoto.category} onChange={e => setNewPhoto({ ...newPhoto, category: e.target.value as Photo['category'] })}>
                {Object.entries(categoryLabels).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={addPhoto} className="btn-primary flex-1">添加</button>
              <button onClick={() => setShowAdd(false)} className="btn-secondary flex-1">取消</button>
            </div>
          </div>
        </div>
      )}

      {/* Photo Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {filtered.map(photo => (
            <div key={photo.id} className="photo-grid-item group">
              <img src={photo.url} alt={photo.caption} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                <p className="text-white text-sm font-medium">{photo.caption}</p>
                <p className="text-white/70 text-xs">{categoryLabels[photo.category]}</p>
              </div>
              <button
                onClick={() => deletePhoto(photo.id)}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="card text-center py-12">
          <Image className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--color-sage)' }} />
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>还没有照片，点击上方按钮添加</p>
          <p className="text-xs mt-2" style={{ color: 'var(--color-text-muted)' }}>支持上传本地图片或粘贴图片链接</p>
        </div>
      )}
    </div>
  );
}
