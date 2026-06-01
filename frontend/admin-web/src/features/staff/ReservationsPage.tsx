import { useCallback, useEffect, useState } from 'react';
import { Search, X, Phone, Calendar, Users, Ticket, StickyNote, Check } from 'lucide-react';
import { reservationService } from '../../services/reservationService';
import { tableService } from '../../services/tableService';
import type { Reservation, Table } from '../../types';

type StatusFilter = 'All' | 'Pending' | 'Confirmed' | 'CheckedIn' | 'Cancelled';

const STATUS_LABEL: Record<string, string> = {
  Pending: 'Chờ Check-in',
  Confirmed: 'Đã Xác Nhận',
  CheckedIn: 'Đã Nhận Bàn',
  Cancelled: 'Đã Hủy',
  NoShow: 'Không Đến',
};

export function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [selectedTableId, setSelectedTableId] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [resRes, tablesRes] = await Promise.all([
      reservationService.getAll(),
      tableService.getTables(),
    ]);
    if (resRes.success) setReservations(resRes.data);
    if (tablesRes.success) setTables(tablesRes.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    void Promise.resolve().then(load);
  }, [load]);

  const filtered = reservations.filter(r => {
    const matchKw = r.customerName.toLowerCase().includes(keyword.toLowerCase()) ||
      r.phone.includes(keyword) ||
      r.reservationCode.toLowerCase().includes(keyword.toLowerCase());
    const matchStatus = statusFilter === 'All' || r.status === statusFilter;
    return matchKw && matchStatus;
  });

  const handleCheckIn = async (id: string) => {
    const res = await reservationService.checkIn(id);
    if (res.success) {
      setActionMsg(`Check-in OK! Session token: ${res.data.sessionToken.slice(0, 8)}...`);
      load();
    } else {
      setActionMsg(`Lỗi: ${res.error.message}`);
    }
  };

  const handleConfirm = async (id: string) => {
    const res = await reservationService.confirm(id, selectedTableId || undefined);
    if (res.success) {
      setActionMsg('Đã xác nhận đặt bàn.');
      setAssigningId(null);
      setSelectedTableId('');
      load();
    } else {
      setActionMsg(`Lỗi: ${res.error.message}`);
    }
  };

  const handleCancel = async (id: string) => {
    const res = await reservationService.cancel(id);
    if (res.success) {
      setActionMsg('Đã hủy đặt bàn.');
      load();
    } else {
      setActionMsg(`Lỗi: ${res.error.message}`);
    }
  };

  const availableTables = tables.filter(t => t.status === 'Available');

  if (loading) return <div className="loading-screen">Đang tải danh sách đặt bàn...</div>;

  return (
    <div className="staff-reservations-container animate-fade-in" style={{ width: '100%' }}>
      {actionMsg && (
        <div className="action-message" onClick={() => setActionMsg(null)}>
          {actionMsg} <span style={{ cursor: 'pointer', marginLeft: 8 }}><X size={14} /></span>
        </div>
      )}

      <div className="res-search-header-panel">
        <div className="res-title-box">
          <h2>Tìm Kiếm & Check-in Khách Đặt Bàn</h2>
          <p>Nhập tên, số điện thoại hoặc mã đặt bàn để tìm kiếm.</p>
        </div>

        <div className="res-search-controls-row">
          <div className="search-input-wrap" style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: 38 }}
              placeholder="Tìm theo tên, SĐT hoặc mã đặt bàn..."
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
            />
          </div>

          <div className="res-status-filter-group">
            {(['All', 'Pending', 'Confirmed', 'CheckedIn', 'Cancelled'] as StatusFilter[]).map(s => (
              <button
                key={s}
                className={`res-filter-pill ${statusFilter === s ? 'active' : ''}`}
                onClick={() => setStatusFilter(s)}
              >
                {s === 'All' ? 'Tất Cả' : STATUS_LABEL[s] ?? s}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="res-list-grid">
        {filtered.length === 0 ? (
          <div className="empty-reservations-box">
            <h3>Không tìm thấy đặt bàn nào</h3>
            <p>Không có đơn đặt bàn khớp với điều kiện tìm kiếm.</p>
          </div>
        ) : (
          filtered.map(res => (
            <div key={res.id} className={`res-card-item status-${res.status.toLowerCase()}`}>
              <div className="res-card-header">
                <div className="res-card-name-phone">
                  <h4>{res.customerName}</h4>
                  <span><Phone size={13} /> {res.phone}</span>
                </div>
                <span className={`res-badge badge-${res.status.toLowerCase()}`}>
                  {STATUS_LABEL[res.status] ?? res.status}
                </span>
              </div>

              <div className="res-card-body">
                <div className="res-meta-grid">
                  <span><Calendar size={13} /> {new Date(res.reservationTime).toLocaleString('vi-VN')}</span>
                  <span><Users size={13} /> {res.guestCount} khách</span>
                  <span><Ticket size={13} /> {res.reservationCode}</span>
                  {res.note && <span><StickyNote size={13} /> {res.note}</span>}
                </div>

                {/* Actions */}
                {res.status === 'Pending' && (
                  <div className="res-action-row">
                    {assigningId === res.id ? (
                      <div className="table-assign-inline">
                        <select
                          className="form-input"
                          value={selectedTableId}
                          onChange={e => setSelectedTableId(e.target.value)}
                        >
                          <option value="">-- Chọn Bàn Trống (tùy chọn) --</option>
                          {availableTables.map(t => (
                            <option key={t.id} value={t.id}>
                              {t.tableNumber} — {t.capacity} ghế — {t.areaName}
                            </option>
                          ))}
                        </select>
                        <button className="btn btn-primary btn-confirm-assign" onClick={() => handleConfirm(res.id)}>
                          <Check size={14} /> Xác Nhận
                        </button>
                        <button className="btn btn-secondary" onClick={() => { setAssigningId(null); setSelectedTableId(''); }}>
                          Hủy
                        </button>
                      </div>
                    ) : (
                      <>
                        <button className="btn btn-primary" onClick={() => setAssigningId(res.id)}>
                          Xác Nhận & Gán Bàn
                        </button>
                        <button className="btn btn-tertiary text-danger" onClick={() => handleCancel(res.id)}>
                          Hủy Đặt
                        </button>
                      </>
                    )}
                  </div>
                )}

                {res.status === 'Confirmed' && (
                  <div className="res-action-row">
                    <button className="btn btn-success" onClick={() => handleCheckIn(res.id)}>
                      <Check size={14} /> Check-In Khách
                    </button>
                    <button className="btn btn-tertiary text-danger" onClick={() => handleCancel(res.id)}>
                      Hủy
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
