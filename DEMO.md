# Helpdesk DevOps Capstone — Live Demonstration Guide

This guide walks you through every step of the final presentation/demonstration (Part O of the curriculum). Follow these steps in order during your live demo or screen recording.

---

## Pre-Demo Checklist

- [ ] Docker Compose is running (`docker compose up -d`)
- [ ] Browser tabs prepared:
  - Tab 1: `http://localhost:3000` (Helpdesk Frontend)
  - Tab 2: `http://localhost:8000/docs` (FastAPI Swagger UI)
  - Tab 3: `http://localhost:8000/metrics` (Prometheus Metrics)
  - Tab 4: GitHub Repo (`https://github.com/Yashwardhan-ed/DevOps-Project`)
  - Tab 5: GitHub Actions (`https://github.com/Yashwardhan-ed/DevOps-Project/actions`)
  - Tab 6: GitHub Packages / GHCR (`https://github.com/Yashwardhan-ed?tab=packages`)
- [ ] Terminal split into 2 panes:
  - Left: Project directory (`/DevOps Projects`)
  - Right: `kubectl` / `docker` monitor

---

## 15-Step Demonstration Script

### Step 1 — Application Frontend (M1, M4)
1. Open `http://localhost:3000`.
2. Point out:
   - Modern dark UI with sidebar, navigation, and KPI stat cards.
   - Click **"+ New Ticket"** in the top right.
   - Enter:
     - **Title**: `Payment gateway timeout on checkout`
     - **Description**: `Stripe webhooks returning 504 gateway timeout`
     - **Priority**: `URGENT`
     - **Assignee**: `DevOps On-Call`
   - Click **"Open Ticket"**.
   - Show the new ticket appear in the table with priority and status badges.
3. Advance the ticket status by clicking the `↻` icon (Open → In Progress → Resolved).
4. Demonstrate status filtering by clicking `Open`, `In Progress`, `Resolved`, `All`.

### Step 2 — REST API & Swagger UI (M1)
1. Open `http://localhost:8000/docs`.
2. Demonstrate interactive OpenAPI/Swagger:
   - Expand `GET /health` → **Try it out** → **Execute** → Show `{"status": "UP"}`.
   - Expand `GET /ready` → **Execute** → Show `{"status": "READY"}` (proves live DB connectivity).
   - Expand `GET /api/tickets/stats` → **Execute** → Show live ticket counts.
   - Point out that there are 5+ REST endpoints (`GET`, `POST`, `PUT`, `DELETE`).

### Step 3 — Database & Alembic Migrations (M1)
1. In your terminal, run:
   ```bash
   docker compose exec postgres psql -U helpdesk -d helpdesk -c "SELECT id, title, priority, status, assignee FROM tickets;"
   ```
2. Show the PostgreSQL table with the tickets you created.
3. Show Alembic migration version:
   ```bash
   docker compose exec postgres psql -U helpdesk -d helpdesk -c "SELECT * FROM alembic_version;"
   ```
4. Show the migration file: `backend/alembic/versions/0001_create_tickets.py`.

### Step 4 — Automated Testing (M2)
1. In terminal, run pytest:
   ```bash
   cd backend && pytest -v
   ```
2. Point out:
   - **10 test cases passing** (well over the required 5).
   - Tests use SQLite in-memory, isolating tests from production database.
   - Tests run before any Docker image is built or promoted.

### Step 5 — Git Commit & Source Control (M3)
1. Make a small visual tweak (e.g., in `frontend/src/main.jsx` or a comment).
2. Commit it:
   ```bash
   git commit -am "chore: trigger CI demo pipeline run"
   git push origin main
   ```
3. Show commit history (`git log --oneline -n 10`) showing clean, meaningful conventional commits.

### Step 6 — CI Pipeline Execution (M5)
1. Switch to GitHub Actions tab.
2. Show the running workflow for the commit.
3. Explain the three stages:
   - **Test job**: Runs pytest and React build.
   - **Build & Scan job**: Multi-stage Docker builds + Trivy container vulnerability scan.
   - **Deploy job**: EKS verification + Helm deployment.

### Step 7 — Container Security Scanning with Trivy (M6)
1. In GitHub Actions, click on **Build, Scan & Push**.
2. Expand **Scan backend image with Trivy** and **Scan frontend image with Trivy**.
3. Explain:
   - Trivy scans both OS packages and application dependencies.
   - It filters for HIGH and CRITICAL vulnerabilities.
   - Highlighting automated security gates in modern DevSecOps pipelines.

### Step 8 — Container Registry / GHCR (M5)
1. Navigate to your GitHub profile packages page:
   `https://github.com/Yashwardhan-ed?tab=packages`
2. Show the two published packages:
   - `devops-project-backend`
   - `devops-project-frontend`
3. Point out that images are tagged with the **Git commit SHA** (not just `latest`), ensuring 100% provenance and traceability from production back to Git source code.

### Step 9 — Infrastructure as Code with Terraform (M7)
1. In terminal or VS Code, show `terraform/main.tf`:
   - AWS VPC module with 2 public + 2 private subnets in `ap-south-1` (Mumbai).
   - NAT Gateway.
   - AWS EKS cluster (`helpdesk-eks`, v1.31) with managed worker node group.
2. Show `terraform/terraform.tfvars.example` (clean template with no committed secrets).
3. Run or show `terraform plan` output:
   ```bash
   cd terraform && terraform init && terraform plan
   ```

### Step 10 — Kubernetes Deployment & Services (M8)
1. In terminal, show Kubernetes objects:
   ```bash
   kubectl get pods -n helpdesk
   kubectl get svc -n helpdesk
   ```
2. Point out:
   - Logical isolation with `namespace: helpdesk`.
   - Backend & frontend running as Deployments with replica sets.
   - Stable internal networking via ClusterIP Services.

### Step 11 — Helm Packaging (M8)
1. Show the Helm chart structure in `helm/taskboard/`:
   - `Chart.yaml` (metadata)
   - `values.yaml` (default configurations)
   - `values-dev.yaml` / `values-prod.yaml` (environment overrides)
   - `templates/` (templated Kubernetes manifests)
2. Run:
   ```bash
   helm list -n helpdesk
   ```

### Step 12 — Ingress Routing (M8)
1. Show `helm/taskboard/templates/ingress.yaml`.
2. Explain routing architecture:
   - Path `/` routes to the React frontend Service (`port 80`).
   - Path `/api` routes to the FastAPI backend Service (`port 8000`).
   - Clients only need one entrypoint hostname (`helpdesk.local`).

### Step 13 — Horizontal Pod Autoscaler / HPA (M8)
1. Inspect HPA:
   ```bash
   kubectl get hpa -n helpdesk
   ```
2. Run the load test helper to demonstrate scaling:
   ```bash
   bash scripts/load-test.sh
   ```
3. Watch HPA respond to CPU pressure:
   ```bash
   kubectl get hpa -n helpdesk -w
   ```

### Step 14 — Observability: Prometheus & Grafana (M9)
1. Show `/metrics` endpoint returning Prometheus metrics:
   ```bash
   curl -s http://localhost:8000/metrics | grep http_requests_total
   ```
2. Show `monitoring/prometheus-values.yaml` and `monitoring/grafana-values.yaml`.
3. Open Grafana:
   - Point out Prometheus scraping `/metrics` via ServiceMonitor every 15s.
   - Show dashboard panels: HTTP requests/sec, p95 latency, and error rate.

### Step 15 — Troubleshooting Lab Simulation (Curriculum)
1. Demonstrate live root-cause analysis:
   ```bash
   # Scenario A: Broken image tag
   kubectl apply -f troubleshooting/broken-image.yaml
   kubectl get pods -n helpdesk
   # Show ImagePullBackOff
   kubectl describe pod -l app=helpdesk-broken-image -n helpdesk | grep -A 3 "Events:"

   # Scenario B: Service label mismatch
   kubectl apply -f troubleshooting/broken-service.yaml
   kubectl get endpoints helpdesk-broken-service -n helpdesk
   # Show <none> endpoints because of selector mismatch
   ```
2. Explain why the failure occurred and how Kubernetes primitives identify it.
3. Clean up troubleshooting pods:
   ```bash
   kubectl delete -f troubleshooting/broken-image.yaml
   kubectl delete -f troubleshooting/broken-service.yaml
   ```

---

## Submission Deliverables Quick Reference

| Module | What to capture / submit |
|--------|-------------------------|
| M1 | Screenshot of running Helpdesk browser UI + Swagger UI |
| M2 | Screenshot of `pytest -v` (10 passed) |
| M3 | Link to GitHub repo + commit history screenshot (≥10 commits) |
| M4 | `Dockerfile`s + screenshot of `docker compose ps` / browser |
| M5 | Link to green GitHub Actions workflow run + GHCR package page |
| M6 | Screenshot of Trivy step in Actions log + 2-3 sentence explanation |
| M7 | `terraform plan` output screenshot + `.tf` files |
| M8 | `kubectl get pods -n helpdesk` + `helm list` screenshot |
| M9 | Screenshot of `/metrics` output + Grafana dashboard |
| M10 | Project `README.md` + Live demo / video link |
