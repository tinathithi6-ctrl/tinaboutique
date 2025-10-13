import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import apiFetch from '@/lib/api';
import { toast } from 'react-toastify';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

type RateRow = {
  base_currency: string;
  target_currency: string;
  rate: string | number;
  updated_at?: string;
};

const CurrencyRatesAdmin: React.FC = () => {
  const { user, token } = useAuth() as any;
  const [rates, setRates] = useState<RateRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [importing, setImporting] = useState(false);
  const [proposals, setProposals] = useState<any[]>([]);
  const [showProposals, setShowProposals] = useState(false);
  const [importPreview, setImportPreview] = useState<any[] | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);

  useEffect(() => {
    const fetchRates = async () => {
      setLoading(true);
      try {
        const data = await apiFetch('/api/admin/currency-rates', { headers: { Authorization: token ? `Bearer ${token}` : '' } });
        setRates(data.map((r: any) => ({ ...r, rate: Number(r.rate) })));
      } catch (err) {
        console.error(err);
        toast.error('Erreur récupération des taux');
      } finally {
        setLoading(false);
      }
    };

    fetchRates();
  }, [token]);

  const updateRate = (index: number, value: string) => {
    const copy = [...rates];
    copy[index].rate = value;
    setRates(copy);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = rates.map(r => ({ from: r.base_currency, to: r.target_currency, rate: Number(r.rate) }));
      await apiFetch('/api/admin/currency-rates', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' },
        body: JSON.stringify({ rates: payload })
      });
      toast.success('Taux mis à jour');
      // refresh
      const refreshed = await apiFetch('/api/admin/currency-rates', { headers: { Authorization: token ? `Bearer ${token}` : '' } });
      setRates(refreshed.map((r: any) => ({ ...r, rate: Number(r.rate) })));
    } catch (err) {
      console.error(err);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const exportCSV = () => {
    const headers = ['base_currency','target_currency','rate','updated_at'];
    const rows = rates.map(r => [r.base_currency, r.target_currency, r.rate, r.updated_at || '']);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'currency_rates.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const fetchHistory = async () => {
    try {
      setShowHistory(true);
  const data = await apiFetch('/api/admin/currency-rates/history', { headers: { Authorization: token ? `Bearer ${token}` : '' } });
  setHistory(data);
    } catch (err) {
      console.error(err);
      toast.error('Impossible de charger l\'historique');
    }
  };

  const handleImport = async (file: File | null) => {
    if (!file) return;
    setImporting(true);
    try {
      const text = await file.text();
      const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
      const rows = lines.slice(1).map(l => l.split(',').map(c => c.trim()));
      const payload = rows.map(r => ({ from: r[0], to: r[1], rate: Number(r[2]) }));
      // Preview import and ask confirmation
      setImportPreview(payload);
      setShowImportModal(true);
      setImporting(false);
      return;
    } catch (err) {
      console.error(err);
      toast.error('Erreur import CSV');
    } finally {
      setImporting(false);
    }
  };

  const fetchProposals = async () => {
    try {
  const data = await apiFetch('/api/admin/currency-rates/proposals', { headers: { Authorization: token ? `Bearer ${token}` : '' } });
  setProposals(data);
  setShowProposals(true);
    } catch (err) {
      console.error(err);
      toast.error('Impossible de récupérer les propositions');
    }
  };

  const applyProposals = async () => {
    setShowApplyModal(true);
    return;
  };

  const applyImport = async () => {
    if (!importPreview) return;
    setImporting(true);
    try {
  await apiFetch('/api/admin/currency-rates', { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' }, body: JSON.stringify({ rates: importPreview, reason: 'import_csv' }) });
  toast.success('Import terminé');
  const refreshed = await apiFetch('/api/admin/currency-rates', { headers: { Authorization: token ? `Bearer ${token}` : '' } });
  setRates(refreshed.map((r: any) => ({ ...r, rate: Number(r.rate) })));
      setImportPreview(null);
      setShowImportModal(false);
    } catch (err) {
      console.error(err);
      toast.error('Erreur import CSV');
    } finally {
      setImporting(false);
    }
  };

  const confirmApplyProposals = async () => {
    try {
  await apiFetch('/api/admin/currency-rates/apply', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' }, body: JSON.stringify({ proposals, reason: 'apply_scheduler' }) });
  toast.success('Propositions appliquées');
  const refreshed = await apiFetch('/api/admin/currency-rates', { headers: { Authorization: token ? `Bearer ${token}` : '' } });
  setRates(refreshed.map((r: any) => ({ ...r, rate: Number(r.rate) })));
      setShowProposals(false);
      setShowApplyModal(false);
    } catch (err) {
      console.error(err);
      toast.error('Erreur application propositions');
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Gestion des taux de change</h1>

        {loading ? (
          <p>Chargement...</p>
        ) : (
          <div className="bg-white rounded-lg shadow p-4">
            <table className="min-w-full table-auto">
              <thead>
                <tr className="text-left">
                  <th className="px-4 py-2">Base</th>
                  <th className="px-4 py-2">Cible</th>
                  <th className="px-4 py-2">Taux</th>
                  <th className="px-4 py-2">Mis à jour</th>
                </tr>
              </thead>
              <tbody>
                {rates.map((r, i) => (
                  <tr key={`${r.base_currency}_${r.target_currency}`} className="border-t">
                    <td className="px-4 py-2">{r.base_currency}</td>
                    <td className="px-4 py-2">{r.target_currency}</td>
                    <td className="px-4 py-2">
                      <input type="number" step="0.000001" value={String(r.rate)} onChange={(e) => updateRate(i, e.target.value)} className="border px-2 py-1 rounded w-32" />
                    </td>
                    <td className="px-4 py-2">{r.updated_at ? new Date(r.updated_at).toLocaleString() : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-4">
              <div className="flex items-center gap-3">
                <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-gold text-white rounded">
                  {saving ? 'Enregistrement...' : 'Enregistrer les taux'}
                </button>
                <button onClick={exportCSV} className="px-4 py-2 border rounded">Export CSV</button>
                <label className="px-4 py-2 border rounded cursor-pointer">
                  {importing ? 'Import...' : 'Importer CSV'}
                  <input type="file" accept="text/csv" onChange={(e) => handleImport(e.target.files ? e.target.files[0] : null)} className="hidden" />
                </label>
                <button onClick={fetchHistory} className="px-4 py-2 border rounded">Voir historique</button>
                <button onClick={fetchProposals} className="px-4 py-2 border rounded">Voir propositions</button>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
      {showHistory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded max-w-3xl w-full max-h-[80vh] overflow-auto">
            <h2 className="text-lg font-bold mb-2">Historique des modifications</h2>
            <button onClick={() => setShowHistory(false)} className="mb-2 underline">Fermer</button>
            <table className="min-w-full table-auto">
              <thead>
                <tr>
                  <th>Admin</th>
                  <th>Base</th>
                  <th>Cible</th>
                  <th>Old</th>
                  <th>New</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {history.map(h => (
                  <tr key={h.id} className="border-t">
                    <td className="px-2 py-1">{h.admin_email || h.admin_user_id}</td>
                    <td className="px-2 py-1">{h.base_currency}</td>
                    <td className="px-2 py-1">{h.target_currency}</td>
                    <td className="px-2 py-1">{h.old_rate}</td>
                    <td className="px-2 py-1">{h.new_rate}</td>
                    <td className="px-2 py-1">{new Date(h.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {showProposals && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded max-w-3xl w-full max-h-[80vh] overflow-auto">
            <h2 className="text-lg font-bold mb-2">Propositions automatiques</h2>
            <button onClick={() => setShowProposals(false)} className="mb-2 underline">Fermer</button>
            <table className="min-w-full table-auto">
              <thead>
                <tr>
                  <th>Base</th>
                  <th>Cible</th>
                  <th>Rate</th>
                  <th>When</th>
                </tr>
              </thead>
              <tbody>
                {proposals.map((p, idx) => (
                  <tr key={idx} className="border-t">
                    <td className="px-2 py-1">{p.from}</td>
                    <td className="px-2 py-1">{p.to}</td>
                    <td className="px-2 py-1">{p.rate}</td>
                    <td className="px-2 py-1">{p.timestamp ? new Date(p.timestamp).toLocaleString() : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-2">
              <button onClick={applyProposals} className="px-4 py-2 bg-gold text-white rounded">Appliquer les propositions</button>
            </div>
          </div>
        </div>
      )}
      {showApplyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded max-w-md w-full">
            <h3 className="font-bold mb-2">Confirmer l'application des propositions</h3>
            <p className="mb-4">Voulez-vous appliquer {proposals.length} propositions ?</p>
            <div className="flex gap-2">
              <button onClick={confirmApplyProposals} className="px-4 py-2 bg-gold text-white rounded">Appliquer</button>
              <button onClick={() => setShowApplyModal(false)} className="px-4 py-2 border rounded">Annuler</button>
            </div>
          </div>
        </div>
      )}
      {showImportModal && importPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded max-w-3xl w-full max-h-[80vh] overflow-auto">
            <h3 className="font-bold mb-2">Aperçu import CSV</h3>
            <p className="mb-2">Lignes prêtes à l'import: {importPreview.length}</p>
            <table className="min-w-full table-auto mb-4">
              <thead><tr><th>From</th><th>To</th><th>Rate</th></tr></thead>
              <tbody>
                {importPreview.map((p, i) => (
                  <tr key={i}><td className="px-2 py-1">{p.from}</td><td className="px-2 py-1">{p.to}</td><td className="px-2 py-1">{p.rate}</td></tr>
                ))}
              </tbody>
            </table>
            <div className="flex gap-2">
              <button onClick={applyImport} className="px-4 py-2 bg-gold text-white rounded">Importer</button>
              <button onClick={() => { setImportPreview(null); setShowImportModal(false); }} className="px-4 py-2 border rounded">Annuler</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CurrencyRatesAdmin;
