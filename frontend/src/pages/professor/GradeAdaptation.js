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
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Chip,
} from '@mui/material';
import { Delete as DeleteIcon, Save as SaveIcon } from '@mui/icons-material';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const loadLS = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const saveLS = (key, value) => localStorage.setItem(key, JSON.stringify(value));

const makeId = (prefix) => `${prefix}_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

const formatDate = (iso) => {
  const dt = new Date(iso);
  return dt.toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default function GradeAdaptation() {
  const { user } = useAuth();
  const location = useLocation();

  const professorId = user?.id || '1';

  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [records, setRecords] = useState([]);

  // Form
  const [courseId, setCourseId] = useState('');
  const [studentId, setStudentId] = useState('');
  const [typeEvaluation, setTypeEvaluation] = useState('EXAMEN'); // EXAMEN | TP | PARTICIPATION
  const [note, setNote] = useState('');
  const [typeParticipation, setTypeParticipation] = useState('ACTIVE'); // ACTIVE | MOYENNE | FAIBLE
  const [commentaire, setCommentaire] = useState('');

  useEffect(() => {
    setCourses(loadLS('pfe_courses', []));
    setStudents(loadLS('pfe_students', []));
    setRecords(loadLS('pfe_grades', []));
  }, []);

  // Prefill from ?studentId=
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const sid = params.get('studentId');
    if (sid) setStudentId(sid);
  }, [location.search]);

  const myCourses = useMemo(
    () => (courses || []).filter((c) => c.professeurId === professorId),
    [courses, professorId]
  );

  const studentName = (id) => {
    const s = (students || []).find((x) => x.id === id);
    return s ? `${s.prenom} ${s.nom}` : `#${id}`;
  };

  const courseName = (id) => {
    const c = (courses || []).find((x) => x.id === id);
    return c ? `${c.intitule} (${c.code})` : `#${id}`;
  };

  const persist = (next) => {
    setRecords(next);
    saveLS('pfe_grades', next);
  };

  const handleAdd = () => {
    if (!courseId || !studentId) return;

    const n = Number(note);
    const hasNote = typeEvaluation !== 'PARTICIPATION' ? !Number.isNaN(n) : true;

    if (!hasNote) return;

    const newRec = {
      id: makeId('grade'),
      professeurId,
      courseId,
      studentId,
      typeEvaluation,
      note: typeEvaluation === 'PARTICIPATION' ? null : n,
      typeParticipation,
      commentaire: commentaire.trim(),
      createdAt: new Date().toISOString(),
    };

    persist([newRec, ...(records || [])]);

    setNote('');
    setCommentaire('');
  };

  const handleDelete = (id) => {
    persist((records || []).filter((r) => r.id !== id));
  };

  const filteredRecords = useMemo(() => {
    return (records || []).filter((r) => r.professeurId === professorId);
  }, [records, professorId]);

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 3, mb: 2 }}>
        <Typography variant="h4" gutterBottom>
          Notes et Adaptation
        </Typography>

        <Alert severity="info" sx={{ mb: 2 }}>
          Mode démo : les notes/évaluations sont enregistrées dans <b>localStorage</b>.
        </Alert>

        <Paper sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField
                select
                fullWidth
                label="Cours"
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
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
                select
                fullWidth
                label="Étudiant"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
              >
                {(students || []).map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.prenom} {s.nom} ({s.numeroEtudiant})
                  </option>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                select
                fullWidth
                label="Type"
                value={typeEvaluation}
                onChange={(e) => setTypeEvaluation(e.target.value)}
              >
                <option value="EXAMEN">EXAMEN</option>
                <option value="TP">TP</option>
                <option value="PARTICIPATION">PARTICIPATION</option>
              </TextField>
            </Grid>

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

            <Grid item xs={12} md={3}>
              <TextField
                select
                fullWidth
                label="Participation"
                value={typeParticipation}
                onChange={(e) => setTypeParticipation(e.target.value)}
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="MOYENNE">MOYENNE</option>
                <option value="FAIBLE">FAIBLE</option>
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Commentaire"
                value={commentaire}
                onChange={(e) => setCommentaire(e.target.value)}
              />
            </Grid>

            <Grid item xs={12}>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleAdd}
                disabled={!courseId || !studentId}
              >
                Enregistrer
              </Button>
            </Grid>
          </Grid>
        </Paper>

        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Historique
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
              {filteredRecords.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8}>Aucune évaluation</TableCell>
                </TableRow>
              ) : (
                filteredRecords.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>{formatDate(r.createdAt)}</TableCell>
                    <TableCell>{studentName(r.studentId)}</TableCell>
                    <TableCell>{courseName(r.courseId)}</TableCell>
                    <TableCell>
                      <Chip size="small" label={r.typeEvaluation} />
                    </TableCell>
                    <TableCell>{r.note == null ? '—' : `${r.note}/20`}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={r.typeParticipation}
                        color={r.typeParticipation === 'ACTIVE' ? 'success' : r.typeParticipation === 'MOYENNE' ? 'warning' : 'default'}
                      />
                    </TableCell>
                    <TableCell>{r.commentaire || '—'}</TableCell>
                    <TableCell align="right">
                      <IconButton size="small" color="error" onClick={() => handleDelete(r.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Paper>
      </Box>
    </Container>
  );
}