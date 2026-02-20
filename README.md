# Commercia
```md
![React](https://img.shields.io/badge/React-Frontend-blue)
![Firebase](https://img.shields.io/badge/Firebase-Backend-orange)
![Vite](https://img.shields.io/badge/Vite-Build-purple)
![Status](https://img.shields.io/badge/Deployed-Firebase%20Hosting-brightgreen)

A lightweight commercial variation tracker for Quantity Surveyors.  
Track projects, manage variation registers, monitor exposure, and keep a clear commercial audit trail.

## Live Demo
https://commercia-964d8.web.app

## Features
- Google authentication (Firebase Auth)
- Protected routes (only signed-in users can access app pages)
- Projects register (create and manage projects)
- Variations register per project
- Status workflow: Draft / Submitted / Agreed / Rejected
- Submission date tracking (submittedAt) + agreedAt
- Overdue risk highlight (Submitted > 30 days)
- Live totals: agreed vs pending exposure
- All-variations view across all projects
- Secure user-based Firestore access rules
- Firebase Hosting deployment

## Tech Stack
- React (Vite)
- Firebase Authentication
- Cloud Firestore
- Firebase Hosting

## Getting Started (Local)
```bash
npm install
npm run dev