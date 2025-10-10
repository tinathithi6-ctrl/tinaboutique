import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Loader2 } from "lucide-react";

interface ProfileData {
  full_name: string;
  phone: string;
  shipping_address: {
    street: string;
    city: string;
    postal_code: string;
    country: string;
  };
}

const Profile = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { user, token, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    full_name: "",
    phone: "",
    shipping_address: {
      street: "",
      city: "",
      postal_code: "",
      country: "",
    },
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth", { state: { from: location }, replace: true });
    }
  }, [user, authLoading, navigate, location]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user || !token) return;

      try {
        const response = await fetch('http://localhost:3001/api/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) throw new Error('Failed to fetch profile');

        const data = await response.json();

        setProfileData({
          full_name: data.full_name || "",
          phone: data.phone || "",
          shipping_address: typeof data.shipping_address === 'object' && data.shipping_address !== null
            ? {
                street: (data.shipping_address as any).street || "",
                city: (data.shipping_address as any).city || "",
                postal_code: (data.shipping_address as any).postal_code || "",
                country: (data.shipping_address as any).country || "",
              }
            : {
                street: "",
                city: "",
                postal_code: "",
                country: "",
              },
        });
      } catch (error) {
        console.error('Erreur lors du chargement du profil:', error);
        toast({
          title: t("profile.toast.loadError.title"),
          description: t("profile.toast.loadError.description"),
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, toast]);

  const handleSave = async () => {
    if (!user || !token) return;

    setSaving(true);
    try {
      const response = await fetch('http://localhost:3001/api/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          full_name: profileData.full_name,
          phone: profileData.phone,
          shipping_address: profileData.shipping_address,
        })
      });

      if (!response.ok) throw new Error('Failed to update profile');

      toast({
        title: t("profile.toast.saveSuccess.title"),
        description: t("profile.toast.saveSuccess.description"),
      });
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du profil:', error);
      toast({
        title: t("profile.toast.saveError.title"),
        description: t("profile.toast.saveError.description"),
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl font-heading">{t("profile.title")}</CardTitle>
            <CardDescription>{t("profile.description")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">{t("profile.labels.email")}</Label>
              <Input id="email" value={user?.email || ""} disabled />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullName">{t("profile.labels.fullName")}</Label>
              <Input
                id="fullName"
                value={profileData.full_name}
                onChange={(e) =>
                  setProfileData({ ...profileData, full_name: e.target.value })
                }
                maxLength={100}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">{t("profile.labels.phone")}</Label>
              <Input
                id="phone"
                type="tel"
                value={profileData.phone}
                onChange={(e) =>
                  setProfileData({ ...profileData, phone: e.target.value })
                }
                maxLength={20}
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">{t("profile.shippingAddress.title")}</h3>
              
              <div className="space-y-2">
                <Label htmlFor="street">{t("profile.shippingAddress.street")}</Label>
                <Input
                  id="street"
                  value={profileData.shipping_address.street}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      shipping_address: {
                        ...profileData.shipping_address,
                        street: e.target.value,
                      },
                    })
                  }
                  maxLength={200}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">{t("profile.shippingAddress.city")}</Label>
                  <Input
                    id="city"
                    value={profileData.shipping_address.city}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        shipping_address: {
                          ...profileData.shipping_address,
                          city: e.target.value,
                        },
                      })
                    }
                    maxLength={100}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="postalCode">{t("profile.shippingAddress.postalCode")}</Label>
                  <Input
                    id="postalCode"
                    value={profileData.shipping_address.postal_code}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        shipping_address: {
                          ...profileData.shipping_address,
                          postal_code: e.target.value,
                        },
                      })
                    }
                    maxLength={20}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">{t("profile.shippingAddress.country")}</Label>
                <Input
                  id="country"
                  value={profileData.shipping_address.country}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      shipping_address: {
                        ...profileData.shipping_address,
                        country: e.target.value,
                      },
                    })
                  }
                  maxLength={100}
                />
              </div>
            </div>

            <Button onClick={handleSave} disabled={saving} className="w-full">
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("profile.buttons.saving")}
                </>
              ) : (
                t("profile.buttons.save")
              )}
            </Button>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default Profile;
