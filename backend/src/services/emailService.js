const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  async sendWelcomeEmail(email, nom, prenom) {
    const mailOptions = {
      from: `"Système d'Assiduité" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Bienvenue sur la plateforme de gestion d\'assiduité',
      html: `
        <h1>Bienvenue ${prenom} ${nom} !</h1>
        <p>Votre compte a été créé avec succès sur notre plateforme de gestion d'assiduité.</p>
        <p>Vous pouvez maintenant vous connecter et utiliser toutes les fonctionnalités.</p>
        <br>
        <p>Cordialement,<br>L'équipe du système d'assiduité</p>
      `
    };

    await this.transporter.sendMail(mailOptions);
  }

  async sendQRCodeNotification(email, cours, date, expiration) {
    const mailOptions = {
      from: `"Système d'Assiduité" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `QR Code généré pour ${cours}`,
      html: `
        <h1>QR Code généré</h1>
        <p>Un nouveau QR Code a été généré pour le cours : <strong>${cours}</strong></p>
        <p>Date : ${new Date(date).toLocaleDateString('fr-FR')}</p>
        <p>Expiration : ${new Date(expiration).toLocaleTimeString('fr-FR')}</p>
        <br>
        <p>Merci de scanner le QR Code en temps voulu.</p>
      `
    };

    await this.transporter.sendMail(mailOptions);
  }

  async sendDecisionNotification(email, etudiant, decision, cours) {
    const mailOptions = {
      from: `"Système d'Assiduité" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Décision concernant ${etudiant}`,
      html: `
        <h1>Nouvelle décision</h1>
        <p>Une décision a été prise concernant l'étudiant : <strong>${etudiant}</strong></p>
        <p>Cours : ${cours}</p>
        <p>Décision : <strong>${decision}</strong></p>
        <br>
        <p>Connectez-vous pour plus de détails.</p>
      `
    };

    await this.transporter.sendMail(mailOptions);
  }
}

module.exports = new EmailService();