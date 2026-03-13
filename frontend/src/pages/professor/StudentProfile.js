import React, { useMemo, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  TextField,
  List,
  ListItemButton,
  ListItemText,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  Button,
  Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const loadLS = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const sumByStatus = (records) => {
  const present = records.filter((r) => r.statut === 'PRESENT').length;
  const retard = records.filter((r) => r.statut === 'RETARD').length;
  const absent = records.filter((r) => r.statut === 'ABSENT').length;
  return { present, retard, absent, total: records.length };
};

export default function StudentProfile() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const students = loadLS('pfe_students', []);
  const grades = loadLS('pfe_grades', []);
  const attendance = loadLS('pfe_attendance_records', []);
  const courses = loadLS('pfe_courses', []);

  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState(students?.[0]?.id || '');

  const selectedStudent = useMemo(
    () => (students || []).find((s) => s.id === selectedId),
    [students, selectedId]
  );

  const studentAttendance = useMemo(
    () => (attendance || []).filter((a) => a.studentId === selectedId),
    [attendance, selectedId]
  );

  const stats = useMemo(() => sumByStatus(studentAttendance), [studentAttendance]);

  const studentGrades = useMemo(
    () => (grades || []).filter((g) => g.studentId === selectedId),
    [grades, selectedId]
  );

  const avg = useMemo(() => {
    const numeric = studentGrades.filter((g) => typeof g.note === 'number' && !Number.isNaN(g.note));
    if (numeric.length === 0) return null;
    const total = numeric.reduce((s, g) => s + g.note, 0);
    return Math.round((total / numeric.length) * 100) / 100;
  }, [studentGrades]);

  const filteredStudents = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return students || [];
    return (students || []).filter((s) => {
      const full = `${s.prenom} ${s.nom}`.toLowerCase();
      return full.includes(q) || (s.email || '').toLowerCase().includes(q) || (s.numeroEtudiant || '').toLowerCase().includes(q);
    });
  }, [students, search]);

  const enrolledCourses = useMemo(() => {
    return (courses || []).filter((c) => (c.etudiants || []).includes(selectedId));
  }, [courses, selectedId]);

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 3, mb: 2 }}>
        <Typography variant="h4" gutterBottom>
          Profil Étudiant
        </Typography>

        <Alert severity="info" sx={{ mb: 2 }}>
          Données en mode démo (localStorage) : présence (scans) + notes/adaptation.
        </Alert>

        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6">Étudiants</Typography>
              <TextField
                fullWidth
                margin="normal"
                label="Recherche"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <List dense>
                {filteredStudents.map((s) => (
                  <ListItemButton
                    key={s.id}
                    selected={s.id === selectedId}
                    onClick={() => setSelectedId(s.id)}
                  >
                    <ListItemText
                      primary={`${s.prenom} ${s.nom}`}
                      secondary={`${s.numeroEtudiant || ''} • ${s.email || ''}`}
                    />
                  </ListItemButton>
                ))}
              </List>
            </Paper>
          </Grid>

          <Grid item xs={12} md={8}>
            {!selectedStudent ? (
              <Paper sx={{ p: 2 }}>
                <Typography>Aucun étudiant sélectionné.</Typography>
              </Paper>
            ) : (
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6">
                    {selectedStudent.prenom} {selectedStudent.nom}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedStudent.email} • {selectedStudent.numeroEtudiant} • {selectedStudent.niveau} • {selectedStudent.filiere}
                  </Typography>

                  <Divider sx={{ my: 2 }} />

                  <Typography variant="subtitle1" gutterBottom>
                    Assiduité (scans)
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    <Chip label={`Total: ${stats.total}`} />
                    <Chip color="success" label={`Présent: ${stats.present}`} />
                    <Chip color="warning" label={`Retard: ${stats.retard}`} />
                    <Chip color="error" label={`Absent: ${stats.absent}`} />
                  </Stack>

                  <Divider sx={{ my: 2 }} />

                  <Typography variant="subtitle1" gutterBottom>
                    Notes / évaluations
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    <Chip label={`Évals: ${studentGrades.length}`} />
                    <Chip label={`Moyenne: ${avg == null ? '—' : `${avg}/20`}`} />
                  </Stack>

                  <Box sx={{ mt: 2 }}>
                    <Button
                      variant="contained"
                      onClick={() => navigate(`/professor/grade-adaptation?studentId=${encodeURIComponent(selectedStudent.id)}`)}
                    >
                      Évaluer / Ajouter une note
                    </Button>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Typography variant="subtitle1" gutterBottom>
                    Cours où il est inscrit
                  </Typography>

                  {enrolledCourses.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      Aucun cours (dans le mode démo).
                    </Typography>
                  ) : (
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      {enrolledCourses.map((c) => (
                        <Chip key={c.id} label={`${c.intitule} (${c.code})`} />
                      ))}
                    </Stack>
                  )}
                </CardContent>
              </Card>
            )}
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}