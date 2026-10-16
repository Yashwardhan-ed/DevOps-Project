# Helpdesk — DevOps Capstone Project

A full-stack support ticket management system demonstrating the complete DevOps lifecycle: from local development to a monitored Kubernetes deployment on AWS.

## Architecture

```text
Developer
   |
   v
Git / GitHub
   |
   v
GitHub Actions
   |-- pytest (10 test cases)
   |-- React frontend build
   |-- Docker build (backend + frontend)
   |-- Trivy security scan
   `-- Push images to GHCR (ghcr.io/yashwardhan-ed/devops-project-*)
              |
              v
         Terraform
              |
       AWS VPC + EKS (ap-south-1)
              |
              v
            Helm
              |
     +--------+--------+
     |                 |
  Frontend           Backend
  React (Nginx)      FastAPI
     |                 |
     +---------► PostgreSQL
              |
         Prometheus
              |
           Grafana
```

## Application

**Helpdesk** is a support ticket management system with:

- Create, view, update and close support tickets
- Priority levels: LOW / MEDIUM / HIGH / URGENT
- Status flow: OPEN → IN_PROGRESS → RESOLVED → CLOSED
- Live KPI dashboard with ticket counts by status
- Responsive dark UI

## API Endpoints

```
GET    /               Info
GET    /health         Liveness probe
GET    /ready          Readiness probe (DB check)
GET    /metrics        Prometheus metrics

GET    /api/tickets         List all tickets
GET    /api/tickets/stats   Ticket counts by status
GET    /api/tickets/{id}    Get single ticket
POST   /api/tickets         Create ticket
PUT    /api/tickets/{id}    Update ticket
DELETE /api/tickets/{id}    Delete ticket
```

Interactive docs: `http://localhost:8000/docs`

---

## Part B — Run Locally

### Fastest: Docker Compose

Requirements: Docker Desktop / Docker Engine

```bash
docker compose up --build
```

| URL | Service |
|-----|---------|
| http://localhost:3000 | Frontend |
| http://localhost:8000/docs | Backend Swagger |
| http://localhost:8000/health | Liveness |
| http://localhost:8000/metrics | Prometheus metrics |

Stop:
```bash
docker compose down
docker compose down -v   # also removes DB volume
```

### Run Backend Directly

Requirements: Python 3.12+, PostgreSQL

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
export DATABASE_URL='postgresql+psycopg://helpdesk:helpdesk@localhost:5432/helpdesk'
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

---

## Part C — Testing

```bash
cd backend
pytest -v
```

10 test cases cover: health, root, ready, create ticket, list tickets, get ticket, update ticket, stats, delete ticket, and 404 not-found.

---

## Part D — Git & GitHub

```bash
git init
git add .
git commit -m "initial Helpdesk application"
git branch -M main
git remote add origin git@github.com:Yashwardhan-ed/DevOps-Project.git
git push -u origin main
```

---

## Part E — Docker

Build images individually:

```bash
docker build -t helpdesk-backend:local ./backend
docker build -t helpdesk-frontend:local ./frontend
```

---

## Part F — CI/CD (GitHub Actions)

Pipeline triggers on every push to `main`:

1. **test** — `pytest` + React build
2. **build-push** — Docker build → Trivy scan → push to GHCR with commit SHA tag
3. **deploy** — `helm upgrade --install` on EKS

Images are tagged with the Git commit SHA for full traceability.

---

## Part G — Security Scanning (Trivy)

Trivy scans both images for HIGH and CRITICAL CVEs. The pipeline fails if any unfixed vulnerabilities are found.

---

## Part H — Terraform (AWS Infrastructure)

```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars   # fill in your values
terraform init
terraform plan
terraform apply
```

Provisions:
- VPC (`10.20.0.0/16`) with 2 public + 2 private subnets in `ap-south-1`
- NAT Gateway
- EKS cluster `helpdesk-eks` (v1.31) with t3.medium managed node group (2–4 nodes)

Configure kubectl:
```bash
aws eks update-kubeconfig --region ap-south-1 --name helpdesk-eks
```

Destroy when finished:
```bash
terraform destroy
```

---

## Part I — Kubernetes

```bash
# Create namespace
kubectl apply -f k8s/namespace.yaml

# Deploy via Helm
helm upgrade --install helpdesk ./helm/taskboard \
  --namespace helpdesk \
  --create-namespace

# With Ingress enabled (dev)
helm upgrade --install helpdesk ./helm/taskboard \
  -n helpdesk \
  -f helm/taskboard/values-dev.yaml
```

---

## Part J — Verify Kubernetes

```bash
kubectl get pods -n helpdesk
kubectl get svc -n helpdesk
kubectl get hpa -n helpdesk
helm list -n helpdesk
```

---

## Part K — Monitoring

Install `kube-prometheus-stack`:
```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

helm upgrade --install kube-prometheus-stack prometheus-community/kube-prometheus-stack \
  -n monitoring --create-namespace \
  -f monitoring/prometheus-values.yaml
```

Install Grafana:
```bash
helm upgrade --install grafana grafana/grafana \
  -n monitoring \
  -f monitoring/grafana-values.yaml
```

Access Grafana (port-forward):
```bash
kubectl port-forward -n monitoring svc/grafana 3001:80
# Open: http://localhost:3001
# Login: admin / helpdesk-admin
```

---

## Part L — Load Testing (HPA Demo)

```bash
bash scripts/load-test.sh
kubectl get hpa -n helpdesk -w
```

---

## Part M — Troubleshooting Lab

```bash
# Broken image scenario
kubectl apply -f troubleshooting/broken-image.yaml
kubectl get pods -n helpdesk
kubectl describe pod <pod-name> -n helpdesk

# Broken service (label mismatch)
kubectl apply -f troubleshooting/broken-service.yaml
kubectl get endpoints -n helpdesk
kubectl get pods --show-labels -n helpdesk
```

---

## Repository Structure

```text
DevOps-Project/
├── frontend/                 # React + Vite + Nginx
├── backend/                  # FastAPI + SQLAlchemy + Alembic
│   ├── app/                  # models, schemas, routes, config, db
│   ├── tests/                # pytest test suite (10 tests)
│   └── alembic/              # DB migration: create tickets table
├── docker-compose.yml        # Full local stack
├── .github/workflows/ci.yml  # GitHub Actions CI/CD pipeline
├── terraform/                # AWS VPC + EKS infrastructure
├── helm/taskboard/           # Kubernetes Helm chart (helpdesk)
├── k8s/                      # Namespace manifest
├── monitoring/               # Prometheus + Grafana Helm values
├── troubleshooting/          # Broken manifests for lab exercises
└── scripts/                  # Load test helper
```

---

## Grading Checklist

| Module | Points | Status |
|--------|--------|--------|
| M1 — Application | 10 | ✅ FastAPI + React + PostgreSQL |
| M2 — Testing | 10 | ✅ 10 pytest cases |
| M3 — Git/GitHub | 5 | ✅ Public repo + .gitignore |
| M4 — Docker | 10 | ✅ Multi-stage, non-root users |
| M5 — CI/CD | 15 | ✅ 3-job GitHub Actions pipeline |
| M6 — DevSecOps | 5 | ✅ Trivy scan HIGH/CRITICAL |
| M7 — Terraform | 15 | ✅ VPC + EKS, tfvars.example |
| M8 — Kubernetes/Helm | 15 | ✅ Helm chart, HPA, Ingress |
| M9 — Monitoring | 10 | ✅ Prometheus + Grafana |
| M10 — Documentation | 5 | ✅ This README |
| **Total** | **100** | |
