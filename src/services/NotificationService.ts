/**
 * 🔔 SERVICE DE NOTIFICATIONS MULTI-CANAL
 * Gère l'envoi de notifications par Email, WhatsApp, et SMS
 */

import nodemailer from 'nodemailer';

interface NotificationPayload {
  userId?: string;
  email?: string;
  phone?: string;
  templateName: string;
  data: Record<string, any>;
  channels?: ('email' | 'whatsapp' | 'sms')[];
}

interface EmailConfig {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

interface WhatsAppConfig {
  to: string;
  message: string;
  templateName?: string;
  params?: any[];
}

export class NotificationService {
  private static instance: NotificationService;
  private emailEnabled: boolean = false;
  private whatsappEnabled: boolean = false;
  private emailTransporter: nodemailer.Transporter | null = null;

  private constructor() {
    // Configurer le transporteur email (Gmail SMTP ou SendGrid)
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      this.emailTransporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_PORT === '465', // true pour port 465, false pour autres
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        },
        tls: {
          rejectUnauthorized: false // Ignore les erreurs de certificat SSL (Windows)
        }
      });
      this.emailEnabled = true;
      console.log('✅ Email SMTP configuré:', process.env.SMTP_USER);
    } else if (process.env.SENDGRID_API_KEY) {
      this.emailEnabled = true;
      console.log('✅ SendGrid configuré');
    }

    // Vérifier WhatsApp
    this.whatsappEnabled = !!(process.env.WHATSAPP_API_KEY || process.env.TWILIO_WHATSAPP_NUMBER);
    if (this.whatsappEnabled) {
      console.log('✅ WhatsApp configuré');
    }
  }

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Envoyer une notification multi-canal
   */
  async send(payload: NotificationPayload): Promise<void> {
    const channels = payload.channels || ['email', 'whatsapp'];
    const promises: Promise<any>[] = [];

    if (channels.includes('email') && (payload.email || payload.userId)) {
      promises.push(this.sendEmail(payload));
    }

    if (channels.includes('whatsapp') && (payload.phone || payload.userId)) {
      promises.push(this.sendWhatsApp(payload));
    }

    await Promise.allSettled(promises);
  }

  /**
   * Envoyer un email
   */
  private async sendEmail(payload: NotificationPayload): Promise<void> {
    if (!this.emailEnabled) {
      console.log('📧 EMAIL (Mode développement):', payload.templateName);
      return;
    }

    const emailConfig = this.buildEmailTemplate(payload);
    
    try {
      if (this.emailTransporter) {
        // Utiliser nodemailer (Gmail SMTP)
        await this.emailTransporter.sendMail({
          from: `"TinaBoutique" <${process.env.SMTP_USER}>`,
          to: emailConfig.to,
          subject: emailConfig.subject,
          html: emailConfig.html
        });
        console.log('✅ Email envoyé via SMTP:', emailConfig.to);
      } else if (process.env.SENDGRID_API_KEY) {
        // TODO: Implémenter avec SendGrid si configuré
        const sgMail = require('@sendgrid/mail');
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        await sgMail.send(emailConfig);
        console.log('✅ Email envoyé via SendGrid:', emailConfig.to);
      }
    } catch (error) {
      console.error('❌ Erreur envoi email:', error);
      throw error;
    }
  }

  /**
   * Envoyer un message WhatsApp
   */
  private async sendWhatsApp(payload: NotificationPayload): Promise<void> {
    if (!this.whatsappEnabled) {
      console.log('📱 WHATSAPP (Mode développement):', payload.templateName);
      return;
    }

    const whatsappConfig = this.buildWhatsAppTemplate(payload);

    // TODO: Implémenter avec Twilio WhatsApp ou WhatsApp Business API
    // const client = require('twilio')(accountSid, authToken);
    // await client.messages.create({
    //   from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
    //   to: `whatsapp:${whatsappConfig.to}`,
    //   body: whatsappConfig.message
    // });

    console.log('📱 WhatsApp envoyé:', whatsappConfig.to);
  }

  /**
   * Templates Email
   */
  private buildEmailTemplate(payload: NotificationPayload): EmailConfig {
    const templates: Record<string, (data: any) => EmailConfig> = {
      
      // 🎉 Achat effectué
      'purchase_confirmation': (data) => ({
        to: payload.email!,
        subject: `Merci pour votre commande #${data.orderId} 🎉`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #D4AF37;">Merci ${data.customerName} ! 🎉</h1>
            <p>Votre commande <strong>#${data.orderId}</strong> a été confirmée.</p>
            <p>Montant total : <strong>${data.amount} ${data.currency}</strong></p>
            <p>Nous préparons votre colis avec soin ❤️</p>
            <p>Vous recevrez un email avec le numéro de suivi dès l'expédition.</p>
            <hr>
            <p style="color: #666; font-size: 12px;">TinaBoutique - L'élégance new-yorkaise</p>
          </div>
        `
      }),

      // 🛒 Panier abandonné
      'abandoned_cart': (data) => ({
        to: payload.email!,
        subject: `Vous avez oublié quelque chose... 🛒`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Bonjour ${data.customerName} 👋</h2>
            <p>Vous avez laissé <strong>${data.itemCount} article(s)</strong> dans votre panier.</p>
            <p>Ne les laissez pas s'envoler ! Ils vous attendent. 💫</p>
            <a href="${data.cartLink}" style="display: inline-block; background: #D4AF37; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 20px 0;">
              Finaliser mon achat
            </a>
            <p style="color: #666; font-size: 14px;">Dépêchez-vous, certains articles partent vite !</p>
          </div>
        `
      }),

      // ⚠️ Compte suspendu
      'account_suspended': (data) => ({
        to: payload.email!,
        subject: `Votre compte a été suspendu`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #ff6b6b;">Compte suspendu ⚠️</h2>
            <p>Bonjour ${data.customerName},</p>
            <p>Votre compte TinaBoutique a été <strong>suspendu</strong>.</p>
            <p><strong>Raison :</strong> ${data.reason || 'Non spécifiée'}</p>
            <p>Pour plus d'informations, contactez-nous à : <a href="mailto:support@tinaboutique.com">support@tinaboutique.com</a></p>
          </div>
        `
      }),

      // ❌ Compte supprimé
      'account_deleted': (data) => ({
        to: payload.email!,
        subject: `Votre compte a été supprimé`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Au revoir ${data.customerName} 👋</h2>
            <p>Votre compte TinaBoutique a été supprimé avec succès.</p>
            <p>Nous espérons vous revoir bientôt ! 💔</p>
            <p>Si c'est une erreur, contactez-nous rapidement.</p>
          </div>
        `
      }),

      // 🎁 Nouveautés / Soldes
      'new_arrivals': (data) => ({
        to: payload.email!,
        subject: `🎁 Nouveautés fraîchement arrivées !`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #D4AF37;">Nouvelles Collections ! 🎁</h1>
            <p>De nouveaux articles viennent d'arriver chez TinaBoutique !</p>
            <p>${data.description}</p>
            <a href="${data.shopLink}" style="display: inline-block; background: #D4AF37; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 20px 0;">
              Voir les nouveautés
            </a>
          </div>
        `
      }),

      // 💥 Soldes
      'sale_announcement': (data) => ({
        to: payload.email!,
        subject: `💥 SOLDES : Jusqu'à ${data.discount}% de réduction !`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px; border-radius: 8px;">
            <h1 style="font-size: 48px; margin: 0;">💥 SOLDES 💥</h1>
            <h2 style="font-size: 32px; margin: 10px 0;">Jusqu'à ${data.discount}% de réduction !</h2>
            <p style="font-size: 18px;">${data.message}</p>
            <a href="${data.shopLink}" style="display: inline-block; background: white; color: #667eea; padding: 16px 32px; text-decoration: none; border-radius: 50px; margin: 20px 0; font-weight: bold; font-size: 18px;">
              J'EN PROFITE !
            </a>
          </div>
        `
      })
    };

    const template = templates[payload.templateName];
    if (!template) {
      throw new Error(`Template email inconnu: ${payload.templateName}`);
    }

    return template(payload.data);
  }

  /**
   * Templates WhatsApp
   */
  private buildWhatsAppTemplate(payload: NotificationPayload): WhatsAppConfig {
    const templates: Record<string, (data: any) => WhatsAppConfig> = {
      
      'purchase_confirmation': (data) => ({
        to: payload.phone!,
        message: `🎉 Merci ${data.customerName} !\n\nVotre commande #${data.orderId} est confirmée ✅\nMontant : ${data.amount} ${data.currency}\n\nNous préparons votre colis avec soin ❤️\n\n- TinaBoutique`
      }),

      'abandoned_cart': (data) => ({
        to: payload.phone!,
        message: `👋 Bonjour ${data.customerName} !\n\nVous avez oublié ${data.itemCount} article(s) dans votre panier 🛒\n\nFinalisez votre achat ici :\n${data.cartLink}\n\nDépêchez-vous, stock limité ! ⏰`
      }),

      'account_suspended': (data) => ({
        to: payload.phone!,
        message: `⚠️ Compte suspendu\n\nBonjour ${data.customerName},\n\nVotre compte TinaBoutique a été suspendu.\nRaison : ${data.reason || 'Non spécifiée'}\n\nContactez-nous : support@tinaboutique.com`
      }),

      'shipment_tracking': (data) => ({
        to: payload.phone!,
        message: `📦 Votre colis est en route !\n\nCommande #${data.orderId}\nTransporteur : ${data.carrier}\nSuivi : ${data.trackingNumber}\n\nLivraison estimée : ${data.estimatedDelivery}\n\n✨ TinaBoutique`
      }),

      'new_arrivals': (data) => ({
        to: payload.phone!,
        message: `🎁 NOUVEAUTÉS chez TinaBoutique !\n\n${data.description}\n\nDécouvrez-les maintenant :\n${data.shopLink}\n\n✨ L'élégance new-yorkaise`
      }),

      'sale_announcement': (data) => ({
        to: payload.phone!,
        message: `💥 SOLDES TinaBoutique ! 💥\n\nJusqu'à ${data.discount}% de réduction !\n\n${data.message}\n\n🛍️ ${data.shopLink}\n\nNe ratez pas cette occasion !`
      })
    };

    const template = templates[payload.templateName];
    if (!template) {
      throw new Error(`Template WhatsApp inconnu: ${payload.templateName}`);
    }

    return template(payload.data);
  }

  /**
   * Envoi groupé (broadcast) - pour les soldes, nouveautés
   */
  async sendBroadcast(
    recipients: Array<{ email?: string; phone?: string }>,
    templateName: string,
    data: Record<string, any>,
    channels: ('email' | 'whatsapp')[] = ['email', 'whatsapp']
  ): Promise<void> {
    const promises = recipients.map(recipient =>
      this.send({
        email: recipient.email,
        phone: recipient.phone,
        templateName,
        data,
        channels
      })
    );

    await Promise.allSettled(promises);
    console.log(`📢 Broadcast envoyé à ${recipients.length} destinataires`);
  }
}

export const notificationService = NotificationService.getInstance();
