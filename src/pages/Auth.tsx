import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext"; // Importer le hook d'authentification
import { z } from "zod";
import { Loader2 } from "lucide-react";

const loginSchema = (t: (key: string) => string) => z.object({
  email: z.string().trim().email({ message: t("auth.zod.invalidEmail") }).max(255),
  password: z.string().min(6, { message: t("auth.zod.passwordLength") }),
});

const signupSchema = (t: (key: string) => string) => z.object({
  email: z.string().trim().email({ message: t("auth.zod.invalidEmail") }).max(255),
  password: z.string().min(6, { message: t("auth.zod.passwordLength") }),
  fullName: z.string().trim().min(2, { message: t("auth.zod.fullNameLength") }).max(100),
  phone: z.string().trim().optional(),
});

const Auth = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { setAuthData } = useAuth(); // Utiliser la fonction du contexte
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    phone: "",
  });

  const from = location.state?.from?.pathname || "/";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const validated = loginSchema(t).parse({
        email: formData.email,
        password: formData.password,
      });

      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validated),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur de connexion');
      }

      setAuthData(data.user, data.token); // Mettre à jour le contexte

      toast({
        title: t("auth.toast.login.success.title"),
        description: t("auth.toast.login.success.description"),
      });
      
      navigate(from, { replace: true });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue.';
      if (error instanceof z.ZodError) {
        toast({
          title: t("auth.toast.validation.title"),
          description: error.errors[0].message,
          variant: "destructive",
        });
      } else {
        toast({
          title: t("auth.toast.login.error.title"),
          description: errorMessage,
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const validated = signupSchema(t).parse(formData);

      const response = await fetch('http://localhost:3001/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validated),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de l\'inscription.');
      }

      toast({
        title: t("auth.toast.signup.success.title"),
        description: t("auth.toast.signup.success.description"),
      });
      setIsLogin(true);
      setFormData({ email: validated.email, password: "", fullName: "", phone: "" }); // Garder l'email
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue.';
      if (error instanceof z.ZodError) {
        toast({
          title: t("auth.toast.validation.title"),
          description: error.errors[0].message,
          variant: "destructive",
        });
      } else {
        toast({
          title: t("auth.toast.signup.error.title"),
          description: errorMessage,
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-heading">
            {isLogin ? t("auth.login.title") : t("auth.signup.title")}
          </CardTitle>
          <CardDescription>
            {isLogin
              ? t("auth.login.description")
              : t("auth.signup.description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={isLogin ? handleLogin : handleSignup} className="space-y-4">
            {!isLogin && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="fullName">{t("auth.labels.fullName")}</Label>
                  <Input
                    id="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    required={!isLogin}
                    maxLength={100}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">{t("auth.labels.phone")}</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    maxLength={20}
                  />
                </div>
              </>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">{t("auth.labels.email")}</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                maxLength={255}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t("auth.labels.password")}</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                minLength={6}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("auth.loading")}
                </>
              ) : isLogin ? (
                t("auth.login.button")
              ) : (
                t("auth.signup.button")
              )}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <Button
              variant="link"
              onClick={() => {
                setIsLogin(!isLogin);
                setFormData({ email: "", password: "", fullName: "", phone: "" });
              }}
            >
              {isLogin
                ? t("auth.login.switch")
                : t("auth.signup.switch")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
