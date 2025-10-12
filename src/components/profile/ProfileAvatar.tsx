import { User } from "lucide-react";

interface ProfileAvatarProps {
  fullName: string;
  email: string;
  size?: "sm" | "md" | "lg";
}

const ProfileAvatar = ({ fullName, email, size = "lg" }: ProfileAvatarProps) => {
  // Obtenir les initiales
  const getInitials = (name: string) => {
    if (!name || name.trim() === "") {
      return email.charAt(0).toUpperCase();
    }
    const names = name.trim().split(" ");
    if (names.length === 1) {
      return names[0].substring(0, 2).toUpperCase();
    }
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  const sizeClasses = {
    sm: "w-12 h-12 text-lg",
    md: "w-16 h-16 text-xl",
    lg: "w-24 h-24 text-3xl",
  };

  const initials = getInitials(fullName);

  return (
    <div
      className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-gold to-yellow-600 flex items-center justify-center text-white font-bold shadow-lg`}
    >
      {initials}
    </div>
  );
};

export default ProfileAvatar;
