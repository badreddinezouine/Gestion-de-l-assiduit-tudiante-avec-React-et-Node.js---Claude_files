import React, { useEffect, useMemo, useState } from 'react';
import {
  Container, Typography, Box, Grid, Card, CardContent,
  Alert, Paper, Table, TableHead, TableRow, TableCell,
  TableBody, Chip, Divider, CircularProgress,
} from '@mui/material';
import {
  People as PeopleIcon, School as SchoolIcon,
  TrendingUp as TrendingUpIcon, SmartToy as SmartToyIcon,
} from '@mui/icons-material';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  Tooltip, CartesianGrid, BarChart, Bar, Legend,
} from 'recharts';
import api from '../../services/api';

const formatDate = (iso) =>
  new Date(iso).toLocaleString('fr-FR', {
    day: '2-digit', month: '2-digit',
    hour: '2-digit', minute: '2-digit',
  });

const statusColor = (s) => {
  if (s === 'PRESENT') return 'success';
  if (s === 'RETARD')  return 'warning';
  if (s === 'ABSENT')  return 'error';
  return 'default';
};

export default function Statistics() {
  const [dashboard, setDashboard] = useState(null);
  const [activity,  setActivity]  = useState([]);
  const [trend,     setTrend]     = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');

  useEffect(() => {
    const fetchAll = async () => {
      setError('');
      setLoading(true);
      try {
        const [d, a, t] = await Promise.all([
          api.get('/statistics/dashboard/professor'),
          api.get('/statistics/recent-activity'),
          api.get('/statistics/attendance-trend'),
        ]);

        setDashboard(d.data);
        setActivity(Array.isArray(a.data) ? a.data : []);
        setTrend(Array.isArray(t.data) ? t.data : []);
      } catch (e) {
        setError(e?.response?.data?.error || 'Erreur chargement statistiques');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // ✅ Répartition depuis les vraies données backend
  const statusBreakdown = useMemo(() => {
    if (!dashboard) return [];
    return [
      { name: 'PRESENT', value: dashboard.totalPresent  || 0 },
      { name: 'RETARD',  value: dashboard.totalRetard   || 0 },
      { name: 'ABSENT',  value: dashboard.totalAbsent   || 0 },
    ];
  }, [dashboard]);

  const cards = [
    { title: 'Étudiants',               value: dashboard?.totalStudents    ?? '—', icon: <PeopleIcon />    },
    { title: 'Cours',                   value: dashboard?.totalCourses     ?? '—', icon: <SchoolIcon />    },
    { title: 'Taux de présence',        value: dashboard?.attendanceRate   != null ? `${dashboard.attendanceRate}%` : '—', icon: <TrendingUpIcon /> },
    { title: 'Décisions en attente',    value: dashboard?.pendingDecisions ?? 0,   icon: <SmartToyIcon />  },
  ];

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
        <Typography variant="h4" gutterBottom>Statistiques</Typography>

        {/* ✅ Plus de localStorage */}
        <Alert severity="success" sx={{ mb: 2 }}>
          Toutes les statistiques proviennent de <b>MongoDB Atlas</b>.
        </Alert>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        )}

        {/* ── Cards KPI ── */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          {cards.map((c) => (
            <Grid item xs={12} sm={6} md={3} key={c.title}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary">
                    {c.title}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center', mt: 1 }}>
                    <Typography variant="h5">{c.value}</Typography>
                    {c.icon}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={2}>

          {/* ── Tendance ── */}
          <Grid item xs={12} md={7}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Tendance du taux de présence (14 derniers jours)
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="tauxPresence"
                      name="Taux (%)"
                      stroke="#1976d2"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>

          {/* ── Répartition ── */}
          <Grid item xs={12} md={5}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Répartition des présences
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={statusBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" name="Nb" fill="#1976d2" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>

          {/* ── Activités récentes ── */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Activités récentes
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Étudiant</TableCell>
                    <TableCell>Cours</TableCell>
                    <TableCell>Statut</TableCell>
                    <TableCell>Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {activity.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} sx={{ color: 'text.secondary' }}>
                        Aucune activité récente.
                      </TableCell>
                    </TableRow>
                  ) : activity.map((a, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{a.etudiant}</TableCell>
                      <TableCell>{a.cours}</TableCell>
                      <TableCell>
                        <Chip size="small" label={a.statut}
                          color={statusColor(a.statut)} />
                      </TableCell>
                      <TableCell>{formatDate(a.date)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
          </Grid>

        </Grid>
      </Box>
    </Container>
  );
}