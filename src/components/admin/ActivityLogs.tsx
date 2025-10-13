import { useState, useEffect } from 'react';
import apiFetch from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Activity, 
  Search, 
  Filter, 
  Download, 
  Eye,
  ShoppingCart,
  LogIn,
  LogOut,
  CreditCard,
  Package,
  MapPin,
  Clock,
  User,
  Globe
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ActivityLog {
  id: number;
  user_id: number | null;
  user_email: string;
  action_type: string;
  action_description: string;
  entity_type?: string;
  entity_id?: string;
  ip_address?: string;
  user_agent?: string;
  country?: string;
  city?: string;
  metadata?: any;
  created_at: string;
}

export const ActivityLogs = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchLogs();
  }, [page, actionFilter]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        limit: '50',
        offset: String((page - 1) * 50),
      });

      if (actionFilter !== 'all') {
        params.append('actionType', actionFilter);
      }

  const data = await apiFetch(`/api/admin/activity-logs?${params}`) as any;
  setLogs(data.rows || []);
  setTotalPages(data.count ? Math.ceil(data.count / 50) : 1);
    } catch (error) {
      console.error('Erreur chargement logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'LOGIN':
      case 'ADMIN_LOGIN':
        return <LogIn className="h-4 w-4" />;
      case 'LOGOUT':
        return <LogOut className="h-4 w-4" />;
      case 'ADD_TO_CART':
      case 'REMOVE_FROM_CART':
      case 'UPDATE_CART':
        return <ShoppingCart className="h-4 w-4" />;
      case 'PAYMENT_SUCCESS':
      case 'PAYMENT_FAILED':
      case 'PAYMENT_INITIATED':
        return <CreditCard className="h-4 w-4" />;
      case 'ORDER_PLACED':
      case 'ORDER_CANCELLED':
        return <Package className="h-4 w-4" />;
      case 'VIEW_PRODUCT':
        return <Eye className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getActionColor = (actionType: string) => {
    if (actionType.includes('LOGIN')) return 'bg-green-100 text-green-800';
    if (actionType.includes('LOGOUT')) return 'bg-gray-100 text-gray-800';
    if (actionType.includes('CART')) return 'bg-blue-100 text-blue-800';
    if (actionType.includes('PAYMENT')) return 'bg-purple-100 text-purple-800';
    if (actionType.includes('ORDER')) return 'bg-orange-100 text-orange-800';
    if (actionType.includes('VIEW')) return 'bg-cyan-100 text-cyan-800';
    if (actionType.includes('FAILED')) return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
  };

  const exportLogs = () => {
    const csvContent = [
      ['Date', 'Utilisateur', 'Action', 'Description', 'IP', 'Pays', 'Ville'].join(','),
      ...logs.map(log => [
        formatDate(log.created_at),
        log.user_email || 'Anonyme',
        log.action_type,
        log.action_description,
        log.ip_address || '',
        log.country || '',
        log.city || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `activity-logs-${new Date().toISOString()}.csv`;
    a.click();
  };

  const filteredLogs = logs.filter(log =>
    searchTerm === '' ||
    log.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.action_description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.ip_address?.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-2">
            <Activity className="h-8 w-8 text-gold" />
            Journal d'Activité
          </h2>
          <p className="text-gray-600 mt-1">Traçabilité complète de toutes les actions</p>
        </div>
        <Button onClick={exportLogs} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Exporter CSV
        </Button>
      </div>

      {/* Filtres */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Rechercher</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Email, IP, description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Type d'action</label>
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les actions</SelectItem>
                  <SelectItem value="LOGIN">Connexions</SelectItem>
                  <SelectItem value="ADD_TO_CART">Ajouts panier</SelectItem>
                  <SelectItem value="ORDER_PLACED">Commandes</SelectItem>
                  <SelectItem value="PAYMENT_SUCCESS">Paiements réussis</SelectItem>
                  <SelectItem value="VIEW_PRODUCT">Vues produits</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={fetchLogs} className="w-full">
                <Filter className="h-4 w-4 mr-2" />
                Filtrer
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des logs */}
      <Card>
        <CardHeader>
          <CardTitle>
            {filteredLogs.length} activité(s) trouvée(s)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto"></div>
              <p className="mt-4 text-gray-600">Chargement des logs...</p>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Aucune activité trouvée
            </div>
          ) : (
            <div className="space-y-2">
              {filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => setSelectedLog(log)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`p-2 rounded-lg ${getActionColor(log.action_type)}`}>
                        {getActionIcon(log.action_type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">
                            {log.action_description}
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            {log.action_type}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-4 text-xs text-gray-600">
                          {log.user_email && (
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {log.user_email}
                            </span>
                          )}
                          {log.ip_address && (
                            <span className="flex items-center gap-1">
                              <Globe className="h-3 w-3" />
                              {log.ip_address}
                            </span>
                          )}
                          {(log.country || log.city) && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {log.city}, {log.country}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDate(log.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Précédent
              </Button>
              <span className="flex items-center px-4 text-sm text-gray-600">
                Page {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Suivant
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal détails (optionnel) */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Détails de l'activité</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-4 right-4"
                onClick={() => setSelectedLog(null)}
              >
                ✕
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Action</label>
                  <p className="text-sm">{selectedLog.action_type}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Date/Heure</label>
                  <p className="text-sm">{formatDate(selectedLog.created_at)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Utilisateur</label>
                  <p className="text-sm">{selectedLog.user_email || 'Anonyme'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Adresse IP</label>
                  <p className="text-sm">{selectedLog.ip_address || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Localisation</label>
                  <p className="text-sm">{selectedLog.city}, {selectedLog.country}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Navigateur</label>
                  <p className="text-sm text-xs truncate" title={selectedLog.user_agent}>
                    {selectedLog.user_agent || 'N/A'}
                  </p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Description</label>
                <p className="text-sm">{selectedLog.action_description}</p>
              </div>
              {selectedLog.metadata && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Données supplémentaires</label>
                  <pre className="text-xs bg-gray-50 p-3 rounded mt-2 overflow-x-auto">
                    {JSON.stringify(selectedLog.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
