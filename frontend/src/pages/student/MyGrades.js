import React, { useEffect, useMemo, useState } from 'react';
import { 
  Container, Typography, Box, Paper, Table, TableHead, 
  TableRow, TableCell, TableBody, Chip, Grid, Alert, CircularProgress 
} from '@mui/material';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { studentService } from '../../services/studentService';

const formatDate = (iso) => new Date(iso).toLocaleString('fr-FR', { 
  day: '2-digit', month: '2-digit', year: 'numeric' 
});

export default function MyGrades() {
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // ✅ Charger les notes depuis l'API
  useEffect(() => {
    const load = async () => {
      try {
        const data = await studentService.getMyGrades();
        setGrades(data);
      } catch (err) {
        setError(err.response?.data?.error || 'Erreur de chargement des notes');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Calculer la moyenne
  const avg = useMemo(() => {
    const numeric = grades.filter((g) => typeof g.note === 'number');
    if (numeric.length === 0) return null;
    const total = numeric.reduce((s, g) => s + g.note, 0);
    return Math.round((total / numeric.length) * 100) / 100;
  }, [grades]);

  // Données pour le graphique
  const chartData = useMemo(() => {
    const byCourse = new Map();
    grades.forEach((g) => {
      if (typeof g.note !== 'number') return;
      const key = g.courseName;
      const prev = byCourse.get(key) || [];
      byCourse.set(key, [...prev, g.note]);
    });

    return Array.from(byCourse.entries()).map(([name, notes]) => ({
      cours: name.length > 18 ? name.slice(0, 18) + '…' : name,
      moyenne: Math.round((notes.reduce((s, n) => s + n, 0) / notes.length) * 100) / 100,
    }));
  }, [grades]);

  // Dernière participation
  const lastParticipation = useMemo(() => {
    const participations = grades.filter(g => g.typeEvaluation === 'PARTICIPATION');
    return participations.length > 0 ? participations[0].typeParticipation : '—';
  }, [grades]);

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
        <Typography variant="h4" gutterBottom>
          Mes Notes
        </Typography>

        {/* ✅ Plus de localStorage - données depuis MongoDB */}
        <Alert severity="success" sx={{ mb: 2 }}>
          Les notes sont enregistrées dans <b>MongoDB Atlas</b>.
        </Alert>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {/* Statistiques */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">Évaluations</Typography>
              <Typography variant="h5">{grades.length}</Typography>
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
              <Typography variant="h5">{lastParticipation}</Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Graphique */}
        {chartData.length > 0 && (
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Moyenne par cours
            </Typography>
            <Box sx={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="cours" />
                  <YAxis domain={[0, 20]} />
                  <Tooltip />
                  <Bar dataKey="moyenne" name="Moyenne" fill="#1976d2" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        )}

        {/* Tableau détaillé */}
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
              {grades.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} sx={{ textAlign: 'center', color: 'text.secondary' }}>
                    Aucune note pour le moment
                  </TableCell>
                </TableRow>
              ) : (
                grades.map((g) => (
                  <TableRow key={g.id}>
                    <TableCell>{formatDate(g.createdAt)}</TableCell>
                    <TableCell>{g.courseName}</TableCell>
                    <TableCell>
                      <Chip size="small" label={g.typeEvaluation} />
                    </TableCell>
                    <TableCell>{g.note == null ? '—' : `${g.note}/20`}</TableCell>
                    <TableCell>
                      <Chip 
                        size="small" 
                        label={g.typeParticipation}
                        color={
                          g.typeParticipation === 'ACTIVE' ? 'success' :
                          g.typeParticipation === 'MOYENNE' ? 'warning' : 'default'
                        }
                      />
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