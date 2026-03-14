import React, { useState } from 'react';
import {
  Container, Paper, TextField, Button, Typography,
  Box, Alert, Link, Grid,
  MenuItem, Select, InputLabel, FormControl
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// ✅ Filières et niveaux disponibles
const FILIERES = [
  'Génie Logiciel',
  'Génie Informatique',
  'Intelligence Artificielle',
  'Réseaux et Télécommunications',
  'Systèmes Embarqués',
  'Cybersécurité',
  'Data Science',
  'Autre',
];

const NIVEAUX = ['LICENCE1', 'LICENCE2', 'LICENCE3', 'MASTER1', 'MASTER2'];

const Register = () => {
  const { register } = useAuth();
  const navigate     = useNavigate();

  const [formData, setFormData] = useState({
    prenom:     '',
    nom:        '',
    email:      '',
    motDePasse: '',
    telephone:  '',
    role:       'ETUDIANT',
    // Champs étudiant
    filiere:    '',
    niveau:     '',
  });

  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Réinitialiser les champs étudiant si le rôle change
  const handleRoleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      role:    e.target.value,
      filiere: '',
      niveau:  '',
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation frontend
    if (formData.motDePasse.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }

    // ✅ Validation filière et niveau obligatoires pour étudiant
    if (formData.role === 'ETUDIANT') {
      if (!formData.filiere) {
        setError('La filière est obligatoire pour un compte étudiant');
        return;
      }
      if (!formData.niveau) {
        setError('Le niveau est obligatoire pour un compte étudiant');
        return;
      }
    }

    setLoading(true);
    try {
      const result = await register(formData);
      if (result.success) {
        setSuccess('Compte créé avec succès ! Redirection...');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Une erreur inattendue est survenue');
    } finally {
      setLoading(false);
    }
  };

  const isEtudiant = formData.role === 'ETUDIANT';

  return (
    <Container component="main" maxWidth="sm">
      <Box sx={{ marginTop: 6, mb: 4 }}>
        <Paper elevation={3} sx={{ padding: 4 }}>
          <Typography component="h1" variant="h4" sx={{ mb: 3, textAlign: 'center' }}>
            Inscription
          </Typography>

          {error   && <Alert severity="error"   sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

          <Box component="form" onSubmit={handleSubmit}>

            {/* Prénom + Nom */}
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField required fullWidth label="Prénom" name="prenom"
                  value={formData.prenom} onChange={handleChange} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField required fullWidth label="Nom" name="nom"
                  value={formData.nom} onChange={handleChange} />
              </Grid>
            </Grid>

            {/* Email */}
            <TextField margin="normal" required fullWidth
              label="Adresse Email" name="email" type="email"
              value={formData.email} onChange={handleChange}
            />

            {/* Mot de passe */}
            <TextField margin="normal" required fullWidth
              label="Mot de passe (min. 8 caractères)"
              name="motDePasse" type="password"
              value={formData.motDePasse} onChange={handleChange}
            />

            {/* Téléphone */}
            <TextField margin="normal" fullWidth
              label="Téléphone (optionnel)" name="telephone"
              value={formData.telephone} onChange={handleChange}
            />

            {/* Rôle */}
            <FormControl fullWidth margin="normal" required>
              <InputLabel>Rôle</InputLabel>
              <Select
                name="role"
                value={formData.role}
                label="Rôle"
                onChange={handleRoleChange}
              >
                <MenuItem value="ETUDIANT">Étudiant</MenuItem>
                <MenuItem value="PROFESSEUR">Professeur</MenuItem>
              </Select>
            </FormControl>

            {/* ✅ Champs étudiant — affichés seulement si rôle = ETUDIANT */}
            {isEtudiant && (
              <>
                <Typography variant="subtitle2"
                  sx={{ mt: 2, mb: 1, color: 'text.secondary' }}>
                  Informations académiques
                </Typography>

                {/* Filière — REQUIRED */}
                <FormControl fullWidth margin="normal" required>
                  <InputLabel>Filière *</InputLabel>
                  <Select
                    name="filiere"
                    value={formData.filiere}
                    label="Filière *"
                    onChange={handleChange}
                    error={!formData.filiere && loading}
                  >
                    <MenuItem value=""><em>-- Choisir une filière --</em></MenuItem>
                    {FILIERES.map((f) => (
                      <MenuItem key={f} value={f}>{f}</MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Niveau — REQUIRED */}
                <FormControl fullWidth margin="normal" required>
                  <InputLabel>Niveau *</InputLabel>
                  <Select
                    name="niveau"
                    value={formData.niveau}
                    label="Niveau *"
                    onChange={handleChange}
                    error={!formData.niveau && loading}
                  >
                    <MenuItem value=""><em>-- Choisir un niveau --</em></MenuItem>
                    {NIVEAUX.map((n) => (
                      <MenuItem key={n} value={n}>{n}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </>
            )}

            {/* Bouton */}
            <Button type="submit" fullWidth variant="contained"
              disabled={loading} sx={{ mt: 3, mb: 2, py: 1.5 }}>
              {loading ? 'Création du compte...' : "S'inscrire"}
            </Button>

            <Grid container justifyContent="flex-end">
              <Grid item>
                <Link href="/login" variant="body2">
                  Déjà un compte ? Connectez-vous
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Paper>

        <Typography variant="body2" color="text.secondary"
          sx={{ mt: 3, textAlign: 'center' }}>
          Système de Gestion d'Assiduité et d'Adaptation
        </Typography>
      </Box>
    </Container>
  );
};

export default Register;
