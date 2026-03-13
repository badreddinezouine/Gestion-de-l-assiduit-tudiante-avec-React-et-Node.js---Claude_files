import React, { useEffect, useMemo, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Chip,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { attendanceService } from '../../services/attendanceService';

const LS_ATT = 'pfe_attendance_records';
const LS_ABS = 'pfe_absence_reports';

const loadLS = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const saveLS = (key, value) => localStorage.setItem(key, JSON.stringify(value));

const formatDate = (iso) => new Date(iso).toLocaleString('fr-FR', {
  day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
});

const statusColor = (s) => {
  if (s === 'PRESENT') return 'success';
  if (s === 'RETARD') return 'warning';
  if (s === 'ABSENT') return 'error';
  return 'default';
};

export default function MyAbsences() {
  const { user } = useAuth();
  const studentId = user?.id || '2';

  const [records, setRecords] = useState([]);
  const [filter, setFilter] = useState('ALL');

  const [openDlg, setOpenDlg] = useState(false);
  const [motif, setMotif] = useState('');
  const [cours, setCours] = useState('');
  const [date, setDate] = useState('');

  const [info, setInfo] = useState('');

  useEffect(() => {
    const init = async () => {
      const all = loadLS(LS_ATT, []);
      const mine = (Array.isArray(all) ? all : []).filter((r) => r.studentId === studentId);

      // Si rien en local, on essaye de récupérer la démo backend /api/attendance/my-attendance
      if (mine.length === 0) {
        try {
          const backend = await attendanceService.getMyAttendance(); // backend renvoie un array
          const mapped = (Array.isArray(backend) ? backend : []).map((x) => ({
            id: `${Date.now()}_${Math.random()}`,
            studentId,
            cours: x.cours,
            date: x.date,
            statut: x.statut,
            code: null,
            sessionId: null,
          }));

          const next = [...mapped, ...(Array.isArray(all) ? all : [])];
          saveLS(LS_ATT, next);
          setRecords(mapped);
          setInfo('Historique initial chargé depuis le backend (mode démo).');
          return;
        } catch {
          // rien
        }
      }

      setRecords(mine);
    };

    init();
  }, [studentId]);

  const filtered = useMemo(() => {
    if (filter === 'ALL') return records;
    return records.filter((r) => r.statut === filter);
  }, [records, filter]);

  const stats = useMemo(() => {
    const present = records.filter((r) => r.statut === 'PRESENT').length;
    const retard = records.filter((r) => r.statut === 'RETARD').length;
    const absent = records.filter((r) => r.statut === 'ABSENT').length;
    return { total: records.length, present, retard, absent };
  }, [records]);

  const handleReportAbsence = () => {
    if (!motif.trim() || !cours.trim() || !date.trim()) return;

    const allReports = loadLS(LS_ABS, []);
    const newRep = {
      id: `${Date.now()}`,
      studentId,
      cours: cours.trim(),
      date: date.trim(),
      motif: motif.trim(),
      statut: 'EN_ATTENTE',
      createdAt: new Date().toISOString(),
    };

    const next = [newRep, ...(Array.isArray(allReports) ? allReports : [])].slice(0, 200);
    saveLS(LS_ABS, next);

    setOpenDlg(false);
    setMotif('');
    setCours('');
    setDate('');
    setInfo('Absence signalée (mode démo, localStorage).');
  };

  const myReports = useMemo(() => {
    const all = loadLS(LS_ABS, []);
    return (Array.isArray(all) ? all : []).filter((r) => r.studentId === studentId);
  }, [studentId, info]);

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 3, mb: 2 }}>
        <Typography variant="h4" gutterBottom>
          Mes Absences & Assiduité
        </Typography>

        {info && (
          <Alert severity="info" sx={{ mb: 2 }}>
            {info}
          </Alert>
        )}

        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={3}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">Total</Typography>
              <Typography variant="h5">{stats.total}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">Présent</Typography>
              <Typography variant="h5">{stats.present}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">Retard</Typography>
              <Typography variant="h5">{stats.retard}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">Absent</Typography>
              <Typography variant="h5">{stats.absent}</Typography>
            </Paper>
          </Grid>
        </Grid>

        <Paper sx={{ p: 2, mb: 2 }}>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip label="Tous" clickable color={filter === 'ALL' ? 'primary' : 'default'} onClick={() => setFilter('ALL')} />
              <Chip label="Présent" clickable color={filter === 'PRESENT' ? 'success' : 'default'} onClick={() => setFilter('PRESENT')} />
              <Chip label="Retard" clickable color={filter === 'RETARD' ? 'warning' : 'default'} onClick={() => setFilter('RETARD')} />
              <Chip label="Absent" clickable color={filter === 'ABSENT' ? 'error' : 'default'} onClick={() => setFilter('ABSENT')} />
            </Box>

            <Button variant="contained" onClick={() => setOpenDlg(true)}>
              Signaler une absence
            </Button>
          </Box>
        </Paper>

        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Historique
          </Typography>

          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Cours</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Statut</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3}>Aucune donnée</TableCell>
                </TableRow>
              ) : (
                filtered.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>{r.cours}</TableCell>
                    <TableCell>{formatDate(r.date)}</TableCell>
                    <TableCell>
                      <Chip size="small" label={r.statut} color={statusColor(r.statut)} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Paper>

        <Paper sx={{ p: 2, mt: 2 }}>
          <Typography variant="h6" gutterBottom>
            Absences signalées (mode démo)
          </Typography>
          {myReports.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              Aucune absence signalée.
            </Typography>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Cours</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Motif</TableCell>
                  <TableCell>Statut</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {myReports.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>{r.cours}</TableCell>
                    <TableCell>{r.date}</TableCell>
                    <TableCell>{r.motif}</TableCell>
                    <TableCell>
                      <Chip size="small" label={r.statut} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Paper>

        <Dialog open={openDlg} onClose={() => setOpenDlg(false)} fullWidth maxWidth="sm">
          <DialogTitle>Signaler une absence</DialogTitle>
          <DialogContent>
            <TextField fullWidth margin="normal" label="Cours" value={cours} onChange={(e) => setCours(e.target.value)} />
            <TextField fullWidth margin="normal" label="Date (ex: 2026-03-02 08:30)" value={date} onChange={(e) => setDate(e.target.value)} />
            <TextField fullWidth margin="normal" label="Motif" value={motif} onChange={(e) => setMotif(e.target.value)} />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDlg(false)}>Annuler</Button>
            <Button variant="contained" onClick={handleReportAbsence} disabled={!cours.trim() || !date.trim() || !motif.trim()}>
              Envoyer
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
}