import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  TextField,
  Alert,
  Card,
  CardContent,
  Grid,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { QrCodeScanner as QrCodeIcon, CheckCircle, Cancel } from '@mui/icons-material';

const ScanQR = () => {
  const [qrCode, setQrCode] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');
  const [successDialog, setSuccessDialog] = useState(false);
  const [errorDialog, setErrorDialog] = useState(false);
  const [scanHistory, setScanHistory] = useState([
    { cours: 'Base de données', date: '2024-01-10T08:30:00', statut: 'PRESENT' },
    { cours: 'Algorithmique', date: '2024-01-09T10:00:00', statut: 'RETARD' },
    { cours: 'Programmation Web', date: '2024-01-08T14:00:00', statut: 'PRESENT' }
  ]);

  const handleScan = () => {
    if (!qrCode.trim()) {
      setMessage('Veuillez entrer un code QR');
      setStatus('error');
      setErrorDialog(true);
      return;
    }
    
    // Simulation d'un scan réussi
    const newScan = {
      cours: 'Cours Test',
      date: new Date().toISOString(),
      statut: 'PRESENT'
    };
    
    setScanHistory([newScan, ...scanHistory]);
    setMessage('Présence enregistrée avec succès !');
    setStatus('success');
    setSuccessDialog(true);
    setQrCode('');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PRESENT':
        return 'success';
      case 'RETARD':
        return 'warning';
      case 'ABSENT':
        return 'error';
      default:
        return 'info';
    }
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom>
        Scanner QR Code
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" flexDirection="column" alignItems="center" p={3}>
                <QrCodeIcon sx={{ fontSize: 100, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Scanner un QR Code de présence
                </Typography>
                <Typography variant="body2" color="textSecondary" align="center" gutterBottom>
                  Entrez le code QR fourni par votre professeur
                </Typography>
                
                <TextField
                  fullWidth
                  label="Code QR"
                  value={qrCode}
                  onChange={(e) => setQrCode(e.target.value)}
                  margin="normal"
                  placeholder="Collez le code QR ici"
                  sx={{ maxWidth: 500 }}
                />
                
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleScan}
                  disabled={!qrCode.trim()}
                  sx={{ mt: 2, mb: 2, minWidth: 200 }}
                >
                  Scanner
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Derniers scans
              </Typography>
              
              {scanHistory.length === 0 ? (
                <Box textAlign="center" py={3}>
                  <Typography color="textSecondary">
                    Aucun scan récent
                  </Typography>
                </Box>
              ) : (
                <Box>
                  {scanHistory.map((scan, index) => (
                    <Paper 
                      key={index} 
                      sx={{ 
                        p: 2, 
                        mb: 1,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <Box>
                        <Typography variant="body1" fontWeight="medium">
                          {scan.cours}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {formatDate(scan.date)}
                        </Typography>
                      </Box>
                      <Chip
                        label={scan.statut}
                        color={getStatusColor(scan.statut)}
                        size="small"
                      />
                    </Paper>
                  ))}
                </Box>
              )}
              
              <Box mt={2}>
                <Typography variant="body2" color="textSecondary">
                  <strong>Instructions :</strong>
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  1. Le professeur affichera un code QR au début du cours
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  2. Copiez-collez le code dans le champ ci-dessus
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  3. Votre présence sera automatiquement enregistrée
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  4. Le code QR est valable uniquement pendant 10 minutes
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Dialogue de succès */}
      <Dialog open={successDialog} onClose={() => setSuccessDialog(false)}>
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <CheckCircle color="success" sx={{ mr: 1 }} />
            Scan réussi !
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box>
            <Typography gutterBottom>
              <strong>Statut :</strong> PRÉSENT
            </Typography>
            <Typography gutterBottom>
              <strong>Message :</strong> Présence enregistrée avec succès
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSuccessDialog(false)}>Fermer</Button>
        </DialogActions>
      </Dialog>
      
      {/* Dialogue d'erreur */}
      <Dialog open={errorDialog} onClose={() => setErrorDialog(false)}>
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <Cancel color="error" sx={{ mr: 1 }} />
            Erreur de scan
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography>{message}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setErrorDialog(false)}>Fermer</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ScanQR;