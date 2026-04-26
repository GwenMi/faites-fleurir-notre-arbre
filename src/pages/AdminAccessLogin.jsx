import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, Lock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { createPageUrl } from '@/utils';

export default function AdminAccessLogin() {
  const [step, setStep] = useState('login'); // login | setPassword | success
  const [slug, setSlug] = useState('');
  const [pseudo, setPseudo] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [member, setMember] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlSlug = params.get('slug');
    const urlPseudo = params.get('pseudo');
    
    if (urlSlug && urlPseudo) {
      setSlug(urlSlug);
      setPseudo(urlPseudo);
      setStep('setPassword');
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Enregistrer la tentative
      await base44.entities.AdminAccessLog.create({
        access_slug: slug,
        action: 'login_attempt',
      }).catch(() => {});

      // Vérifier les identifiants
      const members = await base44.entities.AdminAccess.filter({
        access_slug: slug,
        pseudo: pseudo,
      });

      if (!members || members.length === 0) {
        setError('Slug ou pseudo incorrect');
        setLoading(false);
        return;
      }

      const foundMember = members[0];
      if (foundMember.status === 'pending') {
        setError('Invitation en attente. Vérifiez votre email');
        setLoading(false);
        return;
      }

      // Enregistrer la connexion réussie
      await base44.entities.AdminAccessLog.create({
        access_slug: slug,
        pseudo: pseudo,
        action: 'login_success',
      }).catch(() => {});

      setMember(foundMember);
      setStep('setPassword');
    } catch (err) {
      setError('Erreur lors de la vérification');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSetPassword = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    setLoading(true);

    try {
      // Hasher le mot de passe (en production, utiliser bcrypt côté backend)
      const passwordHash = await hashPassword(password);

      // Mettre à jour le statut et le mot de passe
      await base44.entities.AdminAccess.update(member.id, {
        password_hash: passwordHash,
        status: 'active',
        joined_date: new Date().toISOString(),
      });

      // Enregistrer l'action
      await base44.entities.AdminAccessLog.create({
        access_slug: slug,
        pseudo: pseudo,
        action: 'password_set',
      }).catch(() => {});

      toast.success('Mot de passe défini avec succès');
      setStep('success');
    } catch (err) {
      setError('Erreur lors de la définition du mot de passe');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const hashPassword = async (pwd) => {
    // Implémentation simple - en production, utiliser bcrypt ou une solution sécurisée
    const encoder = new TextEncoder();
    const data = encoder.encode(pwd);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white flex items-center justify-center p-4">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&display=swap');
        .font-serif-elegant { font-family: 'Cormorant Garamond', Georgia, serif; }
      `}</style>

      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 mb-4">
            <Lock className="w-6 h-6 text-purple-600" />
          </div>
          <h1 className="font-serif-elegant text-3xl font-bold text-gray-800 mb-2">Accès sécurisé</h1>
          <p className="text-gray-500 text-sm">Connectez-vous à votre espace administrateur</p>
        </div>

        {/* Login Form */}
        {step === 'login' && (
          <form onSubmit={handleLogin} className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                <span className="text-sm text-red-700">{error}</span>
              </div>
            )}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Slug d'accès</label>
              <Input
                value={slug}
                onChange={e => setSlug(e.target.value)}
                placeholder="Entrez le slug"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Pseudo</label>
              <Input
                value={pseudo}
                onChange={e => setPseudo(e.target.value)}
                placeholder="Entrez votre pseudo"
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-purple-600 hover:bg-purple-700">
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Continuer
            </Button>
          </form>
        )}

        {/* Set Password Form */}
        {step === 'setPassword' && (
          <form onSubmit={handleSetPassword} className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                <span className="text-sm text-red-700">{error}</span>
              </div>
            )}
            <p className="text-sm text-gray-600">
              Bienvenue <strong>{pseudo}</strong>, définissez votre mot de passe
            </p>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Mot de passe</label>
              <Input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Minimum 6 caractères"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Confirmer le mot de passe</label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Confirmez votre mot de passe"
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-purple-600 hover:bg-purple-700">
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Définir mon mot de passe
            </Button>
          </form>
        )}

        {/* Success */}
        {step === 'success' && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center space-y-4">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100">
              <span className="text-2xl">✓</span>
            </div>
            <div>
              <h2 className="font-bold text-gray-800 mb-1">Accès activé</h2>
              <p className="text-sm text-gray-500">Votre mot de passe a été défini avec succès</p>
            </div>
            <Button
              onClick={() => window.location.href = createPageUrl('Home')}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              Retour à l'accueil
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}