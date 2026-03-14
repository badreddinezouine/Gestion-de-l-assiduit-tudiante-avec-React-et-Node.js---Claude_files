import React, { useEffect, useState, useMemo } from 'react';
import {
  Container, Typography, Box, Grid, Card, CardContent, CardActions,
  Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, IconButton, Chip, Stack, Divider,
  Alert, CircularProgress, FormControl, InputLabel, Select, MenuItem,
} from '@mui/material';
import {
  Add as AddIcon, Delete as DeleteIcon,
  Event as EventIcon, QrCode as QrCodeIcon, Group as GroupIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { courseService } from '../../services/courseService';

const fmt = (iso) =>
  new Date(iso).toLocaleString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

// ✅ Helper pour extraire le nom d'un étudiant inscrit
// etudiantsInscrits contient des Student docs avec utilisateurId peuplé
const getStudentName = (s) => {
  if (!s) return '—';
  // Cas 1 : utilisateurId est peuplé (objet avec nom/prenom)
  if (s.utilisateurId?.nom) {
    return `${s.utilisateurId.prenom} ${s.utilisateurId.nom}`;
  }
  // Cas 2 : objet Student sans populate
  if (s.nom) return `${s.prenom || ''} ${s.nom}`;
  // Fallback
  return String(s._id || s);
};

export default function CourseManagement() {
  const navigate = useNavigate();

  const [courses,  setCourses]  = useState([]);
  const [students, setStudents] = useState([]);
  const [filieres, setFilieres] = useState([]);
  const [niveaux,  setNiveaux]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');

  const [openCourseDlg,  setOpenCourseDlg]  = useState(false);
  const [openSessionDlg, setOpenSessionDlg] = useState(false);
  const [openEnrollDlg,  setOpenEnrollDlg]  = useState(false);
  const [activeCourseId, setActiveCourseId] = useState(null);

  const [courseForm, setCourseForm] = useState({
    code: '', intitule: '', filiere: '', niveau: '', description: '', credits: 3,
  });
  const [sessionForm, setSessionForm] = useState({
    date: '', time: '', duree: 120, salle: '',
  });

  const [selectedFiliere,  setSelectedFiliere]  = useState('');
  const [selectedNiveau,   setSelectedNiveau]   = useState('Tous');
  const [enrollMsg,        setEnrollMsg]        = useState('');
  const [saving,           setSaving]           = useState(false);

  // Prévisualisation locale des étudiants de la filière
  const previewStudents = useMemo(() => {
    if (!selectedFiliere) return [];
    return students.filter((s) => {
      const matchFiliere = s.filiere === selectedFiliere;
      const matchNiveau  = selectedNiveau === 'Tous' || s.niveau === selectedNiveau;
      return matchFiliere && matchNiveau;
    });
  }, [selectedFiliere, selectedNiveau, students]);

  // ── Chargement initial ────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const [c, s, f] = await Promise.all([
          courseService.getMyCourses(),
          courseService.getAllStudents(),
          courseService.getFilieres(),
        ]);
        setCourses(c);
        setStudents(s);
        setFilieres(f.filieres || []);
        setNiveaux(f.niveaux   || []);
      } catch (e) {
        setError(e.response?.data?.error || 'Erreur de chargement');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // ── Cours ─────────────────────────────────────────────────
  const handleCreateCourse = async () => {
    if (!courseForm.code || !courseForm.intitule) return;
    setSaving(true);
    try {
      const created = await courseService.createCourse(courseForm);
      setCourses((p) => [{ ...created, sessions: [], etudiantsInscrits: [] }, ...p]);
      setOpenCourseDlg(false);
      setCourseForm({ code: '', intitule: '', filiere: '', niveau: '', description: '', credits: 3 });
    } catch (e) {
      setError(e.response?.data?.error || 'Erreur création cours');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    try {
      await courseService.deleteCourse(courseId);
      setCourses((p) => p.filter((c) => c._id !== courseId));
    } catch (e) {
      setError('Erreur suppression cours');
    }
  };

  // ── Séances ───────────────────────────────────────────────
  const handleAddSession = async () => {
    if (!sessionForm.date || !sessionForm.time) return;
    setSaving(true);
    try {
      const dateDebut = new Date(
        `${sessionForm.date}T${sessionForm.time}:00`
      ).toISOString();

      const session = await courseService.addSession(activeCourseId, {
        dateDebut,
        duree: Number(sessionForm.duree) || 120,
        salle: sessionForm.salle || '—',
      });

      setCourses((prev) =>
        prev.map((c) =>
          c._id === activeCourseId
            ? { ...c, sessions: [session, ...(c.sessions || [])] }
            : c
        )
      );
      setOpenSessionDlg(false);
      setSessionForm({ date: '', time: '', duree: 120, salle: '' });
    } catch (e) {
      setError('Erreur ajout séance');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSession = async (courseId, sessionId) => {
    try {
      await courseService.deleteSession(courseId, sessionId);
      setCourses((prev) =>
        prev.map((c) =>
          c._id === courseId
            ? { ...c, sessions: c.sessions.filter((s) => s._id !== sessionId) }
            : c
        )
      );
    } catch (e) {
      setError('Erreur suppression séance');
    }
  };

  // ── Inscription par filière ───────────────────────────────
  const openEnroll = (courseId) => {
    setActiveCourseId(courseId);
    setSelectedFiliere('');
    setSelectedNiveau('Tous');
    setEnrollMsg('');
    setOpenEnrollDlg(true);
  };

  const handleSaveEnroll = async () => {
    if (!selectedFiliere) {
      setError('Veuillez sélectionner une filière');
      return;
    }
    setSaving(true);
    try {
      const result = await courseService.enrollByFiliere(
        activeCourseId,
        selectedFiliere,
        selectedNiveau
      );
      setEnrollMsg(result.message);

      // ✅ Rafraîchir les cours depuis l'API pour avoir les données à jour
      const updated = await courseService.getMyCourses();
      setCourses(updated);

      setTimeout(() => setOpenEnrollDlg(false), 2000);
    } catch (e) {
      setError(e.response?.data?.error || 'Erreur inscription');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 3, mb: 2 }}>
        <Typography variant="h4" gutterBottom>Gestion des Cours</Typography>

        <Alert severity="success" sx={{ mb: 2 }}>
          Les cours, séances et inscriptions sont sauvegardés dans <b>MongoDB Atlas</b>.
        </Alert>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <Button variant="contained" startIcon={<AddIcon />}
          onClick={() => setOpenCourseDlg(true)}>
          Ajouter un cours
        </Button>
      </Box>

      {/* ── Liste des cours ── */}
      <Grid container spacing={2}>
        {courses.length === 0 ? (
          <Grid item xs={12}>
            <Alert severity="info">
              Aucun cours. Cliquez sur "Ajouter un cours" pour commencer.
            </Alert>
          </Grid>
        ) : courses.map((course) => (
          <Grid item xs={12} md={6} key={course._id}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6">
                  {course.intitule}
                  <Chip size="small" label={course.code} sx={{ ml: 1 }} />
                  {course.filiere && (
                    <Chip size="small" label={course.filiere}
                      color="primary" variant="outlined" sx={{ ml: 1 }} />
                  )}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                  {course.description || '—'}
                </Typography>

                <Divider sx={{ my: 2 }} />

                {/* Séances */}
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  Séances ({course.sessions?.length || 0})
                </Typography>
                <Stack spacing={1}>
                  {(course.sessions || []).length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      Aucune séance pour le moment.
                    </Typography>
                  ) : course.sessions.slice(0, 5).map((s) => (
                    <Box key={s._id} sx={{
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'space-between',
                      p: 1, borderRadius: 1, bgcolor: 'action.hover',
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <EventIcon fontSize="small" />
                        <Typography variant="body2">
                          {fmt(s.dateDebut)} • {s.duree} min • Salle {s.salle}
                        </Typography>
                      </Box>
                      <Box>
                        <IconButton size="small" title="Générer QR"
                          onClick={() =>
                            navigate(`/professor/attendance-qr?sessionId=${s._id}`)
                          }>
                          <QrCodeIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" color="error"
                          onClick={() => handleDeleteSession(course._id, s._id)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                  ))}
                </Stack>

                <Divider sx={{ my: 2 }} />

                {/* ✅ Étudiants inscrits — affichage corrigé */}
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  Étudiants inscrits ({course.etudiantsInscrits?.length || 0})
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {(course.etudiantsInscrits || []).length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      Aucun étudiant inscrit.
                    </Typography>
                  ) : (course.etudiantsInscrits || []).slice(0, 6).map((s) => (
                    <Chip
                      key={String(s._id || s)}
                      size="small"
                      label={getStudentName(s)}   // ✅ helper corrigé
                      icon={<GroupIcon />}
                      sx={{ mb: 0.5 }}
                    />
                  ))}
                  {(course.etudiantsInscrits || []).length > 6 && (
                    <Chip size="small"
                      label={`+${course.etudiantsInscrits.length - 6} autres`} />
                  )}
                </Stack>
              </CardContent>

              <CardActions sx={{ justifyContent: 'space-between' }}>
                <Box>
                  <Button size="small" onClick={() => {
                    setActiveCourseId(course._id);
                    setSessionForm({ date: '', time: '', duree: 120, salle: '' });
                    setOpenSessionDlg(true);
                  }}>
                    + Séance
                  </Button>
                  <Button size="small" startIcon={<GroupIcon />}
                    onClick={() => openEnroll(course._id)}>
                    Inscrire étudiants
                  </Button>
                </Box>
                <IconButton color="error" size="small"
                  onClick={() => handleDeleteCourse(course._id)}>
                  <DeleteIcon />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* ── Dialog : Ajouter cours ── */}
      <Dialog open={openCourseDlg} onClose={() => setOpenCourseDlg(false)}
        fullWidth maxWidth="sm">
        <DialogTitle>Ajouter un cours</DialogTitle>
        <DialogContent>
          <TextField label="Code (ex: INFO201)" fullWidth margin="normal" required
            value={courseForm.code}
            onChange={(e) => setCourseForm((p) => ({ ...p, code: e.target.value }))} />
          <TextField label="Intitulé" fullWidth margin="normal" required
            value={courseForm.intitule}
            onChange={(e) => setCourseForm((p) => ({ ...p, intitule: e.target.value }))} />
          <TextField label="Filière" fullWidth margin="normal"
            value={courseForm.filiere}
            onChange={(e) => setCourseForm((p) => ({ ...p, filiere: e.target.value }))} />
          <TextField label="Niveau" fullWidth margin="normal"
            value={courseForm.niveau}
            onChange={(e) => setCourseForm((p) => ({ ...p, niveau: e.target.value }))} />
          <TextField label="Crédits" type="number" fullWidth margin="normal"
            value={courseForm.credits}
            onChange={(e) => setCourseForm((p) => ({ ...p, credits: e.target.value }))} />
          <TextField label="Description" fullWidth margin="normal"
            multiline minRows={2}
            value={courseForm.description}
            onChange={(e) => setCourseForm((p) => ({ ...p, description: e.target.value }))} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCourseDlg(false)}>Annuler</Button>
          <Button variant="contained" onClick={handleCreateCourse}
            disabled={saving || !courseForm.code || !courseForm.intitule}>
            {saving ? 'Création...' : 'Ajouter'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Dialog : Ajouter séance ── */}
      <Dialog open={openSessionDlg} onClose={() => setOpenSessionDlg(false)}
        fullWidth maxWidth="sm">
        <DialogTitle>Ajouter une séance</DialogTitle>
        <DialogContent>
          <TextField type="date" label="Date" fullWidth margin="normal"
            InputLabelProps={{ shrink: true }} value={sessionForm.date}
            onChange={(e) => setSessionForm((p) => ({ ...p, date: e.target.value }))} />
          <TextField type="time" label="Heure" fullWidth margin="normal"
            InputLabelProps={{ shrink: true }} value={sessionForm.time}
            onChange={(e) => setSessionForm((p) => ({ ...p, time: e.target.value }))} />
          <TextField type="number" label="Durée (minutes)" fullWidth margin="normal"
            value={sessionForm.duree}
            onChange={(e) => setSessionForm((p) => ({ ...p, duree: e.target.value }))} />
          <TextField label="Salle" fullWidth margin="normal"
            value={sessionForm.salle}
            onChange={(e) => setSessionForm((p) => ({ ...p, salle: e.target.value }))} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSessionDlg(false)}>Annuler</Button>
          <Button variant="contained" onClick={handleAddSession}
            disabled={saving || !sessionForm.date || !sessionForm.time}>
            {saving ? 'Ajout...' : 'Ajouter'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Dialog : Inscrire par filière ── */}
      <Dialog open={openEnrollDlg} onClose={() => setOpenEnrollDlg(false)}
        fullWidth maxWidth="sm">
        <DialogTitle>Inscrire des étudiants par filière</DialogTitle>
        <DialogContent>

          {enrollMsg && (
            <Alert severity="success" sx={{ mb: 2 }}>{enrollMsg}</Alert>
          )}

          {filieres.length === 0 ? (
            <Alert severity="warning" sx={{ mt: 1 }}>
              Aucune filière trouvée. Les étudiants doivent renseigner
              leur filière lors de l'inscription.
            </Alert>
          ) : (
            <>
              <FormControl fullWidth margin="normal" required>
                <InputLabel>Filière</InputLabel>
                <Select
                  value={selectedFiliere}
                  label="Filière"
                  onChange={(e) => setSelectedFiliere(e.target.value)}
                >
                  <MenuItem value=""><em>-- Choisir une filière --</em></MenuItem>
                  {filieres.map((f) => (
                    <MenuItem key={f.filiere} value={f.filiere}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {f.filiere}
                        <Chip size="small" label={`${f.count} étudiant(s)`}
                          color="primary" variant="outlined" />
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth margin="normal">
                <InputLabel>Niveau (optionnel)</InputLabel>
                <Select
                  value={selectedNiveau}
                  label="Niveau (optionnel)"
                  onChange={(e) => setSelectedNiveau(e.target.value)}
                >
                  <MenuItem value="Tous">Tous les niveaux</MenuItem>
                  {niveaux.map((n) => (
                    <MenuItem key={n} value={n}>{n}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              {previewStudents.length > 0 && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  <b>{previewStudents.length} étudiant(s)</b> seront inscrits :
                  <Box sx={{ mt: 1 }}>
                    {previewStudents.slice(0, 6).map((s) => (
                      <Chip key={s.id} size="small" icon={<GroupIcon />}
                        label={`${s.prenom} ${s.nom}`}
                        sx={{ mr: 0.5, mb: 0.5 }} />
                    ))}
                    {previewStudents.length > 6 && (
                      <Chip size="small"
                        label={`+${previewStudents.length - 6} autres`} />
                    )}
                  </Box>
                </Alert>
              )}

              {selectedFiliere && previewStudents.length === 0 && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  Aucun étudiant local trouvé. L'inscription sera tentée en base.
                </Alert>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEnrollDlg(false)}>Annuler</Button>
          <Button variant="contained" onClick={handleSaveEnroll}
            disabled={saving || !selectedFiliere}>
            {saving
              ? 'Inscription...'
              : previewStudents.length > 0
                ? `Inscrire ${previewStudents.length} étudiant(s)`
                : 'Inscrire'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
