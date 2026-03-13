import React, { useMemo, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  TextField,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  Alert,
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';

const loadLS = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

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
  const { user } = useAuth();
  const studentId = user?.id || '2';

  const courses = loadLS('pfe_courses', []);
  const [courseFilter, setCourseFilter] = useState('ALL');

  // sessions for courses where student is enrolled
  const sessions = useMemo(() => {
    const list = [];
    (Array.isArray(courses) ? courses : []).forEach((c) => {
      const enrolled = (c.etudiants || []).includes(studentId);
      if (!enrolled) return;

      (c.sessions || []).forEach((s) => {
        list.push({
          courseId: c.id,
          intitule: c.intitule,
          code: c.code,
          dateDebut: s.dateDebut,
          duree: s.duree,
          salle: s.salle,
          sessionId: s.id,
        });
      });
    });

    return list.sort((a, b) => new Date(a.dateDebut) - new Date(b.dateDebut));
  }, [courses, studentId]);

  const courseOptions = useMemo(() => {
    return (Array.isArray(courses) ? courses : []).filter((c) => (c.etudiants || []).includes(studentId));
  }, [courses, studentId]);

  const filtered = useMemo(() => {
    if (courseFilter === 'ALL') return sessions;
    return sessions.filter((s) => s.courseId === courseFilter);
  }, [sessions, courseFilter]);

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 3, mb: 2 }}>
        <Typography variant="h4" gutterBottom>
          Mon Calendrier
        </Typography>

        <Alert severity="info" sx={{ mb: 2 }}>
          Mode démo : les séances viennent de <b>Gestion des cours</b> (localStorage).
        </Alert>

        <Paper sx={{ p: 2, mb: 2 }}>
          <TextField
            select
            fullWidth
            label="Filtrer par cours"
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
          >
            <option value="ALL">Tous</option>
            {courseOptions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.intitule} ({c.code})
              </option>
            ))}
          </TextField>
        </Paper>

        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Séances à venir / programmées
          </Typography>

          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Cours</TableCell>
                <TableCell>Salle</TableCell>
                <TableCell>Durée</TableCell>
                <TableCell>ID séance</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5}>
                    Aucune séance. (Demande à ton prof de créer des séances dans Gestion des cours)
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((s) => (
                  <TableRow key={s.sessionId}>
                    <TableCell>{formatDateTime(s.dateDebut)}</TableCell>
                    <TableCell>
                      {s.intitule} <Chip size="small" label={s.code} sx={{ ml: 1 }} />
                    </TableCell>
                    <TableCell>{s.salle}</TableCell>
                    <TableCell>{s.duree} min</TableCell>
                    <TableCell>
                      <Chip size="small" label={s.sessionId} />
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