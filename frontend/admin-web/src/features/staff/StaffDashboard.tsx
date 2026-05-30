import { useState } from 'react';
import { RoleGate } from '../../auth/RoleGate';
import { ReservationsPage } from './ReservationsPage';
import { TableMapPage } from './TableMapPage';

type Tab = 'map' | 'reservations';

export function StaffDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('map');

  return (
    <RoleGate allow={['Staff', 'Manager']}>
      <div className="staff-panel-layout">
        <div className="staff-sub-nav">
          <button
            className={`staff-nav-tab ${activeTab === 'map' ? 'active' : ''}`}
            onClick={() => setActiveTab('map')}
          >
            🗺️ Sơ Đồ Bàn Phục Vụ
          </button>
          <button
            className={`staff-nav-tab ${activeTab === 'reservations' ? 'active' : ''}`}
            onClick={() => setActiveTab('reservations')}
          >
            📅 Tìm Kiếm & Check-in Đặt Chỗ
          </button>
        </div>

        {activeTab === 'map' ? <TableMapPage /> : <ReservationsPage />}
      </div>
    </RoleGate>
  );
}
