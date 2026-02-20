# Commercia

Commercia is a lightweight commercial control web app for Quantity Surveyors to track projects and manage a variations register.

## Live Demo
https://commercia-964d8.web.app

## Features
- Google authentication (Firebase Auth)
- Create and manage projects
- Variation register per project
- Status workflow (Draft / Submitted / Agreed / Rejected)
- Submission date tracking
- Ageing + overdue risk highlight (Submitted > 30 days)
- Live totals (Agreed vs Pending exposure)
- Secure user-based Firestore rules

## Tech Stack
- React (Vite)
- Firebase Authentication
- Firestore Database
- Firebase Hosting

## How to run locally
```bash
npm install
npm run dev