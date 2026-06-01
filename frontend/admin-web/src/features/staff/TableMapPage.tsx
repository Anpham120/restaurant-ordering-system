import { useCallback, useEffect, useState } from 'react';
import { Phone, Clock, Check, ArrowRight } from 'lucide-react';
import { reservationService } from '../../services/reservationService';
import { tableService } from '../../services/tableService';
import type { Area, Reservation, Table, TableStatus } from '../../types';

const STATUS_LABEL: Record<TableStatus, string> = {
  Available: 'Còn Trống',
  Reserved: 'Được Đặt',
  Occupied: 'Đang Có Khách',
  Cleaning: 'Đang Dọn Bàn',
  Inactive: 'Bảo Trì',
};

export function TableMapPage() {
  const [areas, setAreas] = useState<Area[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [selectedAreaId, setSelectedAreaId] = useState<string>('all');
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [selectedResId, setSelectedResId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    const [areasRes, tablesRes, resRes] = await Promise.all([
      tableService.getAreas(),
      tableService.getTables(),
      reservationService.getAll({ status: 'Pending' }),
    ]);
    if (!areasRes.success) { setError('Không tải được dữ liệu khu vực.'); setLoading(false); return; }
    if (!tablesRes.success) { setError('Không tải được dữ liệu bàn.'); setLoading(false); return; }
    setAreas(areasRes.data);
    setTables(tablesRes.data);
    if (resRes.success) setReservations(resRes.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    void Promise.resolve().then(loadData);
  }, [loadData]);

  const filteredTables = selectedAreaId === 'all'
    ? tables
    : tables.filter(t => t.areaId === selectedAreaId);

  const availableTables = tables.filter(t => t.status === 'Available');
  const matchingRes = selectedTable
    ? reservations.find(r => r.assignedTableId === selectedTable.id)
    : null;

  const handleCheckIn = async () => {
    if (!selectedTable) return;
    const pendingRes = reservations.find(r => r.assignedTableId === selectedTable.id && r.status === 'Pending');
    if (pendingRes) {
      const res = await reservationService.checkIn(pendingRes.id);
      if (res.success) {
        setActionMsg(`Check-in thành công! Session token: ${res.data.sessionToken.slice(0, 8)}...`);
        setSelectedTable(null);
        loadData();
      } else {
        setActionMsg(`Lỗi: ${res.error.message}`);
      }
    }
  };

  const handleConfirmWithTable = async () => {
    if (!selectedTable || !selectedResId) return;
    const res = await reservationService.confirm(selectedResId, selectedTable.id);
    if (res.success) {
      setActionMsg('Đã xác nhận và gán bàn thành công.');
      setSelectedResId('');
      loadData();
    } else {
      setActionMsg(`Lỗi: ${res.error.message}`);
    }
  };

  const handleChangeTableStatus = async (status: TableStatus) => {
    if (!selectedTable) return;
    const res = await tableService.updateStatus(selectedTable.id, status);
    if (res.success) {
      setTables(prev => prev.map(t => t.id === selectedTable.id ? res.data : t));
      setSelectedTable(res.data);
    }
  };

  if (loading) return <div className="loading-screen">Đang tải sơ đồ bàn...</div>;
  if (error) return <div className="error-message">{error} <button onClick={loadData}>Thử lại</button></div>;

  return (
    <div className="staff-map-container-row">
      {/* Left: Table map */}
      <div className="table-map-section">
        <div className="panel-header-row">
          <div className="panel-title-group">
            <h2>Sơ Đồ Bàn Phục Vụ</h2>
            <p>Nhấp chọn bàn để kiểm tra trạng thái hoặc Check-in cho khách đặt trước.</p>
          </div>
          <div className="area-tabs-filter">
            <button
              className={`area-filter-tab ${selectedAreaId === 'all' ? 'active' : ''}`}
              onClick={() => setSelectedAreaId('all')}
            >
              Tất Cả ({tables.length})
            </button>
            {areas.map(area => (
              <button
                key={area.id}
                className={`area-filter-tab ${selectedAreaId === area.id ? 'active' : ''}`}
                onClick={() => setSelectedAreaId(area.id)}
              >
                {area.name} ({tables.filter(t => t.areaId === area.id).length})
              </button>
            ))}
          </div>
        </div>

        <div className="table-grid-display">
          {filteredTables.map(table => (
            <div
              key={table.id}
              className={`table-card-item card-status-${table.status.toLowerCase()} ${selectedTable?.id === table.id ? 'active' : ''}`}
              onClick={() => { setSelectedTable(table); setSelectedResId(''); setActionMsg(null); }}
            >
              <div className="table-card-seats">{table.capacity} Chỗ</div>
              <h3 className="table-card-title">{table.tableNumber}</h3>
              <span className={`table-status-label status-${table.status.toLowerCase()}`}>
                {STATUS_LABEL[table.status]}
              </span>
            </div>
          ))}
        </div>

        <div className="table-status-guide">
          {Object.entries(STATUS_LABEL).map(([k, v]) => (
            <span key={k} className="guide-item">
              <span className={`dot dot-${k.toLowerCase()}`}></span> {v}
            </span>
          ))}
        </div>
      </div>

      {/* Right: Table detail */}
      <div className="table-control-sidebar">
        {actionMsg && (
          <div className="action-message" onClick={() => setActionMsg(null)}>
            {actionMsg}
          </div>
        )}

        {selectedTable ? (
          <div className="control-card">
            <div className="control-card-header">
              <h3>Bàn {selectedTable.tableNumber}</h3>
              <span className="badge-seats">{selectedTable.capacity} Ghế</span>
            </div>

            <div className="control-table-status-block">
              <span className="status-label-prefix">Trạng thái:</span>
              <span className={`status-pill pill-${selectedTable.status.toLowerCase()}`}>
                {STATUS_LABEL[selectedTable.status]}
              </span>
            </div>

            {/* Matching reservation */}
            {matchingRes && (
              <div className="matching-res-preview">
                <p><strong>Đặt chỗ:</strong> {matchingRes.customerName}</p>
                <p><Phone size={13} /> {matchingRes.phone} — {matchingRes.guestCount} khách</p>
                <p><Clock size={13} /> {new Date(matchingRes.reservationTime).toLocaleString('vi-VN')}</p>
                {matchingRes.status === 'Confirmed' && (
                  <button className="btn btn-primary" onClick={handleCheckIn}>
                    <Check size={14} /> Check-In Khách
                  </button>
                )}
              </div>
            )}

            {/* Assign pending reservation to this table */}
            {selectedTable.status === 'Available' && reservations.length > 0 && !matchingRes && (
              <div className="quick-reservation-select-box">
                <p>Gán đặt chỗ đang chờ cho bàn này:</p>
                <select
                  className="form-input"
                  value={selectedResId}
                  onChange={e => setSelectedResId(e.target.value)}
                >
                  <option value="">-- Chọn đặt chỗ --</option>
                  {reservations
                    .filter(r => r.status === 'Pending' && !r.assignedTableId)
                    .map(r => (
                      <option key={r.id} value={r.id}>
                        {r.customerName} — {r.guestCount} khách
                      </option>
                    ))}
                </select>
                {selectedResId && (
                  <button className="btn btn-primary" onClick={handleConfirmWithTable}>
                    Xác Nhận & Gán Bàn
                  </button>
                )}
              </div>
            )}

            {/* Status change actions */}
            <div className="action-vertical-box">
              {selectedTable.status === 'Cleaning' && (
                <button className="btn btn-success" onClick={() => handleChangeTableStatus('Available')}>
                  <Check size={14} /> Dọn Xong <ArrowRight size={12} /> Available
                </button>
              )}
              {selectedTable.status === 'Available' && (
                <button className="btn btn-warning" onClick={() => handleChangeTableStatus('Inactive')}>
                  Đặt Bảo Trì
                </button>
              )}
              {selectedTable.status === 'Inactive' && (
                <button className="btn btn-success" onClick={() => handleChangeTableStatus('Available')}>
                  Hết Bảo Trì <ArrowRight size={12} /> Available
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="control-card-empty">
            <p>Nhấp vào bàn để xem chi tiết</p>
          </div>
        )}

        {/* Available tables summary */}
        <div className="tables-summary-box">
          <h4>Còn trống: {availableTables.length}/{tables.length} bàn</h4>
        </div>
      </div>
    </div>
  );
}
