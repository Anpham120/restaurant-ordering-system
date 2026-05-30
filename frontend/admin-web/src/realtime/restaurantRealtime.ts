import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import type { HubConnection } from '@microsoft/signalr';

export interface OrderItemReadyEvent {
  orderItemId: string;
  orderId: string;
  status: 'Ready';
  tableId?: string;
  tableNumber?: string;
  menuItemName?: string;
  quantity?: number;
  note?: string;
  readyAt?: string;
}

function getRestaurantHubUrl(): string {
  const explicitHubUrl = import.meta.env.VITE_RESTAURANT_HUB_URL;
  if (explicitHubUrl) {
    return explicitHubUrl;
  }

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5030';
  const backendOrigin = apiBaseUrl.replace(/\/api\/v1\/?$/, '').replace(/\/$/, '');

  return `${backendOrigin}/hubs/restaurant`;
}

export function createRestaurantHubConnection(): HubConnection {
  return new HubConnectionBuilder()
    .withUrl(getRestaurantHubUrl(), {
      accessTokenFactory: () => sessionStorage.getItem('admin_token') ?? '',
    })
    .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
    .configureLogging(LogLevel.Warning)
    .build();
}
