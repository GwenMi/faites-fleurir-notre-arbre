import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Shield, Users, Eye, Loader2, UserPlus, RefreshCw, Info } from "lucide-react";
import { toast } from "sonner";

const ROLE_CONFIG = {
  admin:   { label: "Administrateur",  color: "bg-red-100 text-red-700",    icon: Shield,    desc: "Accès complet, gestion utilisateurs" },
  manager: { label: "Manager",         color: "bg-blue-100 text-blue-700",  icon: Users,     desc: "Commandes, CRM, Stats, Devis" },
  viewer:  { label: "Lecteur",         color: "bg-gray-100 text-gray-600",  icon: Eye,       desc: "Statistiques uniquement (lecture)" },
  user:    { label: "Mariés (client)", color: "bg-green-100 text-green-700", icon: Users,    desc: "Espace mariés uniquement" },
};

export default function UserManagementPanel() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("manager");
  const [inviting, setInviting] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  const loadUsers = async () => {
    setLoading(true);
    const data = await base44.entities.User.list("-created_date", 200);
    setUsers(data || []);
    setLoading(false);
  };

  useEffect(() => { loadUsers(); }, []);

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;
    setInviting(true);
    await base44.users.inviteUser(inviteEmail.trim(), inviteRole);
    toast.success(`Invitation envoyée à ${inviteEmail} (rôle : ${ROLE_CONFIG[inviteRole]?.label})`);
    setInviteEmail("");
    setInviting(false);
    await loadUsers();
  };

  const updateRole = async (u, newRole) => {
    setUpdatingId(u.id);
    await base44.entities.User.update(u.id, { role: newRole });
    toast.success(`Rôle mis à jour pour ${u.full_name || u.email}`);
    await loadUsers();
    setUpdatingId(null);
  };

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200 space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="w-5 h-5 text-red-500" />
        <h2 className="text-xl font-bold text-gray-800">Gestion des accès</h2>
        <Badge className="bg-red-100 text-red-700 text-xs">Admins uniquement</Badge>
      </div>

      {/* Role legend */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Object.entries(ROLE_CONFIG).map(([key, cfg]) => {
          const Icon = cfg.icon;
          return (
            <div key={key} className="rounded-xl border border-gray-100 p-3 bg-gray-50">
              <div className="flex items-center gap-1.5 mb-1">
                <Icon className={`w-3.5 h-3.5 ${cfg.color.split(' ')[1]}`} />
                <span className={`text-xs font-bold ${cfg.color.split(' ')[1]}`}>{cfg.label}</span>
              </div>
              <p className="text-xs text-gray-400">{cfg.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Access matrix info */}
      <div className="bg-blue-50 rounded-xl p-4 flex items-start gap-3">
        <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-blue-700 space-y-0.5">
          <p><strong>Admin</strong> : tout le tableau de bord, gestion utilisateurs, promos</p>
          <p><strong>Manager</strong> : commandes, CRM, statistiques, devis (pas gestion utilisateurs)</p>
          <p><strong>Lecteur</strong> : statistiques uniquement</p>
        </div>
      </div>

      {/* Invite form */}
      <div className="bg-indigo-50 rounded-xl p-4 space-y-3">
        <p className="text-sm font-semibold text-indigo-800">✉️ Inviter un collaborateur</p>
        <div className="flex gap-2 flex-wrap">
          <Input
            type="email"
            placeholder="Email du collaborateur"
            value={inviteEmail}
            onChange={e => setInviteEmail(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleInvite()}
            className="rounded-xl flex-1 min-w-48 bg-white"
          />
          <select
            value={inviteRole}
            onChange={e => setInviteRole(e.target.value)}
            className="border border-input rounded-xl px-3 py-2 text-sm bg-white"
          >
            <option value="admin">Administrateur</option>
            <option value="manager">Manager</option>
            <option value="viewer">Lecteur</option>
          </select>
          <Button
            onClick={handleInvite}
            disabled={inviting || !inviteEmail.trim()}
            className="bg-indigo-600 hover:bg-indigo-700 rounded-xl gap-2"
          >
            {inviting ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
            Inviter
          </Button>
        </div>
      </div>

      {/* Users list */}
      {loading ? (
        <div className="text-center py-8"><Loader2 className="w-6 h-6 animate-spin text-gray-300 mx-auto" /></div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-600">{users.length} utilisateur{users.length > 1 ? "s" : ""}</p>
            <button onClick={loadUsers} className="p-1.5 hover:bg-gray-100 rounded-lg transition text-gray-400">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
          {users.map(u => {
            const roleCfg = ROLE_CONFIG[u.role] || ROLE_CONFIG.user;
            return (
              <div key={u.id} className="flex items-center justify-between gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-200 to-pink-200 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-rose-700">
                      {((u.full_name || u.email || "?")[0]).toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{u.full_name || "—"}</p>
                    <p className="text-xs text-gray-400 truncate">{u.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge className={roleCfg.color + " text-xs hidden sm:flex"}>{roleCfg.label}</Badge>
                  <select
                    value={u.role || "user"}
                    onChange={e => updateRole(u, e.target.value)}
                    disabled={updatingId === u.id}
                    className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white disabled:opacity-50"
                  >
                    <option value="admin">Administrateur</option>
                    <option value="manager">Manager</option>
                    <option value="viewer">Lecteur</option>
                    <option value="user">Utilisateur (mariés)</option>
                  </select>
                  {updatingId === u.id && <Loader2 className="w-3.5 h-3.5 animate-spin text-gray-400" />}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}