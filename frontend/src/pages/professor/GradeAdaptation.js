import React, { useEffect, useState, useMemo } from 'react';
import {
  Container, Typography, Box, Grid, Paper,
  TextField, Button, Alert, CircularProgress,
  Table, TableHead, TableRow, TableCell, TableBody,
  IconButton, Chip, MenuItem, Select, InputLabel, FormControl,
} from '@mui/material';
import { Delete as DeleteIcon, Save as SaveIcon } from '@mui/icons-material';
import { useLocation } from 'react-router-dom';
import { gradeService }  from '../../services/gradeService';
import { courseService } from '../../services/courseService';

const formatDate = (iso) =>
  new Date(iso).toLocaleString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

const TYPES_EVAL   = ['EXAMEN', 'TP', 'PARTICIPATION'];
const TYPES_PARTIC = ['ACTIVE', 'MOYENNE', 'FAIBLE'];

const participationColor = (t) => {
  if (t === 'ACTIVE')  return 'success';
  if (t === 'MOYENNE') return 'warning';
  return 'default';
};

export default function GradeAdaptation() {
  const location = useLocation();

  // ── Data ──────────────────────────────────────────────────
  const [courses,  setCourses]  = useState([]);
  const [students, setStudents] = useState([]);
  const [grades,   setGrades]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState('');
  const [success,  setSuccess]  = useState('');

  // ── Formulaire ────────────────────────────────────────────
  const [courseId,          setCourseId]          = useState('');
  const [studentId,         setStudentId]         = useState('');
  const [typeEvaluation,    setTypeEvaluation]    = useState('EXAMEN');
  const [note,              setNote]              = useState('');
  const [typeParticipation, setTypeParticipation] = useState('ACTIVE');
  const [commentaire,       setCommentaire]       = useState('');

  // ── Chargement initial ────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const [c, g] = await Promise.all([
          courseService.getMyCourses(),
          gradeService.getMyGrades(),
        ]);
        setCourses(c);
        setGrades(g);
      } catch (e) {
        setError('Erreur de chargement des données');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // ── Pré-remplissage ?studentId= ──────────────────────────
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const sid = params.get('studentId');
    if (sid) setStudentId(sid);
  }, [location.search]);

  // ── Charger les étudiants quand le cours change ───────────
  useEffect(() => {
    if (!courseId) { setStudents([]); setStudentId(''); return; }

    gradeService.getStudentsForCourse(courseId)
      .then(setStudents)
      .catch(() => setStudents([]));
  }, [courseId]);

  // ── Enregistrer une évaluation ────────────────────────────
  const handleAdd = async () => {
    setError('');
    setSuccess('');

    if (!courseId || !studentId) {
      setError('Veuillez sélectionner un cours et un étudiant');
      return;
    }
    if (typeEvaluation !== 'PARTICIPATION' && (note === '' || isNaN(Number(note)))) {
      setError('Veuillez saisir une note valide');
      return;
    }

    setSaving(true);
    try {
      const created = await gradeService.createGrade({
        coursId:          courseId,
        etudiantId:       studentId,
        typeEvaluation,
        note:             typeEvaluation === 'PARTICIPATION' ? null : Number(note),
        typeParticipation,
        commentaire:      commentaire.trim(),
      });

      // Ajouter en tête de liste
      setGrades((prev) => [created, ...prev]);
      setSuccess('Évaluation enregistrée dans MongoDB Atlas ✅');
      setNote('');
      setCommentaire('');
      setTimeout(() => setSuccess(''), 3000);
    } catch (e) {
      setError(e.response?.data?.error || 'Erreur lors de l\'enregistrement');
    } finally {
      setSaving(false);
    }
  };

  // ── Supprimer une évaluation ──────────────────────────────
  const handleDelete = async (gradeId) => {
    try {
      await gradeService.deleteGrade(gradeId);
      setGrades((prev) => prev.filter((g) => g._id !== gradeId));
    } catch (e) {
      setError('Erreur lors de la suppression');
    }
  };

  // ── Helpers affichage ─────────────────────────────────────
  const studentName = (g) => {
    if (g.etudiantId?.nom) return `${g.etudiantId.prenom} ${g.etudiantId.nom}`;
    return '—';
  };

  const courseName = (g) => {
    if (g.coursId?.intitule) return `${g.coursId.intitule} (${g.coursId.code})`;
    return '—';
  };

  // ── Rendu chargement ──────────────────────────────────────
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
        <Typography variant="h4" gutterBottom>Notes et Adaptation</Typography>

        {/* ✅ Plus de localStorage */}
        <Alert severity="success" sx={{ mb: 2 }}>
          Les notes et évaluations sont enregistrées dans <b>MongoDB Atlas</b>.
        </Alert>

        {error   && <Alert severity="error"   sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        {/* ── Formulaire ── */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2}>

            {/* Cours */}
            <Grid item xs={12} md={4}>
              <FormControl fullWidth required>
                <InputLabel>Cours</InputLabel>
                <Select
                  value={courseId}
                  label="Cours"
                  onChange={(e) => setCourseId(e.target.value)}
                >
                  <MenuItem value=""><em>-- Choisir un cours --</em></MenuItem>
                  {courses.map((c) => (
                    <MenuItem key={c._id} value={c._id}>
                      {c.intitule} ({c.code})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Étudiant — chargé depuis le cours sélectionné */}
            <Grid item xs={12} md={4}>
              <FormControl fullWidth required disabled={!courseId}>
                <InputLabel>Étudiant</InputLabel>
                <Select
                  value={studentId}
                  label="Étudiant"
                  onChange={(e) => setStudentId(e.target.value)}
                >
                  <MenuItem value=""><em>-- Choisir un étudiant --</em></MenuItem>
                  {students.length === 0 && courseId && (
                    <MenuItem disabled>Aucun étudiant inscrit à ce cours</MenuItem>
                  )}
                  {students.map((s) => (
                    <MenuItem key={s.id} value={s.id}>
                      {s.prenom} {s.nom}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Type évaluation */}
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={typeEvaluation}
                  label="Type"
                  onChange={(e) => setTypeEvaluation(e.target.value)}
                >
                  {TYPES_EVAL.map((t) => (
                    <MenuItem key={t} value={t}>{t}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Note /20 — masquée si PARTICIPATION */}
            {typeEvaluation !== 'PARTICIPATION' && (
              <Grid item xs={12} md={3}>
                <TextField
                  type="number"
                  fullWidth
                  label="Note /20"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  inputProps={{ min: 0, max: 20, step: 0.25 }}
                />
              </Grid>
            )}

            {/* Type participation */}
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Participation</InputLabel>
                <Select
                  value={typeParticipation}
                  label="Participation"
                  onChange={(e) => setTypeParticipation(e.target.value)}
                >
                  {TYPES_PARTIC.map((t) => (
                    <MenuItem key={t} value={t}>{t}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Commentaire */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Commentaire (optionnel)"
                value={commentaire}
                onChange={(e) => setCommentaire(e.target.value)}
              />
            </Grid>

            {/* Bouton */}
            <Grid item xs={12}>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleAdd}
                disabled={saving || !courseId || !studentId}
              >
                {saving ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* ── Historique ── */}
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Historique ({grades.length} évaluation{grades.length > 1 ? 's' : ''})
          </Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Étudiant</TableCell>
                <TableCell>Cours</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Note</TableCell>
                <TableCell>Participation</TableCell>
                <TableCell>Commentaire</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {grades.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} sx={{ color: 'text.secondary' }}>
                    Aucune évaluation enregistrée.
                  </TableCell>
                </TableRow>
              ) : grades.map((g) => (
                <TableRow key={g._id}>
                  <TableCell>{formatDate(g.createdAt)}</TableCell>
                  <TableCell>{studentName(g)}</TableCell>
                  <TableCell>{courseName(g)}</TableCell>
                  <TableCell>
                    <Chip size="small" label={g.typeEvaluation} />
                  </TableCell>
                  <TableCell>
                    {g.note == null ? '—' : `${g.note}/20`}
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={g.typeParticipation}
                      color={participationColor(g.typeParticipation)}
                    />
                  </TableCell>
                  <TableCell>{g.commentaire || '—'}</TableCell>
                  <TableCell align="right">
                    <IconButton size="small" color="error"
                      onClick={() => handleDelete(g._id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      </Box>
    </Container>
  );
}