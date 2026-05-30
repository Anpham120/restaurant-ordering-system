# Admin Web

React + TypeScript + Vite application for internal restaurant roles: Staff, Kitchen, Cashier, and Manager.

## Realtime configuration

Staff and Manager screens connect to the backend SignalR hub to receive `OrderItemReady` events:

```text
/hubs/restaurant
```

Environment variables:

```env
VITE_API_BASE_URL=https://localhost:5001
VITE_RESTAURANT_HUB_URL=https://localhost:5001/hubs/restaurant
```

`VITE_RESTAURANT_HUB_URL` is optional. If it is not set, the app derives the hub URL from `VITE_API_BASE_URL` and removes a trailing `/api/v1` when present.

## Local development

```powershell
npm install
npm run dev
```

## Verification

```powershell
npm run lint
npm run build
```

Manual realtime check:

1. Run the backend with SignalR hub `/hubs/restaurant`.
2. Run `npm run dev`.
3. Open Admin Web, quick-login as `Staff`.
4. Emit `OrderItemReady` with `orderItemId`, `orderId`, and `status: "Ready"`.
5. Confirm the Staff serving list shows the ready item and the SignalR status badge is connected.
