import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Save, Phone, Mail, Settings } from "lucide-react";
import apiFetch from '@/lib/api';

export default function SettingsAdmin() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    whatsapp_business_number: '',
    whatsapp_enabled: false,
    email_notifications_enabled: true,
    sendgrid_configured: false,
    twilio_configured: false,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await apiFetch('/api/admin/settings') as any;
      
      // Convertir en objet simple
      const settingsObj: any = {};
      data.forEach((s: any) => {
        settingsObj[s.setting_key] = 
          s.setting_value === 'true' ? true : 
          s.setting_value === 'false' ? false : 
          s.setting_value;
      });
      
      setSettings(settingsObj);
    } catch (error: any) {
      toast.error("Erreur lors du chargement des paramètres");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Valider le numéro WhatsApp
      if (settings.whatsapp_enabled && !settings.whatsapp_business_number) {
        toast.error("Numéro WhatsApp requis si activé");
        return;
      }

      // Valider format numéro
      if (settings.whatsapp_business_number && !settings.whatsapp_business_number.startsWith('+')) {
        toast.error("Le numéro doit commencer par + (ex: +243837352401)");
        return;
      }

      await apiFetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });

      toast.success("Paramètres enregistrés avec succès !");
      fetchSettings();
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de l'enregistrement");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const testWhatsApp = async () => {
    try {
      await apiFetch('/api/admin/test-whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          to: settings.whatsapp_business_number 
        })
      });

      toast.success("Message de test envoyé ! Vérifiez votre WhatsApp.");
    } catch (error: any) {
      toast.error(error.message || "Erreur envoi test");
    }
  };

  if (loading) {
    return <div className="p-8">Chargement...</div>;
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center gap-3">
        <Settings className="h-8 w-8 text-gold" />
        <div>
          <h1 className="text-3xl font-heading font-bold">Paramètres Notifications</h1>
          <p className="text-muted-foreground">Configurez les notifications Email et WhatsApp</p>
        </div>
      </div>

      {/* WhatsApp Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Phone className="h-5 w-5 text-green-600" />
            <CardTitle>WhatsApp Business</CardTitle>
          </div>
          <CardDescription>
            Configuration des notifications WhatsApp (Twilio)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="whatsapp_enabled" className="text-base">
                Activer WhatsApp
              </Label>
              <p className="text-sm text-muted-foreground">
                Envoyer des notifications par WhatsApp
              </p>
            </div>
            <Switch
              id="whatsapp_enabled"
              checked={settings.whatsapp_enabled}
              onCheckedChange={(checked) => 
                setSettings({ ...settings, whatsapp_enabled: checked })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="whatsapp_number">
              Numéro WhatsApp Business
            </Label>
            <Input
              id="whatsapp_number"
              type="tel"
              placeholder="+243837352401"
              value={settings.whatsapp_business_number}
              onChange={(e) => 
                setSettings({ ...settings, whatsapp_business_number: e.target.value })
              }
              className="font-mono"
            />
            <p className="text-xs text-muted-foreground">
              Format international avec + (ex: +243 pour Congo)
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-sm mb-2">📱 Configuration Twilio</h4>
            <p className="text-xs text-gray-700 mb-2">
              Statut : {settings.twilio_configured ? 
                <span className="text-green-600 font-semibold">✅ Configuré</span> : 
                <span className="text-orange-600 font-semibold">⚠️ Non configuré</span>
              }
            </p>
            <p className="text-xs text-gray-600">
              Pour activer Twilio, ajoutez ces variables d'environnement sur Render :
            </p>
            <code className="block text-xs bg-gray-800 text-green-400 p-2 rounded mt-2 font-mono">
              TWILIO_ACCOUNT_SID=ACxxxxx<br/>
              TWILIO_AUTH_TOKEN=xxxxx<br/>
              TWILIO_WHATSAPP_NUMBER=+14155238886
            </code>
          </div>

          {settings.whatsapp_enabled && settings.twilio_configured && (
            <Button 
              variant="outline" 
              onClick={testWhatsApp}
              className="w-full"
            >
              <Phone className="mr-2 h-4 w-4" />
              Envoyer un message de test
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Email Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-blue-600" />
            <CardTitle>Email (SendGrid)</CardTitle>
          </div>
          <CardDescription>
            Configuration des notifications par email
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="email_enabled" className="text-base">
                Activer Email
              </Label>
              <p className="text-sm text-muted-foreground">
                Envoyer des notifications par email
              </p>
            </div>
            <Switch
              id="email_enabled"
              checked={settings.email_notifications_enabled}
              onCheckedChange={(checked) => 
                setSettings({ ...settings, email_notifications_enabled: checked })
              }
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-sm mb-2">📧 Configuration SendGrid</h4>
            <p className="text-xs text-gray-700 mb-2">
              Statut : {settings.sendgrid_configured ? 
                <span className="text-green-600 font-semibold">✅ Configuré</span> : 
                <span className="text-orange-600 font-semibold">⚠️ Non configuré</span>
              }
            </p>
            <p className="text-xs text-gray-600">
              Pour activer SendGrid, ajoutez ces variables d'environnement sur Render :
            </p>
            <code className="block text-xs bg-gray-800 text-green-400 p-2 rounded mt-2 font-mono">
              SENDGRID_API_KEY=SG.xxxxx<br/>
              SENDGRID_FROM_EMAIL=noreply@tinaboutique.com
            </code>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button 
          onClick={handleSave} 
          disabled={saving}
          className="bg-gold hover:bg-gold/90"
        >
          {saving ? (
            <>Enregistrement...</>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Enregistrer les paramètres
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
