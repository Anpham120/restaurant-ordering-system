import { useCallback, useEffect, useRef, useState } from 'react';
import { kitchenService } from '../../services/kitchenService';
import type { KitchenOrderItem, OrderItemStatus } from '../../types';
import { env } from '../../config/env';
import { RefreshCw, Clock, StickyNote } from 'lucide-react';

const NEXT_STATUS: Partial<Record<OrderItemStatus, OrderItemStatus>> = {
  Pending: 'Preparing',
  Preparing: 'Ready',
  Ready: 'Served',
};

const COLUMN_CONFIG: { status: OrderItemStatus; label: string; btnLabel: string; btnClass: string; cardClass: string }[] = [
  { status: 'Pending',   label: 'Chờ Chế Biến',       btnLabel: 'Bắt Đầu Nấu',         btnClass: 'btn btn-primary',   cardClass: '' },
  { status: 'Preparing', label: 'Đang Nấu',            btnLabel: 'Báo Món Chín',         btnClass: 'btn btn-secondary', cardClass: 'card-preparing-active' },
  { status: 'Ready',     label: 'Sẵn Sàng Phục Vụ',   btnLabel: 'Đã Giao Bàn',         btnClass: 'btn btn-tertiary',  cardClass: 'card-ready-active' },
];

function minutesSince(dateStr: string) {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
}

export function KitchenBoardPage() {
  const [items, setItems] = useState<KitchenOrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const wsRef = useRef<WebSocket | null>(null);

  const load = useCallback(async () => {
    const res = await kitchenService.getOrderItems();
    if (res.success) setItems(res.data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  // SignalR / WS: nhận NewOrderCreated → reload
  useEffect(() => {
    const wsUrl = env.hubUrl.replace('https://', 'wss://').replace('http://', 'ws://');
    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;
      ws.onmessage = (e) => {
        try {
          const msg = JSON.parse(e.data);
          if (msg?.type === 'NewOrderCreated' || msg?.arguments?.[0]) {
            load(); // reload khi có order mới
          }
        } catch { /* ignore */ }
      };
    } catch { /* ignore if hub not available */ }

    return () => { wsRef.current?.close(); };
  }, [load, env.hubUrl]);

  const handleAdvance = async (item: KitchenOrderItem) => {
    const next = NEXT_STATUS[item.status];
    if (!next) return;
    const res = await kitchenService.updateStatus(item.id, next);
    if (res.success) {
      setItems(prev =>
        next === 'Served'
          ? prev.filter(i => i.id !== item.id)
          : prev.map(i => i.id === item.id ? res.data : i)
      );
    }
  };

  if (loading) return <div className="loading-screen">Đang tải Kitchen Display...</div>;

  return (
    <div className="kitchen-panel-layout">
      <div className="panel-header-row">
        <div className="panel-title-group">
          <h2>Bảng Điều Phối Món Ăn (Kitchen Kanban)</h2>
          <p>Cập nhật tiến độ nấu ăn theo thời gian thực.</p>
        </div>
        <div className="panel-actions-group">
          <button className="btn btn-tertiary" onClick={load}><RefreshCw size={14} /> Làm Mới</button>
        </div>
      </div>

      <div className="kanban-board-grid">
        {COLUMN_CONFIG.map(({ status, label, btnLabel, btnClass, cardClass }) => {
          const col = items.filter(i => i.status === status);
          return (
            <div key={status} className={`kanban-column col-${status.toLowerCase()}`}>
              <div className="column-header">
                <h3>{label} ({col.length})</h3>
              </div>
              <div className="column-items-scroll">
                {col.length === 0 ? (
                  <div className="kanban-empty-state">Trống</div>
                ) : (
                  col.map(item => (
                    <div key={item.id} className={`kanban-item-card ${cardClass}`}>
                      <div className="item-card-top">
                        <span className="item-table-no">Bàn: {item.tableNumber}</span>
                        <span className="item-time-waiting">
                          <Clock size={13} /> {minutesSince(item.createdAt)} phút
                        </span>
                      </div>
                      <h4 className="item-dish-name">{item.menuItemName}</h4>
                      <div className="item-quantity-box">Số lượng: <strong>x{item.quantity}</strong></div>
                      {item.note && <div className="item-note-box"><StickyNote size={13} /> {item.note}</div>}
                      {status !== 'Served' && (
                        <button
                          className={`${btnClass} btn-advance w-full mt-10`}
                          onClick={() => handleAdvance(item)}
                        >
                          {btnLabel}
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
