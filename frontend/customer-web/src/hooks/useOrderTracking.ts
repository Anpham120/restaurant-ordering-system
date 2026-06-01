import { useCallback, useEffect, useRef, useState } from 'react';
import {
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
  type HubConnection
} from '@microsoft/signalr';
import type {
  Order,
  OrderItem,
  RealtimeStatus,
  OrderItemStatusEvent,
  ApiResponse,
  ApiOrder
} from '../types/orderTracking';
import { deriveOrderStatus, mapApiOrder } from '../utils/orderTracking';
import { env } from '../config/env';

const RESTAURANT_HUB_PATH = '/hubs/restaurant';

export function useOrderTracking(
  sessionToken: string | null,
  fallbackTableNumber: string,
  triggerToast: (msg: string) => void,
  isRealSession: boolean
) {
  const [placedOrders, setPlacedOrders] = useState<Order[]>([]);
  const [realtimeStatus, setRealtimeStatus] = useState<RealtimeStatus>(isRealSession ? 'connecting' : 'demo');
  const [lastRealtimeAt, setLastRealtimeAt] = useState<Date | null>(null);
  const [realtimeMessage, setRealtimeMessage] = useState(
    isRealSession
      ? 'Dang chuan bi ket noi realtime.'
      : 'Che do demo: phien chua xac thuc voi backend nen trang thai se tu mo phong.'
  );

  const placedOrdersRef = useRef<Order[]>([]);
  const triggerToastRef = useRef(triggerToast);

  useEffect(() => {
    placedOrdersRef.current = placedOrders;
  }, [placedOrders]);

  useEffect(() => {
    triggerToastRef.current = triggerToast;
  }, [triggerToast]);

  const addPlacedOrder = useCallback((
    order: Order,
    realtimeUpdate?: { status: RealtimeStatus; message: string }
  ) => {
    setPlacedOrders(prevOrders => [order, ...prevOrders]);

    if (realtimeUpdate) {
      setRealtimeStatus(realtimeUpdate.status);
      setRealtimeMessage(realtimeUpdate.message);
    }
  }, []);

  const applyOrderItemStatusEvent = useCallback((event: OrderItemStatusEvent) => {
    setPlacedOrders(prevOrders => {
      return prevOrders.map(order => {
        if (order.orderId !== event.orderId) return order;

        const nextItems = order.items.map(item =>
          item.id === event.orderItemId ? { ...item, status: event.status } : item
        );

        return {
          ...order,
          status: deriveOrderStatus(nextItems),
          items: nextItems
        };
      });
    });

    setLastRealtimeAt(new Date());
    setRealtimeStatus('connected');
    setRealtimeMessage(`SignalR da nhan cap nhat ${event.status}.`);
  }, []);

  // 2. Stable reference for fetching snapshots
  const fetchOrderSnapshot = useCallback(async (orderId: string) => {
    if (!isRealSession || !sessionToken) return null;

    const response = await fetch(`${env.apiBaseUrl}/api/v1/orders/${orderId}?sessionToken=${encodeURIComponent(sessionToken)}`);
    const payload = await response.json() as ApiResponse<ApiOrder>;

    if (!response.ok || !payload.success) {
      throw new Error(payload.error?.message || 'Khong the tai trang thai order.');
    }

    return mapApiOrder(payload.data, fallbackTableNumber);
  }, [sessionToken, fallbackTableNumber, isRealSession]);

  // 3. Demo status updater (runs when the session is not backend-verified)
  useEffect(() => {
    if (isRealSession || placedOrders.length === 0) return;

    const interval = setInterval(() => {
      setPlacedOrders(prevOrders => {
        let updated = false;
        const newOrders = prevOrders.map(order => {
          if (order.status === 'Served') return order;

          let nextStatus: OrderItem['status'] = order.status;
          let nextItems = [...order.items];

          if (order.status === 'Pending') {
            nextStatus = 'Preparing';
            nextItems = order.items.map(it => ({ ...it, status: 'Preparing' }));
            updated = true;
          } else if (order.status === 'Preparing') {
            nextStatus = 'Ready';
            nextItems = order.items.map(it => ({ ...it, status: 'Ready' }));
            updated = true;
          } else if (order.status === 'Ready') {
            nextStatus = 'Served';
            nextItems = order.items.map(it => ({ ...it, status: 'Served' }));
            updated = true;
            triggerToastRef.current(`Mon ngon cua ban da san sang! Nhan vien dang phuc vu len Ban ${order.tableNumber}.`);
          }

          return {
            ...order,
            status: nextStatus,
            items: nextItems
          };
        });

        if (updated) {
          setLastRealtimeAt(new Date());
          setRealtimeStatus('demo');
          setRealtimeMessage('Che do demo dang mo phong event trang thai mon.');
          return newOrders;
        }
        return prevOrders;
      });
    }, 12000);

    return () => clearInterval(interval);
  }, [placedOrders.length, isRealSession]);

  // 4. SignalR connection manager - ONLY depend on stable variables and sessionToken
  useEffect(() => {
    if (!isRealSession || !sessionToken) return;

    let connection: HubConnection | null = null;
    let isCancelled = false;

    const startConnection = async () => {
      setRealtimeStatus('connecting');
      setRealtimeMessage('Dang ket noi SignalR...');

      connection = new HubConnectionBuilder()
        .withUrl(`${env.apiBaseUrl}${RESTAURANT_HUB_PATH}?sessionToken=${encodeURIComponent(sessionToken)}`, {
          accessTokenFactory: () => sessionToken
        })
        .withAutomaticReconnect()
        .configureLogging(LogLevel.Warning)
        .build();

      connection.on('OrderItemPreparing', applyOrderItemStatusEvent);
      connection.on('OrderItemReady', applyOrderItemStatusEvent);
      connection.on('OrderItemServed', applyOrderItemStatusEvent);

      connection.onreconnecting(() => {
        if (isCancelled) return;
        setRealtimeStatus('polling');
        setRealtimeMessage('SignalR dang ket noi lai, tam thoi dung polling.');
      });

      connection.onreconnected(() => {
        if (isCancelled) return;
        setRealtimeStatus('connected');
        setRealtimeMessage('SignalR da ket noi lai.');
        // Group membership is lost on reconnect — re-join the customer session group.
        void connection?.invoke('SubscribeToOrderStatus', sessionToken).catch(() => {});
      });

      connection.onclose(() => {
        if (isCancelled) return;
        setRealtimeStatus('polling');
        setRealtimeMessage('SignalR tam thoi mat ket noi, he thong dang polling trang thai.');
      });

      try {
        await connection.start();
        if (isCancelled) return;
        // Join the customer session group so kitchen status events reach this client.
        try {
          await connection.invoke('SubscribeToOrderStatus', sessionToken);
        } catch { /* best-effort; events still arrive via Order group if subscribed elsewhere */ }
        setRealtimeStatus('connected');
        setRealtimeMessage('SignalR dang theo doi trang thai mon theo thoi gian thuc.');
      } catch {
        if (isCancelled) return;
        setRealtimeStatus('polling');
        setRealtimeMessage('Chua ket noi duoc SignalR, dang dung fallback polling.');
      }
    };

    startConnection();

    return () => {
      isCancelled = true;
      if (connection && connection.state !== HubConnectionState.Disconnected) {
        void connection.stop();
      }
    };
  }, [applyOrderItemStatusEvent, sessionToken, isRealSession]);

  // 5. Fallback polling manager
  useEffect(() => {
    if (!isRealSession || !sessionToken || realtimeStatus === 'connected') return;

    const interval = setInterval(async () => {
      const ordersToPoll = placedOrdersRef.current;
      if (ordersToPoll.length === 0) return;

      try {
        const snapshots = await Promise.all(
          ordersToPoll.map(order => fetchOrderSnapshot(order.orderId))
        );
        setPlacedOrders(snapshots.filter((order): order is Order => order !== null));
        setRealtimeStatus('polling');
        setLastRealtimeAt(new Date());
        setRealtimeMessage('Fallback polling da cap nhat trang thai order.');
      } catch {
        setRealtimeStatus('offline');
        setRealtimeMessage('Chua the cap nhat trang thai. Vui long giu man hinh nay de thu lai tu dong.');
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [fetchOrderSnapshot, realtimeStatus, sessionToken, isRealSession]);

  return {
    placedOrders,
    addPlacedOrder,
    realtimeStatus,
    realtimeMessage,
    lastRealtimeAt
  };
}
