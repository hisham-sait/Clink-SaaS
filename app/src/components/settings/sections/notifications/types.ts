export interface EmailNotifications {
  accountUpdates: boolean;
  securityAlerts: boolean;
  marketingUpdates: boolean;
}

export interface PushNotifications {
  taskUpdates: boolean;
  comments: boolean;
  reminders: boolean;
}

export interface NotificationSchedule {
  quietHoursStart: number;
  quietHoursEnd: number;
  weekendsOnly: boolean;
}

export interface NotificationSettings {
  email: EmailNotifications;
  push: PushNotifications;
  schedule: NotificationSchedule;
}
