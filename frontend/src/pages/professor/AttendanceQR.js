import React, { useEffect, useMemo, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  TextField,
  Button,
  Alert,
  Card,
  CardContent,
  Chip,
  Stack,
  Divider,
  IconButton,
  CircularProgress,
} from '@mui/material';
import {
  QrCode as QrCodeIcon,
  ContentCopy as CopyIcon,
  Refresh as RefreshIcon,
  Event as EventIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import { qrService } from '../../services/qrService';
import { courseService } from '../../services/courseService'; // ✅ API réelle
import { useAuth } from '../../context/AuthContext';

const formatDateTime = (iso) => {
  const dt = new Date(iso);
  return dt.toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default function AttendanceQR() {
  const { user } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();

  // ✅ Données venant de l'API (MongoDB Atlas) — plus de localStorage
  const [courses,     setCourses]     = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  const [courseId,      setCourseId]      = useState('');
  const [sessionId,     setSessionId]     = useState('');
  const [dureeValidite, setDureeValidite] = useState(10);

  const [loading,      setLoading]      = useState(false);
  const [qr,           setQr]           = useState(null);
  const [error,        setError]        = useState('');
  const [remainingSec, setRemainingSec] = useState(null);

  // ── Chargement des cours depuis MongoDB Atlas ──────────────
  useEffect(() => {
    courseService.getMyCourses()
      .then((data) => setCourses(data))
      .catch(() => setError('Impossible de charger les cours'))
      .finally(() => setLoadingData(false));
  }, []);

  // ── Séances du cours sélectionné ──────────────────────────
  // ✅ Utilise _id (ObjectId MongoDB réel)
  const sessionsForSelectedCourse = useMemo(() => {
    const course = courses.find((c) => c._id === courseId);
    return course?.sessions || [];
  }, [courses, courseId]);

  // ── Pré-remplissage depuis ?sessionId= ────────────────────
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const sid = params.get('sessionId');
    if (!sid) return;

    setSessionId(sid);

    // Trouver le cours correspondant
    const foundCourse = courses.find((c) =>
      (c.sessions || []).some((s) => s._id === sid)
    );
    if (foundCourse) setCourseId(foundCourse._id);
  }, [location.search, courses]);

  // ── Countdown expiration ──────────────────────────────────
  useEffect(() => {
    if (!qr?.expiration) return;

    const tick = () => {
      const diff = Math.floor(
        (new Date(qr.expiration).getTime() - Date.now()) / 1000
      );
      setRemainingSec(diff);
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [qr]);

  const isExpired = (expirationIso) =>
    new Date(expirationIso).getTime() <= Date.now();

  // ── Historique QR (en mémoire session) ───────────────────
  const [qrHistory, setQrHistory] = useState([]);

  const pushHistory = (qrData) => {
    setQrHistory((prev) => [
      {
        id:           qrData.id || `${Date.now()}`,
        sessionCoursId: sessionId,
        courseId,
        code:         qrData.code,
        expiration:   qrData.expiration,
        createdAt:    new Date().toISOString(),
      },
      ...prev,
    ].slice(0, 50));
  };

  const historyForSession = useMemo(
    () => qrHistory.filter((h) => h.sessionCoursId === sessionId),
    [qrHistory, sessionId]
  );

  // ── Générer le QR Code ────────────────────────────────────
  const handleGenerate = async () => {
    setError('');
    setQr(null);
    setRemainingSec(null);

    if (!sessionId.trim()) {
      setError('Veuillez sélectionner une séance.');
      return;
    }

    setLoading(true);
    try {
      // ✅ sessionId est maintenant un vrai ObjectId MongoDB
      const data = await qrService.generateQRCode(
        sessionId.trim(),
        Number(dureeValidite) || 10
      );
      const qrCode = data.qrCode || data;
      setQr(qrCode);
      pushHistory(qrCode);
    } catch (e) {
      setError(e?.error || e?.message || 'Erreur lors de la génération du QR code');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(qr?.code || '');
    } catch {
      window.prompt('Copiez le code QR :', qr?.code || '');
    }
  };

  const selectedCourse = courses.find((c) => c._id === courseId);

  // ── Affichage chargement ──────────────────────────────────
  if (loadingData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 3, mb: 2 }}>
        <Typography variant="h4" gutterBottom>
          QR Code de Présence
        </Typography>

        <Alert severity="info" sx={{ mb: 2 }}>
          Sélectionne une séance, puis génère un QR Code valide pendant une
          durée limitée. Les étudiants pourront le scanner sur{' '}
          <b>Scanner QR</b>.
        </Alert>

        {courses.length === 0 && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Aucun cours trouvé. Va d'abord dans{' '}
            <b>Gestion des cours</b> pour créer des cours et des séances.
            <Box sx={{ mt: 1 }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/professor/courses')}
              >
                Aller à Gestion des cours
              </Button>
            </Box>
          </Alert>
        )}

        {/* ── Formulaire sélection ── */}
        <Paper sx={{ p: 2 }}>
          <Grid container spacing={2} alignItems="center">

            {/* Cours */}
            <Grid item xs={12} md={4}>
              <TextField
                select
                fullWidth
                label="Cours"
                value={courseId}
                onChange={(e) => {
                  setCourseId(e.target.value);
                  setSessionId('');
                }}
                disabled={courses.length === 0}
                SelectProps={{ native: true }}
              >
                <option value="">-- Choisir un cours --</option>
                {courses.map((c) => (
                  // ✅ Utilise c._id (ObjectId MongoDB)
                  <option key={c._id} value={c._id}>
                    {c.intitule} ({c.code})
                  </option>
                ))}
              </TextField>
            </Grid>

            {/* Séance */}
            <Grid item xs={12} md={4}>
              <TextField
                select
                fullWidth
                label="Séance"
                value={sessionId}
                onChange={(e) => setSessionId(e.target.value)}
                helperText={
                  sessionsForSelectedCourse.length === 0
                    ? 'Sélectionnez d\'abord un cours.'
                    : 'Choisir une séance créée.'
                }
                disabled={sessionsForSelectedCourse.length === 0}
                SelectProps={{ native: true }}
              >
                <option value="">-- Choisir une séance --</option>
                {sessionsForSelectedCourse.map((s) => (
                  // ✅ Utilise s._id (ObjectId MongoDB réel) → plus d'erreur Cast!
                  <option key={s._id} value={s._id}>
                    {formatDateTime(s.dateDebut)} • Salle {s.salle}
                  </option>
                ))}
              </TextField>
            </Grid>

            {/* Validité */}
            <Grid item xs={12} md={2}>
              <TextField
                type="number"
                fullWidth
                label="Validité (min)"
                value={dureeValidite}
                onChange={(e) => setDureeValidite(e.target.value)}
                inputProps={{ min: 1, max: 60 }}
              />
            </Grid>

            {/* Bouton */}
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<QrCodeIcon />}
                onClick={handleGenerate}
                disabled={loading || !sessionId}
              >
                {loading ? 'Génération...' : 'Générer'}
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Erreur */}
        {error && (
          <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* ── Résultat QR ── */}
        {qr && (
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    QR Code généré
                  </Typography>

                  <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                    <img
                      src={qr.image}
                      alt="QR Code"
                      style={{ maxWidth: 320, width: '100%', borderRadius: 8 }}
                    />
                  </Box>

                  <Stack direction="row" spacing={1} sx={{ mb: 1 }} flexWrap="wrap">
                    {isExpired(qr.expiration) ? (
                      <Chip icon={<ErrorIcon />} label="Expiré" color="error" />
                    ) : (
                      <Chip icon={<CheckCircleIcon />} label="Actif" color="success" />
                    )}
                    <Chip
                      icon={<EventIcon />}
                      label={`Expire : ${formatDateTime(qr.expiration)}`}
                    />
                    {typeof remainingSec === 'number' && (
                      <Chip
                        label={`Restant : ${Math.max(0, remainingSec)}s`}
                        color={remainingSec <= 30 ? 'warning' : 'default'}
                      />
                    )}
                  </Stack>

                  <Divider sx={{ my: 2 }} />

                  <Typography variant="subtitle2">Code (à scanner / copier)</Typography>
                  <Paper sx={{ p: 1, mt: 1, bgcolor: 'action.hover' }}>
                    <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                      {qr.code}
                    </Typography>
                  </Paper>

                  <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                    <Button
                      variant="outlined"
                      startIcon={<CopyIcon />}
                      onClick={handleCopy}
                    >
                      Copier le code
                    </Button>
                    <Button
                      variant="text"
                      startIcon={<RefreshIcon />}
                      onClick={handleGenerate}
                      disabled={loading}
                    >
                      Régénérer
                    </Button>
                  </Stack>

                  {selectedCourse && (
                    <Alert severity="info" sx={{ mt: 2 }}>
                      Cours : <b>{selectedCourse.intitule}</b> — Séance ID :{' '}
                      <b>{sessionId}</b>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Historique */}
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Historique (séance)
                  </Typography>

                  {historyForSession.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      Aucun QR code généré pour cette séance.
                    </Typography>
                  ) : (
                    <Stack spacing={1}>
                      {historyForSession.slice(0, 8).map((h) => (
                        <Paper key={h.id} sx={{ p: 1, bgcolor: 'action.hover' }}>
                          <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                            {h.code}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Créé : {formatDateTime(h.createdAt)} • Expire :{' '}
                            {formatDateTime(h.expiration)}
                          </Typography>
                        </Paper>
                      ))}
                    </Stack>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </Box>
    </Container>
  );
}