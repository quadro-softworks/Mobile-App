import { useEffect, useRef } from 'react';
import { busTrackingSocket, WebSocketNotification } from '@/utils/socket';
import { useNotificationStore } from '@/stores/notificationStore';

interface UseWebSocketNotificationsOptions {
  onNotificationReceived?: (notification: WebSocketNotification) => void;
  onChatMessageReceived?: (message: WebSocketNotification) => void;
  onIncidentReported?: (incident: WebSocketNotification) => void;
  autoRefreshNotifications?: boolean;
}

export const useWebSocketNotifications = (options: UseWebSocketNotificationsOptions = {}) => {
  const { onNotificationReceived, onChatMessageReceived, onIncidentReported, autoRefreshNotifications = true } = options;
  const { fetchNotifications } = useNotificationStore();
  const isSubscribed = useRef(false);

  useEffect(() => {
    // Subscribe to notification events
    const unsubscribeNotifications = busTrackingSocket.on('notification:received', (notification: WebSocketNotification) => {
      console.log('🔔 Notification received in hook:', {
        id: notification.id,
        title: notification.title,
        type: notification.notification_type
      });

      // Call custom callback if provided
      if (onNotificationReceived) {
        onNotificationReceived(notification);
      }

      // Auto-refresh notifications from API if enabled
      if (autoRefreshNotifications) {
        console.log('🔄 Auto-refreshing notifications from API...');
        fetchNotifications();
      }
    });

    // Subscribe to chat message events
    const unsubscribeChatMessages = busTrackingSocket.on('chat:message:received', (message: WebSocketNotification) => {
      console.log('💬 Chat message received in hook:', {
        id: message.id,
        title: message.title,
        type: message.notification_type,
        sender: message.related_entity?.sender_name
      });

      // Call custom callback if provided
      if (onChatMessageReceived) {
        onChatMessageReceived(message);
      }

      // Auto-refresh notifications from API if enabled (chat messages are also stored as notifications)
      if (autoRefreshNotifications) {
        console.log('🔄 Auto-refreshing notifications from API for chat message...');
        fetchNotifications();
      }
    });

    // Subscribe to incident report events
    const unsubscribeIncidentReports = busTrackingSocket.on('incident:reported', (incident: WebSocketNotification) => {
      console.log('🚨 Incident reported in hook:', {
        id: incident.id,
        title: incident.title,
        type: incident.notification_type,
        severity: incident.related_entity?.severity,
        incidentType: incident.related_entity?.incident_type
      });

      // Call custom callback if provided
      if (onIncidentReported) {
        onIncidentReported(incident);
      }

      // Auto-refresh notifications from API if enabled
      if (autoRefreshNotifications) {
        console.log('🔄 Auto-refreshing notifications from API for incident report...');
        fetchNotifications();
      }
    });

    // Subscribe to connection events to re-subscribe to notifications
    const unsubscribeConnect = busTrackingSocket.on('connect', () => {
      console.log('🔔 WebSocket connected - subscribing to notifications');
      if (!isSubscribed.current) {
        busTrackingSocket.subscribeToNotifications();
        isSubscribed.current = true;
      }
    });

    const unsubscribeDisconnect = busTrackingSocket.on('disconnect', () => {
      console.log('🔔 WebSocket disconnected - notification subscription lost');
      isSubscribed.current = false;
    });

    // If already connected, subscribe immediately
    if (busTrackingSocket.isConnected() && !isSubscribed.current) {
      busTrackingSocket.subscribeToNotifications();
      isSubscribed.current = true;
    }

    // Cleanup on unmount
    return () => {
      unsubscribeNotifications();
      unsubscribeChatMessages();
      unsubscribeIncidentReports();
      unsubscribeConnect();
      unsubscribeDisconnect();
      isSubscribed.current = false;
    };
  }, [onNotificationReceived, onChatMessageReceived, onIncidentReported, autoRefreshNotifications, fetchNotifications]);

  return {
    isConnected: busTrackingSocket.isConnected(),
    connectionStatus: busTrackingSocket.getConnectionStatus(),
    subscribeToNotifications: () => busTrackingSocket.subscribeToNotifications(),
    forceReconnect: () => busTrackingSocket.forceReconnect(),
    sendChatMessage: (message: string, recipientId?: string, chatType?: 'DIRECT' | 'GROUP' | 'SUPPORT') =>
      busTrackingSocket.sendChatMessage(message, recipientId, chatType),
    sendIncidentReport: (incidentData: {
      description: string;
      incident_type: 'VEHICLE_ISSUE' | 'PASSENGER_INCIDENT' | 'ROUTE_PROBLEM' | 'SCHEDULE_DELAY' | 'OTHER';
      severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
      location?: { latitude: number; longitude: number };
      related_bus_id?: string;
      related_route_id?: string;
    }) => busTrackingSocket.sendIncidentReport(incidentData),
  };
};
