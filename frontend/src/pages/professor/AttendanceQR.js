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
import { useAuth } from '../../context/AuthContext';

const LS_KEYS = {
  courses: 'pfe_courses',
  qrHistory: 'pfe_qr_history',
};

const loadLS = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const saveLS = (key, value) => localStorage.setItem(key, JSON.stringify(value));

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
  const navigate = useNavigate();
  const location = useLocation();

  const [courses, setCourses] = useState([]);
  const [courseId, setCourseId] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [dureeValidite, setDureeValidite] = useState(10);

  const [loading, setLoading] = useState(false);
  const [qr, setQr] = useState(null);
  const [error, setError] = useState('');
  const [remainingSec, setRemainingSec] = useState(null);

  const professorId = user?.id || '1';

  // Load local courses
  useEffect(() => {
    const c = loadLS(LS_KEYS.courses, []);
    setCourses(Array.isArray(c) ? c : []);
  }, []);

  const myCourses = useMemo(
    () => (courses || []).filter((c) => c.professeurId === professorId),
    [courses, professorId]
  );

  const sessionsForSelectedCourse = useMemo(() => {
    const course = myCourses.find((c) => c.id === courseId);
    return course?.sessions || [];
  }, [myCourses, courseId]);

  // Prefill from query param ?sessionId=
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const sid = params.get('sessionId');
    if (!sid) return;

    setSessionId(sid);

    // Try to find matching course
    const foundCourse = myCourses.find((c) => (c.sessions || []).some((s) => s.id === sid));
    if (foundCourse) setCourseId(foundCourse.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search, myCourses.length]);

  const isExpired = (expirationIso) => new Date(expirationIso).getTime() <= Date.now();

  // Countdown
  useEffect(() => {
    if (!qr?.expiration) return;

    const tick = () => {
      const diff = Math.floor((new Date(qr.expiration).getTime() - Date.now()) / 1000);
      setRemainingSec(diff);
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [qr]);

  const pushHistory = (qrData) => {
    const hist = loadLS(LS_KEYS.qrHistory, []);
    const next = [
      {
        id: qrData.id || `${Date.now()}`,
        professeurId,
        sessionCoursId: sessionId,
        courseId,
        code: qrData.code,
        expiration: qrData.expiration,
        dureeValidite: qrData.dureeValidite,
        createdAt: new Date().toISOString(),
      },
      ...(Array.isArray(hist) ? hist : []),
    ].slice(0, 50);

    saveLS(LS_KEYS.qrHistory, next);
  };

  const historyForSession = useMemo(() => {
    const hist = loadLS(LS_KEYS.qrHistory, []);
    return (Array.isArray(hist) ? hist : []).filter((h) => h.sessionCoursId === sessionId);
  }, [sessionId]);

  const handleGenerate = async () => {
    setError('');
    setQr(null);
    setRemainingSec(null);

    if (!sessionId.trim()) {
      setError('Veuillez sélectionner (ou saisir) une séance.');
      return;
    }

    setLoading(true);
    try {
      const data = await qrService.generateQRCode(sessionId.trim(), Number(dureeValidite) || 10);
      // backend -> { success:true, qrCode:{...} }
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
      // fallback
      window.prompt('Copiez le code QR :', qr?.code || '');
    }
  };

  const selectedCourse = myCourses.find((c) => c.id === courseId);

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 3, mb: 2 }}>
        <Typography variant="h4" gutterBottom>
          QR Code de Présence
        </Typography>

        <Alert severity="info" sx={{ mb: 2 }}>
          Sélectionne une séance, puis génère un QR Code valide pendant une durée limitée.
          Les étudiants pourront le scanner sur <b>Scanner QR</b>.
        </Alert>

        {myCourses.length === 0 && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Aucun cours trouvé en localStorage. Va d’abord dans <b>Gestion des cours</b> pour créer
            des séances, ou saisis une séance manuellement.
            <Box sx={{ mt: 1 }}>
              <Button variant="outlined" onClick={() => navigate('/professor/courses')}>
                Aller à Gestion des cours
              </Button>
            </Box>
          </Alert>
        )}

        <Paper sx={{ p: 2 }}>
          <Grid container spacing={2} alignItems="center">
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
                disabled={myCourses.length === 0}
              >
                {myCourses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.intitule} ({c.code})
                  </option>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                select={sessionsForSelectedCourse.length > 0}
                fullWidth
                label="Séance"
                value={sessionId}
                onChange={(e) => setSessionId(e.target.value)}
                placeholder="Saisir un ID séance (ex: session_123)"
                helperText={
                  sessionsForSelectedCourse.length === 0
                    ? 'Aucune séance : tu peux saisir un ID manuel.'
                    : 'Choisir une séance créée.'
                }
              >
                {sessionsForSelectedCourse.map((s) => (
                  <option key={s.id} value={s.id}>
                    {formatDateTime(s.dateDebut)} • Salle {s.salle}
                  </option>
                ))}
              </TextField>
            </Grid>

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

            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<QrCodeIcon />}
                onClick={handleGenerate}
                disabled={loading}
              >
                Générer
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

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

                    <Chip icon={<EventIcon />} label={`Expire : ${formatDateTime(qr.expiration)}`} />
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
                    <Button variant="outlined" startIcon={<CopyIcon />} onClick={handleCopy}>
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
                      Cours : <b>{selectedCourse.intitule}</b> • Séance : <b>{sessionId}</b>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Historique (séance)
                  </Typography>

                  {(historyForSession || []).length === 0 ? (
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
                            Créé : {formatDateTime(h.createdAt)} • Expire : {formatDateTime(h.expiration)}
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