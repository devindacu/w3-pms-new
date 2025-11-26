import { Notification, EmailNotification } from '@/lib/types'

export const generateEmailFromNotifications = (
  notifications: Notification[],
  recipientEmail: string,
  recipientName?: string
): EmailNotification => {
  const criticalNotifications = notifications.filter(n => n.priority === 'critical')
  const highNotifications = notifications.filter(n => n.priority === 'high')
  const otherNotifications = notifications.filter(n => n.priority !== 'critical' && n.priority !== 'high')

  const subject = criticalNotifications.length > 0
    ? `🚨 Critical Alert: ${criticalNotifications.length} Urgent Notification(s) - W3 Hotel PMS`
    : `W3 Hotel PMS: ${notifications.length} New Notification(s)`

  const body = `
Hello ${recipientName || 'Team'},

You have ${notifications.length} new notification(s) in the W3 Hotel PMS system.

${criticalNotifications.length > 0 ? `
CRITICAL ALERTS (${criticalNotifications.length}):
${criticalNotifications.map((n, i) => `
${i + 1}. ${n.title}
   ${n.message}
   Module: ${n.module}
   ${n.actionLabel ? `Action: ${n.actionLabel}` : ''}
`).join('\n')}
` : ''}

${highNotifications.length > 0 ? `
HIGH PRIORITY (${highNotifications.length}):
${highNotifications.map((n, i) => `
${i + 1}. ${n.title}
   ${n.message}
   Module: ${n.module}
`).join('\n')}
` : ''}

${otherNotifications.length > 0 ? `
OTHER NOTIFICATIONS (${otherNotifications.length}):
${otherNotifications.map((n, i) => `${i + 1}. ${n.title}`).join('\n')}
` : ''}

Please log in to the system to view full details and take necessary actions.

---
W3 Hotel PMS
Unified Hotel Management System
`

  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: 'IBM Plex Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #2d7a4e 0%, #3a9e68 100%);
      color: white;
      padding: 20px;
      border-radius: 8px 8px 0 0;
      text-align: center;
    }
    .content {
      background: #f9fafa;
      padding: 20px;
      border: 1px solid #ddd;
      border-top: none;
      border-radius: 0 0 8px 8px;
    }
    .notification {
      background: white;
      padding: 15px;
      margin: 10px 0;
      border-left: 4px solid #ddd;
      border-radius: 4px;
    }
    .notification.critical {
      border-left-color: #d32f2f;
      background: #ffebee;
    }
    .notification.high {
      border-left-color: #f57c00;
      background: #fff3e0;
    }
    .notification.medium {
      border-left-color: #2d7a4e;
      background: #f1f8f4;
    }
    .notification-title {
      font-weight: 600;
      margin-bottom: 5px;
      font-size: 16px;
    }
    .notification-message {
      color: #666;
      font-size: 14px;
      margin-bottom: 8px;
    }
    .notification-meta {
      font-size: 12px;
      color: #999;
    }
    .badge {
      display: inline-block;
      padding: 3px 8px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      margin-left: 8px;
    }
    .badge.critical {
      background: #d32f2f;
      color: white;
    }
    .badge.high {
      background: #f57c00;
      color: white;
    }
    .badge.medium {
      background: #2d7a4e;
      color: white;
    }
    .badge.low {
      background: #9e9e9e;
      color: white;
    }
    .action-button {
      display: inline-block;
      margin-top: 10px;
      padding: 8px 16px;
      background: #2d7a4e;
      color: white;
      text-decoration: none;
      border-radius: 4px;
      font-size: 14px;
    }
    .footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
      text-align: center;
      font-size: 12px;
      color: #999;
    }
    .section-header {
      font-size: 18px;
      font-weight: 600;
      margin: 20px 0 10px 0;
      color: #333;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1 style="margin: 0; font-size: 24px;">W3 Hotel PMS</h1>
    <p style="margin: 10px 0 0 0; opacity: 0.9;">Notification Alert</p>
  </div>
  
  <div class="content">
    <p>Hello ${recipientName || 'Team'},</p>
    <p>You have <strong>${notifications.length} new notification(s)</strong> in the W3 Hotel PMS system.</p>
    
    ${criticalNotifications.length > 0 ? `
      <div class="section-header">🚨 Critical Alerts (${criticalNotifications.length})</div>
      ${criticalNotifications.map(n => `
        <div class="notification critical">
          <div class="notification-title">
            ${n.title}
            <span class="badge critical">${n.priority}</span>
          </div>
          <div class="notification-message">${n.message}</div>
          <div class="notification-meta">Module: ${n.module}</div>
          ${n.actionLabel ? `<a href="#" class="action-button">${n.actionLabel}</a>` : ''}
        </div>
      `).join('')}
    ` : ''}
    
    ${highNotifications.length > 0 ? `
      <div class="section-header">⚠️ High Priority (${highNotifications.length})</div>
      ${highNotifications.map(n => `
        <div class="notification high">
          <div class="notification-title">
            ${n.title}
            <span class="badge high">${n.priority}</span>
          </div>
          <div class="notification-message">${n.message}</div>
          <div class="notification-meta">Module: ${n.module}</div>
          ${n.actionLabel ? `<a href="#" class="action-button">${n.actionLabel}</a>` : ''}
        </div>
      `).join('')}
    ` : ''}
    
    ${otherNotifications.length > 0 ? `
      <div class="section-header">📋 Other Notifications (${otherNotifications.length})</div>
      ${otherNotifications.slice(0, 5).map(n => `
        <div class="notification ${n.priority}">
          <div class="notification-title">
            ${n.title}
            <span class="badge ${n.priority}">${n.priority}</span>
          </div>
          <div class="notification-message">${n.message}</div>
          <div class="notification-meta">Module: ${n.module}</div>
        </div>
      `).join('')}
      ${otherNotifications.length > 5 ? `<p style="text-align: center; color: #666; font-size: 14px;">... and ${otherNotifications.length - 5} more</p>` : ''}
    ` : ''}
    
    <div style="margin-top: 30px; padding: 15px; background: #e8f5e9; border-radius: 4px; text-align: center;">
      <p style="margin: 0 0 10px 0; color: #2d7a4e; font-weight: 600;">Please log in to the system to view full details and take necessary actions.</p>
      <a href="#" class="action-button">Open W3 Hotel PMS</a>
    </div>
  </div>
  
  <div class="footer">
    <p><strong>W3 Hotel PMS</strong></p>
    <p>Unified Hotel Management System</p>
    <p style="margin-top: 10px;">This is an automated notification. Please do not reply to this email.</p>
  </div>
</body>
</html>
`

  return {
    id: `email-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    to: [recipientEmail],
    subject,
    body,
    htmlBody,
    notificationIds: notifications.map(n => n.id),
    status: 'pending',
    createdAt: Date.now()
  }
}

export const generateDailyDigestEmail = (
  notifications: Notification[],
  recipientEmail: string,
  recipientName?: string
): EmailNotification => {
  const today = new Date()
  const todayNotifications = notifications.filter(n => {
    const notifDate = new Date(n.createdAt)
    return notifDate.toDateString() === today.toDateString()
  })

  const byModule = todayNotifications.reduce((acc, n) => {
    if (!acc[n.module]) acc[n.module] = []
    acc[n.module].push(n)
    return acc
  }, {} as Record<string, Notification[]>)

  const subject = `W3 Hotel PMS Daily Digest - ${today.toLocaleDateString()}`

  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: 'IBM Plex Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #2d7a4e 0%, #3a9e68 100%);
      color: white;
      padding: 20px;
      border-radius: 8px 8px 0 0;
      text-align: center;
    }
    .content {
      background: #f9fafa;
      padding: 20px;
      border: 1px solid #ddd;
      border-top: none;
      border-radius: 0 0 8px 8px;
    }
    .summary-card {
      background: white;
      padding: 15px;
      margin: 10px 0;
      border-radius: 4px;
      border: 1px solid #e0e0e0;
    }
    .module-section {
      margin: 20px 0;
    }
    .module-title {
      font-size: 16px;
      font-weight: 600;
      color: #2d7a4e;
      margin-bottom: 10px;
      text-transform: capitalize;
    }
    .footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
      text-align: center;
      font-size: 12px;
      color: #999;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1 style="margin: 0; font-size: 24px;">W3 Hotel PMS</h1>
    <p style="margin: 10px 0 0 0; opacity: 0.9;">Daily Digest - ${today.toLocaleDateString()}</p>
  </div>
  
  <div class="content">
    <p>Hello ${recipientName || 'Team'},</p>
    <p>Here's your daily summary of notifications from the W3 Hotel PMS system.</p>
    
    <div class="summary-card">
      <h3 style="margin: 0 0 10px 0;">Today's Summary</h3>
      <p style="margin: 5px 0;"><strong>${todayNotifications.length}</strong> total notifications</p>
      <p style="margin: 5px 0;">
        <strong>${todayNotifications.filter(n => n.priority === 'critical').length}</strong> critical •
        <strong>${todayNotifications.filter(n => n.priority === 'high').length}</strong> high priority
      </p>
    </div>
    
    ${Object.entries(byModule).map(([module, notifs]) => `
      <div class="module-section">
        <div class="module-title">${module} (${notifs.length})</div>
        ${notifs.slice(0, 3).map(n => `
          <div style="padding: 10px; margin: 5px 0; background: #f5f5f5; border-radius: 4px; font-size: 14px;">
            <strong>${n.title}</strong><br>
            <span style="color: #666;">${n.message}</span>
          </div>
        `).join('')}
        ${notifs.length > 3 ? `<p style="font-size: 12px; color: #999;">... and ${notifs.length - 3} more</p>` : ''}
      </div>
    `).join('')}
    
    <div style="margin-top: 30px; padding: 15px; background: #e8f5e9; border-radius: 4px; text-align: center;">
      <p style="margin: 0 0 10px 0; color: #2d7a4e; font-weight: 600;">Log in to view all notifications and take action</p>
      <a href="#" style="display: inline-block; padding: 10px 20px; background: #2d7a4e; color: white; text-decoration: none; border-radius: 4px;">Open W3 Hotel PMS</a>
    </div>
  </div>
  
  <div class="footer">
    <p><strong>W3 Hotel PMS</strong></p>
    <p>Unified Hotel Management System</p>
    <p style="margin-top: 10px;">This is an automated daily digest. To unsubscribe, update your notification preferences in settings.</p>
  </div>
</body>
</html>
`

  const body = `
W3 Hotel PMS Daily Digest - ${today.toLocaleDateString()}

Hello ${recipientName || 'Team'},

Today's Summary:
- Total Notifications: ${todayNotifications.length}
- Critical: ${todayNotifications.filter(n => n.priority === 'critical').length}
- High Priority: ${todayNotifications.filter(n => n.priority === 'high').length}

${Object.entries(byModule).map(([module, notifs]) => `
${module.toUpperCase()} (${notifs.length}):
${notifs.slice(0, 3).map((n, i) => `${i + 1}. ${n.title}`).join('\n')}
${notifs.length > 3 ? `... and ${notifs.length - 3} more` : ''}
`).join('\n')}

Log in to the W3 Hotel PMS to view all notifications and take necessary actions.

---
W3 Hotel PMS
Unified Hotel Management System
`

  return {
    id: `email-digest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    to: [recipientEmail],
    subject,
    body,
    htmlBody,
    notificationIds: todayNotifications.map(n => n.id),
    status: 'pending',
    createdAt: Date.now()
  }
}

export const mockSendEmail = async (email: EmailNotification): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('📧 Email sent:', email.subject, 'to', email.to.join(', '))
      console.log('Email preview:', email.body.substring(0, 200) + '...')
      resolve(true)
    }, 1000)
  })
}
