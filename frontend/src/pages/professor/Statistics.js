import React, { useEffect, useMemo, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Alert,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  Divider,
} from '@mui/material';
import {
  People as PeopleIcon,
  School as SchoolIcon,
  TrendingUp as TrendingUpIcon,
  SmartToy as SmartToyIcon,
} from '@mui/icons-material';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import api from '../../services/api';

const loadLS = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const formatDate = (iso) => {
  const dt = new Date(iso);
  return dt.toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
};

const statusColor = (s) => {
  if (s === 'PRESENT') return 'success';
  if (s === 'RETARD') return 'warning';
  if (s === 'ABSENT') return 'error';
  return 'default';
};

export default function Statistics() {
  const [dashboard, setDashboard] = useState(null);
  const [activity, setActivity] = useState([]);
  const [trend, setTrend] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Local stats (courses + scans)
  const localCourses = loadLS('pfe_courses', []);
  const localAttendance = loadLS('pfe_attendance_records', []);

  const localStats = useMemo(() => {
    const totalCourses = Array.isArray(localCourses) ? localCourses.length : 0;
    const totalSessions = (Array.isArray(localCourses) ? localCourses : []).reduce(
      (sum, c) => sum + (c.sessions?.length || 0),
      0
    );

    const totalScans = Array.isArray(localAttendance) ? localAttendance.length : 0;

    const present = (Array.isArray(localAttendance) ? localAttendance : []).filter((x) => x.statut === 'PRESENT').length;
    const retard = (Array.isArray(localAttendance) ? localAttendance : []).filter((x) => x.statut === 'RETARD').length;
    const absent = (Array.isArray(localAttendance) ? localAttendance : []).filter((x) => x.statut === 'ABSENT').length;

    const rate = totalScans > 0 ? Math.round((present / totalScans) * 100) : 0;

    return { totalCourses, totalSessions, totalScans, present, retard, absent, rate };
  }, [localCourses, localAttendance]);

  const statusBreakdown = useMemo(
    () => [
      { name: 'PRESENT', value: localStats.present },
      { name: 'RETARD', value: localStats.retard },
      { name: 'ABSENT', value: localStats.absent },
    ],
    [localStats]
  );

  useEffect(() => {
    const fetchAll = async () => {
      setError('');
      setLoading(true);
      try {
        // backend/server.js expose:
        // GET /api/statistics/dashboard/professor -> { totalStudents, totalCourses, attendanceRate, pendingDecisions }
        // GET /api/statistics/recent-activity -> [ ... ]
        // GET /api/statistics/attendance-trend -> [ ... ]
        const [d, a, t] = await Promise.all([
          api.get('/statistics/dashboard/professor'),
          api.get('/statistics/recent-activity'),
          api.get('/statistics/attendance-trend'),
        ]);

        setDashboard(d.data);
        setActivity(Array.isArray(a.data) ? a.data : []);
        setTrend(Array.isArray(t.data) ? t.data : []);
      } catch (e) {
        setError(e?.message || "Erreur lors du chargement des statistiques");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  const cards = [
    {
      title: 'Étudiants',
      value: dashboard?.totalStudents ?? '—',
      icon: <PeopleIcon />,
    },
    {
      title: 'Cours',
      value: dashboard?.totalCourses ?? '—',
      icon: <SchoolIcon />,
    },
    {
      title: 'Taux de présence (backend)',
      value: dashboard?.attendanceRate != null ? `${dashboard.attendanceRate}%` : '—',
      icon: <TrendingUpIcon />,
    },
    {
      title: 'Décisions en attente',
      value: dashboard?.pendingDecisions ?? '—',
      icon: <SmartToyIcon />,
    },
  ];

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 3 }}>
          <Typography variant="h5">Chargement des statistiques…</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 3, mb: 2 }}>
        <Typography variant="h4" gutterBottom>
          Statistiques
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={2} sx={{ mb: 2 }}>
          {cards.map((c) => (
            <Grid item xs={12} sm={6} md={3} key={c.title}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary">
                    {c.title}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                    <Typography variant="h5">{c.value}</Typography>
                    {c.icon}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Alert severity="info" sx={{ mb: 2 }}>
          Bonus (localStorage) : {localStats.totalCourses} cours • {localStats.totalSessions} séances •{' '}
          {localStats.totalScans} scans • présence locale ~ {localStats.rate}%.
        </Alert>

        <Grid container spacing={2}>
          <Grid item xs={12} md={7}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Tendance du taux de présence (backend)
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="tauxPresence" name="Taux (%)" />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={5}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Répartition locale (scans)
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={statusBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" name="Nb" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Activités récentes (backend)
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
                      <TableCell colSpan={4}>Aucune activité</TableCell>
                    </TableRow>
                  ) : (
                    activity.map((a, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{a.etudiant}</TableCell>
                        <TableCell>{a.cours}</TableCell>
                        <TableCell>
                          <Chip size="small" label={a.statut} color={statusColor(a.statut)} />
                        </TableCell>
                        <TableCell>{formatDate(a.date)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}