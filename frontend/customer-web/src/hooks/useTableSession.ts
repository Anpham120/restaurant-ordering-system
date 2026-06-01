import { useEffect, useState } from 'react';
import { orderService } from '../services/orderService';

export interface TableSession {
  id: string;
  tableId: string;
  tableNumber: string;
  status: string;
  openedAt: string;
}

/**
 * Manages the QR table-session lifecycle: load + verify a session token against
 * the backend (with demo fallback), simulate a QR scan, and clear the session.
 * Mirrors the extraction pattern of useOrderTracking — keeps App.tsx thin.
 */
export function useTableSession(
  triggerToast: (msg: string) => void,
  onSessionLoaded?: () => void
) {
  const [sessionToken, setSessionToken] = useState<string | null>(() =>
    sessionStorage.getItem('sessionToken')
  );
  const [tableSession, setTableSession] = useState<TableSession | null>(() => {
    const saved = sessionStorage.getItem('tableSession');
    return saved ? JSON.parse(saved) : null;
  });
  // True only when the session was verified against the backend -> enables real order creation.
  const [isRealSession, setIsRealSession] = useState(() => sessionStorage.getItem('isRealSession') === 'true');

  const loadSession = async (token: string) => {
    sessionStorage.setItem('sessionToken', token);
    setSessionToken(token);

    const applySession = (session: TableSession, real: boolean) => {
      sessionStorage.setItem('tableSession', JSON.stringify(session));
      sessionStorage.setItem('isRealSession', String(real));
      setTableSession(session);
      setIsRealSession(real);
      onSessionLoaded?.();
      window.history.replaceState({}, '', window.location.pathname + `?sessionToken=${token}`);
    };

    // Verify the token against the backend; fall back to a demo session if unavailable.
    const res = await orderService.getSessionByToken(token);
    if (res.success && res.data) {
      const s = res.data;
      applySession({ id: s.id, tableId: s.tableId, tableNumber: s.tableNumber, status: s.status, openedAt: s.openedAt }, true);
      triggerToast(`Đã kích hoạt session gọi món tại Bàn ${s.tableNumber}!`);
    } else {
      applySession({
        id: 'sess_' + Math.random().toString(36).substr(2, 9),
        tableId: 'tbl-a01',
        tableNumber: 'A01',
        status: 'Active',
        openedAt: new Date().toISOString(),
      }, false);
      triggerToast('Đã kích hoạt session gọi món tại Bàn A01 (demo)!');
    }
  };

  const simulateQRScan = () => {
    loadSession('secure-qr-session-token-' + Math.floor(1000 + Math.random() * 9000));
  };

  const clearSession = () => {
    sessionStorage.removeItem('sessionToken');
    sessionStorage.removeItem('tableSession');
    sessionStorage.removeItem('isRealSession');
    setSessionToken(null);
    setTableSession(null);
    setIsRealSession(false);
    window.history.replaceState({}, '', window.location.pathname);
    triggerToast('Đã đóng phiên gọi món tại bàn.');
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('sessionToken');
    if (token) loadSession(token);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { sessionToken, tableSession, isRealSession, loadSession, simulateQRScan, clearSession };
}
