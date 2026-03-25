import React, { useEffect, useMemo, useState } from 'react';
import {
  Container, Typography, Box, Paper, Grid, Chip, Table, 
  TableHead, TableRow, TableCell, TableBody, Alert, CircularProgress
} from '@mui/material';
import { studentService } from '../../services/studentService';

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
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('ALL');

  // ✅ Charger les présences depuis l'API
  useEffect(() => {
    const load = async () => {
      try {
        console.log('🔄 Chargement des présences...');
        const data = await studentService.getMyAttendance();
        console.log('✅ Données reçues:', data);
        setRecords(data);
      } catch (err) {
        console.error('❌ Erreur:', err);
        setError(err.response?.data?.error || 'Erreur de chargement des absences');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Filtrer par statut
  const filtered = useMemo(() => {
    if (filter === 'ALL') return records;
    return records.filter((r) => r.statut === filter);
  }, [records, filter]);

  // Statistiques
  const stats = useMemo(() => {
    const present = records.filter((r) => r.statut === 'PRESENT').length;
    const retard = records.filter((r) => r.statut === 'RETARD').length;
    const absent = records.filter((r) => r.statut === 'ABSENT').length;
    return { total: records.length, present, retard, absent };
  }, [records]);

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
          Mes Absences & Assiduité
        </Typography>

        {/* ✅ Plus de localStorage */}
        <Alert severity="success" sx={{ mb: 2 }}>
          Les présences sont enregistrées dans <b>MongoDB Atlas</b> via le système QR Code.
        </Alert>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {/* Statistiques */}
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
              <Typography variant="h5" color="success.main">{stats.present}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">Retard</Typography>
              <Typography variant="h5" color="warning.main">{stats.retard}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">Absent</Typography>
              <Typography variant="h5" color="error.main">{stats.absent}</Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Filtres */}
        <Paper sx={{ p: 2, mb: 2 }}>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip 
              label="Tous" 
              clickable 
              color={filter === 'ALL' ? 'primary' : 'default'} 
              onClick={() => setFilter('ALL')} 
            />
            <Chip 
              label="Présent" 
              clickable 
              color={filter === 'PRESENT' ? 'success' : 'default'} 
              onClick={() => setFilter('PRESENT')} 
            />
            <Chip 
              label="Retard" 
              clickable 
              color={filter === 'RETARD' ? 'warning' : 'default'} 
              onClick={() => setFilter('RETARD')} 
            />
            <Chip 
              label="Absent" 
              clickable 
              color={filter === 'ABSENT' ? 'error' : 'default'} 
              onClick={() => setFilter('ABSENT')} 
            />
          </Box>
        </Paper>

        {/* Historique */}
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Historique ({filtered.length})
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
                  <TableCell colSpan={3} sx={{ textAlign: 'center', color: 'text.secondary' }}>
                    {filter === 'ALL' 
                      ? 'Aucune donnée de présence. Scannez des QR codes en cours !'
                      : `Aucune donnée avec le statut "${filter}"`
                    }
                  </TableCell>
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

        {/* Info QR Code */}
        {stats.total === 0 && (
          <Alert severity="info" sx={{ mt: 2 }}>
            💡 <strong>Comment marquer ma présence ?</strong>
            <br />
            Allez sur <strong>"Scanner QR"</strong> et entrez le code affiché par votre professeur au début du cours.
          </Alert>
        )}
      </Box>
    </Container>
  );
}
