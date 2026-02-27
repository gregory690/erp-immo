import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, XCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { proVerify, saveProSession } from '../services/pro.service';

export default function ProAuth() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (!token) {
      setErrorMessage('Lien de connexion invalide. Aucun token trouvé.');
      setStatus('error');
      return;
    }

    proVerify(token)
      .then(({ email, sessionToken }) => {
        saveProSession(email, sessionToken);
        navigate('/pro/dashboard', { replace: true });
      })
      .catch(err => {
        setErrorMessage(err.message || 'Lien expiré ou déjà utilisé.');
        setStatus('error');
      });
  }, [navigate]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-navy-900 mx-auto" />
          <p className="text-sm text-gray-500">Connexion en cours…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="bg-white border border-border rounded-xl p-8 w-full max-w-sm text-center space-y-5">
        <div className="bg-red-50 rounded-full w-14 h-14 flex items-center justify-center mx-auto">
          <XCircle className="h-7 w-7 text-red-500" />
        </div>
        <div className="space-y-2">
          <h1 className="font-bold text-gray-900">Lien invalide</h1>
          <p className="text-sm text-gray-500">{errorMessage}</p>
        </div>
        <Button
          onClick={() => navigate('/pro/login')}
          className="w-full bg-navy-900 hover:bg-navy-800"
        >
          Demander un nouveau lien
        </Button>
      </div>
    </div>
  );
}
