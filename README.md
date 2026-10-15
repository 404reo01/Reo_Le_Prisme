# Reo Le Prisme

**À CV égal, est-ce que tu as les mêmes chances ?**

Tu construis un profil fictif : origine, lieu de résidence, genre et diplôme pour l'emploi ; revenus, composition du foyer et âge pour le logement. Le simulateur estime ensuite tes chances d'obtenir un rappel pour un entretien ou une visite d'appartement, par rapport à un profil de référence.

**→ [reo-le-prisme.netlify.app](https://reo-le-prisme.netlify.app/)**

<!-- Capture ou GIF à ajouter ici -->

## D'où viennent les chiffres

Chaque critère applique un coefficient tiré d'études françaises par testing (envoi de candidatures fictives identiques où seul un critère change) et d'enquêtes nationales :

- DARES, testing sur les discriminations à l'embauche (2016)
- INSEE / INED, enquête Trajectoires et Origines 2 (2022)
- ISM Corum, testings emploi et logement (2021)
- Défenseur des droits (2022) et CNCDH (2021)

Un coefficient de 0,60 signifie 40 % de réponses en moins que le profil de référence. Les critères se combinent, puis le score est borné pour rester réaliste. Les données et leurs sources sont dans `web/data/`.

> C'est une simulation statistique, pas une prédiction individuelle. Le but est de rendre visible un phénomène mesuré, pas de décourager qui que ce soit.

## Stack

- **Next.js 16** (App Router, Server Actions) · **TypeScript** · **Tailwind v4**
- **Three.js** via React Three Fiber pour la 3D
- **Python / FastMCP** : un serveur MCP qui expose les mêmes données statistiques à un agent IA (`mcp-server/`)
- Déployé sur **Netlify**

## Lancer en local

```bash
cd web
npm install
npm run dev
```

---

[Portfolio](https://portfolio-rayan-elouazzani.netlify.app/) · [LinkedIn](https://www.linkedin.com/in/rayan-el-ouazzani-529a86214/)
