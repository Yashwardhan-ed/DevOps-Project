# Helpdesk — DevOps Capstone Project

[![CI/CD Pipeline](https://github.com/Yashwardhan-ed/DevOps-Project/actions/workflows/ci.yml/badge.svg)](https://github.com/Yashwardhan-ed/DevOps-Project/actions/workflows/ci.yml)
[![Docker](https://img.shields.io/badge/Docker-Containers-blue?logo=docker)](https://www.docker.com/)
[![Kubernetes](https://img.shields.io/badge/Kubernetes-EKS-326CE5?logo=kubernetes)](https://kubernetes.io/)
[![Terraform](https://img.shields.io/badge/Terraform-IaC-7B42BC?logo=terraform)](https://www.terraform.io/)
[![Python](https://img.shields.io/badge/Python-FastAPI-3776AB?logo=python)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-Vite-61DAFB?logo=react)](https://react.dev/)

A production-grade, full-stack **Support Ticket Management System** engineered to demonstrate the entire modern DevOps lifecycle: from local containerized development to automated CI/CD security gates, AWS Infrastructure-as-Code (Terraform), Kubernetes orchestration (Helm, Ingress, HPA), and end-to-end observability (Prometheus & Grafana).

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Application Features](#2-application-features)
3. [Prerequisites & System Requirements](#3-prerequisites--system-requirements)
4. [Quickstart — Running Locally with Docker Compose](#4-quickstart--running-locally-with-docker-compose)
5. [Manual Local Development Setup](#5-manual-local-development-setup)
6. [Automated Testing (Pytest)](#6-automated-testing-pytest)
7. [Docker & Containerization](#7-docker--containerization)
8. [CI/CD Pipeline (GitHub Actions)](#8-cicd-pipeline-github-actions)
9. [DevSecOps & Container Scanning (Trivy)](#9-devsecops--container-scanning-trivy)
10. [Infrastructure as Code (Terraform on AWS)](#10-infrastructure-as-code-terraform-on-aws)
11. [Kubernetes Orchestration & Helm](#11-kubernetes-orchestration--helm)
12. [Horizontal Pod Autoscaling (HPA) & Load Testing](#12-horizontal-pod-autoscaling-hpa--load-testing)
13. [Observability (Prometheus & Grafana)](#13-observability-prometheus--grafana)
14. [Troubleshooting Lab Exercises](#14-troubleshooting-lab-exercises)
15. [Live Demonstration Guide](#15-live-demonstration-guide)
16. [Grading Rubric Checklist (100 Points)](#16-grading-rubric-checklist-100-points)

---

## 1. Architecture Overview

```text
Developer Laptop
      │
      ▼
Git / GitHub (main branch)
      │
      ▼
GitHub Actions CI/CD Pipeline
  ├── 1. Test Job: Pytest (10 tests) + React Vite Build
  ├── 2. Build & Scan Job: Multi-stage Docker Builds + Trivy CVE Scanner
  ├── 3. Publish: Push tagged images to GHCR (git commit SHA tag)
  └── 4. Deploy: AWS EKS validation & automated Helm upgrade
              │
              ▼
    Terraform (AWS ap-south-1)
  ├── AWS VPC (2 public, 2 private subnets, NAT Gateway)
  └── AWS EKS Cluster (v1.31) with t3.small Managed Worker Nodes (Free-Tier eligible)
              │
              ▼
         Helm Chart
  ┌───────────┴───────────┐
  ▼                       ▼
Frontend Pods           Backend Pods (HPA Autoscaled 2-6)
React 19 on Nginx       FastAPI on Uvicorn
(Non-root appuser)      (Non-root appuser)
  │                       │
  └───────────┬───────────┘
              ▼
      PostgreSQL 16 Database (Stateful with PVC)
              │
              ▼
   Prometheus (ServiceMonitor scrapes /metrics every 15s)
              │
              ▼
     Grafana Dashboards (Request rate, latency, error rate)
```

---

## 2. Application Features

* **YouTube Dark Mode UI**: Clean, professional interface built with a consistent **Black & Blue color palette** (`#0f0f0f` base, `#181818` card surfaces, and `#3ea6ff` electric blue accents).
* **Real-time Search & Filter**:
  * YouTube-style centered search bar with instant title, description, ID, and assignee search.
  * Interactive pill chips: `All Tickets`, `Open`, `In Progress`, `Resolved`, `Closed`, `Urgent`, `High Priority`, and `My Tickets`.
* **Full CRUD Support Ticket Workflow**:
  * **Create**: Modal dialog with controlled React state, priority selectors (`LOW`, `MEDIUM`, `HIGH`, `URGENT`), and assignee input.
  * **Read**: Formatted table view with ticket badges, timestamps, and assignee avatars.
  * **Update**: Direct inline Status dropdown (`OPEN` → `IN_PROGRESS` → `RESOLVED` → `CLOSED`) and full Edit modal.
  * **Delete**: Confirmation modal and immediate deletion via REST API.
* **Health & Metrics Endpoints**:
  * `GET /health`: Lightweight liveness probe returning `{"status": "UP"}`.
  * `GET /ready`: Readiness probe verifying live database connection before accepting traffic.
  * `GET /metrics`: Machine-readable metrics exposed for Prometheus scraping.
  * `GET /docs`: Interactive Swagger OpenAPI documentation.

---

## 3. Prerequisites & System Requirements

Before running the project, ensure you have the following tools installed:

| Tool | Recommended Version | Verification Command |
|---|---|---|
| **Docker** | 20.10+ | `docker --version` |
| **Docker Compose** | v2.20+ | `docker compose version` |
| **Python** | 3.12+ | `python3 --version` |
| **Node.js & npm** | Node 20+, npm 10+ | `node -v && npm -v` |
| **kubectl** | v1.28+ | `kubectl version --client` |
| **Helm** | v3.12+ | `helm version` |
| **Terraform** | >= 1.7.0 | `terraform version` |
| **AWS CLI** | v2.x | `aws --version` |

---

## 4. Quickstart — Running Locally with Docker Compose

The fastest way to run the full stack (Database + Backend + Frontend) is Docker Compose:

### 1. Start the stack
```bash
docker compose up --build -d
```

> **Note on Port 3000**: If port 3000 is occupied by another application on your system, run:
> ```bash
> FRONTEND_PORT=3001 docker compose up -d
> ```

### 2. Access the Application Services

| Service | URL | Description |
|---|---|---|
| **Helpdesk Frontend** | `http://localhost:3000` *(or 3001)* | Interactive YouTube-style ticket dashboard |
| **FastAPI Swagger Docs** | `http://localhost:8000/docs` | Interactive API documentation |
| **Health Liveness Probe** | `http://localhost:8000/health` | Returns `{"status": "UP"}` |
| **Readiness Probe** | `http://localhost:8000/ready` | Returns `{"status": "READY"}` (DB check) |
| **Prometheus Metrics** | `http://localhost:8000/metrics` | Prometheus metrics feed |

### 3. Check container status
```bash
docker compose ps
```

### 4. Stop the stack
```bash
# Stop containers
docker compose down

# Stop and delete database volumes (clean reset)
docker compose down -v
```

---

## 5. Manual Local Development Setup

If you wish to develop without Docker:

### 1. Start PostgreSQL
Run a local PostgreSQL instance or start only the postgres container:
```bash
docker compose up -d postgres
```

### 2. Backend Setup (FastAPI)
```bash
cd backend

# Create virtual environment
python3 -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure database environment variable
export DATABASE_URL='postgresql+psycopg://helpdesk:helpdesk@localhost:5432/helpdesk'

# Run database migrations
alembic upgrade head

# Start development server
uvicorn app.main:app --reload --port 8000
```

### 3. Frontend Setup (React + Vite)
In a separate terminal:
```bash
cd frontend

# Install Node dependencies
npm install

# Start development server
npm run dev
```

Open `http://localhost:5173` to access the Vite development server.

---

## 6. Automated Testing (Pytest)

The test suite validates API endpoints, business logic, and database operations using an isolated **SQLite in-memory test database** (preventing any corruption of production data).

```bash
cd backend
source .venv/bin/activate
pytest -v
```

### What is tested (10 test cases):
* `test_health`: Validates `/health` returns `200` and `{"status": "UP"}`.
* `test_root`: Validates root endpoint returns service metadata and docs path.
* `test_ready`: Validates `/ready` tests database connectivity.
* `test_create_ticket`: Validates ticket creation with status `OPEN`.
* `test_list_tickets`: Validates ticket listing and array structure.
* `test_get_ticket`: Validates retrieving a single ticket by ID.
* `test_update_ticket`: Validates updating status and assignee.
* `test_stats`: Validates live KPI counts (`open`, `inProgress`, `resolved`, `closed`).
* `test_delete_ticket`: Validates ticket deletion (`204 No Content`).
* `test_ticket_not_found`: Validates 404 response when querying invalid ID.

---

## 7. Docker & Containerization

Both images are built following container security best practices:

* **Non-Root Execution**: Both `backend` and `frontend` images execute under unprivileged users (`appuser`).
* **Multi-Stage Build**: The frontend compiles static assets in a `node:22-alpine` builder and serves them using a stripped-down `nginx:1.27-alpine` runtime.

### Build and test images locally:
```bash
# Build backend
docker build -t helpdesk-backend:local ./backend

# Build frontend
docker build -t helpdesk-frontend:local ./frontend

# Run backend standalone
docker run --rm -p 8000:8000 \
  -e DATABASE_URL='postgresql+psycopg://helpdesk:helpdesk@host.docker.internal:5432/helpdesk' \
  helpdesk-backend:local
```

---

## 8. CI/CD Pipeline (GitHub Actions)

The pipeline is located in [`.github/workflows/ci.yml`](.github/workflows/ci.yml) and automatically triggers on push to the `main` branch.

```text
[Push to main]
      │
      ▼
┌──────────────┐
│   Test Job   │  ──► Python 3.12 + Pytest (10 tests) & Node 22 Vite build
└──────┬───────┘
       │ (Pass)
       ▼
┌──────────────┐
│ Build & Scan │  ──► Docker multi-stage build + Trivy security scan (HIGH/CRITICAL)
│   and Push   │  ──► Push images to GHCR with git commit SHA tag
└──────┬───────┘
       │ (Pass)
       ▼
┌──────────────┐
│  Deploy Job  │  ──► Validate AWS credentials, connect EKS, and deploy via Helm
└──────────────┘
```

### Repository Secrets Setup
Add the following secrets under **Repository → Settings → Secrets and variables → Actions**:

| Secret Name | Description |
|---|---|
| `AWS_ACCESS_KEY_ID` | AWS IAM Access Key with VPC & EKS permissions |
| `AWS_SECRET_ACCESS_KEY` | AWS IAM Secret Access Key |
| `GHCR_PAT` | GitHub Personal Access Token (`write:packages`, `read:packages`) *(Optional: `GITHUB_TOKEN` is used as primary)* |

---

## 9. DevSecOps & Container Scanning (Trivy)

Security scanning is integrated directly into the build pipeline using **Aqua Security Trivy**:

* Scans OS packages and application dependencies for both backend and frontend images.
* Scans are filtered to flag `HIGH` and `CRITICAL` severity vulnerabilities.
* Unfixed vulnerabilities are ignored (`ignore-unfixed: true`) to focus on actionable CVEs.

---

## 10. Infrastructure as Code (Terraform on AWS)

Terraform provisions the complete cloud environment in AWS region `ap-south-1` (Mumbai).

### Resources Provisioned:
* **VPC**: `10.20.0.0/16` CIDR with 2 public subnets (`10.20.101.0/24`, `10.20.102.0/24`) and 2 private subnets (`10.20.1.0/24`, `10.20.2.0/24`).
* **NAT Gateway**: Single NAT Gateway for private subnet outbound internet access.
* **EKS Cluster**: Kubernetes v1.31 cluster named `helpdesk-eks`.
* **Managed Node Group**: 2 to 4 `t3.small` EC2 worker nodes (Free-Tier eligible).

### Provisioning Steps:
```bash
cd terraform

# 1. Create your variables file from the template
cp terraform.tfvars.example terraform.tfvars

# 2. Initialize Terraform providers and modules
terraform init

# 3. Preview execution plan
terraform plan

# 4. Apply and create infrastructure on AWS (~12-15 minutes)
terraform apply -auto-approve

# 5. Configure local kubectl to point to your new EKS cluster
aws eks update-kubeconfig --region ap-south-1 --name helpdesk-eks

# 6. Verify cluster connectivity
kubectl get nodes
```

### Teardown (Avoid Runaway AWS Costs):
```bash
# When evaluation is finished, destroy all resources
terraform destroy -auto-approve
```

---

## 11. Kubernetes Orchestration & Helm

The application is deployed to Kubernetes using a parameterized Helm chart located in [`helm/taskboard/`](helm/taskboard/).

### 1. Create the application namespace
```bash
kubectl apply -f k8s/namespace.yaml
```

### 2. Deploy via Helm
```bash
helm upgrade --install helpdesk ./helm/taskboard \
  --namespace helpdesk \
  --create-namespace
```

### 3. Deploy with Ingress enabled (Dev environment)
```bash
helm upgrade --install helpdesk ./helm/taskboard \
  --namespace helpdesk \
  -f helm/taskboard/values-dev.yaml
```

### 4. Verify Kubernetes Resources
```bash
# Verify pods are Running
kubectl get pods -n helpdesk

# Verify services
kubectl get svc -n helpdesk

# Verify Helm release
helm list -n helpdesk
```

---

## 12. Horizontal Pod Autoscaling (HPA) & Load Testing

The backend Deployment is automatically scaled based on CPU utilization via Kubernetes HPA:

* **Target Utilization**: 60% CPU
* **Min Replicas**: 2
* **Max Replicas**: 6

### Verify HPA status:
```bash
kubectl get hpa -n helpdesk
```

### Run the load test helper to generate traffic:
```bash
bash scripts/load-test.sh
```

Watch the autoscaler scale pods in real time:
```bash
kubectl get hpa -n helpdesk -w
```

---

## 13. Observability (Prometheus & Grafana)

The FastAPI backend exposes native Prometheus metrics at `/metrics`.

### 1. Install kube-prometheus-stack
```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

helm upgrade --install kube-prometheus-stack prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --create-namespace \
  -f monitoring/prometheus-values.yaml
```

### 2. Install Grafana with pre-configured dashboards
```bash
helm repo add grafana https://grafana.github.io/helm-charts
helm repo update

helm upgrade --install grafana grafana/grafana \
  --namespace monitoring \
  -f monitoring/grafana-values.yaml
```

### 3. Access Grafana Dashboard
```bash
# Port-forward Grafana service
kubectl port-forward -n monitoring svc/grafana 3000:80
```
* **URL**: `http://localhost:3000`
* **Username**: `admin`
* **Password**: `helpdesk-admin`

---

## 14. Troubleshooting Lab Exercises

The repository includes deliberately broken manifests to practice Kubernetes failure scenarios:

### Scenario 1 — ImagePullBackOff (Broken Image Tag)
```bash
# 1. Apply broken deployment
kubectl apply -f troubleshooting/broken-image.yaml

# 2. Inspect pods
kubectl get pods -n helpdesk

# 3. Diagnose using describe
kubectl describe pod -l app=helpdesk-broken-image -n helpdesk

# 4. Clean up
kubectl delete -f troubleshooting/broken-image.yaml
```

### Scenario 2 — Service Label Mismatch (No Endpoints)
```bash
# 1. Apply broken service
kubectl apply -f troubleshooting/broken-service.yaml

# 2. Check endpoints (will show <none>)
kubectl get endpoints helpdesk-broken-service -n helpdesk

# 3. Check pod labels
kubectl get pods -n helpdesk --show-labels

# 4. Clean up
kubectl delete -f troubleshooting/broken-service.yaml
```

---

## 15. Verification Screenshots

All evaluation deliverables are captured and mapped to their respective modules:

| # | Topic | Module | Screenshot File | Deliverable Verified |
|---|---|:---:|---|---|
| **1** | **Automated Testing** | `M2` | [`screenshots/1.png`](screenshots/1.png) | 10/10 Pytest test cases passing against isolated in-memory SQLite DB |
| **2a** | **Docker Containers** | `M4` | [`screenshots/2a.png`](screenshots/2a.png) | Multi-stage Docker Compose stack running with healthy PostgreSQL |
| **2b** | **Application UI** | `M1` | [`screenshots/2b.png`](screenshots/2b.png) | Helpdesk Web UI (YouTube Dark Theme, ticket table, priority chips) |
| **2c** | **Prometheus Metrics** | `M9` | [`screenshots/2c.png`](screenshots/2c.png) | Live `/metrics` output scraped via Prometheus FastAPI Instrumentator |
| **3** | **Kubernetes Deployment** | `M8` | [`screenshots/4.png`](screenshots/4.png) | `helm list -n helpdesk` and all 5 pods running with Ingress & HPA |
| **4** | **Autoscaling (HPA)** | `M8` | [`screenshots/7a.png`](screenshots/7a.png) | `kubectl get pods,svc,hpa` showing 2-6 replica HPA scaling |
| **5** | **Prometheus Targets** | `M9` | [`screenshots/7b.png`](screenshots/7b.png) | ServiceMonitor target `helpdesk-backend` reporting `UP` |
| **6** | **Grafana Dashboard** | `M9` | [`screenshots/7c.png`](screenshots/7c.png) | Grafana RED metrics dashboard (Throughput, Latency, Target stats) |
| **7** | **Git Commit History** | `M3` | [`screenshots/8a.png`](screenshots/8a.png) | 10+ conventional commits on GitHub `main` branch |
| **8** | **CI/CD Pipeline** | `M5` | [`screenshots/8b.png`](screenshots/8b.png) | Green 3-stage GitHub Actions workflow (Test, Build/Scan/Push, Deploy) |
| **9** | **Trivy DevSecOps** | `M6` | [`screenshots/8c.png`](screenshots/8c.png) | Aqua Trivy container security audit in CI with zero high/crit CVEs |
| **10** | **GHCR Image Registry** | `M5` | [`screenshots/8d.png`](screenshots/8d.png) | Packages published with immutable Git commit SHA tags |

---

### Visual Verification Gallery

#### Module 1 & 4: Application & Docker Containers
![Application UI](screenshots/2b.png)
*Figure 1: Helpdesk Support Management UI with YouTube Dark aesthetic.*

![Docker Compose](screenshots/2a.png)
*Figure 2: Docker Compose multi-container stack running healthy.*

#### Module 2: Automated Testing (10/10 Passing)
![Pytest Tests](screenshots/1.png)
*Figure 3: Pytest test suite passing 10/10 test cases in 0.11s.*

#### Module 5 & 6: CI/CD Pipeline & Trivy Security Gate
![GitHub Actions Run](screenshots/8b.png)
*Figure 4: 100% Green 3-stage CI/CD pipeline in GitHub Actions.*

![Aqua Trivy Scanner](screenshots/8c.png)
*Figure 5: Aqua Trivy container security scan enforcing 0 High/Critical CVEs.*

![GHCR Registry Packages](screenshots/8d.png)
*Figure 6: GitHub Container Registry with immutable Git commit SHA tags.*

#### Module 8: Kubernetes Orchestration & Helm
![Helm & Kubernetes Resources](screenshots/4.png)
*Figure 7: Helm release deployed with all 5 pods running and HPA autoscaling.*

#### Module 9: Observability (Prometheus & Grafana)
![Prometheus Targets](screenshots/7b.png)
*Figure 8: Prometheus Targets page showing ServiceMonitor instances UP.*

![Grafana Dashboard](screenshots/7c.png)
*Figure 9: Live Grafana dashboard tracking RED performance metrics.*

---

## 16. Live Demonstration Guide

A complete demonstration walkthrough for presentations and grading reviews is documented in [`DEMO.md`](DEMO.md) and [`private_folder/README.md`](private_folder/README.md).

---

## 17. Grading Rubric Checklist (100 Points)

| Module | Topic | Weight | Verification Deliverables | Status |
|---|---|:---:|---|:---:|
| **M1** | Application | 10 pts | FastAPI backend, React YouTube UI, PostgreSQL, Alembic migrations | ✅ Complete |
| **M2** | Testing | 10 pts | 10 Pytest test cases passing, SQLite in-memory isolation | ✅ Complete |
| **M3** | Git & GitHub | 5 pts | Public repository with 10+ conventional commits, clean `.gitignore` | ✅ Complete |
| **M4** | Docker | 10 pts | Multi-stage build, non-root users, working `docker compose` | ✅ Complete |
| **M5** | CI/CD | 15 pts | 3-job GitHub Actions pipeline, green run, commit SHA tags in GHCR | ✅ Complete |
| **M6** | DevSecOps | 5 pts | Trivy container vulnerability scan in pipeline | ✅ Complete |
| **M7** | Terraform | 15 pts | AWS VPC + EKS HCL in `ap-south-1`, clean `terraform.tfvars.example` | ✅ Complete |
| **M8** | Kubernetes & Helm | 15 pts | `helpdesk` namespace, Helm chart, Deployments, Services, Ingress, HPA | ✅ Complete |
| **M9** | Observability | 10 pts | `/metrics` Prometheus endpoint, ServiceMonitor, Grafana values | ✅ Complete |
| **M10** | Presentation | 5 pts | Comprehensive `README.md`, slides in `demo/slides.pdf`, recording script | ✅ Ready |
| **TOTAL** | | **100 pts** | Full DevOps Capstone Implementation | ✅ **100% Complete** |
