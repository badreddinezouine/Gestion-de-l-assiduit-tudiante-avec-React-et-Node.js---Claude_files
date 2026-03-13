import React, { useEffect, useMemo, useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  TextField,
  Alert,
  Card,
  CardContent,
  Grid,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { QrCodeScanner as QrCodeIcon, CheckCircle, Cancel } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { qrService } from '../../services/qrService';

const LS_KEY = 'pfe_attendance_records';

const loadLS = (fallback = []) => {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const saveLS = (value) => localStorage.setItem(LS_KEY, JSON.stringify(value));

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getStatusColor = (status) => {
  switch (status) {
    case 'PRESENT':
      return 'success';
    case 'RETARD':
      return 'warning';
    case 'ABSENT':
      return 'error';
    default:
      return 'info';
  }
};

export default function ScanQR() {
  const { user } = useAuth();

  const [qrCode, setQrCode] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');
  const [successDialog, setSuccessDialog] = useState(false);
  const [errorDialog, setErrorDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  const studentId = user?.id || '2';

  const [scanHistory, setScanHistory] = useState([]);

  useEffect(() => {
    const all = loadLS([]);
    const mine = (Array.isArray(all) ? all : []).filter((r) => r.studentId === studentId);
    setScanHistory(mine.slice(0, 20));
  }, [studentId]);

  const persistAndRefresh = (newRecord) => {
    const all = loadLS([]);
    const next = [newRecord, ...(Array.isArray(all) ? all : [])].slice(0, 200);
    saveLS(next);

    const mine = next.filter((r) => r.studentId === studentId);
    setScanHistory(mine.slice(0, 20));
  };

  const handleScan = async () => {
    if (!qrCode.trim()) {
      setMessage('Veuillez entrer un code QR');
      setStatus('error');
      setErrorDialog(true);
      return;
    }

    setLoading(true);
    try {
      const data = await qrService.scanQRCode(qrCode.trim());
      // Attendu (backend): { success:true, message, statut, session:{ id, cours, date } }
      if (data?.success === false) {
        throw new Error(data?.error || 'Scan refusé');
      }

      const statut = data?.statut || 'PRESENT';
      const session = data?.session || {};
      const record = {
        id: `${Date.now()}`,
        studentId,
        code: qrCode.trim(),
        statut,
        cours: session.cours || 'Cours',
        sessionId: session.id || null,
        date: session.date || new Date().toISOString(),
      };

      persistAndRefresh(record);

      setMessage(data?.message || 'Présence enregistrée avec succès !');
      setStatus('success');
      setSuccessDialog(true);
      setQrCode('');
    } catch (e) {
      setMessage(e?.message || 'Erreur lors du scan');
      setStatus('error');
      setErrorDialog(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 3, mb: 2 }}>
        <Typography variant="h4" gutterBottom>
          Scanner QR Code
        </Typography>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <QrCodeIcon sx={{ fontSize: 60, mb: 1 }} />
            <Typography variant="h6">Scanner un QR Code de présence</Typography>
            <Typography variant="body2" color="text.secondary">
              Collez ici le code fourni par votre professeur (mode démo).
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <TextField
              fullWidth
              value={qrCode}
              onChange={(e) => setQrCode(e.target.value)}
              margin="normal"
              placeholder="Collez le code QR ici"
              sx={{ maxWidth: 520 }}
            />

            <Button
              variant="contained"
              onClick={handleScan}
              disabled={loading}
              startIcon={<QrCodeIcon />}
              sx={{ mt: 2 }}
            >
              {loading ? 'Scan…' : 'Scanner'}
            </Button>
          </Box>

          {message && (
            <Alert severity={status} sx={{ mt: 2 }}>
              {message}
            </Alert>
          )}
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Derniers scans
          </Typography>

          {scanHistory.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              Aucun scan récent
            </Typography>
          ) : (
            <Grid container spacing={2}>
              {scanHistory.map((scan) => (
                <Grid item xs={12} key={scan.id}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                          <Typography variant="subtitle1">{scan.cours}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {formatDate(scan.date)}
                          </Typography>
                        </Box>
                        <Chip label={scan.statut} color={getStatusColor(scan.statut)} />
                      </Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, wordBreak: 'break-all' }}>
                        code: {scan.code}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}

          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2">Instructions :</Typography>
            <Typography variant="body2" color="text.secondary">
              1) Le professeur génère un QR sur “QR Code de Présence” • 2) L’étudiant copie/colle le code • 3) La présence est enregistrée.
            </Typography>
          </Box>
        </Paper>

        {/* Success dialog */}
        <Dialog open={successDialog} onClose={() => setSuccessDialog(false)}>
          <DialogTitle>
            <CheckCircle sx={{ color: 'green', mr: 1 }} />
            Scan réussi !
          </DialogTitle>
          <DialogContent>
            <Typography>Présence enregistrée.</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSuccessDialog(false)}>Fermer</Button>
          </DialogActions>
        </Dialog>

        {/* Error dialog */}
        <Dialog open={errorDialog} onClose={() => setErrorDialog(false)}>
          <DialogTitle>
            <Cancel sx={{ color: 'red', mr: 1 }} />
            Erreur
          </DialogTitle>
          <DialogContent>
            <Typography>{message}</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setErrorDialog(false)}>Fermer</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
}