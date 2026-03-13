import React, { useState } from 'react';
import {
  Container, Paper, TextField, Button, Typography,
  Box, Alert, Link, Grid, MenuItem, Select,
  InputLabel, FormControl
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // ✅ Import AuthContext

const Register = () => {
  const { register } = useAuth(); // ✅ Utiliser la fonction register du contexte
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    prenom: '',
    nom: '',
    email: '',
    motDePasse: '',   // ✅ Corrigé (était 'password')
    telephone: '',
    role: 'ETUDIANT'  // ✅ Ajouté (requis par le backend)
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation basique côté frontend
    if (formData.motDePasse.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }

    setLoading(true);

    try {
      // ✅ Appel RÉEL via AuthContext (fini la simulation !)
      const result = await register(formData);

      if (result.success) {
        setSuccess('Compte créé avec succès ! Redirection vers la connexion...');
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

  return (
    <Container component="main" maxWidth="xs">
      <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Paper elevation={3} sx={{ padding: 4, width: '100%' }}>
          <Typography component="h1" variant="h4" sx={{ mb: 3, textAlign: 'center' }}>
            Inscription
          </Typography>

          {error   && <Alert severity="error"   sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              margin="normal" required fullWidth
              label="Prénom" name="prenom"
              value={formData.prenom} onChange={handleChange}
            />
            <TextField
              margin="normal" required fullWidth
              label="Nom" name="nom"
              value={formData.nom} onChange={handleChange}
            />
            <TextField
              margin="normal" required fullWidth
              label="Adresse Email" name="email" type="email"
              value={formData.email} onChange={handleChange}
            />
            <TextField
              margin="normal" required fullWidth
              label="Mot de passe (min. 8 caractères)"
              name="motDePasse"          // ✅ Correspond exactement au backend
              type="password"
              value={formData.motDePasse} onChange={handleChange}
            />
            <TextField
              margin="normal" fullWidth
              label="Téléphone (optionnel)" name="telephone"
              value={formData.telephone} onChange={handleChange}
            />

            {/* ✅ Champ role — requis par User.js */}
            <FormControl fullWidth margin="normal" required>
              <InputLabel>Rôle</InputLabel>
              <Select
                name="role"
                value={formData.role}
                label="Rôle"
                onChange={handleChange}
              >
                <MenuItem value="ETUDIANT">Étudiant</MenuItem>
                <MenuItem value="PROFESSEUR">Professeur</MenuItem>
              </Select>
            </FormControl>

            <Button
              type="submit" fullWidth variant="contained"
              disabled={loading} sx={{ mt: 3, mb: 2, py: 1.5 }}
            >
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

        <Typography variant="body2" color="text.secondary" sx={{ mt: 4 }}>
          Système de Gestion d'Assiduité et d'Adaptation
        </Typography>
      </Box>
    </Container>
  );
};

export default Register;