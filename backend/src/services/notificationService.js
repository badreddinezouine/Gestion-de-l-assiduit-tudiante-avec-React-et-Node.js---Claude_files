const Notification = require('../models/Notification');

class NotificationService {
  async createNotification(userId, titre, message, type, lien = null) {
    const notification = await Notification.create({
      utilisateurId: userId,
      titre,
      message,
      type,
      lien,
      dateCreation: new Date()
    });

    return notification;
  }

  async getUserNotifications(userId, limit = 10) {
    const notifications = await Notification.find({ utilisateurId: userId })
      .sort({ dateCreation: -1 })
      .limit(limit)
      .lean();

    return notifications;
  }

  async markAsRead(notificationId, userId) {
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, utilisateurId: userId },
      { lue: true },
      { new: true }
    );

    return notification;
  }

  async markAllAsRead(userId) {
    await Notification.updateMany(
      { utilisateurId: userId, lue: false },
      { lue: true }
    );
  }

  async deleteNotification(notificationId, userId) {
    await Notification.findOneAndDelete({
      _id: notificationId,
      utilisateurId: userId
    });
  }
}

module.exports = new NotificationService();