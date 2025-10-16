import { useEffect, useState } from "react";
import { Check, X, AlertCircle } from "lucide-react";

interface PasswordStrengthProps {
  password: string;
  onStrengthChange?: (isStrong: boolean) => void;
}

export const PasswordStrengthIndicator = ({ password, onStrengthChange }: PasswordStrengthProps) => {
  const [strength, setStrength] = useState({
    score: 0,
    hasMinLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false,
  });

  useEffect(() => {
    if (!password) {
      setStrength({
        score: 0,
        hasMinLength: false,
        hasUpperCase: false,
        hasLowerCase: false,
        hasNumber: false,
        hasSpecialChar: false,
      });
      onStrengthChange?.(false);
      return;
    }

    const checks = {
      hasMinLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };

    const score = Object.values(checks).filter(Boolean).length;
    const isStrong = score >= 4 && checks.hasMinLength;

    setStrength({ ...checks, score });
    onStrengthChange?.(isStrong);
  }, [password, onStrengthChange]);

  if (!password) return null;

  const getStrengthText = () => {
    if (strength.score <= 2) return { text: "Faible", color: "text-red-500" };
    if (strength.score === 3) return { text: "Moyen", color: "text-yellow-500" };
    if (strength.score === 4) return { text: "Bon", color: "text-blue-500" };
    return { text: "Fort", color: "text-green-500" };
  };

  const { text, color } = getStrengthText();

  const CheckItem = ({ met, label }: { met: boolean; label: string }) => (
    <div className={`flex items-center gap-2 text-sm ${met ? 'text-green-600' : 'text-gray-400'}`}>
      {met ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
      <span>{label}</span>
    </div>
  );

  return (
    <div className="mt-2 space-y-2">
      <div className="flex items-center gap-2">
        <AlertCircle className={`h-4 w-4 ${color}`} />
        <span className={`font-semibold ${color}`}>Force : {text}</span>
      </div>

      {/* Barre de progression */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${
            strength.score <= 2 ? 'bg-red-500' :
            strength.score === 3 ? 'bg-yellow-500' :
            strength.score === 4 ? 'bg-blue-500' :
            'bg-green-500'
          }`}
          style={{ width: `${(strength.score / 5) * 100}%` }}
        />
      </div>

      {/* Critères */}
      <div className="grid grid-cols-1 gap-1 text-xs">
        <CheckItem met={strength.hasMinLength} label="Au moins 8 caractères" />
        <CheckItem met={strength.hasUpperCase} label="Une majuscule (A-Z)" />
        <CheckItem met={strength.hasLowerCase} label="Une minuscule (a-z)" />
        <CheckItem met={strength.hasNumber} label="Un chiffre (0-9)" />
        <CheckItem met={strength.hasSpecialChar} label="Un caractère spécial (!@#$...)" />
      </div>
    </div>
  );
};
