# Sentria AI Optimization: Advanced Mathematical Framework

This document details the complete theoretical model underpinning the Sentria Health AI supply chain optimization engine, incorporating Multilevel Probabilistic Forecasting, Safety Stock Optimization, and Multi-Stage Stochastic Optimization.

## 0. Preliminaries

Let:
- $\Omega$ be the underlying probability space
- $(\Omega, F, P)$ a complete probability space

**Time indexed discretely:**
$h \in \{1, \dots, H\}$

**Sites:**
$i, s, d \in \{1, \dots, N\}$

**Drugs:**
$j \in \{1, \dots, J\}$

**Patients:**
$p \in P_i$

We define:
$D_{i,j} = \{D_{i,j}(h) : h = 1, \dots, H\}$
as the stochastic demand process per site and drug.

---

## 1. Multilevel Probabilistic Forecasting Framework

Demand is modeled as a hierarchical Bayesian dynamic state-space model with:
*   Deterministic clinical schedule
*   Probabilistic unscheduled arrivals
*   Temporal latent states
*   Exogenous regressors
*   Hierarchical priors for patient-level heterogeneity

### 1.1 Generative Model

Demand is decomposed:
$$D_{i,j}(h) = \mu_{i,j}(h) + \eta_{i,j}(h)$$

where:

#### 1.1.1 Deterministic Clinical Component
$$\mu_{i,j}(h) = \sum_{p \in P_i} \sum_{t \in T_{p,j}} \mathbb{I}(t_{date} = h) \cdot Q_{t} \cdot A_{p} \cdot R_{i,p}(h) \cdot W_{i,j}(h) \cdot E_{i,j}(h)$$

**New Factors:**

*   **Acuity score model:**
    $$A_p = \sigma(\theta^\top x_p)$$
    with $x_p$ patient features, $\theta$ learned via Bayesian logistic regression.

*   **Readmission / complication hazard:**
    $$R_{i,p}(h) = 1 + \lambda \cdot \exp(\beta^\top u_{i,p}(h))$$

*   **Time-varying seasonality/outbreak factor:**
    $$W_{i,j}(h) = \exp(\gamma_0 + \gamma^\top s(h))$$

*   **Exogenous epidemiology factor:**
    $$E_{i,j}(h) = f(\text{ILI}(h), \text{COVID}(h), \text{temp}(h), \text{mobility}(h))$$
    where $f$ is a Gaussian Process regression output over exogenous inputs.

### 1.2 Stochastic Emergency Component

$$\eta_{i,j}(h) \mid \lambda_{i,j}(h) \sim \text{Poisson}(\lambda_{i,j}(h))$$

with Gamma hyperprior:
$$\lambda_{i,j}(h) \sim \text{Gamma}(\alpha_{i,j}, \beta_{i,j}(h))$$

leading to Negative Binomial demand:
$$\eta_{i,j}(h) \sim \text{NegBin}(\alpha_{i,j}, \beta_{i,j}(h))$$

### 1.3 Temporal Evolution (State-Space Form)

Let latent state $X_{i,j}(h)$ govern emergency demand rate:

$$X_{i,j}(h) = A X_{i,j}(h-1) + B u(h) + \epsilon(h)$$
$$\lambda_{i,j}(h) = \exp(C X_{i,j}(h))$$

Where:
$\epsilon(h) \sim N(0, Q)$
$u(h)$ = exogenous signals

Kalman filtering applied to linearized approximation (EKF/UKF).

### 1.4 Cross-Site Correlation via Copulas

Define marginal CDFs $F_{i,j,h}$.
Cross-site correlation:

$$(D_{1,j}(h), \dots, D_{N,j}(h)) = F^{-1}(C(U_1, \dots, U_N))$$

where:
$C$ is a Gaussian copula for general correlation
or a Clayton / Gumbel copula for tail dependence during outbreaks.

### 1.5 Full Predictive Distribution
$$D_{i,j}(h) \sim F_{i,j}(h)$$

where $F$ is a mixture distribution incorporating:
*   Bayesian posterior uncertainty
*   Emergency overdispersion
*   Cross-site correlation
*   Exogenous uncertainty

---

## 2. Safety Stock Optimization

Compute cumulative variance:
$$\sigma_{i,j}^2 = \sum_{h=1}^H \text{Var}[D_{i,j}(h)]$$

Then:
$$SS_{i,j} = z_\gamma \sigma_{i,j}$$

For chance constraints:
$$P(I_{i,j}(0) + y_{*,i}(j) + x_{i,\text{ext}}(j) \geq D_{i,j}(1:H)) \geq \gamma$$

---

## 3. Multi-Stage Stochastic Optimization

We solve a multi-stage problem with scenario tree $S$.

### 3.1 Objective Function
$$\min \ E_\omega \left[ \sum_{t=1}^T \left( \sum_{i,j} C_{\text{purch}}(j) x_i(j)(t, \omega) + \sum_{s,d,j} C_{\text{trans}}(j) y_{s,d}(j)(t, \omega) + \sum_{i,j} \Phi(z_i(j)(t, \omega)) \right) \right]$$

Where:
$\Phi(z) = C_{\text{stock}} z^2$ (nonlinear safety cost)

Stage-wise decisions depend on scenario tree realization.

### 3.2 Constraints

#### Inventory Flow (Perishable Goods)
Let expiry time be $\tau_j$.
Inventory age indexed by $a$:

$$I_{i,j}^a(t+1) = I_{i,j}^{a-1}(t) - c_{i,j}^a(t)$$

Expired inventory:
$$I_{i,j}^{\tau_j}(t+1) = 0$$

#### Network Flow Conservation
$$I_{i,j}(t+1) = I_{i,j}(t) + \sum_s y_{s,i}(j)(t) - \sum_d y_{i,d}(j)(t) + x_i(j)(t) - D_{i,j}(t) - z_{i,j}(t)$$

#### Capacity Constraints
$$y_{s,d}(j)(t) \leq \text{Cap}_{s,d}(t)$$
$$I_{i,j}(t) \leq \text{Storage}_{i,j}$$

#### Lead Time
$$y_{s,d}(j)(t) \to I_{d,j}(t + L_{s,d})$$

---

## 4. Robust Optimization & CVaR Risk

Define loss $L(\omega)$.

CVaR at level $\alpha$:
$$\text{CVaR}_\alpha(L) = \min_\zeta \left[ \zeta + \frac{1}{1-\alpha} E[(L-\zeta)^+] \right]$$

Model ensures:
$$\min_x \text{CVaR}_\alpha(Z(x))$$

This controls catastrophic shortage risk under distributional ambiguity.

---

## 5. Reinforcement Learning (MDP Formulation)

**State:**
$s_t = (I_{i,j}(t), D_{i,j}(t:t+H), \hat{\theta}, W_{i,j}(t), \text{lead-times})$

**Actions:**
$a_t = (x_i(j)(t), y_{s,d}(j)(t))$

**Transition:**
$s_{t+1} \sim P(\cdot \mid s_t, a_t)$

**Reward:**
$r_t = -(C_{\text{purch}}x + C_{\text{trans}}y + C_{\text{stock}}z^2)$

**Bellman optimality:**
$$V^*(s) = \max_a [r(s,a) + \gamma E[V^*(s')]]$$

Policy optimized via:
*   Soft Actor Critic
*   PPO
*   Q-learning with distributional critics

---

## 6. Model Predictive Control (MPC)

At each time $t$:
1.  Solve constrained optimization over planning horizon $H_{MPC}$
2.  Apply only action $a_t$
3.  Reobserve state
4.  Repeat

MPC reduces sensitivity to forecasting error and lead-time uncertainty.

---

## 7. Structural Causal Modeling

Causal DAG includes:
*   patient acuity $\to$ emergency probability
*   site census $\to$ drug usage
*   epidemiological prevalence $\to$ drug demand
*   staffing shortages $\to$ treatment delays $\to$ shifted demand

**Structural equations example:**
$$D_{i,j}(h) = g(A_p, \text{census}_i(h), \text{epi}(h), U_h)$$

**Counterfactuals:**
$D_{i,j}(h)_{\text{do}(\text{epi}=x)}$
used for shortage-mitigation scenario analysis.

---

## 8. Digital Twin Simulation

The digital twin includes:
*   Agent-based patient arrival model
*   Probabilistic OR scheduling model
*   Supply chain logistics simulator
*   Inventory aging & expiry
*   Vendor stochastic delays
*   Random disruptions (shortages, courier outages)

Simulation validates RL or MPC policies before deployment.

---

## 9. KKT Conditions & Dual Problem

For convex subproblems:

**Lagrangian:**
$$L(x, y, z, \lambda, \mu) = Z + \lambda^\top (Ax - b) + \mu^\top (Cx - d)$$

**KKT conditions:**
*   Primal feasibility
*   Dual feasibility
*   Complementary slackness
*   Stationarity:
    $$\nabla_x Z + A^\top \lambda + C^\top \mu = 0$$

Dual decomposition enables scalable distributed optimization across hospitals.

---

## 10. Real-Time Data Infrastructure

The model presumes:
*   Streaming EMR integration (HL7/FHIR)
*   Incremental Bayesian updating
*   On-device inference for sub-second decisioning
*   Feature stores with SCD type 2 temporal validity
*   Dependency graph for data latency propagation
