import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PasswordStrengthIndicator } from "@/components/PasswordStrengthIndicator";
import { useToast } from "@/hooks/use-toast";
import apiFetch from '@/lib/api';
import { Loader2, CheckCircle2 } from "lucide-react";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [passwordStrong, setPasswordStrong] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const token = searchParams.get('token');
  const email = searchParams.get('email');

  useEffect(() => {
    if (!token || !email) {
      toast({
        title: "Lien invalide",
        description: "Ce lien de réinitialisation est invalide.",
        variant: "destructive",
      });
      navigate('/auth');
    }
  }, [token, email, navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (newPassword !== confirmPassword) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    if (!passwordStrong) {
      toast({
        title: "Mot de passe faible",
        description: "Veuillez choisir un mot de passe plus fort.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    try {
      await apiFetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          token,
          newPassword
        })
      });

      toast({
        title: "Succès",
        description: "Votre mot de passe a été réinitialisé avec succès.",
      });

      setTimeout(() => {
        navigate('/auth');
      }, 2000);

    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de réinitialiser le mot de passe.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-heading">
            Réinitialiser votre mot de passe
          </CardTitle>
          <CardDescription>
            Choisissez un nouveau mot de passe fort et sécurisé
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email || ''}
                disabled
                className="bg-gray-100"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">Nouveau mot de passe</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
              />
              <PasswordStrengthIndicator 
                password={newPassword}
                onStrengthChange={setPasswordStrong}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="flex items-center gap-2">
                Confirmer le mot de passe
                {newPassword && confirmPassword && newPassword === confirmPassword && (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                )}
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                className={confirmPassword ? (newPassword === confirmPassword ? 'border-green-500' : 'border-red-300') : ''}
              />
              {confirmPassword && newPassword !== confirmPassword && (
                <p className="text-xs text-red-500">Les mots de passe ne correspondent pas</p>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading || !passwordStrong || newPassword !== confirmPassword}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Réinitialisation...
                </>
              ) : (
                "Réinitialiser mon mot de passe"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;
