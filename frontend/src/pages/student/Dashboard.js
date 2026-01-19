import React from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button
} from '@mui/material';
import {
  QrCodeScanner as QrCodeIcon,
  School as SchoolIcon,
  CalendarMonth as CalendarIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';

const StudentDashboard = () => {
  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom>
        Tableau de bord - Étudiant
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" flexDirection="column" alignItems="center" p={2}>
                <QrCodeIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Scanner QR
                </Typography>
                <Typography variant="body2" color="textSecondary" align="center">
                  Scanner le QR code de présence
                </Typography>
                <Button
                  variant="contained"
                  sx={{ mt: 2 }}
                  href="/student/scan"
                >
                  Scanner
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" flexDirection="column" alignItems="center" p={2}>
                <SchoolIcon sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Mes Notes
                </Typography>
                <Typography variant="body2" color="textSecondary" align="center">
                  Consulter vos notes et évaluations
                </Typography>
                <Button
                  variant="contained"
                  color="success"
                  sx={{ mt: 2 }}
                  href="/student/grades"
                >
                  Voir mes notes
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" flexDirection="column" alignItems="center" p={2}>
                <CalendarIcon sx={{ fontSize: 60, color: 'warning.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Calendrier
                </Typography>
                <Typography variant="body2" color="textSecondary" align="center">
                  Voir votre emploi du temps
                </Typography>
                <Button
                  variant="contained"
                  color="warning"
                  sx={{ mt: 2 }}
                  href="/student/calendar"
                >
                  Voir calendrier
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      <Box sx={{ mt: 4 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Aujourd'hui
            </Typography>
            <Typography color="textSecondary">
              Aucun cours aujourd'hui
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default StudentDashboard;