const express = require('express');
const router = express.Router();

module.exports = (prisma) => {
  // Alert CRUD operations
  router.get('/', async (req, res) => {
    try {
      const { accountId, connectionId, isActive } = req.query;
      const alerts = await prisma.balanceAlert.findMany({
        where: {
          ...(accountId && { accountId }),
          ...(connectionId && { connectionId }),
          ...(isActive !== undefined && { isActive: isActive === 'true' })
        },
        include: {
          account: true,
          connection: true
        }
      });
      res.json(alerts);
    } catch (error) {
      console.error('Error fetching alerts:', error);
      res.status(500).json({ error: 'Failed to fetch alerts' });
    }
  });

  router.post('/', async (req, res) => {
    try {
      const alert = await prisma.balanceAlert.create({
        data: req.body,
        include: {
          account: true,
          connection: true
        }
      });
      res.json(alert);
    } catch (error) {
      console.error('Error creating alert:', error);
      res.status(500).json({ error: 'Failed to create alert' });
    }
  });

  router.patch('/:id', async (req, res) => {
    try {
      const alert = await prisma.balanceAlert.update({
        where: { id: req.params.id },
        data: req.body,
        include: {
          account: true,
          connection: true
        }
      });
      res.json(alert);
    } catch (error) {
      console.error('Error updating alert:', error);
      res.status(500).json({ error: 'Failed to update alert' });
    }
  });

  router.delete('/:id', async (req, res) => {
    try {
      await prisma.balanceAlert.delete({
        where: { id: req.params.id }
      });
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting alert:', error);
      res.status(500).json({ error: 'Failed to delete alert' });
    }
  });

  // Alert status management
  router.patch('/:id/toggle', async (req, res) => {
    try {
      const { isActive } = req.body;
      const alert = await prisma.balanceAlert.update({
        where: { id: req.params.id },
        data: { isActive },
        include: {
          account: true,
          connection: true
        }
      });
      res.json(alert);
    } catch (error) {
      console.error('Error toggling alert:', error);
      res.status(500).json({ error: 'Failed to toggle alert' });
    }
  });

  router.patch('/toggle-all', async (req, res) => {
    try {
      const { accountId, isActive } = req.body;
      await prisma.balanceAlert.updateMany({
        where: { accountId },
        data: { isActive }
      });
      res.json({ success: true });
    } catch (error) {
      console.error('Error toggling all alerts:', error);
      res.status(500).json({ error: 'Failed to toggle all alerts' });
    }
  });

  // Alert history
  router.get('/history', async (req, res) => {
    try {
      const { startDate, endDate, alertId, accountId } = req.query;
      const history = await prisma.$queryRaw`
        SELECT 
          ba.id as "alertId",
          ba.type,
          ba.threshold,
          acc.name as "accountName",
          bc.institution_name as "bankName",
          ba.last_triggered as "triggeredAt",
          acc.balance
        FROM balance_alert ba
        JOIN bank_account acc ON ba.account_id = acc.id
        JOIN bank_connection bc ON ba.connection_id = bc.id
        WHERE ba.last_triggered IS NOT NULL
        ${alertId ? prisma.sql`AND ba.id = ${alertId}` : prisma.sql``}
        ${accountId ? prisma.sql`AND ba.account_id = ${accountId}` : prisma.sql``}
        ${startDate ? prisma.sql`AND ba.last_triggered >= ${startDate}` : prisma.sql``}
        ${endDate ? prisma.sql`AND ba.last_triggered <= ${endDate}` : prisma.sql``}
        ORDER BY ba.last_triggered DESC
      `;
      res.json(history);
    } catch (error) {
      console.error('Error fetching alert history:', error);
      res.status(500).json({ error: 'Failed to fetch alert history' });
    }
  });

  // Alert notifications
  router.get('/notifications', async (req, res) => {
    try {
      const { status, limit } = req.query;
      const notifications = await prisma.$queryRaw`
        SELECT 
          n.*,
          ba.type as "alertType",
          ba.threshold,
          acc.name as "accountName",
          bc.institution_name as "bankName"
        FROM alert_notification n
        JOIN balance_alert ba ON n.alert_id = ba.id
        JOIN bank_account acc ON ba.account_id = acc.id
        JOIN bank_connection bc ON ba.connection_id = bc.id
        WHERE ${status ? prisma.sql`n.status = ${status}` : prisma.sql`1=1`}
        ORDER BY n.created_at DESC
        ${limit ? prisma.sql`LIMIT ${limit}` : prisma.sql``}
      `;
      res.json(notifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      res.status(500).json({ error: 'Failed to fetch notifications' });
    }
  });

  router.patch('/notifications/:id/read', async (req, res) => {
    try {
      await prisma.$executeRaw`
        UPDATE alert_notification 
        SET status = 'read', updated_at = NOW()
        WHERE id = ${req.params.id}
      `;
      res.json({ success: true });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      res.status(500).json({ error: 'Failed to mark notification as read' });
    }
  });

  router.patch('/notifications/read-all', async (req, res) => {
    try {
      await prisma.$executeRaw`
        UPDATE alert_notification 
        SET status = 'read', updated_at = NOW()
        WHERE status = 'unread'
      `;
      res.json({ success: true });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      res.status(500).json({ error: 'Failed to mark all notifications as read' });
    }
  });

  // Alert settings
  router.get('/settings', async (req, res) => {
    try {
      const settings = await prisma.$queryRaw`
        SELECT * FROM alert_settings 
        WHERE user_id = 'mock-user-id'
        LIMIT 1
      `;
      res.json(settings[0] || {
        emailNotifications: true,
        pushNotifications: true,
        notificationSound: true,
        dailyDigest: false,
        quietHoursStart: null,
        quietHoursEnd: null
      });
    } catch (error) {
      console.error('Error fetching alert settings:', error);
      res.status(500).json({ error: 'Failed to fetch alert settings' });
    }
  });

  router.patch('/settings', async (req, res) => {
    try {
      await prisma.$executeRaw`
        INSERT INTO alert_settings (
          user_id, 
          email_notifications, 
          push_notifications, 
          notification_sound,
          daily_digest,
          quiet_hours_start,
          quiet_hours_end,
          updated_at
        )
        VALUES (
          'mock-user-id',
          ${req.body.emailNotifications},
          ${req.body.pushNotifications},
          ${req.body.notificationSound},
          ${req.body.dailyDigest},
          ${req.body.quietHoursStart},
          ${req.body.quietHoursEnd},
          NOW()
        )
        ON CONFLICT (user_id) DO UPDATE
        SET
          email_notifications = EXCLUDED.email_notifications,
          push_notifications = EXCLUDED.push_notifications,
          notification_sound = EXCLUDED.notification_sound,
          daily_digest = EXCLUDED.daily_digest,
          quiet_hours_start = EXCLUDED.quiet_hours_start,
          quiet_hours_end = EXCLUDED.quiet_hours_end,
          updated_at = NOW()
      `;
      res.json({ success: true });
    } catch (error) {
      console.error('Error updating alert settings:', error);
      res.status(500).json({ error: 'Failed to update alert settings' });
    }
  });

  // Alert testing
  router.post('/:id/test', async (req, res) => {
    try {
      const alert = await prisma.balanceAlert.findUnique({
        where: { id: req.params.id },
        include: {
          account: true
        }
      });

      if (!alert) {
        return res.status(404).json({ error: 'Alert not found' });
      }

      const triggered = alert.type === 'below' 
        ? alert.account.balance < alert.threshold
        : alert.account.balance > alert.threshold;

      res.json({
        triggered,
        currentBalance: alert.account.balance,
        threshold: alert.threshold,
        message: triggered
          ? `Account balance ${alert.type === 'below' ? 'below' : 'above'} threshold of ${alert.threshold}`
          : 'Alert conditions not met'
      });
    } catch (error) {
      console.error('Error testing alert:', error);
      res.status(500).json({ error: 'Failed to test alert' });
    }
  });

  return router;
};
