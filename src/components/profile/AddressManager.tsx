import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin } from "lucide-react";

const AddressManager = () => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-gold" />
          <CardTitle>Mes Adresses</CardTitle>
        </div>
        <CardDescription>
          Gérez vos adresses de livraison (Fonctionnalité à venir)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12 text-gray-500">
          <MapPin className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <p>La gestion multi-adresses sera bientôt disponible.</p>
          <p className="text-sm mt-2">Pour l'instant, utilisez l'adresse dans l'onglet Profil.</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AddressManager;
