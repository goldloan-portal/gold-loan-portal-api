# Gold Loan Application & Data Collection Portal — Product Description

Take-home technical assignment: **Full-Stack Developer Intern (Node.js & AI-Assisted)** at **Yellow Metal**, an RBI-licensed NBFC. 24-hour time limit, built with AI coding tools (Claude Code, Cursor, GitHub Copilot). Jira project `GLA` tracks the work ticket by ticket — each ticket's acceptance criteria is the definition of done for that piece.

> **Note on stack/repo names**: the original assignment brief left the backend framework open (Express or NestJS) and named Supabase specifically for Postgres + auth; the actual repos for this project are `gold-loan-portal-api` (Express, MVC + repository — see its own `CLAUDE.md`) and `gold-loan-portal-frontend` (Vite + React), not `gold-loan-assignment-backend`/`-web`. Treat each repo's own `CLAUDE.md` as authoritative for technical/architectural decisions; this document is the product/business brief, not the tech decision record.

## Core Objective

Build a web-based lead intake portal where a **partner** (a gold shop, field agent, or referral business) or a prospective borrower enters gold collateral details and customer info to receive a preliminary gold loan offer. The system validates input, calculates loan eligibility from gold purity and market value, prevents duplicate submissions, and logs every application to a database. A simple admin/partner dashboard lists past submissions.

## Domain Concepts

These must be correct — they're the most heavily weighted part of the grading (see Evaluation Criteria below).

- **LTV (Loan-to-Value)**: the maximum percentage of collateral value a lender may lend against. Capped at **75%** here — an RBI compliance requirement for gold loan NBFCs, not an arbitrary business choice.
- **Purity karat → pure gold weight**: `pureGoldWeight = netWeightGrams * (purityKarat / 24)`.
  Example: 45g net weight at 22K = 45 × (22/24) = **41.25g** pure gold.
- **Gross vs. net weight**: gross weight includes stones/settings; net weight is gold only. **Net must always be ≤ gross** — reject any submission where it isn't.
- **Max eligible loan**: `pureGoldWeight * goldRatePerGram * 0.75` (the 75% LTV cap applied to the pure gold's market value).

## Required API Surface

### `GET /api/v1/loan-schemes`

Returns available loan plans (e.g. _Bullet Repayment Plan_, _Monthly EMI Plan_) with their base interest rates and max LTV caps (75%).

### `POST /api/v1/leads/submit`

Input:

```json
{
  "customerName": "Rahul Sharma",
  "mobileNumber": "9876543210",
  "grossWeightGrams": 50,
  "netWeightGrams": 45,
  "purityKarat": 22,
  "selectedPlanId": "PLAN_BULLET_01"
}
```

Validation & business logic:

- **Field validation**: reject missing/invalid fields. `netWeightGrams` strictly ≤ `grossWeightGrams`. `mobileNumber` must match a valid 10-digit format.
- **Collateral calculation**: compute pure gold weight from karat purity, then max loan eligibility from the 75% LTV cap against the pure gold's market value.
- **Deduplication**: reject the submission with `409 Conflict` if the same `mobileNumber` has submitted within the last **7 days**.
- **Storage**: persist valid applications with status `SUBMITTED`.

### `GET /api/v1/leads`

Returns all submitted leads with their calculated loan amounts and selected plans. `mobileNumber` is masked (e.g. `9876XXXX10`).

## Frontend Flow

A responsive, single-page web portal:

1. **Customer & Gold Details Form** — customer name, mobile number, gross weight (g), net weight (g), purity dropdown (18K/22K/24K).
2. **Dynamic Loan Calculator & Scheme Selection** — live-calculated pure gold weight and maximum eligible loan amount; card options to pick a loan plan (Bullet Repayment vs. Monthly EMI).
3. **Submit & Confirmation** — a submit action calling `/leads/submit`, returning a confirmation view with the generated Application ID.
4. **Admin / Partner Summary View** — a dashboard listing past leads: customer name, masked mobile, net weight, selected plan, calculated loan value.

## Non-Negotiable Constraints

- **Strict validation everywhere.** This is a fintech assignment graded specifically on validation rigor and financial math accuracy.
- **Never skip validation, error handling, or the 409 dedup logic** to save time, even under deadline pressure — prioritize correctness and speed over premature abstraction, not over correctness itself.
- **Every AI-assisted change must be explainable and defensible.** Flag anything non-obvious or risky in generated output so it can be logged in `AI_LOG.md`.

## Submission Deliverables (per the assignment brief)

1. **GitHub repository link** — public or accessible, with a structured `README.md` covering local run instructions (`npm install` / `npm start` in the brief; this project uses `pnpm`, see each repo's own `CLAUDE.md`).
2. **`AI_LOG.md`** (mandatory) documenting:
   - Which AI tools were used (Cursor, Claude Code, GitHub Copilot, ChatGPT, etc.).
   - **2 exact prompts** used to generate form state management or backend validation rules.
   - **1 instance** where AI-generated code was flawed (e.g. incorrect net vs. gross weight logic, an unhandled async error, a flawed regex) and how it was manually audited and fixed.

See each repo's own `CLAUDE.md` → AI Workflow & Prompt Logging for the ongoing convention that feeds this document.

## Evaluation Criteria

| Criteria                | Weight | What's assessed                                                                                                      |
| ----------------------- | ------ | -------------------------------------------------------------------------------------------------------------------- |
| Input Validation & Math | 30%    | Strict net vs. gross weight handling, karat purity calculation, 75% LTV ceiling, valid mobile number regex           |
| Deduplication & Errors  | 25%    | Correct HTTP status codes (`400`, `409`), preventing duplicate entries within 7 days                                 |
| Full-Stack & Speed      | 25%    | Clean, intuitive UI component layout and rapid full-stack delivery using AI coding assistants                        |
| AI Audit & Criticality  | 20%    | Quality of `AI_LOG.md` — proving active auditing and verification of AI-generated output for edge cases and security |
