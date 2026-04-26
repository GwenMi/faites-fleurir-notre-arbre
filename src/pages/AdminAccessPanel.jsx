import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, Copy, Check, Trash2, UserPlus, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { createPageUrl } from '@/utils';

export default function AdminAccessPanel() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accessSlug, setAccessSlug] = useState('');
  const [members, setMembers] = useState([]);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteForm, setInviteForm] = useState({ pseudo: '', email: '', role: 'viewer' });
  const [savingInvite, setSavingInvite] = useState(false);
  const [copiedSlug, setCopiedSlug] = useState(false);
  const [stats, setStats] = useState({ totalAttempts: 0, successLogins: 0, pendingInvites: 0, activeUsers: 0 });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const me = await base44.auth.me();
      if (!me) {
        base44.auth.redirectToLogin(window.location.href);
        return;
      }
      setUser(me);

      // Récupérer ou créer le slug
      const existing = await base44.entities.AdminAccess.filter({ owner_email: me.email }, '-created_date', 1);
      if (existing?.length > 0) {
        setAccessSlug(existing[0].access_slug);
        // Charger les membres
        const allMembers = await base44.entities.AdminAccess.filter({ access_slug: existing[0].access_slug });
        setMembers(allMembers || []);

        // Charger les statistiques
        const logs = await base44.entities.AdminAccessLog.filter({ access_slug: existing[0].access_slug });
        const successLogins = logs?.filter(l => l.action === 'login_success').length || 0;
        const pendingInvites = (allMembers || []).filter(m => m.status === 'pending').length;
        const activeUsers = (allMembers || []).filter(m => m.status === 'active' && m.email !== me.email).length;
        
        setStats({
          totalAttempts: logs?.length || 0,
          successLogins,
          pendingInvites,
          activeUsers,
        });
      } else {
        // Créer un slug unique
        const slug = generateSlug();
        setAccessSlug(slug);
        // Créer un premier enregistrement pour stocker le slug
        await base44.entities.AdminAccess.create({
          owner_email: me.email,
          access_slug: slug,
          pseudo: 'propriétaire',
          email: me.email,
          role: 'admin',
          status: 'active',
          joined_date: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error(error);
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteForm.pseudo.trim() || !inviteForm.email.trim()) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    setSavingInvite(true);
    try {
      const invitationLink = `${window.location.origin}${createPageUrl('AdminAccessLogin')}?slug=${accessSlug}&pseudo=${inviteForm.pseudo}`;

      // Créer l'enregistrement d'accès
      await base44.entities.AdminAccess.create({
        owner_email: user.email,
        access_slug: accessSlug,
        pseudo: inviteForm.pseudo,
        email: inviteForm.email,
        role: inviteForm.role,
        status: 'pending',
        invitation_sent_date: new Date().toISOString(),
      });

      // Envoyer l'email d'invitation
      await base44.functions.invoke('sendAdminAccessInvitation', {
        email: inviteForm.email,
        pseudo: inviteForm.pseudo,
        invitationLink,
      });

      toast.success(`Invitation envoyée à ${inviteForm.email}`);
      setInviteForm({ pseudo: '', email: '', role: 'viewer' });
      setShowInviteForm(false);

      // Recharger les membres
      const updated = await base44.entities.AdminAccess.filter({ access_slug: accessSlug });
      setMembers(updated || []);
    } catch (error) {
      console.error(error);
      toast.error('Erreur lors de l\'invitation');
    } finally {
      setSavingInvite(false);
    }
  };

  const handleDeleteMember = async (memberId) => {
    try {
      await base44.entities.AdminAccess.delete(memberId);
      setMembers(members.filter(m => m.id !== memberId));
      toast.success('Membre supprimé');
    } catch (error) {
      console.error(error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const copySlug = () => {
    navigator.clipboard.writeText(accessSlug);
    setCopiedSlug(true);
    setTimeout(() => setCopiedSlug(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-rose-400" />
      </div>
    );
  }

  const roleConfig = {
    admin: { label: 'Admin', color: 'bg-purple-100 text-purple-700', desc: 'Accès complet' },
    editor: { label: 'Éditeur', color: 'bg-blue-100 text-blue-700', desc: 'Modification' },
    viewer: { label: 'Lecteur', color: 'bg-gray-100 text-gray-700', desc: 'Lecture seule' },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white p-6">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&display=swap');
        .font-serif-elegant { font-family: 'Cormorant Garamond', Georgia, serif; }
      `}</style>

      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 mb-4">
            <Shield className="w-6 h-6 text-purple-600" />
          </div>
          <h1 className="font-serif-elegant text-4xl font-bold text-gray-800 mb-2">Accès administrateur</h1>
          <p className="text-gray-500 text-sm">Gérez les accès à votre page privée d'administration</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500 font-semibold mb-1">Tentatives d'accès</p>
            <p className="text-3xl font-bold text-gray-800">{stats.totalAttempts}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500 font-semibold mb-1">Connexions réussies</p>
            <p className="text-3xl font-bold text-green-600">{stats.successLogins}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500 font-semibold mb-1">Invitations en attente</p>
            <p className="text-3xl font-bold text-amber-600">{stats.pendingInvites}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500 font-semibold mb-1">Utilisateurs actifs</p>
            <p className="text-3xl font-bold text-blue-600">{stats.activeUsers}</p>
          </div>
        </div>

        {/* Slug Secret */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-bold text-gray-800">Votre lien d'accès secret</h2>
            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-semibold">
              À garder confidentiel
            </span>
          </div>
          <p className="text-xs text-gray-500 mb-3">Partagez ce lien UNIQUEMENT avec des personnes de confiance</p>
          
          <div className="flex gap-2">
            <div className="flex-1 bg-gray-50 rounded-lg px-3 py-2 border border-gray-200 font-mono text-sm text-gray-700">
              {accessSlug}
            </div>
            <button
              onClick={copySlug}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition flex items-center gap-2 text-sm"
            >
              {copiedSlug ? (
                <>
                  <Check className="w-4 h-4" /> Copié
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" /> Copier
                </>
              )}
            </button>
          </div>
        </div>

        {/* Invite Form */}
        {showInviteForm && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
            <h3 className="font-bold text-gray-800 mb-4">Inviter un utilisateur</h3>
            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Pseudo</label>
                <Input
                  value={inviteForm.pseudo}
                  onChange={e => setInviteForm({ ...inviteForm, pseudo: e.target.value })}
                  placeholder="Ex: Emma"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                <Input
                  type="email"
                  value={inviteForm.email}
                  onChange={e => setInviteForm({ ...inviteForm, email: e.target.value })}
                  placeholder="emma@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Rôle</label>
                <select
                  value={inviteForm.role}
                  onChange={e => setInviteForm({ ...inviteForm, role: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="viewer">Lecteur (lecture seule)</option>
                  <option value="editor">Éditeur (modification)</option>
                  <option value="admin">Admin (accès complet)</option>
                </select>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={savingInvite} className="flex-1 bg-purple-600 hover:bg-purple-700">
                  {savingInvite ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Envoyer l'invitation
                </Button>
                <Button
                  type="button"
                  onClick={() => setShowInviteForm(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Annuler
                </Button>
              </div>
            </form>
          </div>
        )}

        {!showInviteForm && (
          <Button
            onClick={() => setShowInviteForm(true)}
            className="w-full mb-6 bg-purple-600 hover:bg-purple-700 text-white"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Ajouter un utilisateur
          </Button>
        )}

        {/* Members List */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="font-bold text-gray-800 mb-4">Utilisateurs ({members.length})</h3>
          {members.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">Aucun utilisateur ajouté</p>
          ) : (
            <div className="space-y-3">
              {members.map(member => (
                <div key={member.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-800">{member.pseudo}</p>
                      <span className={`text-xs px-2 py-1 rounded-full font-semibold ${roleConfig[member.role].color}`}>
                        {roleConfig[member.role].label}
                      </span>
                      {member.status === 'pending' && (
                        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">En attente</span>
                      )}
                      {member.status === 'active' && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Actif</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{member.email}</p>
                  </div>
                  {member.email !== user.email && (
                    <button
                      onClick={() => handleDeleteMember(member.id)}
                      className="p-2 hover:bg-red-50 rounded-lg transition text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}