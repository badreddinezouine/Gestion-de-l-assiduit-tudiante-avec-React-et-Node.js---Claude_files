import React, { useEffect, useMemo, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Chip,
  Stack,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Event as EventIcon,
  QrCode as QrCodeIcon,
  Group as GroupIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const LS_KEYS = {
  courses: 'pfe_courses',
  students: 'pfe_students',
};

const safeJsonParse = (value, fallback) => {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

const loadLS = (key, fallback) => safeJsonParse(localStorage.getItem(key), fallback);
const saveLS = (key, value) => localStorage.setItem(key, JSON.stringify(value));

const makeId = (prefix) => `${prefix}_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

const defaultStudents = [
  {
    id: '2',
    nom: 'Zouine',
    prenom: 'Badr eddine',
    email: 'badr.zouine@univ.fr',
    numeroEtudiant: 'ETU2024001',
    niveau: 'LICENCE3',
    filiere: 'Informatique',
  },
  {
    id: '3',
    nom: 'Moumen',
    prenom: 'Marouane',
    email: 'marouane.moumen@univ.fr',
    numeroEtudiant: 'ETU2024002',
    niveau: 'LICENCE3',
    filiere: 'Informatique',
  },
  {
    id: '4',
    nom: 'Doe',
    prenom: 'John',
    email: 'john.doe@univ.fr',
    numeroEtudiant: 'ETU2024003',
    niveau: 'LICENCE3',
    filiere: 'Informatique',
  },
];

const buildDemoCourses = (professorId) => {
  const now = new Date();
  const addDays = (d) => new Date(now.getTime() + d * 24 * 60 * 60 * 1000);
  const iso = (dt) => dt.toISOString().slice(0, 16);

  const c1 = makeId('course');
  const c2 = makeId('course');
  const c3 = makeId('course');

  return [
    {
      id: c1,
      professeurId: professorId,
      code: 'BDA2026',
      intitule: 'Base de Données',
      filiere: 'Informatique',
      niveau: 'LICENCE3',
      description: 'Modélisation, SQL, normalisation, transactions…',
      etudiants: ['2', '3', '4'],
      sessions: [
        { id: makeId('session'), dateDebut: iso(addDays(1).setHours(8, 30, 0, 0) && addDays(1)), duree: 120, salle: 'A1' },
        { id: makeId('session'), dateDebut: iso(addDays(8).setHours(8, 30, 0, 0) && addDays(8)), duree: 120, salle: 'A1' },
      ],
    },
    {
      id: c2,
      professeurId: professorId,
      code: 'ALG2026',
      intitule: 'Algorithmique',
      filiere: 'Informatique',
      niveau: 'LICENCE3',
      description: 'Complexité, structures de données, graphes…',
      etudiants: ['2', '3'],
      sessions: [
        { id: makeId('session'), dateDebut: iso(addDays(2).setHours(10, 0, 0, 0) && addDays(2)), duree: 120, salle: 'B2' },
      ],
    },
    {
      id: c3,
      professeurId: professorId,
      code: 'WEB2026',
      intitule: 'Programmation Web',
      filiere: 'Informatique',
      niveau: 'LICENCE3',
      description: 'React, Node.js, API REST, sécurité…',
      etudiants: ['2', '4'],
      sessions: [
        { id: makeId('session'), dateDebut: iso(addDays(3).setHours(14, 0, 0, 0) && addDays(3)), duree: 120, salle: 'C3' },
      ],
    },
  ];
};

const formatDateTime = (isoString) => {
  const dt = new Date(isoString);
  return dt.toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default function CourseManagement() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const professorId = user?.id || '1';

  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);

  // Dialogs
  const [openCourseDlg, setOpenCourseDlg] = useState(false);
  const [openSessionDlg, setOpenSessionDlg] = useState(false);
  const [openEnrollDlg, setOpenEnrollDlg] = useState(false);

  const [activeCourseId, setActiveCourseId] = useState(null);

  // Course form
  const [courseForm, setCourseForm] = useState({
    code: '',
    intitule: '',
    filiere: '',
    niveau: '',
    description: '',
  });

  // Session form
  const [sessionForm, setSessionForm] = useState({
    date: '',
    time: '',
    duree: 120,
    salle: '',
  });

  const [enrollSelection, setEnrollSelection] = useState([]);

  useEffect(() => {
    // Students
    let s = loadLS(LS_KEYS.students, []);
    if (!Array.isArray(s) || s.length === 0) {
      s = defaultStudents;
      saveLS(LS_KEYS.students, s);
    }
    setStudents(s);

    // Courses
    let c = loadLS(LS_KEYS.courses, []);
    if (!Array.isArray(c) || c.length === 0) {
      c = buildDemoCourses(professorId);
      saveLS(LS_KEYS.courses, c);
    }
    setCourses(c);
  }, [professorId]);

  const myCourses = useMemo(
    () => courses.filter((c) => c.professeurId === professorId),
    [courses, professorId]
  );

  const persistCourses = (next) => {
    setCourses(next);
    saveLS(LS_KEYS.courses, next);
  };

  const courseById = (id) => courses.find((c) => c.id === id);

  const handleCreateCourse = () => {
    const newCourse = {
      id: makeId('course'),
      professeurId: professorId,
      code: courseForm.code.trim(),
      intitule: courseForm.intitule.trim(),
      filiere: courseForm.filiere.trim(),
      niveau: courseForm.niveau.trim(),
      description: courseForm.description.trim(),
      etudiants: [],
      sessions: [],
    };

    if (!newCourse.code || !newCourse.intitule) return;

    persistCourses([newCourse, ...courses]);
    setOpenCourseDlg(false);
    setCourseForm({ code: '', intitule: '', filiere: '', niveau: '', description: '' });
  };

  const handleDeleteCourse = (courseId) => {
    persistCourses(courses.filter((c) => c.id !== courseId));
  };

  const openAddSession = (courseId) => {
    setActiveCourseId(courseId);
    setSessionForm({ date: '', time: '', duree: 120, salle: '' });
    setOpenSessionDlg(true);
  };

  const handleAddSession = () => {
    const c = courseById(activeCourseId);
    if (!c) return;

    if (!sessionForm.date || !sessionForm.time) return;

    const dateDebut = new Date(`${sessionForm.date}T${sessionForm.time}:00`);
    const newSession = {
      id: makeId('session'),
      dateDebut: dateDebut.toISOString().slice(0, 16),
      duree: Number(sessionForm.duree) || 120,
      salle: sessionForm.salle.trim() || '—',
    };

    const next = courses.map((x) =>
      x.id === c.id ? { ...x, sessions: [newSession, ...(x.sessions || [])] } : x
    );
    persistCourses(next);
    setOpenSessionDlg(false);
  };

  const openEnroll = (courseId) => {
    const c = courseById(courseId);
    setActiveCourseId(courseId);
    setEnrollSelection(Array.isArray(c?.etudiants) ? c.etudiants : []);
    setOpenEnrollDlg(true);
  };

  const toggleEnroll = (studentId) => {
    setEnrollSelection((prev) =>
      prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId]
    );
  };

  const handleSaveEnroll = () => {
    const c = courseById(activeCourseId);
    if (!c) return;

    const next = courses.map((x) =>
      x.id === c.id ? { ...x, etudiants: enrollSelection } : x
    );
    persistCourses(next);
    setOpenEnrollDlg(false);
  };

  const studentName = (id) => {
    const s = students.find((x) => x.id === id);
    return s ? `${s.prenom} ${s.nom}` : `#${id}`;
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 3, mb: 2 }}>
        <Typography variant="h4" gutterBottom>
          Gestion des Cours
        </Typography>

        <Alert severity="info" sx={{ mb: 2 }}>
          Cette page est maintenant fonctionnelle (mode démo) : cours, séances et inscriptions
          sont sauvegardés dans <b>localStorage</b>.
        </Alert>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenCourseDlg(true)}
        >
          Ajouter un cours
        </Button>
      </Box>

      <Grid container spacing={2}>
        {myCourses.map((course) => (
          <Grid item xs={12} md={6} key={course.id}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6">
                  {course.intitule} <Chip size="small" label={course.code} sx={{ ml: 1 }} />
                </Typography>

                <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                  {course.description || '—'}
                </Typography>

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  Séances ({course.sessions?.length || 0})
                </Typography>

                <Stack spacing={1}>
                  {(course.sessions || []).length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      Aucune séance pour le moment.
                    </Typography>
                  ) : (
                    course.sessions.slice(0, 5).map((s) => (
                      <Box
                        key={s.id}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          p: 1,
                          borderRadius: 1,
                          bgcolor: 'action.hover',
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <EventIcon fontSize="small" />
                          <Typography variant="body2">
                            {formatDateTime(s.dateDebut)} • {s.duree} min • Salle {s.salle}
                          </Typography>
                        </Box>

                        <IconButton
                          size="small"
                          title="Générer QR de présence"
                          onClick={() => navigate(`/professor/attendance-qr?sessionId=${encodeURIComponent(s.id)}`)}
                        >
                          <QrCodeIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    ))
                  )}
                </Stack>

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  Étudiants inscrits ({course.etudiants?.length || 0})
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {(course.etudiants || []).slice(0, 6).map((sid) => (
                    <Chip key={sid} size="small" label={studentName(sid)} icon={<GroupIcon />} />
                  ))}
                  {(course.etudiants || []).length > 6 && (
                    <Chip size="small" label={`+${course.etudiants.length - 6}`} />
                  )}
                  {(course.etudiants || []).length === 0 && (
                    <Typography variant="body2" color="text.secondary">
                      Aucun étudiant inscrit.
                    </Typography>
                  )}
                </Stack>
              </CardContent>

              <CardActions sx={{ justifyContent: 'space-between' }}>
                <Box>
                  <Button size="small" onClick={() => openAddSession(course.id)}>
                    Ajouter séance
                  </Button>
                  <Button size="small" onClick={() => openEnroll(course.id)}>
                    Inscrire étudiants
                  </Button>
                </Box>

                <IconButton
                  color="error"
                  size="small"
                  title="Supprimer le cours"
                  onClick={() => handleDeleteCourse(course.id)}
                >
                  <DeleteIcon />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Dialog: Add Course */}
      <Dialog open={openCourseDlg} onClose={() => setOpenCourseDlg(false)} fullWidth maxWidth="sm">
        <DialogTitle>Ajouter un cours</DialogTitle>
        <DialogContent>
          <TextField
            label="Code"
            fullWidth
            margin="normal"
            value={courseForm.code}
            onChange={(e) => setCourseForm((p) => ({ ...p, code: e.target.value }))}
          />
          <TextField
            label="Intitulé"
            fullWidth
            margin="normal"
            value={courseForm.intitule}
            onChange={(e) => setCourseForm((p) => ({ ...p, intitule: e.target.value }))}
          />
          <TextField
            label="Filière"
            fullWidth
            margin="normal"
            value={courseForm.filiere}
            onChange={(e) => setCourseForm((p) => ({ ...p, filiere: e.target.value }))}
          />
          <TextField
            label="Niveau"
            fullWidth
            margin="normal"
            value={courseForm.niveau}
            onChange={(e) => setCourseForm((p) => ({ ...p, niveau: e.target.value }))}
          />
          <TextField
            label="Description"
            fullWidth
            margin="normal"
            multiline
            minRows={2}
            value={courseForm.description}
            onChange={(e) => setCourseForm((p) => ({ ...p, description: e.target.value }))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCourseDlg(false)}>Annuler</Button>
          <Button variant="contained" onClick={handleCreateCourse} disabled={!courseForm.code || !courseForm.intitule}>
            Ajouter
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog: Add Session */}
      <Dialog open={openSessionDlg} onClose={() => setOpenSessionDlg(false)} fullWidth maxWidth="sm">
        <DialogTitle>Ajouter une séance</DialogTitle>
        <DialogContent>
          <TextField
            type="date"
            label="Date"
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
            value={sessionForm.date}
            onChange={(e) => setSessionForm((p) => ({ ...p, date: e.target.value }))}
          />
          <TextField
            type="time"
            label="Heure"
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
            value={sessionForm.time}
            onChange={(e) => setSessionForm((p) => ({ ...p, time: e.target.value }))}
          />
          <TextField
            type="number"
            label="Durée (minutes)"
            fullWidth
            margin="normal"
            value={sessionForm.duree}
            onChange={(e) => setSessionForm((p) => ({ ...p, duree: e.target.value }))}
          />
          <TextField
            label="Salle"
            fullWidth
            margin="normal"
            value={sessionForm.salle}
            onChange={(e) => setSessionForm((p) => ({ ...p, salle: e.target.value }))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSessionDlg(false)}>Annuler</Button>
          <Button variant="contained" onClick={handleAddSession} disabled={!sessionForm.date || !sessionForm.time}>
            Ajouter
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog: Enroll */}
      <Dialog open={openEnrollDlg} onClose={() => setOpenEnrollDlg(false)} fullWidth maxWidth="sm">
        <DialogTitle>Inscrire des étudiants</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Coche les étudiants à inscrire au cours.
          </Typography>
          {students.map((s) => (
            <FormControlLabel
              key={s.id}
              control={
                <Checkbox
                  checked={enrollSelection.includes(s.id)}
                  onChange={() => toggleEnroll(s.id)}
                />
              }
              label={`${s.prenom} ${s.nom} (${s.numeroEtudiant})`}
            />
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEnrollDlg(false)}>Annuler</Button>
          <Button variant="contained" onClick={handleSaveEnroll}>
            Enregistrer
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}