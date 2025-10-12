import { User, Package, MapPin, Lock, Settings } from "lucide-react";

interface Tab {
  id: string;
  label: string;
  icon: React.ElementType;
}

interface ProfileTabsProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

const ProfileTabs = ({ activeTab, onTabChange }: ProfileTabsProps) => {
  const tabs: Tab[] = [
    { id: "profile", label: "Profil", icon: User },
    { id: "orders", label: "Commandes", icon: Package },
    { id: "addresses", label: "Adresses", icon: MapPin },
    { id: "security", label: "Sécurité", icon: Lock },
    { id: "preferences", label: "Préférences", icon: Settings },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm p-2 mb-6">
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-md font-medium transition-all ${
                isActive
                  ? "bg-gradient-to-r from-gold to-yellow-600 text-white shadow-md"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ProfileTabs;
