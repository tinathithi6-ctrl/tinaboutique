import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
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

      const { error } = await supabase.auth.signInWithPassword({
        email: validated.email,
        password: validated.password,
      });

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          toast({
            title: t("auth.toast.login.error.title"),
            description: t("auth.toast.login.error.description"),
            variant: "destructive",
          });
        } else {
          toast({
            title: t("auth.toast.genericError.title"),
            description: error.message,
            variant: "destructive",
          });
        }
        return;
      }

      toast({
        title: t("auth.toast.login.success.title"),
        description: t("auth.toast.login.success.description"),
      });
      
      navigate(from, { replace: true });

    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: t("auth.toast.validation.title"),
          description: error.errors[0].message,
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

      const { error } = await supabase.auth.signUp({
        email: validated.email,
        password: validated.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: validated.fullName,
            phone: validated.phone || "",
          },
        },
      });

      if (error) {
        if (error.message.includes("User already registered")) {
          toast({
            title: t("auth.toast.signup.error.title"),
            description: t("auth.toast.signup.error.description"),
            variant: "destructive",
          });
        } else {
          toast({
            title: t("auth.toast.genericError.title"),
            description: error.message,
            variant: "destructive",
          });
        }
        return;
      }

      toast({
        title: t("auth.toast.signup.success.title"),
        description: t("auth.toast.signup.success.description"),
      });
      setIsLogin(true);
      setFormData({ email: "", password: "", fullName: "", phone: "" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: t("auth.toast.validation.title"),
          description: error.errors[0].message,
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
