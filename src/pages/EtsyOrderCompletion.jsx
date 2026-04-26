import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { Loader2, AlertCircle, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { createPageUrl } from '@/utils';

export default function EtsyOrderCompletion() {
  const [step, setStep] = useState('fetch'); // fetch | ready | creating
  const [orderIdInput, setOrderIdInput] = useState('');
  const [etsyOrder, setEtsyOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get('order_id');
    if (orderId) {
      setOrderIdInput(orderId);
      fetchOrder(orderId);
    }
  }, []);

  const fetchOrder = async (orderId) => {
    setLoading(true);
    setError('');
    
    try {
      const response = await base44.functions.invoke('fetchEtsyOrder', {
        order_id: orderId,
      });
      
      if (response.data?.error) {
        setError(response.data.error);
        setStep('fetch');
      } else {
        setEtsyOrder(response.data);
        setStep('ready');
      }
    } catch (err) {
      setError('Erreur lors de la récupération de la commande');
      console.error(err);
      setStep('fetch');
    } finally {
      setLoading(false);
    }
  };

  const handleFetchClick = () => {
    if (!orderIdInput.trim()) {
      setError('Veuillez entrer un numéro de commande');
      return;
    }
    fetchOrder(orderIdInput.trim());
  };

  const startCreatingEvent = async () => {
    if (!etsyOrder) return;

    setStep('creating');
    setLoading(true);

    try {
      // Create event with Etsy data
      const eventData = {
        couple_names: etsyOrder.buyer_email || 'Client Etsy',
        event_type: 'autre',
        event_date: new Date().toISOString().split('T')[0],
        slug: `etsy-${etsyOrder.order_id}`,
        plan: 'basic',
        status: 'active',
        template: 'classique',
      };

      const newEvent = await base44.entities.Event.create(eventData);

      // Save Etsy order reference
      const order = await base44.entities.Order.create({
        event_id: newEvent.id,
        customer_email: etsyOrder.buyer_email,
        customer_name: etsyOrder.buyer_email?.split('@')[0] || 'Client Etsy',
        etsy_order_id: etsyOrder.order_id,
        etsy_order_number: etsyOrder.order_number,
        total_price: etsyOrder.total_price || 0,
        payment_status: 'paid',
        shipping_status: 'pending',
        status: 'confirmed',
      });

      toast.success('Événement Etsy créé ! 🌸');
      
      // Redirect to event editor with pre-filled data
      window.location.href = createPageUrl('CreateMyEvent') + `?event_id=${newEvent.id}&from=etsy`;
    } catch (err) {
      setError('Erreur lors de la création de l\'événement');
      console.error(err);
      setStep('ready');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white flex items-center justify-center p-4">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&display=swap');
        .font-serif-elegant { font-family: 'Cormorant Garamond', Georgia, serif; }
      `}</style>

      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-rose-100 mb-4">
            <span className="text-2xl">🌸</span>
          </div>
          <h1 className="font-serif-elegant text-3xl font-bold text-gray-800 mb-2">
            Votre événement Etsy
          </h1>
          <p className="text-gray-500 text-sm">Créez votre site personnalisé en quelques clics</p>
        </div>

        {/* Step 1: Fetch Order */}
        {step === 'fetch' && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                <span className="text-sm text-red-700">{error}</span>
              </div>
            )}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Numéro de commande Etsy
              </label>
              <Input
                value={orderIdInput}
                onChange={(e) => setOrderIdInput(e.target.value)}
                placeholder="Ex: 1234567890"
                onKeyDown={(e) => e.key === 'Enter' && handleFetchClick()}
              />
            </div>
            <Button
              onClick={handleFetchClick}
              disabled={loading}
              className="w-full bg-rose-500 hover:bg-rose-600"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Récupérer ma commande
            </Button>
          </div>
        )}

        {/* Step 2: Ready */}
        {step === 'ready' && etsyOrder && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
              <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-green-700">Commande trouvée</p>
                <p className="text-xs text-green-600">N° {etsyOrder.order_number}</p>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-widest mb-1">Email</p>
                <p className="text-gray-800 font-semibold">{etsyOrder.buyer_email}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-widest mb-1">Montant</p>
                <p className="text-gray-800 font-semibold">{etsyOrder.total_price}€</p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-xs text-blue-700">
                ℹ️ Un site événement personnalisé sera créé et lié à votre commande. Vous pourrez le personnaliser ensuite.
              </p>
            </div>

            <Button
              onClick={startCreatingEvent}
              disabled={loading}
              className="w-full bg-rose-500 hover:bg-rose-600"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Créer mon événement
            </Button>
          </div>
        )}

        {/* Step 3: Creating */}
        {step === 'creating' && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-rose-500 mx-auto" />
            <p className="text-gray-600">Création de votre événement en cours...</p>
          </div>
        )}
      </div>
    </div>
  );
}