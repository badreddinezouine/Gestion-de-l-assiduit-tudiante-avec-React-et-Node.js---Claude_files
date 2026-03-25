import React, { useEffect, useMemo, useState } from 'react';
import {
  Container, Typography, Box, Paper, TextField, Table, 
  TableHead, TableRow, TableCell, TableBody, Chip, Alert, CircularProgress
} from '@mui/material';
import { studentService } from '../../services/studentService';

const formatDateTime = (iso) => {
  const dt = new Date(iso);
  return dt.toLocaleString('fr-FR', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default function MyCalendar() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [courseFilter, setCourseFilter] = useState('ALL');

  // ✅ Charger les sessions depuis l'API
  useEffect(() => {
    const load = async () => {
      try {
        const data = await studentService.getMyCalendar();
        setSessions(data);
      } catch (err) {
        setError(err.response?.data?.error || 'Erreur de chargement du calendrier');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Liste des cours uniques pour le filtre
  const courseOptions = useMemo(() => {
    const unique = new Map();
    sessions.forEach(s => {
      if (!unique.has(s.courseId)) {
        unique.set(s.courseId, {
          id: s.courseId,
          name: s.courseName,
          code: s.courseCode,
        });
      }
    });
    return Array.from(unique.values());
  }, [sessions]);

  // Sessions filtrées
  const filtered = useMemo(() => {
    if (courseFilter === 'ALL') return sessions;
    return sessions.filter((s) => s.courseId === courseFilter);
  }, [sessions, courseFilter]);

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
          Mon Calendrier
        </Typography>

        {/* ✅ Plus de localStorage */}
        <Alert severity="success" sx={{ mb: 2 }}>
          Les séances sont chargées depuis <b>MongoDB Atlas</b>.
        </Alert>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {/* Filtre par cours */}
        <Paper sx={{ p: 2, mb: 2 }}>
          <TextField
            select
            fullWidth
            label="Filtrer par cours"
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            SelectProps={{ native: true }}
          >
            <option value="ALL">Tous</option>
            {courseOptions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.code})
              </option>
            ))}
          </TextField>
        </Paper>

        {/* Tableau des séances */}
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Séances à venir / programmées ({filtered.length})
          </Typography>

          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Cours</TableCell>
                <TableCell>Salle</TableCell>
                <TableCell>Durée</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} sx={{ textAlign: 'center', color: 'text.secondary' }}>
                    Aucune séance programmée pour le moment
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((s) => (
                  <TableRow key={s.sessionId}>
                    <TableCell>{formatDateTime(s.dateDebut)}</TableCell>
                    <TableCell>
                      {s.courseName} <Chip size="small" label={s.courseCode} sx={{ ml: 1 }} />
                    </TableCell>
                    <TableCell>{s.salle}</TableCell>
                    <TableCell>{s.duree} min</TableCell>
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