import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Button,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip
} from '@mui/material';
import {
  People as PeopleIcon,
  School as SchoolIcon,
  QrCode as QrCodeIcon,
  TrendingUp as TrendingUpIcon,
  MoreVert as MoreVertIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const ProfessorDashboard = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalCourses: 0,
    attendanceRate: 0,
    pendingDecisions: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Récupérer les statistiques
      const statsResponse = await axios.get('/api/statistics/dashboard/professor');
      setStats(statsResponse.data);
      
      // Récupérer les activités récentes
      const activityResponse = await axios.get('/api/statistics/recent-activity');
      setRecentActivity(activityResponse.data);
      
      // Récupérer les données de présence
      const attendanceResponse = await axios.get('/api/statistics/attendance-trend');
      setAttendanceData(attendanceResponse.data);
      
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors du chargement du dashboard:', error);
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Étudiants',
      value: stats.totalStudents,
      icon: <PeopleIcon sx={{ fontSize: 40 }} />,
      color: '#1976d2',
      progress: 100
    },
    {
      title: 'Cours',
      value: stats.totalCourses,
      icon: <SchoolIcon sx={{ fontSize: 40 }} />,
      color: '#2e7d32',
      progress: 100
    },
    {
      title: 'Taux Présence',
      value: `${stats.attendanceRate}%`,
      icon: <QrCodeIcon sx={{ fontSize: 40 }} />,
      color: '#ed6c02',
      progress: stats.attendanceRate
    },
    {
      title: 'Décisions en attente',
      value: stats.pendingDecisions,
      icon: <WarningIcon sx={{ fontSize: 40 }} />,
      color: '#d32f2f',
      progress: Math.min(stats.pendingDecisions * 10, 100)
    }
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PRESENT':
        return <CheckCircleIcon color="success" />;
      case 'RETARD':
        return <WarningIcon color="warning" />;
      case 'ABSENT':
        return <ErrorIcon color="error" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <Typography>Chargement du dashboard...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Tableau de bord - Professeur {user?.prenom}
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography color="textSecondary" gutterBottom variant="h6">
                      {card.title}
                    </Typography>
                    <Typography variant="h4">{card.value}</Typography>
                  </Box>
                  <Box sx={{ color: card.color }}>
                    {card.icon}
                  </Box>
                </Box>
                <Box sx={{ mt: 2 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={card.progress} 
                    sx={{ 
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: 'rgba(0,0,0,0.1)',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: card.color
                      }
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Évolution du taux de présence
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={attendanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="tauxPresence" 
                      stroke="#1976d2" 
                      strokeWidth={2}
                      name="Taux de présence (%)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Activités récentes
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Étudiant</TableCell>
                      <TableCell align="right">Statut</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentActivity.slice(0, 5).map((activity, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Typography variant="body2">
                            {activity.etudiant}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {activity.cours}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          {getStatusIcon(activity.statut)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <Button 
                fullWidth 
                sx={{ mt: 2 }}
                onClick={() => window.location.href = '/professor/statistics'}
              >
                Voir toutes les activités
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">
                  Décisions IA récentes
                </Typography>
                <Button 
                  variant="outlined" 
                  onClick={() => window.location.href = '/professor/chatbot'}
                >
                  Voir toutes les décisions
                </Button>
              </Box>
              
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Étudiant</TableCell>
                      <TableCell>Décision</TableCell>
                      <TableCell>Confiance</TableCell>
                      <TableCell>Statut</TableCell>
                      <TableCell>Date</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        <Typography color="textSecondary">
                          Aucune décision récente
                        </Typography>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProfessorDashboard;