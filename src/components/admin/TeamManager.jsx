import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Users, Plus, Trash2, Loader2, Check, X, UserPlus, Shield, 
  Mail, Calendar, AlertCircle, Crown
} from "lucide-react";
import { toast } from "sonner";

const ROLES = {
  owner: { label: "Propriétaire", color: "bg-purple-100 text-purple-800", description: "Contrôle complet" },
  admin: { label: "Admin", color: "bg-red-100 text-red-800", description: "Accès complet" },
  manager: { label: "Manager", color: "bg-blue-100 text-blue-800", description: "Gestion des commandes" },
  editor: { label: "Éditeur", color: "bg-amber-100 text-amber-800", description: "Produits & promos" },
  viewer: { label: "Lecteur", color: "bg-gray-100 text-gray-800", description: "Lecture seule" },
};

function InviteForm({ team, onSuccess, onCancel }) {
  const [form, setForm] = useState({ email: "", role: "manager", message: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email.trim()) { toast.error("Email requis"); return; }
    
    setLoading(true);
    try {
      await base44.functions.invoke("inviteTeamMember", {
        team_id: team.id,
        email: form.email.trim(),
        role: form.role,
        message: form.message.trim(),
      });
      toast.success("Invitation envoyée ✓");
      setForm({ email: "", role: "manager", message: "" });
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.error || "Erreur lors de l'invitation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl border border-rose-100 p-5 space-y-3">
      <div className="flex items-center gap-2 mb-3">
        <UserPlus className="w-5 h-5 text-rose-500" />
        <h3 className="font-semibold text-gray-800">Inviter un membre</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Input
          type="email"
          placeholder="email@exemple.com"
          value={form.email}
          onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
          required
          className="rounded-xl h-10 border-rose-200 bg-white"
        />
        <select
          value={form.role}
          onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
          className="rounded-xl h-10 px-3 border border-rose-200 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-rose-300"
        >
          {Object.entries(ROLES).filter(([k]) => k !== "owner").map(([k, v]) => (
            <option key={k} value={k}>{v.label} — {v.description}</option>
          ))}
        </select>
      </div>
      <textarea
        placeholder="Message optionnel (ex: rejoins-nous pour la saison 2025 !)"
        value={form.message}
        onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
        className="w-full rounded-xl px-3 py-2 border border-rose-200 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-rose-300 resize-none"
        rows={2}
      />
      <div className="flex gap-3">
        <Button type="submit" disabled={loading} className="flex-1 bg-rose-500 hover:bg-rose-600 rounded-xl h-10">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
          Envoyer l'invitation
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="rounded-xl h-10">
          <X className="w-4 h-4" />
        </Button>
      </div>
    </form>
  );
}

export default function TeamManager() {
  const [user, setUser] = useState(null);
  const [team, setTeam] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const me = await base44.auth.me();
      setUser(me);

      // Find user's team
      const teams = await base44.entities.Team.filter({ owner_email: me.email });
      if (teams?.length > 0) {
        setTeam(teams[0]);
        // Load team members
        const teamMembers = await base44.entities.TeamMember.filter({ team_id: teams[0].id }, "-created_date", 50);
        setMembers(teamMembers || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (member) => {
    if (!window.confirm(`Retirer ${member.email} de l'équipe ?`)) return;
    await base44.entities.TeamMember.delete(member.id);
    toast.success("Membre retiré");
    await load();
  };

  const handleChangeRole = async (member, newRole) => {
    if (member.role === "owner") {
      toast.error("Impossible de modifier le rôle du propriétaire");
      return;
    }
    await base44.entities.TeamMember.update(member.id, { role: newRole });
    toast.success("Rôle mis à jour ✓");
    await load();
  };

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-rose-300" /></div>;

  if (!team) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
        <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500 text-sm">Vous n'avez pas d'équipe créée</p>
        <p className="text-xs text-gray-400 mt-2">Une équipe est automatiquement créée lors de votre première connexion admin</p>
      </div>
    );
  }

  const acceptedMembers = members.filter(m => m.status === "accepted");
  const pendingInvitations = members.filter(m => m.status === "pending");
  const owner = members.find(m => m.role === "owner");

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Users className="w-5 h-5 text-rose-500" /> {team.name}
          </h2>
          <p className="text-sm text-gray-500 mt-1">{acceptedMembers.length} membre{acceptedMembers.length > 1 ? "s" : ""} · {pendingInvitations.length} invitation{pendingInvitations.length !== 1 ? "s" : ""} en attente</p>
        </div>
        <Button onClick={() => setShowInvite(!showInvite)} className="bg-rose-500 hover:bg-rose-600 rounded-xl gap-2">
          <Plus className="w-4 h-4" /> Inviter
        </Button>
      </div>

      {/* Invite form */}
      {showInvite && (
        <InviteForm
          team={team}
          onSuccess={load}
          onCancel={() => setShowInvite(false)}
        />
      )}

      {/* Accepted members */}
      {acceptedMembers.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-600 px-2 uppercase tracking-wider">Membres actifs ({acceptedMembers.length})</p>
          {acceptedMembers.map(member => (
            <div key={member.id} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  {member.role === "owner" && <Crown className="w-4 h-4 text-purple-500 flex-shrink-0" />}
                  <p className="font-semibold text-gray-800 text-sm">{member.full_name || member.email}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${ROLES[member.role].color}`}>
                    {ROLES[member.role].label}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1">{member.email}</p>
                {member.joined_date && (
                  <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Depuis le {new Date(member.joined_date).toLocaleDateString("fr-FR")}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {member.role !== "owner" && (
                  <>
                    <select
                      value={member.role}
                      onChange={e => handleChangeRole(member, e.target.value)}
                      className="h-9 px-2 rounded-lg border border-gray-200 bg-white text-xs focus:outline-none focus:ring-1 focus:ring-rose-300"
                    >
                      {Object.entries(ROLES).filter(([k]) => k !== "owner").map(([k, v]) => (
                        <option key={k} value={k}>{v.label}</option>
                      ))}
                    </select>
                    <button onClick={() => handleRemove(member)}
                      className="p-2 rounded-lg hover:bg-red-50 transition text-gray-400 hover:text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pending invitations */}
      {pendingInvitations.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-600 px-2 uppercase tracking-wider">Invitations en attente ({pendingInvitations.length})</p>
          {pendingInvitations.map(invite => (
            <div key={invite.id} className="bg-amber-50 rounded-2xl border border-amber-100 p-4 flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-amber-500 flex-shrink-0" />
                  <p className="font-semibold text-gray-800 text-sm">{invite.email}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${ROLES[invite.role].color}`}>
                    {ROLES[invite.role].label}
                  </span>
                </div>
                {invite.invitation_sent_date && (
                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Envoyée le {new Date(invite.invitation_sent_date).toLocaleDateString("fr-FR")}
                  </p>
                )}
              </div>
              <button onClick={() => handleRemove(invite)} className="p-2 rounded-lg hover:bg-red-50 transition text-gray-400 hover:text-red-500">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Permissions info */}
      <div className="bg-indigo-50 rounded-2xl border border-indigo-100 p-4">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-indigo-900">
            <p className="font-semibold mb-2">Définition des rôles :</p>
            <ul className="space-y-1 text-xs">
              {Object.entries(ROLES).map(([k, v]) => (
                <li key={k}><strong>{v.label}</strong> — {v.description}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}