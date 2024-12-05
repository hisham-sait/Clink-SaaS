const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const nodemailer = require('nodemailer');

// Configure email transport
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

async function startBalanceAlertWorker() {
  console.log('Starting balance alert worker...');
  
  setInterval(async () => {
    try {
      // Get all active alerts
      const alerts = await prisma.balanceAlert.findMany({
        where: {
          isActive: true
        },
        include: {
          account: true,
          connection: true
        }
      });

      for (const alert of alerts) {
        await checkAlert(alert);
      }
    } catch (error) {
      console.error('Error in balance alert worker:', error);
    }
  }, 300000); // Run every 5 minutes
}

async function checkAlert(alert) {
  const { account, threshold, type, frequency } = alert;

  // Skip if already triggered and frequency is 'once'
  if (frequency === 'once' && alert.lastTriggered) {
    return;
  }

  const isTriggered = type === 'below' 
    ? account.balance < threshold
    : account.balance > threshold;

  if (isTriggered) {
    // Check quiet hours settings
    const settings = await getAlertSettings(account.userId);
    if (isInQuietHours(settings)) {
      return;
    }

    // Create notification
    await prisma.balanceAlert.update({
      where: { id: alert.id },
      data: { lastTriggered: new Date() }
    });

    const notification = await prisma.$queryRaw`
      INSERT INTO alert_notification (
        alert_id,
        message,
        status,
        created_at
      )
      VALUES (
        ${alert.id},
        ${generateAlertMessage(alert)},
        'unread',
        NOW()
      )
      RETURNING *
    `;

    // Send notifications based on settings
    await sendNotifications(alert, notification[0], settings);
  }
}

async function getAlertSettings(userId) {
  const settings = await prisma.$queryRaw`
    SELECT * FROM alert_settings 
    WHERE user_id = ${userId}
    LIMIT 1
  `;
  
  return settings[0] || {
    emailNotifications: true,
    pushNotifications: true,
    notificationSound: true,
    dailyDigest: false,
    quietHoursStart: null,
    quietHoursEnd: null
  };
}

function isInQuietHours(settings) {
  if (!settings.quietHoursStart || !settings.quietHoursEnd) {
    return false;
  }

  const now = new Date();
  const currentHour = now.getHours();
  const [startHour] = settings.quietHoursStart.split(':').map(Number);
  const [endHour] = settings.quietHoursEnd.split(':').map(Number);

  if (startHour <= endHour) {
    return currentHour >= startHour && currentHour < endHour;
  } else {
    // Handle overnight quiet hours (e.g., 22:00 - 06:00)
    return currentHour >= startHour || currentHour < endHour;
  }
}

function generateAlertMessage(alert) {
  const { account, threshold, type } = alert;
  const formattedBalance = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: account.currency
  }).format(account.balance);

  const formattedThreshold = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: account.currency
  }).format(threshold);

  return `Account "${account.name}" balance (${formattedBalance}) is ${type} threshold ${formattedThreshold}`;
}

async function sendNotifications(alert, notification, settings) {
  const promises = [];

  if (settings.emailNotifications) {
    promises.push(sendEmailNotification(alert, notification));
  }

  if (settings.pushNotifications) {
    promises.push(sendPushNotification(alert, notification));
  }

  await Promise.all(promises);
}

async function sendEmailNotification(alert, notification) {
  try {
    const { account, connection } = alert;
    
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: process.env.ALERT_EMAIL, // Replace with actual user email
      subject: `Balance Alert: ${account.name}`,
      html: `
        <h2>Balance Alert</h2>
        <p>${notification.message}</p>
        <p><strong>Bank:</strong> ${connection.institutionName}</p>
        <p><strong>Account:</strong> ${account.name}</p>
        <p><strong>Current Balance:</strong> ${formatCurrency(account.balance, account.currency)}</p>
        <p><strong>Threshold:</strong> ${formatCurrency(alert.threshold, account.currency)}</p>
        <p><strong>Alert Type:</strong> ${alert.type}</p>
        <p><em>This is an automated message. Please do not reply.</em></p>
      `
    });
  } catch (error) {
    console.error('Error sending email notification:', error);
  }
}

async function sendPushNotification(alert, notification) {
  // Implement push notification logic here
  // This could use Firebase Cloud Messaging, Web Push, or another service
  console.log('Push notification would be sent:', notification.message);
}

function formatCurrency(amount, currency) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
}

module.exports = {
  startBalanceAlertWorker
};
