import { RefreshCw } from 'lucide-react';
import { useOrderTracking } from '../../hooks/useOrderTracking';
import type { Order } from '../../types/orderTracking';

interface Props {
  sessionToken: string | null;
  tableNumber: string;
  triggerToast: (msg: string) => void;
  isRealSession: boolean;
  onTrackingReady: (addOrder: (order: Order) => void) => void;
}

const STATUS_LABEL: Record<string, string> = {
  Pending: 'Chờ chế biến',
  Preparing: 'Đang nấu',
  Ready: 'Đã nấu chín',
  Served: 'Đã phục vụ',
  Cancelled: 'Đã huỷ',
};

export function OrderTrackerPage({ sessionToken, tableNumber, triggerToast, isRealSession, onTrackingReady }: Props) {
  const { placedOrders, realtimeStatus, realtimeMessage, lastRealtimeAt, addPlacedOrder } =
    useOrderTracking(sessionToken, tableNumber, triggerToast, isRealSession);

  // Expose addPlacedOrder to parent (for cart submission)
  // Use a ref to avoid re-render loops
  const addOrderRef = { current: addPlacedOrder };
  onTrackingReady(addOrderRef.current);

  const statusColor: Record<string, string> = {
    demo: 'pill-pending', connecting: 'pill-pending',
    connected: 'pill-ready', polling: 'pill-preparing', offline: 'pill-cancelled',
  };

  return (
    <div className="tracker-page">
      {/* Realtime status banner */}
      <div className={`realtime-banner ${statusColor[realtimeStatus] ?? ''}`}>
        <span className="indicator-glow"></span>
        <span>{realtimeMessage}</span>
        {lastRealtimeAt && (
          <span className="last-update">Cập nhật: {lastRealtimeAt.toLocaleTimeString('vi-VN')}</span>
        )}
      </div>

      <h2>Theo Dõi Đơn Hàng</h2>

      {placedOrders.length === 0 ? (
        <div className="empty-state">
          <RefreshCw size={40} />
          <p>Chưa có đơn hàng nào. Hãy gọi món từ menu!</p>
        </div>
      ) : (
        <div className="orders-list">
          {placedOrders.map(order => (
            <div key={order.orderId} className="order-card">
              <div className="order-card-header">
                <strong>{order.orderCode}</strong>
                <span className="order-table">Bàn {order.tableNumber}</span>
                <span className={`status-pill pill-${order.status.toLowerCase()}`}>
                  {STATUS_LABEL[order.status] ?? order.status}
                </span>
              </div>
              <div className="order-items-list">
                {order.items.map(item => (
                  <div key={item.id} className="order-item-row">
                    <span>{item.menuItemName} x{item.quantity}</span>
                    <span className={`status-pill pill-${item.status.toLowerCase()}`}>
                      {STATUS_LABEL[item.status] ?? item.status}
                    </span>
                  </div>
                ))}
              </div>
              <div className="order-placed-at">
                Đặt lúc: {new Date(order.placedAt).toLocaleTimeString('vi-VN')}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
