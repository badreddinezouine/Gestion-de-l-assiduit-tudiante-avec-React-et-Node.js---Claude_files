import React, { useMemo } from 'react';
import { Container, Typography, Box, Paper, Table, TableHead, TableRow, TableCell, TableBody, Chip, Grid, Alert } from '@mui/material';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { useAuth } from '../../context/AuthContext';

const loadLS = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const formatDate = (iso) => new Date(iso).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });

export default function MyGrades() {
  const { user } = useAuth();
  const studentId = user?.id || '2';

  const grades = loadLS('pfe_grades', []);
  const courses = loadLS('pfe_courses', []);

  const myGrades = useMemo(
    () => (Array.isArray(grades) ? grades : []).filter((g) => g.studentId === studentId),
    [grades, studentId]
  );

  const courseName = (courseId) => {
    const c = (Array.isArray(courses) ? courses : []).find((x) => x.id === courseId);
    return c ? `${c.intitule} (${c.code})` : `#${courseId}`;
  };

  const avg = useMemo(() => {
    const numeric = myGrades.filter((g) => typeof g.note === 'number');
    if (numeric.length === 0) return null;
    const total = numeric.reduce((s, g) => s + g.note, 0);
    return Math.round((total / numeric.length) * 100) / 100;
  }, [myGrades]);

  const chartData = useMemo(() => {
    const byCourse = new Map();
    myGrades.forEach((g) => {
      if (typeof g.note !== 'number') return;
      const key = courseName(g.courseId);
      const prev = byCourse.get(key) || [];
      byCourse.set(key, [...prev, g.note]);
    });

    return Array.from(byCourse.entries()).map(([name, notes]) => ({
      cours: name.length > 18 ? name.slice(0, 18) + '…' : name,
      moyenne: Math.round((notes.reduce((s, n) => s + n, 0) / notes.length) * 100) / 100,
    }));
  }, [myGrades, courses]);

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 3, mb: 2 }}>
        <Typography variant="h4" gutterBottom>
          Mes Notes
        </Typography>

        <Alert severity="info" sx={{ mb: 2 }}>
          Mode démo : les notes sont enregistrées par le professeur dans “Notes et Adaptation” (localStorage).
        </Alert>

        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">Évaluations</Typography>
              <Typography variant="h5">{myGrades.length}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">Moyenne</Typography>
              <Typography variant="h5">{avg == null ? '—' : `${avg}/20`}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">Participation (dernier)</Typography>
              <Typography variant="h5">
                {myGrades[0]?.typeParticipation || '—'}
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            Moyenne par cours
          </Typography>
          <Box sx={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="cours" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="moyenne" name="Moyenne" />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Paper>

        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Détails
          </Typography>

          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Cours</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Note</TableCell>
                <TableCell>Participation</TableCell>
                <TableCell>Commentaire</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {myGrades.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6}>Aucune note pour le moment</TableCell>
                </TableRow>
              ) : (
                myGrades.map((g) => (
                  <TableRow key={g.id}>
                    <TableCell>{formatDate(g.createdAt)}</TableCell>
                    <TableCell>{courseName(g.courseId)}</TableCell>
                    <TableCell>
                      <Chip size="small" label={g.typeEvaluation} />
                    </TableCell>
                    <TableCell>{g.note == null ? '—' : `${g.note}/20`}</TableCell>
                    <TableCell>
                      <Chip size="small" label={g.typeParticipation} />
                    </TableCell>
                    <TableCell>{g.commentaire || '—'}</TableCell>
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