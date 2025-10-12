import ProfileAvatar from "./ProfileAvatar";
import { Crown } from "lucide-react";

interface ProfileHeaderProps {
  fullName: string;
  email: string;
  tier: "bronze" | "silver" | "gold" | "platinum";
}

const ProfileHeader = ({ fullName, email, tier }: ProfileHeaderProps) => {
  const getTierBadge = (tier: string) => {
    const badges = {
      bronze: {
        label: "Bronze Member",
        gradient: "from-orange-400 to-orange-600",
        icon: "🥉",
      },
      silver: {
        label: "Silver Member",
        gradient: "from-gray-400 to-gray-600",
        icon: "🥈",
      },
      gold: {
        label: "Gold Member",
        gradient: "from-yellow-400 to-yellow-600",
        icon: "🥇",
      },
      platinum: {
        label: "Platinum Member",
        gradient: "from-purple-400 to-purple-600",
        icon: "💎",
      },
    };
    return badges[tier as keyof typeof badges] || badges.bronze;
  };

  const badge = getTierBadge(tier);

  return (
    <div className="bg-gradient-to-r from-primary/5 to-gold/5 rounded-lg p-6 mb-6">
      <div className="flex flex-col md:flex-row items-center gap-6">
        {/* Avatar */}
        <ProfileAvatar fullName={fullName} email={email} size="lg" />

        {/* Info */}
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-3xl font-heading font-bold text-gray-900 mb-2">
            Bienvenue, {fullName || "Invité"} !
          </h1>
          <p className="text-gray-600 mb-3">{email}</p>
          
          {/* Badge Statut */}
          <div className="inline-flex items-center gap-2">
            <div
              className={`bg-gradient-to-r ${badge.gradient} text-white px-4 py-2 rounded-full font-semibold text-sm shadow-md flex items-center gap-2`}
            >
              <span>{badge.icon}</span>
              <span>{badge.label}</span>
            </div>
          </div>
        </div>

        {/* Crown Icon pour les membres Gold/Platinum */}
        {(tier === "gold" || tier === "platinum") && (
          <div className="hidden md:block">
            <Crown className="h-16 w-16 text-yellow-500 animate-pulse" />
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileHeader;
