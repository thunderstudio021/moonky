import { useOrderNotifications } from '@/hooks/useOrderNotifications';

const OrderNotificationProvider = () => {
  useOrderNotifications();
  return null;
};

export default OrderNotificationProvider;
