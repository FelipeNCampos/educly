$frFile = 'C:\Users\User\Documents\GitHub\educly\public\i18n\lessonContent\fr-lessons.json'
$content = Get-Content $frFile -Raw
$pattern = '(?s)"day1":\s*\{.*?\s*\},\s*("day2":)'
$newDay1 = @"
"day1": {
    "steps": [
      {
        "type": "text",
        "title": "Comment fonctionne ChatGPT",
        "content": "ChatGPT est un programme d'intelligence artificielle entraîné pour comprendre et générer du texte.\n\nIl a été nourri de milliards d'exemples provenant de livres, sites web, articles et conversations. Avec cela, il a appris les modèles du langage humain.\n\nQuand vous écrivez une question, il analyse le contexte et prédit, mot par mot, quelle est la meilleure réponse possible basée sur ces modèles.\n\nIl ne \"sait\" pas les choses comme un humain. Il reconnaît des modèles et répond en fonction de probabilités.\n\nPlus votre commande est bonne, meilleur sera le résultat.\n\nC'est l'une des intelligences artificielles les plus utilisées au monde. Il a dépassé 100 millions d'utilisateurs en seulement 2 mois après son lancement.\n\nAujourd'hui, il est utilisé par des étudiants, des entreprises, des programmeurs, des créateurs de contenu et de grandes sociétés.\n\nIl est intégré dans des outils comme les navigateurs, les applications, les systèmes d'entreprise et les plateformes de productivité.\n\nLes entreprises utilisent l'IA pour réduire le temps de tâche jusqu'à 40% dans les activités administratives et de production de texte."
      },
      {
        "type": "text",
        "title": "Où ChatGPT excelle",
        "content": "ChatGPT se distingue lorsque le travail implique:\n\n- Créer des textes, scripts, emails, publicités et contenus\n- Organiser des idées dispersées en quelque chose de logique et stratégique\n- Aider aux études, résumés et explications\n- Planifier des stratégies de marketing, ventes ou contenu\n- Analyser l'information textuelle et \"relier les points\" entre les données\n- Économiser du temps sur des tâches répétitives ou créatives"
      },
      {
        "type": "text",
        "title": "Où ChatGPT échoue (et ne doit pas être utilisé)",
        "content": "ChatGPT n'est pas adapté pour:\n\n- Diagnostiquer des maladies ou interpréter des examens médicaux\n- Prédire les prix des actions, cryptomonnaies ou résultats futurs avec certitude\n- Exécuter des actions physiques ou prendre des décisions critiques seul\n- Accéder à des informations en temps réel sans outils supplémentaires\n- Remplacer des spécialistes dans des domaines sensibles"
      },
      {
        "type": "text",
        "title": "L'attention n'est pas la conscience",
        "content": "L'IA utilise une 'lampe torche mathématique' pour se concentrer sur ce qui est pertinent dans votre phrase.\n\nSi vous demandez : 'Qui a écrit Dom Casmurro ?', la lampe se concentre sur 'écrit' et 'Dom Casmurro'. Elle ignore le reste pour trouver la connexion la plus probable : Machado de Assis.\n\nCela lui permet de maintenir le sens dans de longues conversations, mais rappelez-vous : c'est juste un calcul de pertinence, pas un réel intérêt pour le sujet."
      },
      {
        "type": "text",
        "title": "🚨 Hallucination : Quand l'IA 'divague'",
        "content": "L''Hallucination' n'est pas une erreur système ; c'est son mode de fonctionnement.\n\nL'objectif de l'IA est d'être convaincante, pas nécessairement véridique. Si vous lui demandez de citer une étude qui n'existe pas, elle peut inventer un titre et des auteurs juste pour vous livrer ce que vous avez demandé.\n\nTraitez l'IA comme un brouillon initial, jamais comme le mot final."
      },
      {
        "type": "quiz",
        "title": "✅ Test rapide",
        "question": "Quand vous demandez à ChatGPT \"Qui a écrit Dom Casmurro ?\", que fait réellement l'IA ?",
        "options": [
          {
            "text": "Elle accède à sa base de données de livres et cherche la bonne réponse",
            "isCorrect": false,
            "explanation": "Non. ChatGPT ne consulte pas une base de données en temps réel."
          },
          {
            "text": "Utilise une \"lampe torche mathématique\" pour se concentrer sur les mots-clés pertinents (\"écrit\" et \"Dom Casmurro\") et trouve la connexion la plus probable",
            "isCorrect": true,
            "explanation": "Correct. Il calcule la réponse la plus probable basée sur des modèles appris."
          },
          {
            "text": "Elle comprend le contexte culturel de la littérature brésilienne et répond avec une connaissance authentique",
            "isCorrect": false,
            "explanation": "Faux. Elle n'a pas de compréhension réelle, seulement des modèles statistiques."
          },
          {
            "text": "Elle cherche sur internet en temps réel la vraie réponse",
            "isCorrect": false,
            "explanation": "Non. Sans outils supplémentaires, elle n'effectue pas de recherches en temps réel."
          }
        ]
      },
      {
        "type": "quiz",
        "title": "✏️ Complétez la phrase",
        "question": "\"L'objectif de l'IA est d'être _______________, pas nécessairement _______________. Si vous lui demandez de citer une étude qui n'existe pas, elle peut inventer un titre et des auteurs juste pour vous livrer ce que vous avez demandé.\"",
        "options": [
          {
            "text": "Rapide / lente",
            "isCorrect": false,
            "explanation": "Il ne s'agit pas de vitesse, mais de paraître convaincante."
          },
          {
            "text": "Convaincante / véridique",
            "isCorrect": true,
            "explanation": "Correct. Elle cherche à sembler convaincante, pas à garantir la vérité absolue."
          },
          {
            "text": "Intelligente / stupide",
            "isCorrect": false,
            "explanation": "Le point principal est convaincante vs véridique."
          },
          {
            "text": "Honnête / malhonnête",
            "isCorrect": false,
            "explanation": "Non. L'idée centrale est convaincante vs véridique."
          }
        ]
      },
      {
        "type": "component",
        "componentName": "MatchWords",
        "props": {
          "title": "🔗 Concept x Signification",
          "description": "Associez chaque concept à sa signification correcte.",
          "pairs": [
            { "left": "Lampe Torche Mathématique", "right": "Mécanisme qui se concentre sur les mots-clés pertinents" },
            { "left": "Hallucination", "right": "Quand l'IA invente des informations pour paraître convaincante" },
            { "left": "Brouillon Initial", "right": "Comment vous devez traiter la réponse de l'IA - jamais comme finale" }
          ]
        }
      }
    ]
  },
  `$1
"@
$newContent = $content -replace $pattern, $newDay1
Set-Content -Path $frFile -Value $newContent -Encoding UTF8
Write-Output "French file updated successfully"
