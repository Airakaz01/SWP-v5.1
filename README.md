# Smart Warehousing Platform v5.1 — présentations web

Versions web des présentations de la Smart Warehousing Platform v5.1, publiées avec GitHub Pages.

| Page | Contenu |
|---|---|
| `index.html` | Accueil : regroupe les présentations |
| `details.html` | Présentation détaillée — bilan de projet (10 slides, FR) |
| `one-slide.html` | One-slide — `#1` français, `#2` anglais |
| `guide.html` | Guide utilisateur illustré (12 slides, FR) |

## Navigation

- `←` / `→`, `Espace`, `Début` / `Fin` ; swipe sur écran tactile
- `F` : plein écran ; bouton liste : accès direct à une slide
- Lien direct vers une slide : `guide.html#7`
- Bouton PDF : impression, une slide par page (choisir « Enregistrer au format PDF »)
- Sur mobile, les slides se lisent en défilement vertical

## Structure

```
assets/css/deck.css   habillage des slides (1280 × 720, mis à l'échelle) et barre de navigation
assets/css/site.css   page d'accueil
assets/js/deck.js     moteur de présentation commun
assets/img/           captures de la plateforme (données de démonstration fictives) et aperçus
```

Site statique, sans build : ouvrir `index.html` dans un navigateur suffit.

Les captures d'écran ont été prises sur des jeux de données fictifs ; elles ne contiennent aucune donnée client.
