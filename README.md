# 🛒 Gestão de Vendas Pro

Sistema completo com dados salvos no Firebase (nuvem gratuita).

## 🔥 Passo 1 — Criar projeto no Firebase

1. Acesse https://console.firebase.google.com
2. Clique em "Adicionar projeto" → nomeie → crie
3. No menu lateral: **Firestore Database** → **Criar banco de dados** → Modo de teste → região `southamerica-east1`

## ⚙️ Passo 2 — Credenciais

1. Na tela inicial do projeto, clique no ícone **</>** (Web)
2. Registre o app e copie o `firebaseConfig`
3. Cole em `src/firebase.js` substituindo os `"COLE_AQUI"`

## 🚀 Passo 3 — Rodar localmente

```bash
npm install
npm run dev
```

## 🌐 Passo 4 — Publicar no GitHub Pages

```bash
# 1. Crie repositório em github.com (nome: gestao-vendas)
# 2. Verifique vite.config.js: base: "/gestao-vendas/"

git init
git add .
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/gestao-vendas.git
git push -u origin main

npm run deploy
# No GitHub: Settings → Pages → Branch: gh-pages → Save
```

## 🔒 Regras Firestore (após 30 dias de teste)

No Firebase Console → Firestore → Regras:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```
