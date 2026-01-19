import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  SmartToy as BotIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Visibility as ViewIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const ChatBotDecisions = () => {
  const [decisions, setDecisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDecision, setSelectedDecision] = useState(null);
  const [detailsDialog, setDetailsDialog] = useState(false);
  const [reviewDialog, setReviewDialog] = useState(false);
  const [reviewComment, setReviewComment] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    rejected: 0,
    pending: 0
  });
  const { user } = useAuth();

  useEffect(() => {
    fetchDecisions();
    fetchStats();
  }, []);

  const fetchDecisions = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/chatbot/history');
      setDecisions(response.data.decisions);
    } catch (error) {
      console.error('Erreur lors du chargement des décisions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/chatbot/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    }
  };

  const handleViewDetails = (decision) => {
    setSelectedDecision(decision);
    setDetailsDialog(true);
  };

  const handleReview = (decision, action) => {
    setSelectedDecision(decision);
    setReviewComment('');
    setReviewDialog(true);
  };

  const submitReview = async (action) => {
    if (!selectedDecision) return;

    try {
      setActionLoading(true);
      await axios.put(`/api/chatbot/review/${selectedDecision._id}`, {
        action: action,
        comment: reviewComment
      });

      // Rafraîchir les données
      fetchDecisions();
      fetchStats();
      
      setReviewDialog(false);
      setDetailsDialog(false);
      
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'APPROUVE':
        return 'success';
      case 'REJETE':
        return 'error';
      case 'EN_ATTENTE':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getDecisionColor = (type) => {
    switch (type) {
      case 'RATTRAPAGE':
        return 'success';
      case 'REFUS':
        return 'error';
      case 'REVUE_MANUELLE':
        return 'warning';
      default:
        return 'info';
    }
  };

  const getConfidenceColor = (score) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'error';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <Box sx={{ width: '100%', maxWidth: 400 }}>
          <LinearProgress />
          <Typography align="center" sx={{ mt: 2 }}>
            Chargement des décisions...
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4">
          <BotIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Décisions du ChatBot IA
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchDecisions}
        >
          Actualiser
        </Button>
      </Box>

      {/* Statistiques */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total des décisions
              </Typography>
              <Typography variant="h4">{stats.total}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Approuvées
              </Typography>
              <Typography variant="h4" color="success.main">
                {stats.approved}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Rejetées
              </Typography>
              <Typography variant="h4" color="error.main">
                {stats.rejected}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                En attente
              </Typography>
              <Typography variant="h4" color="warning.main">
                {stats.pending}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Table des décisions */}
      <Card>
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Étudiant</TableCell>
                  <TableCell>Décision</TableCell>
                  <TableCell>Confiance</TableCell>
                  <TableCell>Statut</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {decisions.map((decision) => (
                  <TableRow key={decision._id}>
                    <TableCell>
                      <Typography fontWeight="medium">
                        {decision.etudiantId?.prenom} {decision.etudiantId?.nom}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {decision.coursId?.intitule}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={decision.typeDecision}
                        color={getDecisionColor(decision.typeDecision)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <LinearProgress
                          variant="determinate"
                          value={decision.scoreConfiance}
                          sx={{
                            width: 60,
                            mr: 1,
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: getConfidenceColor(decision.scoreConfiance) === 'success' 
                                ? '#4caf50' 
                                : getConfidenceColor(decision.scoreConfiance) === 'warning'
                                ? '#ff9800'
                                : '#f44336'
                            }
                          }}
                        />
                        <Typography variant="body2">
                          {decision.scoreConfiance}%
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={decision.statut}
                        color={getStatusColor(decision.statut)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(decision.createdAt).toLocaleDateString('fr-FR')}
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Voir les détails">
                        <IconButton
                          size="small"
                          onClick={() => handleViewDetails(decision)}
                        >
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      {decision.statut === 'EN_ATTENTE' && (
                        <>
                          <Tooltip title="Approuver">
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => handleReview(decision, 'APPROUVE')}
                            >
                              <ApproveIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Rejeter">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleReview(decision, 'REJETE')}
                            >
                              <RejectIcon />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Dialogue de détails */}
      <Dialog 
        open={detailsDialog} 
        onClose={() => setDetailsDialog(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedDecision && (
          <>
            <DialogTitle>
              Détails de la décision
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    ÉTUDIANT
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedDecision.etudiantId?.prenom} {selectedDecision.etudiantId?.nom}
                  </Typography>
                  
                  <Typography variant="subtitle2" color="textSecondary" sx={{ mt: 2 }}>
                    COURS
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedDecision.coursId?.intitule} ({selectedDecision.coursId?.code})
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    DÉCISION
                  </Typography>
                  <Chip
                    label={selectedDecision.typeDecision}
                    color={getDecisionColor(selectedDecision.typeDecision)}
                    sx={{ mb: 1 }}
                  />
                  
                  <Typography variant="subtitle2" color="textSecondary" sx={{ mt: 2 }}>
                    RECOMMANDATION
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedDecision.recommandation}
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary">
                    JUSTIFICATION
                  </Typography>
                  <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                    <Typography variant="body2">
                      {selectedDecision.justification}
                    </Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary">
                    DONNÉES ANALYSÉES
                  </Typography>
                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    {selectedDecision.donneesAnalysees && Object.entries(selectedDecision.donneesAnalysees).map(([key, value]) => (
                      <Grid item xs={6} sm={4} md={3} key={key}>
                        <Card variant="outlined">
                          <CardContent sx={{ p: 2 }}>
                            <Typography variant="caption" color="textSecondary" display="block">
                              {key.replace(/([A-Z])/g, ' $1').toUpperCase()}
                            </Typography>
                            <Typography variant="h6">
                              {typeof value === 'number' ? value.toFixed(1) : value}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDetailsDialog(false)}>Fermer</Button>
              {selectedDecision.statut === 'EN_ATTENTE' && (
                <>
                  <Button
                    color="success"
                    startIcon={<ApproveIcon />}
                    onClick={() => {
                      setDetailsDialog(false);
                      handleReview(selectedDecision, 'APPROUVE');
                    }}
                  >
                    Approuver
                  </Button>
                  <Button
                    color="error"
                    startIcon={<RejectIcon />}
                    onClick={() => {
                      setDetailsDialog(false);
                      handleReview(selectedDecision, 'REJETE');
                    }}
                  >
                    Rejeter
                  </Button>
                </>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Dialogue de révision */}
      <Dialog open={reviewDialog} onClose={() => setReviewDialog(false)}>
        <DialogTitle>
          {selectedDecision?.typeDecision === 'RATTRAPAGE' ? 'Approuver le rattrapage' : 'Rejeter la demande'}
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            Vous êtes sur le point de {selectedDecision?.typeDecision === 'RATTRAPAGE' ? 'approuver' : 'rejeter'} la décision pour 
            {selectedDecision?.etudiantId?.prenom} {selectedDecision?.etudiantId?.nom}
          </Alert>
          
          <TextField
            autoFocus
            margin="dense"
            label="Commentaire (optionnel)"
            fullWidth
            multiline
            rows={3}
            value={reviewComment}
            onChange={(e) => setReviewComment(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReviewDialog(false)} disabled={actionLoading}>
            Annuler
          </Button>
          <Button
            color={selectedDecision?.typeDecision === 'RATTRAPAGE' ? 'success' : 'error'}
            variant="contained"
            onClick={() => submitReview(selectedDecision?.typeDecision === 'RATTRAPAGE' ? 'APPROUVE' : 'REJETE')}
            disabled={actionLoading}
          >
            {actionLoading ? 'Traitement...' : 'Confirmer'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ChatBotDecisions;