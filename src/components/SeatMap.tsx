import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Plus, Trash2, Users, Armchair } from 'lucide-react';
import type { WeddingData, Guest } from '../types';
import { addHistory } from '../lib/data';

interface OutletContext {
  data: WeddingData;
  onUpdate: (data: WeddingData) => void;
}

export default function SeatMap() {
  const { data, onUpdate } = useOutletContext<OutletContext>();
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [showAddTable, setShowAddTable] = useState(false);
  const [newTableNum, setNewTableNum] = useState(1);

  // 获取所有有桌号的桌子
  const tables = [...new Set(data.guests.filter(g => g.table !== null).map(g => g.table!))].sort((a, b) => a - b);
  const maxTable = tables.length > 0 ? Math.max(...tables) : 0;

  const getGuestsAtTable = (tableNum: number): Guest[] => {
    return data.guests.filter(g => g.table === tableNum);
  };

  const assignToTable = (guestId: string, tableNum: number | null) => {
    const guest = data.guests.find(g => g.id === guestId);
    if (!guest) return;
    const updated = {
      ...data,
      guests: data.guests.map(g => g.id === guestId ? { ...g, table: tableNum } as Guest : g),
    };
    onUpdate(addHistory(updated, tableNum ? `分配到${tableNum}号桌` : '取消座位', guest.name));
  };

  const unassignedGuests = data.guests.filter(g => g.rsvp === 'attending' && g.table === null);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--color-primary-dark)' }}>座位安排</h2>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
            {tables.length} 桌已安排 · {unassignedGuests.length} 人待安排
          </p>
        </div>
        <button onClick={() => setShowAddTable(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> 添加桌号
        </button>
      </div>

      {/* Unassigned Guests Pool */}
      {unassignedGuests.length > 0 && (
        <div className="card">
          <h3 className="font-medium text-sm mb-3 flex items-center gap-2" style={{ color: 'var(--color-primary-dark)' }}>
            <Users className="w-4 h-4" /> 待安排来宾（拖拽或点击分配到桌）
          </h3>
          <div className="flex flex-wrap gap-2">
            {unassignedGuests.map(guest => (
              <div
                key={guest.id}
                className="badge badge-gold cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => {
                  const table = prompt(`将 ${guest.name} 分配到几号桌？`, String(maxTable + 1));
                  if (table) assignToTable(guest.id, Number(table));
                }}
              >
                {guest.name} {guest.plusOne && '(+1)'}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tables Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tables.map(tableNum => {
          const guests = getGuestsAtTable(tableNum);
          const totalPeople = guests.reduce((sum, g) => sum + 1 + (g.plusOne ? 1 : 0), 0);
          return (
            <div
              key={tableNum}
              className={`seat-table ${selectedTable === tableNum ? 'highlight' : ''}`}
              onClick={() => setSelectedTable(selectedTable === tableNum ? null : tableNum)}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Armchair className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
                  <span className="font-bold" style={{ color: 'var(--color-primary-dark)' }}>{tableNum}号桌</span>
                </div>
                <span className="badge badge-gray">{totalPeople} 人</span>
              </div>
              <div className="space-y-1.5">
                {guests.map(guest => (
                  <div key={guest.id} className="flex items-center justify-between text-sm py-1 px-2 rounded" style={{ background: 'rgba(168,181,160,0.1)' }}>
                    <div className="flex items-center gap-2">
                      <span className="font-medium" style={{ color: 'var(--color-text)' }}>{guest.name}</span>
                      {guest.plusOne && <span className="badge badge-rose text-xs">+1</span>}
                      {guest.dietary && <span className="badge badge-gold text-xs">{guest.dietary}</span>}
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); assignToTable(guest.id, null); }}
                      className="btn-ghost p-1 text-red-400 hover:text-red-600"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
              {guests.length === 0 && (
                <div className="text-center py-4 text-sm" style={{ color: 'var(--color-text-muted)' }}>空桌</div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Table Modal */}
      {showAddTable && (
        <div className="modal-overlay" onClick={() => setShowAddTable(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--color-primary-dark)' }}>添加桌号</h3>
            <p className="text-sm mb-3" style={{ color: 'var(--color-text-muted)' }}>输入桌号，然后在上方待安排区域为来宾分配座位</p>
            <input
              className="input-field"
              type="number"
              placeholder="桌号"
              value={newTableNum}
              onChange={e => setNewTableNum(Number(e.target.value))}
            />
            <div className="flex gap-2 mt-4">
              <button onClick={() => { setShowAddTable(false); }} className="btn-primary flex-1">确定</button>
              <button onClick={() => setShowAddTable(false)} className="btn-secondary flex-1">取消</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
