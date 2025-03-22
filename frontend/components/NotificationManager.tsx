import React, { useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { useInterval } from '../hooks/useInterval';

/** Interface for notification data structure */
interface NotificationData {
    /** Unique identifier for the notification */
    id: string;
    /** Content of the notification message */
    message: string;
    /** Timestamp when the notification was created/updated */
    timestamp: number;
    /** Flag indicating if notification has been dismissed */
    dismissed: boolean;
    /** Add fade animation value per notification */
    fadeAnim?: Animated.Value;
}

/** Props for NotificationManager component */
interface NotificationManagerProps {
    /** Optional className for styling */
    className?: string;
}

const styles = StyleSheet.create({
    notification: {
        position: 'absolute',
        top: 20,
        right: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 15,
        borderRadius: 8,
        maxWidth: 300,
        zIndex: 1000,
    },
    text: {
        color: 'white',
        fontSize: 14,
    },
    closeButton: {
        position: 'absolute',
        top: 5,
        right: 5,
        padding: 5,
    },
    closeText: {
        color: 'white',
        fontSize: 16,
    },
});

/**
 * Component for managing and displaying notifications
 * Handles automatic reappearance of dismissed notifications
 */
export const NotificationManager: React.FC<NotificationManagerProps> = ({ className }) => {
    const [notifications, setNotifications] = useState<NotificationData[]>([]);
    const animationQueue = useRef<string[]>([]);

    // Add notification method
    const addNotification = useCallback((message: string) => {
        const newNotification: NotificationData = {
            id: Date.now().toString(),
            message,
            timestamp: Date.now(),
            dismissed: false,
            fadeAnim: new Animated.Value(1)
        };
        setNotifications(prev => [...prev, newNotification]);
    }, []);

    const dismissNotification = useCallback((id: string) => {
        const notification = notifications.find(n => n.id === id);
        if (notification?.fadeAnim) {
            Animated.timing(notification.fadeAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true
            }).start(() => {
                setNotifications(prev =>
                    prev.map(notif =>
                        notif.id === id
                            ? { ...notif, dismissed: true, timestamp: Date.now() }
                            : notif
                    )
                );
            });
        }
    }, [notifications]);

    const reappearNotifications = useCallback(() => {
        const currentTime = Date.now();

        notifications.forEach(notification => {
            if (
                notification.dismissed &&
                currentTime - notification.timestamp >= 10000 &&
                !animationQueue.current.includes(notification.id)
            ) {
                animationQueue.current.push(notification.id);

                // Create a new Animated.Value for the notification
                const newFadeAnim = new Animated.Value(0);

                // Update the notification with the new animation value
                setNotifications(prev =>
                    prev.map(notif =>
                        notif.id === notification.id
                            ? { ...notif, fadeAnim: newFadeAnim }
                            : notif
                    )
                );

                // Start the animation with the new value
                Animated.timing(newFadeAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true
                }).start(() => {
                    setNotifications(prev =>
                        prev.map(notif =>
                            notif.id === notification.id
                                ? { ...notif, dismissed: false, timestamp: currentTime }
                                : notif
                        )
                    );
                    animationQueue.current = animationQueue.current.filter(
                        id => id !== notification.id
                    );
                });
            }
        });
    }, [notifications]);

    // Check more frequently for better timing accuracy
    useInterval(reappearNotifications, 1000); // Check every second

    return (
        <>
            {notifications
                .filter(n => !n.dismissed)
                .map(notification => (
                    <Animated.View
                        key={notification.id}
                        style={[
                            styles.notification,
                            { opacity: notification.fadeAnim }
                        ]}
                    >
                        <Text style={styles.text}>{notification.message}</Text>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => dismissNotification(notification.id)}
                        >
                            <Text style={styles.closeText}>×</Text>
                        </TouchableOpacity>
                    </Animated.View>
                ))}
        </>
    );
};
