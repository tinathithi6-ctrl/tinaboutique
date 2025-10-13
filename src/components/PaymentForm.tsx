import { useState } from 'react';
import apiFetch from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CreditCard, Smartphone, Building } from 'lucide-react';

interface PaymentFormProps {
  amount: number;
  currency: string;
  orderId: string;
  onPaymentSuccess: (transactionId: string) => void;
  onPaymentError: (error: string) => void;
}

export const PaymentForm = ({
  amount,
  currency,
  orderId,
  onPaymentSuccess,
  onPaymentError
}: PaymentFormProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardData, setCardData] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  });
  const [mobileData, setMobileData] = useState({
    phone: '',
    provider: 'orange' // Défaut Orange Money (plus populaire en RDC)
  });

  // Méthodes de paiement disponibles selon le pays
  const paymentMethods = [
    {
      id: 'card',
      name: 'Carte de Crédit/Débit',
      icon: CreditCard,
      description: 'Visa, Mastercard, etc.',
      providers: ['flutterwave', 'stripe']
    },
    {
      id: 'mobile',
      name: 'Mobile Money',
      icon: Smartphone,
      description: 'MTN Mobile Money, Orange Money',
      providers: ['mtn', 'orange', 'airtel']
    },
    {
      id: 'bank',
      name: 'Virement Bancaire',
      icon: Building,
      description: 'Transfert bancaire sécurisé',
      providers: ['bank_transfer']
    }
  ];

  const handleCardPayment = async () => {
    if (!cardData.number || !cardData.expiry || !cardData.cvv || !cardData.name) {
      toast({
        title: 'Erreur',
        description: 'Veuillez remplir tous les champs de la carte',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      // Créer l'intent de paiement
  const intentRes = await apiFetch('/api/payments/create-intent', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ amount, currency, orderId, paymentMethod: 'flutterwave', metadata: { cardLast4: cardData.number.slice(-4) } }) } as any) as any;
      const { intentId } = intentRes;

      // Traiter le paiement avec Flutterwave
  const result = await apiFetch('/api/payments/process', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ intentId, paymentData: { card_number: cardData.number.replace(/\s/g, ''), expiry_month: cardData.expiry.split('/')[0], expiry_year: cardData.expiry.split('/')[1], cvv: cardData.cvv, card_holder: cardData.name } }) } as any) as any;

      if (result.success) {
        onPaymentSuccess(result.transactionId);
        toast({
          title: 'Paiement réussi',
          description: 'Votre commande a été confirmée'
        });
      } else {
        throw new Error(result.error || 'Paiement échoué');
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur de paiement';
      onPaymentError(errorMessage);
      toast({
        title: 'Erreur de paiement',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMobilePayment = async () => {
    if (!mobileData.phone) {
      toast({
        title: 'Erreur',
        description: 'Veuillez saisir votre numéro de téléphone',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      // Logique de paiement mobile money
  const result = await apiFetch('/api/payments/mobile-money', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ amount, currency, orderId, phone: mobileData.phone, provider: mobileData.provider }) } as any) as any;

      if (result.success) {
        onPaymentSuccess(result.transactionId);
        toast({
          title: 'Paiement initié',
          description: 'Veuillez confirmer le paiement sur votre téléphone'
        });
      } else {
        throw new Error(result.error || 'Erreur de paiement mobile');
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur de paiement';
      onPaymentError(errorMessage);
      toast({
        title: 'Erreur de paiement',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBankTransfer = async () => {
    setLoading(true);
    try {
      // Générer les instructions de virement
  const result = await apiFetch('/api/payments/bank-transfer', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ amount, currency, orderId }) } as any) as any;

      if (result.success) {
        onPaymentSuccess(result.transactionId);
        toast({
          title: 'Instructions envoyées',
          description: 'Consultez votre email pour les instructions de virement'
        });
      } else {
        throw new Error(result.error || 'Erreur lors de la génération des instructions');
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur de génération';
      onPaymentError(errorMessage);
      toast({
        title: 'Erreur',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = () => {
    switch (paymentMethod) {
      case 'card':
        return handleCardPayment();
      case 'mobile':
        return handleMobilePayment();
      case 'bank':
        return handleBankTransfer();
      default:
        toast({
          title: 'Erreur',
          description: 'Méthode de paiement non supportée',
          variant: 'destructive'
        });
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">
          Paiement Sécurisé
        </CardTitle>
        <div className="text-center text-2xl font-bold text-primary">
          {amount.toFixed(2)} {currency}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Sélection de la méthode de paiement */}
        <div>
          <Label className="text-base font-medium">Méthode de paiement</Label>
          <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="mt-3">
            {paymentMethods.map((method) => {
              const Icon = method.icon;
              return (
                <div key={method.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                  <RadioGroupItem value={method.id} id={method.id} />
                  <Icon className="h-5 w-5 text-primary" />
                  <div className="flex-1">
                    <Label htmlFor={method.id} className="font-medium cursor-pointer">
                      {method.name}
                    </Label>
                    <p className="text-sm text-muted-foreground">{method.description}</p>
                  </div>
                </div>
              );
            })}
          </RadioGroup>
        </div>

        {/* Formulaire selon la méthode sélectionnée */}
        {paymentMethod === 'card' && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="cardNumber">Numéro de carte</Label>
              <Input
                id="cardNumber"
                placeholder="1234 5678 9012 3456"
                value={cardData.number}
                onChange={(e) => setCardData({...cardData, number: formatCardNumber(e.target.value)})}
                maxLength={19}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="expiry">Expiration</Label>
                <Input
                  id="expiry"
                  placeholder="MM/YY"
                  value={cardData.expiry}
                  onChange={(e) => setCardData({...cardData, expiry: formatExpiry(e.target.value)})}
                  maxLength={5}
                />
              </div>
              <div>
                <Label htmlFor="cvv">CVV</Label>
                <Input
                  id="cvv"
                  placeholder="123"
                  value={cardData.cvv}
                  onChange={(e) => setCardData({...cardData, cvv: e.target.value.replace(/[^0-9]/g, '')})}
                  maxLength={4}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="name">Nom sur la carte</Label>
              <Input
                id="name"
                placeholder="John Doe"
                value={cardData.name}
                onChange={(e) => setCardData({...cardData, name: e.target.value})}
              />
            </div>
          </div>
        )}

        {paymentMethod === 'mobile' && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="provider">Opérateur Mobile</Label>
              <Select value={mobileData.provider} onValueChange={(value) => setMobileData({...mobileData, provider: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="orange">Orange Money (RDC)</SelectItem>
                  <SelectItem value="airtel">Airtel Money (RDC)</SelectItem>
                  <SelectItem value="africell">Africell Money (RDC)</SelectItem>
                  <SelectItem value="mpesa">M-Pesa (International)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="phone">Numéro de téléphone</Label>
              <Input
                id="phone"
                placeholder="+243 XX XXX XXXX"
                value={mobileData.phone}
                onChange={(e) => setMobileData({...mobileData, phone: e.target.value})}
              />
            </div>
          </div>
        )}

        {paymentMethod === 'bank' && (
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <Building className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-sm text-blue-800">
              Vous recevrez les instructions de virement par email après confirmation.
            </p>
          </div>
        )}

        {/* Bouton de paiement */}
        <Button
          onClick={handlePayment}
          disabled={loading}
          className="w-full"
          size="lg"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Traitement...
            </>
          ) : (
            `Payer ${amount.toFixed(2)} ${currency}`
          )}
        </Button>

        {/* Sécurité */}
        <div className="text-center text-xs text-muted-foreground">
          <p>🔒 Paiement sécurisé SSL</p>
          <p>Conforme PCI DSS Level 1</p>
        </div>
      </CardContent>
    </Card>
  );
};