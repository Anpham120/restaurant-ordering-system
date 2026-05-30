import { RoleGate } from '../../auth/RoleGate';
import { KitchenBoardPage } from './KitchenBoardPage';

export function KitchenDashboard() {
  return (
    <RoleGate allow={['Kitchen', 'Manager']}>
      <KitchenBoardPage />
    </RoleGate>
  );
}
