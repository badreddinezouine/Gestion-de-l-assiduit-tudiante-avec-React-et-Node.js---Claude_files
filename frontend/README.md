# Système de Gestion d'Assiduité et d'Adaptation

## Description
Application web complète pour la gestion automatisée des présences via QR codes et l'évaluation de l'adaptation pédagogique des étudiants.

## Fonctionnalités
- Authentification sécurisée (JWT)
- Génération et scan de QR codes temporisés
- Gestion des présences/absences
- Évaluation de l'adaptation pédagogique
- ChatBot IA pour les décisions de rattrapage
- Dashboard statistiques
- Notifications temps réel

## Installation

### Prérequis
- Node.js v18+
- MongoDB Atlas
- npm ou yarn

### Backend
```bash
cd backend
npm install
cp .env.example .env
# Éditer .env avec vos configurations
npm run dev