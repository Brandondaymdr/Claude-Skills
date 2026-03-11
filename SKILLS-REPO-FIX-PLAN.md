# Fix Plan: Clean Skills Repo Setup

## The Problem

Your local `Skills` folder (Desktop/Storage/Claude/Skills) is just a regular folder — no `.git` directory, no connection to GitHub. Your GitHub repo `Claude-Skills` was built separately with a different structure (`Claude-Skills/skills/` wrapper). Every Cowork session starts blind with no way to sync them.

## The Fix: 3 Steps

---

### Step 1: Delete the GitHub Repo

1. Go to **https://github.com/Brandondaymdr/Claude-Skills/settings**
2. Scroll all the way to the bottom → **Danger Zone**
3. Click **"Delete this repository"**
4. Type `Brandondaymdr/Claude-Skills` to confirm
5. Click the delete button

---

### Step 2: Initialize Git in Your Local Skills Folder

Open Terminal on your Mac and run these commands one at a time:

```bash
# Navigate to your local Skills folder
cd ~/Desktop/Storage/Claude/Skills

# Initialize a fresh git repo
git init

# Create a .gitignore to keep things clean
cat > .gitignore << 'EOF'
.DS_Store
*.env
*.secret
__pycache__/
node_modules/
.venv/
EOF

# Stage everything
git add -A

# Make your first commit
git commit -m "Initial commit: all skills from local folder"
```

---

### Step 3: Create the New GitHub Repo and Push

Still in Terminal, still in the same folder:

```bash
# Create the repo on GitHub and push in one command
gh repo create Claude-Skills --public --source=. --remote=origin --push
```

If you don't have `gh` installed, do it manually instead:

1. Go to **https://github.com/new**
2. Name it `Claude-Skills`
3. Leave it **empty** (no README, no .gitignore, nothing)
4. Click **Create repository**
5. Then back in Terminal:

```bash
git remote add origin https://github.com/Brandondaymdr/Claude-Skills.git
git branch -M main
git push -u origin main
```

---

## Done! How It Works Now

After this setup:

- Your local `Skills` folder IS the git repo
- `git push` from that folder goes straight to GitHub
- Cowork sessions that mount this folder will see the `.git` directory and can push/pull directly
- No wrapper folders, no structural mismatch, no confusion

### Daily Workflow for New Skills

When you create or update a skill (either locally or in a Cowork session):

```bash
cd ~/Desktop/Storage/Claude/Skills
git add -A
git commit -m "Add [skill-name] skill"
git push
```

Or just tell Claude in Cowork: *"commit and push my changes"* — it will work because the `.git` repo is right there in the mounted folder.

---

## Optional Cleanup

After confirming everything works, you can delete this plan file:

```bash
rm ~/Desktop/Storage/Claude/Skills/SKILLS-REPO-FIX-PLAN.md
```
