# Rapport technique — TaskFlow API

**Étudiant :** Florian Lebon  
**Formation :** ESGI 5ème année  
**Projet :** API RESTful de gestion de tâches (NestJS + TypeORM + PostgreSQL)  
**Dépôt Git :** https://github.com/Yoseinoo/ESGI5-NESTJS

---

## 1. Choix techniques

### Architecture et organisation des modules

Le projet suit l'architecture modulaire imposée par NestJS : chaque domaine métier (`users`, `teams`, `projects`, `tasks`, `comments`) est encapsulé dans son propre module avec contrôleur, service et entité. Cette séparation permet d'isoler les responsabilités et de tester chaque couche indépendamment.

Un module `common/` regroupe les éléments transversaux : `GlobalExceptionFilter` (normalisation des erreurs en `{ statusCode, timestamp, path, message }`), `LoggingInterceptor` (durée et statut de chaque requête), et un helper `createMockRepository` partagé par les tests unitaires.

### Relations entre entités

Le modèle de données reflète les contraintes métier suivantes :

- **User ↔ Team** : relation ManyToMany via une table de jointure `team_members`. Un utilisateur peut appartenir à plusieurs équipes.
- **Team → Project** : OneToMany avec `onDelete: CASCADE` — supprimer une équipe supprime ses projets.
- **Project → Task** : OneToMany avec `onDelete: CASCADE`.
- **Task → Comment** : OneToMany avec `onDelete: CASCADE`.
- **Task → User (assignee)** : ManyToOne nullable avec `onDelete: SET NULL` — supprimer un utilisateur ne supprime pas ses tâches assignées, mais les désassigne.

Le choix `SET NULL` pour l'assignee est délibéré : une tâche sans assigné reste exploitable, alors qu'une suppression en cascade effacerait de l'historique de travail.

### Stratégie d'authentification

Deux stratégies Passport sont combinées :

- **LocalStrategy** : valide email + mot de passe via `UsersService.findByEmailWithPassword()`, seule méthode qui sélectionne `passwordHash` (champ marqué `select: false` dans l'entité).
- **JwtStrategy** : vérifie le token Bearer sur toutes les routes. `JwtAuthGuard` est appliqué globalement dans `AppModule`; le décorateur `@Public()` permet d'exclure certaines routes (login, health check).

Le contrôle d'accès est assuré par `RolesGuard` (RBAC sur `role` extrait du payload JWT) complété par des vérifications de propriété dans `UsersService.update()` — un membre ne peut modifier que son propre profil.

### WebSockets (TP 17)

La `NotificationsGateway` (Socket.io, namespace `/notifications`) authentifie chaque connexion en vérifiant le JWT transmis dans `handshake.auth.token`. En cas d'échec, le client est immédiatement déconnecté. Les clients rejoignent automatiquement une room `user:<id>` personnelle, et peuvent rejoindre des rooms `project:<id>` via l'événement `join:project`. Lorsque l'assigné d'une tâche change, `TasksService.update()` émet `task:assigned` directement vers la room de l'utilisateur concerné.

### Tests

**Tests unitaires (Jest + mocks)** : `UsersService` et `RolesGuard` sont testés en isolation complète via un mock repository (`createMockRepository`) qui simule le comportement de TypeORM sans toucher à la base de données.

**Tests e2e (Supertest + PostgreSQL)** : une base dédiée `taskflow_test` est utilisée. L'application est bootstrappée via `createTestApp()` qui charge `.env.test` et appelle `dataSource.synchronize()` pour créer le schéma. Chaque suite tronque les tables via `cleanDatabase()` avant son exécution. Les fichiers e2e sont exécutés en mode séquentiel (`--runInBand`) pour éviter les conflits sur la base partagée.

---

## 2. Difficultés rencontrées

### Types PostgreSQL non supprimés par `synchronize()`

Lors des tests e2e, le deuxième run échouait avec `duplicate key violates "pg_type_typname_nsp_index"`. L'appel `synchronize(true)` (avec `dropBeforeSync`) supprime les tables mais pas les types enum PostgreSQL. La solution a été de ne jamais passer `true` à `synchronize()` et de se reposer sur `TRUNCATE ... CASCADE` entre les suites de tests pour repartir d'un état propre sans recréer le schéma.

### Race conditions entre suites de tests e2e

Jest exécute les fichiers de tests en parallèle par défaut. Deux suites écrivant simultanément dans `taskflow_test` provoquaient des violations de contrainte unique (emails en double) et des 404 inexplicables. L'ajout du flag `--runInBand` dans le script npm (`jest --config ./test/jest-e2e.json --runInBand`) a résolu le problème en forçant l'exécution séquentielle.

### `passwordHash` exposé dans la réponse POST /users

Le champ `passwordHash` est marqué `select: false` dans l'entité TypeORM, ce qui l'exclut des requêtes `find*`. Cependant, `repository.save()` retourne directement l'objet en mémoire, qui contient le hash. La correction a consisté à appeler `this.findOne(saved.id)` après le `save()`, forçant un rechargement depuis la base sans le champ exclu. Cette même correction a nécessité d'adapter le test unitaire : `repo.findOne` est maintenant mocké deux fois avec `mockResolvedValueOnce` (une fois pour la vérification de doublon email, une fois pour le rechargement post-save).

### `JWT_EXPIRES_IN` non numérique

La variable d'environnement était initialement définie à `1h` (chaîne) alors que le module JWT applique `Number(config.get('JWT_EXPIRES_IN'))`, ce qui produit `NaN` et provoque une erreur 500 au login. La solution est de toujours stocker la durée en secondes (`86400`, `3600`).

### Prisma 7 — ruptures de compatibilité

La migration vers Prisma 7 (branche `feature/prisma`) a révélé deux changements majeurs par rapport aux exemples du TP (écrits pour Prisma 5) :
- Les valeurs d'enum doivent être sur des lignes séparées (la syntaxe inline `{ admin member viewer }` n'est plus valide).
- La propriété `url` dans le bloc `datasource` du schéma n'est plus supportée ; la connexion se configure désormais dans `prisma.config.ts` via `defineConfig`.

---

## 3. Améliorations envisagées

**Implémentation complète des services** : `ProjectsService` et `CommentsService` sont restés à l'état de stubs générés par le CLI NestJS. Avec plus de temps, ils auraient été implémentés avec les mêmes patterns que `UsersService` et `TasksService` (TypeORM, gestion des erreurs, tests unitaires associés).

**Pagination et filtrage** : les endpoints `GET /tasks` et `GET /projects` retournent toutes les entités sans limite. Une pagination par curseur ou par offset, combinée à des filtres (statut, priorité, équipe), serait indispensable en production.

**Refresh tokens** : l'authentification actuelle délivre un token à durée fixe sans mécanisme de renouvellement. L'ajout d'un refresh token (stocké en base, révocable) rendrait le système plus robuste pour des sessions longues.

**Migration complète vers Prisma** : la branche `feature/prisma` pose les bases (`PrismaService`, `PrismaModule`, `UsersPrismaService`) mais ne remplace pas encore TypeORM dans tous les modules. Une migration complète permettrait de bénéficier du typage fort généré par Prisma et de la fonctionnalité `omit` native (disponible en Prisma 7) pour exclure `passwordHash` sans contournement.

**Tests e2e plus exhaustifs** : les suites couvrent les flux auth et users. Les modules `teams`, `projects`, `tasks` et `comments` mériteraient leurs propres fichiers e2e, ainsi que des tests pour les cas limites (cascade de suppression, assignation WebSocket en temps réel).