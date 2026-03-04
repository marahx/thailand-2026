# 🇹🇭 Thaïlande 2026 — Guide de déploiement

## Architecture

```
iPhone/Android (PWA)
        │
        ▼
   Netlify (héberge le site)
    ├── App React (Vite + PWA)
    ├── Netlify Function /api/chat (clé Anthropic sécurisée)
    │
    ▼
  Supabase (base de données : itinéraire + planning)
```

---

## ÉTAPE 1 — Créer le projet Supabase (5 min)

1. Va sur **https://supabase.com** → crée un compte gratuit
2. Clique **"New Project"** → choisis un nom (ex: `thailand-2026`)
3. Note le **mot de passe** de la base de données
4. Attends que le projet soit prêt (~1 min)

### Créer la table

5. Dans le menu gauche → **SQL Editor**
6. Copie-colle le contenu du fichier `supabase-setup.sql` :

```sql
CREATE TABLE IF NOT EXISTS app_data (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE app_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access" ON app_data
  FOR ALL USING (true) WITH CHECK (true);
```

7. Clique **"Run"** ✅

### Récupérer les clés

8. Menu gauche → **Settings** → **API**
9. Copie :
   - **Project URL** → c'est ton `VITE_SUPABASE_URL`
   - **anon public key** → c'est ton `VITE_SUPABASE_ANON_KEY`

---

## ÉTAPE 2 — Clé API Anthropic (2 min)

1. Va sur **https://console.anthropic.com**
2. Crée un compte → **API Keys** → **Create Key**
3. Copie la clé `sk-ant-api...` → c'est ton `ANTHROPIC_API_KEY`

> ⚠️ Cette clé ne sera JAMAIS visible côté client, elle reste sur le serveur Netlify.

---

## ÉTAPE 3 — Déployer sur Netlify (10 min)

### Option A : Via GitHub (recommandé)

1. Crée un repo GitHub et pousse tout le dossier `thailand-app/`
2. Va sur **https://app.netlify.com** → connecte ton GitHub
3. Clique **"Add new site"** → **"Import an existing project"**
4. Sélectionne ton repo
5. Paramètres de build :
   - **Build command** : `npm run build`
   - **Publish directory** : `dist`
6. Clique **"Deploy"**

### Option B : Sans GitHub (drag & drop)

1. Dans le dossier du projet, lance :
```bash
npm install
npm run build
```
2. Sur Netlify → **"Add new site"** → **"Deploy manually"**
3. Glisse le dossier `dist/` sur la page

### Configurer les variables d'environnement

7. Sur Netlify → **Site settings** → **Environment variables**
8. Ajoute ces 3 variables :

| Variable | Valeur |
|----------|--------|
| `VITE_SUPABASE_URL` | `https://xxxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbG...` |
| `ANTHROPIC_API_KEY` | `sk-ant-api...` |

9. **Redéploie** le site (Deploys → Trigger deploy)

---

## ÉTAPE 4 — Installer sur iPhone (1 min)

1. Ouvre Safari sur ton iPhone
2. Va sur ton URL Netlify (ex: `https://thai-2026.netlify.app`)
3. Appuie sur le bouton **Partager** (carré avec flèche ↑)
4. Choisis **"Sur l'écran d'accueil"**
5. Donne-lui un nom → **"Thai 2026"** → Ajouter

**C'est fait !** 🎉 L'app apparaît comme une vraie app sur ton écran d'accueil.

### Pour Android

1. Ouvre Chrome → va sur ton URL
2. Le navigateur propose **"Installer l'application"** → accepte
3. Ou : menu ⋮ → **"Ajouter à l'écran d'accueil"**

---

## ÉTAPE 5 — Ajouter les icônes (optionnel)

L'app a besoin de 2 icônes PNG dans le dossier `public/` :
- `icon-192.png` (192×192 px)
- `icon-512.png` (512×512 px)

Tu peux utiliser un emoji 🇹🇭 converti en image via https://emoji.supply ou créer un logo personnalisé.

---

## Comment ça marche en résumé

| Fonctionnalité | Hors-ligne | En ligne |
|---|---|---|
| Parcours (itinéraire) | ✅ en cache | ✅ synchro Supabase |
| Planning journées | ✅ en cache | ✅ synchro Supabase |
| Convertisseur devises | ✅ derniers taux cachés | ✅ taux en temps réel |
| Chat assistant | ❌ | ✅ via Netlify Function |

---

## Structure du projet

```
thailand-app/
├── index.html              ← Page HTML principale
├── package.json            ← Dépendances
├── vite.config.js          ← Config Vite + PWA
├── netlify.toml            ← Config Netlify
├── supabase-setup.sql      ← SQL à exécuter sur Supabase
├── .env.example            ← Template des variables
├── public/
│   ├── icon-192.png        ← Icône (à créer)
│   └── icon-512.png        ← Icône (à créer)
├── src/
│   ├── main.jsx            ← Point d'entrée React
│   ├── App.jsx             ← App complète
│   └── supabase.js         ← Client Supabase
└── netlify/
    └── functions/
        └── chat.js         ← Serverless function pour le chat
```

---

## Dépannage

**L'app ne s'installe pas sur iPhone ?**
→ Il faut utiliser **Safari** (pas Chrome). Vérifie que le manifest.json est bien servi (regarde dans les devtools réseau).

**Le chat ne fonctionne pas ?**
→ Vérifie que `ANTHROPIC_API_KEY` est bien dans les variables Netlify et que tu as redéployé.

**Les données ne se sauvent pas ?**
→ Vérifie que la table `app_data` existe dans Supabase et que la policy RLS est bien créée.

**Les taux de change ne se mettent pas à jour ?**
→ L'API gratuite a un rate limit. Les taux par défaut (1 EUR = 37.5 THB) seront utilisés en cas d'erreur.
