# Projet Socles - Musée du Quai Branly

## Description du projet

Application mobile PWA en VueJS pour gérer les socles des œuvres du musée du Quai Branly. L'application permet de créer et gérer des fiches de socles et des fiches d'exposition associées. Les socles sont stockés dans une base de données locale (Dexie) et synchronisés avec une base de données distante via une API REST (CollectiveAccess).

## Contexte

Les socles sont amenés à se déplacer avec les œuvres lorsqu'une exposition créée au musée du Quai Branly voyage pour être exposée à l'autre bout de la planète.

## Fonctionnalités

L'application doit gérer :
- Des fiches de socles
- Des fiches d'exposition

## Structure des données

### Fiches de socles
- Liste de champs personnalisables
- Photos attachées

### Fiches d'exposition
- Titre court
- Titre long
- Date
- Lieu
- Image
- Couleur associée (optionnel)
