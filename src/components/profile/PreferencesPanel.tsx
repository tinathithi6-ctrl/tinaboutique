import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings } from "lucide-react";

const PreferencesPanel = () => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-gold" />
          <CardTitle>Mes Préférences</CardTitle>
        </div>
        <CardDescription>
          Personnalisez votre expérience (Fonctionnalité à venir)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12 text-gray-500">
          <Settings className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <p>Les préférences utilisateur seront bientôt disponibles.</p>
          <p className="text-sm mt-2">Langue, devise, notifications, etc.</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PreferencesPanel;
