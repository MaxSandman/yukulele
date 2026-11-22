# Ukulélé Facile

Une application web pour apprendre le ukulélé **en partant de zéro**, sans solfège.
Elle est faite pour être posée devant soi (tablette, ordi, téléphone) pendant qu'on joue.

## Comment elle est organisée

Quatre onglets, en bas de l'écran :

| Onglet | Ce qu'on y trouve |
|---|---|
| **Aujourd'hui** | La **séance du jour** en un bouton (accorder → échauffement → nouvelle notion → morceau, 10 à 20 min), calculée d'après la progression. Une barre en bas de l'écran guide d'une étape à l'autre. Autour : reprendre le dernier morceau joué, l'avancement dans le parcours, les accords connus et la série de jours de pratique. |
| **Apprendre** | Le parcours en 12 étapes (de « tenir le ukulélé » jusqu'aux accords + mélodie), l'entraînement aux enchaînements d'accords, les rythmes et le quiz du manche. |
| **Morceaux** | Une seule bibliothèque : chansons (chant + accords), mélodies note par note, morceaux « accords + mélodie » (niveau 2) et morceaux perso. Filtres « Je peux les jouer », recherche, suggestions « Pour toi ». **Ajouter un morceau** : depuis un fichier audio, en collant des accords, ou en jouant/chantant une mélodie. |
| **Outils** | Accordeur, dictionnaire d'accords, manche interactif, métronome et rythmes, réglages. |

Tous les morceaux s'ouvrent dans le **lecteur « scène »** : plein écran, sur fond sombre, lisible à un mètre.
On y voit l'accord à jouer en très grand, l'accord suivant avec un compte à rebours (« Prépare-toi ! »),
les temps, les flèches de grattage et les paroles (ligne en cours et suivante).
Trois commandes seulement (Jouer, Vitesse, Boucler) et trois modes (**Découverte** 60 %, **Entraînement** 80 % en boucle,
**Concert** 100 %). Le reste est dans le panneau Réglages : métronome, accompagnement, pas-à-pas, manche, tonalité, rythme.

## Ce qu'elle sait faire

| Fonction | Détail |
|---|---|
| **Leçons** | 12 leçons courtes, dans l'ordre : tenir le ukulélé, les cordes, accorder, gratter, premiers accords (C, Am, F, G7, G), rythmes, tablature, routine, accords + mélodie. Les accords appris sont mémorisés. |
| **Lecteur de chansons** | Accord actuel et suivant, temps, rythme, paroles synchronisées, vitesse de 50 à 110 %, métronome, le ukulélé qui joue en même temps, pas-à-pas, boucle sur une ligne, transposition. |
| **Ajouter une chanson** | Le « traducteur » : on colle les accords d'une chanson trouvée sur internet (format « accords au-dessus des paroles » ou `[C]paroles`, noms anglais ou français `Lam`, `Sol7`…). L'outil reconnaît les accords, dessine les diagrammes, signale les accords difficiles, et peut **transposer automatiquement vers des accords plus faciles** ou simplifier (`Cmaj7 → C`). |
| **Accords** | Dictionnaire avec diagrammes, doigtés (couleur par doigt), son, positions alternatives. Les accords absents du dictionnaire sont calculés automatiquement. |
| **Manche** | Manche interactif : clic = son + nom de la note, gammes, notes d'un accord. |
| **Rythmes** | 8 rythmes de grattage avec métronome et exemple sonore. |
| **Mélodies** | Tablature animée note par note, avec un mode « J'attends ta note » qui écoute au micro. |
| **Entraînement** | Enchaînements d'accords au tempo (l'exercice le plus utile) + quiz « trouve la note sur le manche ». |
| **Accordeur** | Au micro, ou à l'oreille avec des sons de référence. |
| **Accords + mélodie (niveau 2)** | Fingerstyle, pour qui a l'habitude du piano à deux mains : le **pouce** joue l'accompagnement (la « main gauche » du piano), l'**index/majeur** la mélodie (la « main droite »). Tablature en couleurs à deux couches, entraînement **mains séparées**, pas-à-pas, boucle de 4 mesures, 6 styles d'accompagnement. Morceaux : Canon (Pachelbel), Tetris (Korobeiniki), Greensleeves, Gymnopédie n°1 (Satie), The Entertainer (Joplin), Lettre à Élise. |
| **Traduire un morceau** | On donne un **fichier audio** (mp3, m4a, wav…) : l'outil détecte le tempo, les temps, la tonalité et les **accords**, puis on joue **par-dessus le vrai morceau**. Suggestion de **capodastre**, correction d'un accord en un clic, ajout aux chansons. |
| **Transcrire une mélodie** | On joue la mélodie (piano main droite, voix, sifflement) au micro ou via un mémo vocal : l'outil la transcrit en tablature ukulélé, et on peut y ajouter les accords. |

Tout est en local dans le navigateur (pas de compte, pas de base de données). La progression et les
chansons ajoutées sont stockées dans le navigateur, avec export/import dans **Réglages**.
L'appli fonctionne aussi hors ligne et peut être « ajoutée à l'écran d'accueil » d'une tablette.

Les morceaux fournis sont traditionnels ou du domaine public (le dépôt est public : on n'y publie pas de
partitions de chansons protégées). Pour les autres chansons, on colle soi-même les accords trouvés sur internet,
ou on fait « Traduire un morceau » à partir d'un fichier audio : tout reste dans le navigateur, pour un usage perso.

**Limites de l'analyse audio** : elle tourne entièrement dans le navigateur (rien n'est envoyé sur internet ni au NAS).
Les accords sont reconnus parmi les accords majeurs et mineurs ; c'est fiable sur la pop/folk aux accords clairs,
moins sur le jazz ou les morceaux très produits (d'où le bouton de correction). La mélodie d'un enregistrement complet
(voix + instruments) ne peut pas être isolée de façon fiable : on la rejoue soi-même pour la transcrire.
YouTube n'est pas pris en charge (il faut un fichier audio).

## Structure

```
yukulele/
├── docker-compose.yml   # conteneur nginx (port 8095)
├── nginx.conf
└── app/                 # le site (HTML/CSS/JS, aucune compilation nécessaire)
    ├── index.html       # coquille : en-tête + 4 onglets
    ├── css/style.css    # système de design (couleurs, polices, composants, lecteur « scène »)
    ├── fonts/           # Fredoka et Nunito, hébergées localement (aucune dépendance internet)
    └── js/              # app.js (routeur et pages secondaires), hubs.js (les 4 espaces),
                         # session.js (séance du jour, temps de pratique), library.js (catalogue),
                         # player.js (lecteur « scène »), icons.js (icônes dessinées),
                         # parser.js (traducteur de texte), chords.js (dictionnaire),
                         # audio.js (son, métronome, micro), arrange.js + fingerstyle.js (niveau 2),
                         # analysis-worker.js (analyse audio), translate.js (morceaux traduits), ...
```

Pour ajouter une chanson « officielle » au carnet, l'éditer dans `app/js/songs.js` (format ChordPro, `[C:2]` = 2 temps).
Pour un morceau du niveau 2 : `app/js/arrange.js` (`chords` = un accord par mesure, `melody` = `Note+octave:durée`,
ex. `A4:1 C5:0.5 R:1`) : la position sur le manche et l'accompagnement sont calculés automatiquement.

## Déploiement sur le NAS (Synology DS218)

1. **Récupérer le code** sur le NAS (SSH), par exemple dans `/volume1/docker/` :
   ```bash
   cd /volume1/docker
   git clone https://github.com/MaxSandman/yukulele.git
   cd yukulele
   ```
2. **Lancer le conteneur**, au choix :
   - en SSH : `sudo docker compose up -d` (ou `sudo docker-compose up -d` selon la version de DSM)
   - ou dans **Portainer** → *Stacks* → *Add stack* → coller le contenu de `docker-compose.yml`,
     en remplaçant `./app` et `./nginx.conf` par les chemins complets
     (`/volume1/docker/yukulele/app`, etc.)
3. Ouvrir **http://192.168.1.10:8095** (ou `http://maxsandman.synology.me:8095` depuis l'extérieur si le port est redirigé sur la box).

**Mise à jour** : `git pull` dans le dossier, c'est tout (nginx sert directement les fichiers, pas besoin de redémarrer).

## Activer le micro (accordeur, « J'attends ta note », enregistrement de mélodie) : HTTPS

Les navigateurs n'autorisent le micro que sur une adresse **https://** (ou `localhost`).
Tout le reste de l'appli fonctionne en http. Le plus simple, avec le certificat déjà présent sur le NAS :

**DSM → Panneau de configuration → Portail de connexion → Avancé → Proxy inversé → Créer**
- Source : protocole `HTTPS`, nom d'hôte `maxsandman.synology.me`, port `8443`
- Destination : protocole `HTTP`, nom d'hôte `localhost`, port `8095`

Puis ouvrir **https://maxsandman.synology.me:8443** (redirection du port 8443 sur la box pour un accès extérieur).
Alternative : créer un *Proxy Host* équivalent dans Nginx Proxy Manager avec un certificat Let's Encrypt.

## Tester en local (sans Docker)

```bash
cd app
python3 -m http.server 8000
```
puis ouvrir http://localhost:8000 (le micro fonctionne sur `localhost`).
