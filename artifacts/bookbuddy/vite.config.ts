name: Build and deploy Node.js app to Azure Web App - book-buddy

on:
  push:
    branches:
      - main
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest
    permissions:
      contents: read
    steps:
      - uses: actions/checkout@v4

      - name: Install pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 10
          run_install: false

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --no-frozen-lockfile

      - name: Build
        run: pnpm -r --if-present run build
        env:
          NODE_ENV: production
          PORT: "3000"
          BASE_PATH: "/"
          SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}

      - name: Prepare deployment package
        run: |
          mkdir -p deploy/artifacts/api-server
          mkdir -p deploy/artifacts/bookbuddy
          cp -r artifacts/api-server/dist deploy/artifacts/api-server/dist
          cp -r artifacts/bookbuddy/dist deploy/artifacts/bookbuddy/dist

      - name: Upload artifact for deployment job
        uses: actions/upload-artifact@v4
        with:
          name: node-app
          path: deploy/

  deploy:
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Download artifact from build job
        uses: actions/download-artifact@v4
        with:
          name: node-app

      - name: 'Deploy to Azure Web App'
        id: deploy-to-webapp
        uses: azure/webapps-deploy@v3
        with:
          app-name: 'book-buddy'
          slot-name: 'Production'
          package: .
          publish-profile: ${{ secrets.AZUREAPPSERVICE_PUBLISHPROFILE_79F98BEE9968433CBF722123FC0189A3 }}
