# mobitweet

[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.3854988.svg)](https://doi.org/10.5281/zenodo.3854988)

## Installation

L’application Mobitweet fonctionne dans un environnement virtuel. Pour lancer l’application, il est nécessaire d’avoir le logiciel [Docker](https://www.docker.com).

La machine virtuelle peut alors être créée en utilisant la recette décrite dans le fichier `Dockerfile`. Dans un terminal ouvert à la racine de ce dépôt, lancez la commande suivante :

```bash
docker build --no-cache --tag mobitweet:v1 .
```

## Démarrage du serveur de l’application

### Lancement de la machine virtuelle

Ensuite, la machine virtuelle doit être lancée. Dans un terminal, tapez cette commande :

```bash
docker run --detach --rm --publish 127.0.0.1:3000:3000 --name mobitweet_server mobitweet:v1
```

### Accès à l’application

Après une dizaine de minutes de mise en place, l’application est accessible depuis un navigateur internet à l’adresse <http://localhost:3000>.

### Exploration de l’environnement du serveur

Pendant son fonctionnement, vous pouvez explorer son environnement avec la commande suivante :

```bash
docker exec --tty --interactive mobitweet_server bash
```

## Arrêt du serveur

```bash
docker stop mobitweet_server
```

## Note sur la connexion à l’aide des réseaux sociaux

Pour se connecter à l’aide d’un réseau social et dupliquer les messages et signaux sur celui-ci, il est nécessaire de paramétrer manuellement l’application. Cette manœuvre étant complexe, nous essayons actuellement de trouver une solution pour un paramétrage automatique.
