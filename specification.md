# Consulting Platform — Application Specification
### Version 1.0 — March 2026 — Draft for Review

*A platform to support strategy consultants across the full project lifecycle*

---

## Table of Contents

1. [Introduction & Purpose](#1-introduction--purpose)
2. [Context: The Work That Produced This Specification](#2-context-the-work-that-produced-this-specification)
3. [Application Modules — Overview](#3-application-modules--overview)
4. [Module 2: Intelligence Engine — Detailed Specification](#4-module-2-intelligence-engine--detailed-specification)
5. [Module 3: Framework & Analysis Studio — Detailed Specification](#5-module-3-framework--analysis-studio--detailed-specification)
6. [Module 5: Recommendation & Roadmap Engine — Detailed Specification](#6-module-5-recommendation--roadmap-engine--detailed-specification)
7. [Core Data Model](#7-core-data-model)
8. [Key Workflows](#8-key-workflows)
9. [Non-Functional Requirements & Constraints](#9-non-functional-requirements--constraints)
10. [Next Steps](#10-next-steps)

---

## 1. Introduction & Purpose

### 1.1 Background

This document specifies the requirements for a software application designed to support strategy consultants across the full lifecycle of client engagements. The specification has been derived from analysis of real consulting projects — specifically a market strategy project for a Danish insurance company (GF Forsikring) and a *målbillede* (target operating model) project for their claims division — and is intended to capture the full range of work consultants perform from engagement setup to final board-level presentation.

The application replaces or augments many of the manual, fragmented, and time-intensive activities that currently consume consultant capacity: desk research compiled across disparate sources, qualitative interview coding performed in Word documents or spreadsheets, competitive benchmarking rebuilt from scratch on every project, and presentation narratives assembled manually from disconnected analysis artefacts.

### 1.2 The Problem This Solves

Consulting work generates enormous amounts of structured knowledge — competitor data, interview transcripts, trend analyses, benchmarks, frameworks, recommendations — but this knowledge is almost never reused systematically. Every project starts largely from scratch. Every presentation severs the link between the data and the claim. Every recommendation exists only in slides, not in a structured form that can be traced, updated, or built upon.

Specifically, the application addresses six recurring pain points observed in the source projects:

- **Research is duplicated** — competitive profiles and trend analyses are rebuilt on each engagement even when the underlying market is the same.
- **Interview data is unstructured** — transcripts sit in notebooks or documents with no systematic coding, synthesis, or traceability.
- **The reasoning chain is broken** — a claim in a presentation cannot be traced back to the data or interviewee that supports it.
- **Frameworks are one-offs** — tools like dilemma canvases, scenario matrices, and operating model delta tables are recreated from scratch each time.
- **Recommendations float free** — roadmap items and KPI targets are not linked to the strategic logic that produced them.
- **Client collaboration is ad-hoc** — meeting notes, decisions, and open questions are scattered across emails and chat threads.

### 1.3 Design Philosophy

The core architectural principle of the application is that the consulting engagement is a **graph of linked reasoning** — not a sequence of documents. Sources connect to findings. Findings connect to insights. Insights connect to recommendations. Recommendations connect to roadmap initiatives and KPIs. The presentation is one rendering of that graph, not the primary artefact.

> **Core Principle:** When a client challenges a conclusion in the boardroom, the consultant should be able to trace it back through every assumption to the original source — in seconds, not hours.

A second design principle is that the application should support the **actual micro-methodology** of consulting work, not an idealised version of it. This means supporting the messy, iterative nature of how strategy is built: hypotheses are formed early and updated as evidence accumulates; interview themes shape the dilemma framework before the scenarios are written; scenarios are refined during working sessions with clients.

---

## 2. Context: The Work That Produced This Specification

### 2.1 Source Projects

This specification was derived from two live consulting projects conducted for GF Forsikring (a Danish mutual insurance company) in early 2026. Both projects were led by H&B, a Danish strategy consultancy operating as part of the Eraneos Group. Analysing these projects allowed us to reverse-engineer the actual workflow of strategy consultants and identify the specific application capabilities needed to support it.

#### Project 1: Market Strategy Inspiration — GF × H&B

A strategic inspiration session focused on the future of the Danish insurance market. The consultants produced analysis across three domains:

- **Trend analysis** — Seven macro-trends mapped across Definition, Impact, Uncertainty, and Insurance Implications: Agentic AI, Extreme Automation & STP, Hyperpersonalisation, Open Finance, Embedded Insurance, Legacy Modernisation, and Cyber Risk & Digital Trust.
- **Competitive intelligence** — Detailed profiles of five national competitors (Tryg, Sampo/If/Topdanmark, ABG, Gjensidige, GF itself) and three international benchmarks (Lemonade, Aviva, Zurich) — each with strategy, KPIs, strengths, and weaknesses.
- **Distribution strategy** — Ten embedded insurance opportunities, three European distribution models, a digital club digitalisation concept, and a three-horizon technology roadmap.

The output was a 20-slide presentation for GF's top management, delivered on 4 March 2026.

#### Project 2: Målbillede for Skadehjælp 2030–2035

A short, intensive strategy project (approximately six weeks) to produce a target operating model for GF's claims department (*Skadehjælp*) with a 2035 horizon. This project followed a structured four-phase methodology:

- **Phase 1 — Mobilisation** (28 Jan – 2 Feb): Scope definition, ambition level, success criteria, stakeholder mapping, planning.
- **Phase 2 — Analysis** (2–13 Feb): Interviews with 11 stakeholders (6 internal, 5 external), market/technology trend analysis, competitive benchmarking, scenario development, design principles.
- **Phase 3 — Target Picture Working Sessions** (13–20 Feb): Two half-day working sessions with the client team to qualify scenarios, resolve dilemmas, and define the recommended direction.
- **Phase 4 — Consolidation** (20 Feb – 11 Mar): Final presentation for the Board of Directors and Executive Management Team, including the recommended scenario, six design principles, operating model delta, three-phase dependency roadmap, and a KPI architecture.

The recommended outcome was the *Nærværende og Digital* (Present and Digital) scenario: 80% automation of claims volume, freeing capacity for 20% human empathy in complex cases, with the future employee role defined as *agentleder* — supervising 3–4 AI agents rather than processing cases manually.

### 2.2 The Six Types of Work Consultants Perform

Analysing these two projects, we identified six distinct types of work that any strategy consulting engagement requires. These map directly to the six application modules:

| Work Type | Description & Source Evidence |
|---|---|
| **Discovery & Framing** | Understanding the client's strategic context, scope, and success criteria before analysis begins. In the målbillede project this was Phase 1 (Mobilisation): establishing ambition level, identifying stakeholders, defining what decisions the board needed to make. |
| **Market & Competitive Intelligence** | Structured research on competitors and market dynamics. In Project 1 this produced the five-company national competitor matrix and three-company international benchmark. Each entry required data collection across multiple sources, normalised into a consistent schema. |
| **Qualitative Research & Synthesis** | Conducting structured interviews, coding transcripts, and synthesising findings into strategic insights. In the målbillede project, 11 interviews (6 internal + 5 external) were conducted and synthesised into the "What we heard" slide and the dilemma framework. |
| **Framework & Strategic Analysis** | Applying structured thinking tools to raw intelligence. In Project 2 this produced nine binary design principle dilemmas, three strategic scenarios with consistent fields, six design principles with dependencies, and the operating model delta table. |
| **Recommendation & Roadmap** | Translating analysis into actionable output. In Project 2 this was the recommended scenario with rationale, the three-phase dependency roadmap (eight numbered prerequisites), and the KPI architecture across three tiers. |
| **Narrative & Presentation** | Assembling the reasoning chain into a coherent story for a specific audience. Both projects culminated in board-level presentations with a clear arc: context → insights → dilemmas → recommendation → next steps. |

### 2.3 The Consulting Workflow Is Non-Linear

A critical observation from the source projects is that consulting work does not proceed as a clean sequence of phases. The workflow is deeply iterative:

- Interview insights (Phase 2) retroactively changed the scope framing established in Phase 1
- Client decisions in working sessions (Phase 3) invalidated scenarios already used to draft slide content
- Competitive data gathered late in Phase 2 shifted the recommended position on two dilemmas
- KPI targets defined in Phase 4 required re-examination of the scenario comparison to confirm internal consistency

The application must be designed to handle this retroactive, non-linear nature of work — not assume a clean left-to-right progression.

---

## 3. Application Modules — Overview

The application is structured into six modules, each corresponding to a type of consulting work. The modules are **not sequential stages** — they are concurrent workspaces that share a common underlying data model. A finding created in Module 2 can be referenced in a hypothesis in Module 3, cited in a recommendation in Module 5, and rendered in a slide in Module 4, with full traceability preserved throughout.

---

### Module 1: Engagement Workspace
*The root container for all project knowledge and coordination*

- Client profile: strategy documents, financial data, org structure, known stakeholders
- Engagement brief with scope boundaries, ambition level, and success criteria
- Hypothesis board: explicitly stated working hypotheses with status (confirmed / rejected / open)
- Shared timeline and milestone tracker across phases
- Team roles and access control
- Version history of all deliverables

---

### Module 2: Intelligence Engine
*Research, interview analysis, and synthesis of external knowledge*

- Competitive intelligence: automated profiling from public sources, structured KPI extraction
- Trend radar: continuous monitoring of sources classified against a configurable taxonomy
- International benchmark library: case studies with structured fields and applicability ratings
- Qualitative Research System: interview planning, capture, coding, synthesis, and quote management
- Source traceability: every data point links back to its origin
- Contradiction detector: surfaces where sources or interviewees diverge

---

### Module 3: Framework & Analysis Studio
*Structured tools for turning raw intelligence into strategic insight*

- Segmentation model builder: configurable layers with data field mapping
- Financial modelling: linked assumptions and scenario calculations
- Strategic Dilemma Canvas: binary axes with evidence per pole and position marker
- Scenario Builder: 3-scenario structure with consistent fields and comparison matrix
- Operating Model Delta: from→to table across configurable dimensions
- Design Principles Tracker: cards with rationale, dependencies, and RAG status

---

### Module 4: Narrative & Presentation Builder
*Output layer deeply integrated with the analysis layer*

- Story arc builder: drag sections into logical flow (context → insight → dilemma → recommendation)
- Slide canvas with live links to underlying data — changing a number in the model updates the slide
- Client brand template management
- Confidence scoring: flags claims lacking sourced evidence
- Audience variants: same analysis rendered differently for board vs. management team

---

### Module 5: Recommendation & Roadmap Engine
*From insight to initiative to implementation plan*

- Multi-horizon roadmap builder (short / medium / long term) with configurable horizons
- Initiative cards: owner, dependencies, estimated effort, risk level, linked evidence
- Dependency mapping: visual graph showing prerequisite relationships between initiatives
- Prioritisation matrix: impact vs. effort vs. urgency
- KPI Architecture: three-tier model (strategic / tactical / operational) with baselines and trajectories
- KPIs linked to design principles and roadmap initiatives

---

### Module 6: Client Collaboration Layer
*Managing the dialogue with the client throughout the engagement*

- Shared review portal: clients comment on interim outputs
- Meeting preparation: auto-generated agenda, pre-read summaries, discussion questions
- Decision log: what was agreed, challenged, or deferred in each session
- Open questions tracker: linked to specific hypotheses or dilemmas
- Feedback loop: client input flows back into the hypothesis board

---

## 4. Module 2: Intelligence Engine — Detailed Specification

Module 2 is the most complex module and the one most directly supported by evidence from the source projects. It consists of two sub-systems: the **Desk Research Engine** and the **Qualitative Research System**. Both feed the same underlying knowledge graph.

---

### 4.1 Desk Research Engine

#### 4.1.1 Competitive Intelligence

The competitive intelligence component must support the creation and maintenance of structured competitor profiles. Each profile contains:

- **Identity**: company name, market, ownership type (listed / mutual / private), geographic scope
- **Strategy summary**: stated strategic direction, key initiatives, differentiators
- **Financial KPIs**: combined ratio, cost ratio, customer satisfaction score, ROE, market share — with target values and time horizon
- **Strengths and weaknesses**: structured assessment with supporting evidence
- **Source log**: all data points linked to their origin document or URL with date

The system must support **comparison views** across multiple competitors on any KPI dimension. In the GF project, consultants needed to compare combined ratio trajectories across five companies simultaneously. The application should make this a native operation, not a manual spreadsheet exercise.

> **From the source project:** The Project 1 competitor matrix compared Tryg (CR 81%, cost 13.5%, NPS 72.7), Sampo/If (CR 84%, cost 17%), ABG (CR 87%, cost 18.3%), Gjensidige (CR 83.4%, cost 12.7%, ROE 27.3%), and GF (CR 89.8%, NPS 81.2) — each with strategy narrative, financial targets, and strengths/weaknesses. This matrix was rebuilt from scratch; the application should make it reusable across engagements.

#### 4.1.2 Trend Radar

The trend radar component maintains a living database of market and technology trends relevant to the consulting firm's practice areas. Each trend entry contains:

- Name and definition
- Impact rating: High / Medium / Low
- Uncertainty rating: High / Medium / Low
- Sector implications: configurable per engagement (e.g. "Significance for insurance claims")
- Source citations with date
- Related trends and dependencies

In Project 1, seven trends were mapped: Agentic AI, Extreme Automation & STP, Hyperpersonalisation, Open Finance, Embedded Insurance & Ecosystems, Legacy Modernisation, and Cyber Risk & Digital Trust. In Project 2, nine trends were mapped for the claims context (adding Computer Vision & Remote Assessment, Conversational AI & Omnichannel, Predictive Analytics & Fraud, Sustainable Claims, and Climate Adaptation). The application's trend library should allow the same trend to be re-used with **different sector-specific implications** across engagements.

#### 4.1.3 International Benchmark Library

The benchmark library holds structured case studies of companies — typically international analogues — that illustrate strategic choices relevant to the client's situation. Each entry contains:

- Company name, geography, sector
- Strategy description and strategic position
- Key metrics and performance indicators
- Lessons for the client: explicitly stated "what can [client] learn?"
- Applicability rating for the current engagement

> **From the source projects:** Benchmarks used across both projects included Lemonade (AI-native insurer, 3-second claims record, 75+ NPS), Aviva (hybrid AI + human, 10× faster damage assessment via computer vision), Zurich (bionic claims, human-in-the-loop agentic AI), Achmea/Interpolis (bancassurance via Rabobank, 90%+ digital claims), and HUK-Coburg (dual-track: 700+ physical offices + HUK24 digital brand with 2M+ customers). These are **reusable assets** that should not need to be rebuilt for every financial services engagement.

---

### 4.2 Qualitative Research System

This is the most distinctive component of Module 2 and the one least served by existing tools. It supports the complete workflow of stakeholder interviews — from planning through to strategic synthesis.

#### 4.2.1 Interview Planning & Stakeholder Mapping

Before interviews begin, the application supports structured planning:

- **Stakeholder map**: classify each interviewee by role (internal / external), seniority, perspective angle, and which strategic questions they are best placed to answer
- **Coverage matrix**: a visual view of which strategic questions are covered by which interviewees — identifying gaps before the schedule is finalised
- **Interview guide generator**: produces a tailored guide for each interviewee based on their profile and the engagement's hypothesis set. A guide for an internal claims director differs substantially from one for an external InsurTech expert.
- **Scheduling and reminder management**
- **Pre-interview briefing pack**: auto-assembled from the engagement's knowledge base (client background, relevant competitor data, working hypotheses)

> **From the source project:** The målbillede project interviewed 11 stakeholders — 6 internal (including the EMT and directors) and 5 external experts. The final presentation contained a dedicated slide: *"11 stemmer fra frontlinjen: vi har talt med dem, der kender skaderejsen indefra og udefra"* (11 voices from the frontline). Planning coverage systematically, and ensuring no critical perspective is missing, is currently done manually.

#### 4.2.2 Interview Capture

During and immediately after each interview, the application supports structured capture:

- **Structured note-taking** with predefined topic tags aligned to the engagement's hypothesis set and dilemma framework
- **Audio transcription** with speaker identification
- **Quote extraction**: flagging verbatim quotes for potential use in presentation slides, with source attribution preserved
- **Initial impressions field**: the interviewer's unstructured reaction immediately after the session, before analysis begins

#### 4.2.3 Qualitative Coding Engine

This is the analytically most demanding component. After all interviews are captured, the system must support systematic qualitative analysis:

- **Coding taxonomy**: a hierarchical set of codes aligned to the engagement's strategic questions. In the målbillede project the natural coding framework was the dilemma set (Automation vs. Human Proximity, Invest Early vs. Wait for Maturity, etc.)
- **Code application**: assign one or more codes to each segment of transcript text, with the ability to apply codes across all transcripts simultaneously
- **Frequency and sentiment analysis per theme**: how many interviewees raised this theme, and with what sentiment (positive / negative / ambivalent)
- **Contradiction detector**: surfaces where internal and external voices diverge on the same theme
- **Cross-tabulation**: view theme × interviewee role — do internal stakeholders see the technology barrier differently from external experts?
- **Synthesis generator**: produces a structured "What we heard / What it means / What it implies" narrative per theme, drawing on coded segments

> **From the source project:** The final presentation contained a "11 voices from the frontline" slide with five representative quotes across themes: the most important insight, technology vs. human balance, customer experience, organisational change required, and GF's biggest opportunity or threat. Generating these representative quotes systematically from coded data — rather than relying on consultant recall — is a core application capability.

#### 4.2.4 Dilemma Translation

One of the most distinctive outputs of the qualitative analysis phase is the translation of messy interview data into crisp strategic dilemmas. The application supports a structured promotion step:

- Themes identified in the coding phase can be **promoted to named dilemmas**
- Each dilemma has a binary axis with labelled poles (e.g. "Full Automation" ↔ "Human Contact")
- Supporting evidence from both interviews and desk research is attached to each pole
- A "current client position" marker can be placed on the axis
- Dilemmas are **linked to the scenarios** they define in Module 3

> **From the source project:** Nine design principle dilemmas were defined covering: degree of automation, service position (proactive vs. reactive), relationship model (Batman vs. Coach), organisation (product-based vs. customer-based), decision basis (algorithms vs. humans), sustainability, product strategy, claims steering, and risk appetite. Each had a left-pole and right-pole label with supporting rationale. This structure was built manually from interview notes; the application should make the coding-to-dilemma pathway explicit and traceable.

---

## 5. Module 3: Framework & Analysis Studio — Detailed Specification

### 5.1 Strategic Dilemma Canvas

The dilemma canvas is a reusable artefact type that appears consistently across strategy projects. It allows consultants to take raw analytical tensions and structure them into a form suitable for client discussion and decision-making.

Each dilemma contains:

| Field | Description |
|---|---|
| Dilemma name | Short, memorable label |
| Left pole | Label and description for one extreme |
| Right pole | Label and description for the other extreme |
| Rationale per pole | Why a client might choose this direction |
| Risks per pole | What the client gives up by choosing this direction |
| Supporting evidence | Linked quotes, competitor examples, trend data |
| Current position marker | Where the client sits today on the axis |
| Recommended position marker | Where the consulting team recommends (optional) |
| Scenario links | Which scenarios are defined in part by this dilemma |

> **From the source project:** The målbillede project used this structure explicitly. Example: *"Automation vs. Human Contact"* — Left pole: "Full Automation — end-to-end AI-driven flows, 100% automation for simple claims"; Right pole: "Human Contact — personal relationships and presence as the core of the claims experience." Each pole had a specific risk for GF and a stated rationale. Nine such dilemmas were defined across the project.

### 5.2 Scenario Builder

The scenario builder supports the creation and comparison of strategic scenarios. Each scenario is defined by a consistent set of fields:

| Field | Description |
|---|---|
| Scenario name | Short, evocative label |
| What | The model described in plain language |
| Who would choose this | Which competitors or analogues have adopted this direction |
| Advantages for the client | Why this is an attractive option |
| Risks for the client | What could go wrong, or what is given up |
| Dilemma positions | For each dilemma in the canvas, which pole this scenario occupies |
| Recommendation status | Recommended / Possible / Not recommended |

The **comparison matrix view** shows all scenarios side-by-side on all dilemma dimensions, making it immediately apparent why the recommended scenario is preferred over the alternatives.

> **From the source project:** Project 2 defined three scenarios: *"Efficiency First"* (Tryg/Gjensidige model — scale and efficiency, risks losing GF's DNA and competing on Tryg's terms with one-fifth of the resources), *"Nærhed Først"* (human presence first — not financially scalable at 50% volume growth without proportional FTE increase), and *"Nærværende og Digital"* (the recommended scenario — automate volume to fund intimacy, 80/20 model). The recommendation was supported by explicit risk statements for each alternative.

### 5.3 Operating Model Delta

The operating model delta is a structured from→to table that describes the transformation of an organisation across key dimensions. It is a reusable template with configurable dimensions.

**Standard dimensions** (as used in Project 2):

| Dimension | Current State (2026) | Future State (2030–2035) |
|---|---|---|
| Organisation | Product-split (car, home, accident in silos) | One Skadehjælp — flexible teams organised by complexity |
| Employee role | Product specialist who processes cases | Empathetic agent leader: supervises 3–4 AI agents, makes professional judgements |
| Competencies | Knowledge of GF's products | Knowledge of insurance, member behaviour, data and AI |
| Case handling | Manual assessment and document handling | 80% digitally driven; humans on 20% complex cases |
| Decision authority | Central control, narrow mandate to employees | Decentral autonomy with data-driven safety net |
| Member contact | Reactive — the member calls us | Proactive — we contact the member before the claim |
| Channels | Telephone-primary, separate digital channel | Omnichannel — AI chat, app, telephone, video as one flow |
| Quality assurance | Spot checks, SLA on telephone time | Real-time AI monitoring, gennemløbstid, Right First Time |
| Governance | FTE-based, SLA-focused | Budget-based, outcome-focused (CSAT, gennemløbstid) |

Each dimension entry contains: dimension name, current state description, future state description, key enablers required, and dependencies on other dimensions or roadmap initiatives.

> **From the source project:** The single most transformative row was the employee role shift: from "Product specialist who processes cases" to "Empathetic agent leader: supervises 3–4 AI agents, makes professional judgements — not a case processor." Having this in a structured form (not just prose) means it can be directly linked to the competency development initiatives in the roadmap.

### 5.4 Design Principles Tracker

Design principles are the "corner flags" that ensure all future decisions pull in the same direction. They emerge from the synthesis of analysis, interviews, and scenario work, and they persist as governance artefacts throughout the implementation phase.

Each design principle card contains:

| Field | Description |
|---|---|
| Principle name | Short, actionable label |
| Rationale | The "because..." statement explaining why this principle is necessary |
| Dependencies | What data, capabilities, or decisions are needed for this principle to be actionable |
| RAG status | On Track / In Progress / Missing |
| Linked KPIs | Which KPIs measure adherence to this principle |
| Linked initiatives | Which roadmap initiatives deliver the required enablers |

> **From the source project:** The six design principles from Project 2 were: *Intimacy & Presence, Fast & Accessible, Risk Appetite & Autonomy, One Member Experience, Professional Responsibility & Proactivity*, and *Data-Driven Culture*. Each had a "because..." rationale and a dependency list. The RAG status was tracked against the roadmap — indicating which principles were already operational, which were in progress, and which had no delivery plan yet. This living governance artefact was embedded in the final board presentation.

---

## 6. Module 5: Recommendation & Roadmap Engine — Detailed Specification

### 6.1 Multi-Horizon Roadmap

The roadmap structures recommended initiatives across time horizons. Horizon definitions are configurable per engagement. In Project 2, three horizons were used:

| Horizon | Label | Content from Project 2 |
|---|---|---|
| Short term | 0–6 months | AI POC on product complexity; digital-first principle for all new products; product simplification POC starting with a high-frequency product (e.g. pet insurance) |
| Medium term | 6–18 months | API layer over upgraded TIA core system — described as the prerequisite for all other digital initiatives |
| Long term | 1–5 years | Phased modernisation to a three-layer architecture (TIA as narrow system of record + configurable workflow engine + user/agent interface layer) |

The roadmap must support **dependency mapping** — visually showing which initiatives are prerequisites for others. In Project 2, eight prerequisites were explicitly numbered and sequenced across three phases. Without this structure, the roadmap is a list rather than a plan.

**Initiative card fields:**

| Field | Description |
|---|---|
| Initiative name | Short, descriptive label |
| Horizon | Short / Medium / Long |
| Owner | Responsible person or team |
| Estimated effort | T-shirt size or person-weeks |
| Risk level | Low / Medium / High |
| Dependencies | Which other initiatives must be completed first |
| Linked recommendation | The recommendation node this initiative delivers |
| Linked evidence | The findings and insights that justify this initiative |
| Status | Not started / In progress / Complete |

### 6.2 KPI Architecture

The KPI architecture is a three-tier model linking strategic intent to operational measurement.

**Tier 1 — Strategic KPIs** measure the long-horizon direction of travel:
- NPS (member loyalty and recommendation willingness)
- eNPS (employee engagement)
- ESG metrics (to be defined per engagement)

**Tier 2 — Tactical KPIs** measure capability build over the medium term:
- Digital FNOL rate (target: 80% by 2028)
- STP rate — Straight Through Processing (target: 25–30% by 2028)
- Empathy score for the 20% complex cases (post-claim survey)
- Time from FNOL to payment decision (gennemløbstid)

**Tier 3 — Operational KPIs** support day-to-day management:
- Average telephone wait time (seconds)
- Cases per FTE
- Right-first-time rate (% of cases resolved without callback)
- Rådgivning rate (% of calls involving proactive advisory beyond the immediate claim)
- FTE / salary budget vs. volume handled

Each KPI entry in the application contains:

| Field | Description |
|---|---|
| Name and short label | For display in dashboards |
| Definition | Precise description of what is being measured |
| Formula | How it is calculated |
| Current baseline value | Measured at engagement start |
| Target value | With time horizon |
| Measurement frequency | Daily / Weekly / Monthly / Annual |
| Linked design principle | Which design principle does this KPI operationalise |
| Linked initiative | Which initiative delivers the capability that moves this KPI |

> **From the source project:** The three-tier distinction was explicitly articulated in the board presentation. The relationship between the three measurement types was defined as a hierarchy: NPS measures the long-term relationship ("Will members stay with GF?"); CSAT measures emotional satisfaction after contact ("Were we friendly, competent, and did we deliver as expected?"); CES measures cognitive effort ("Was it easy to get the case resolved?"). Together they form a measurement system that allows consultants to identify the specific experience dimensions driving or eroding the strategic NPS outcome.

---

## 7. Core Data Model

The application's primary data model is a **directed graph of linked nodes**. This is the architectural decision that distinguishes this application from a document management system or a presentation tool. The graph preserves the reasoning chain from source to output.

### 7.1 Node Types

| Node Type | Description |
|---|---|
| **Source** | An external document, article, annual report, or interview transcript. Has a type, date, author/organisation, and reliability rating. |
| **Finding** | A specific factual claim extracted from a source. Linked to exactly one source. Has a confidence level. |
| **Insight** | An interpreted conclusion drawn from one or more findings. Explicitly links the findings it is based on. Has a "so what" statement. |
| **Hypothesis** | A working proposition about the client's situation or market. Has a status (open / confirmed / rejected) and links to the insights that update it. |
| **Dilemma** | A structured binary tension. Links to the insights and findings on each side. Has a recommended position. |
| **Scenario** | A strategic direction option. Defined by its position on each dilemma axis. Links to the dilemmas that define it. |
| **Design Principle** | A governance rule for future decisions. Links to the scenario it supports and the dilemmas it resolves. |
| **Recommendation** | A specific action or decision proposed to the client. Links to the scenario, insights, and findings that support it. |
| **Initiative** | A concrete implementation task on the roadmap. Links to the recommendations that generated it, and to other initiatives it depends on. |
| **KPI** | A measurement of progress. Links to the design principle it operationalises and the initiatives that move it. |
| **Slide** | A presentation slide. Links to the nodes whose content it renders. When a linked node changes, the slide is flagged for review. |

### 7.2 The Reasoning Chain in Practice

An example from the source projects illustrates how the graph works end-to-end:

```
Source
  BCG 2025: "Only 7% of companies have brought AI to scale"
    ↓
Finding
  AI adoption remains limited despite high intent across the industry
    ↓
Insight
  GF is not behind the market; the whole market is behind — the competitive
  advantage window for early AI investment is still open
    ↓
Hypothesis [status: confirmed by interviews]
  Early movers in AI will establish durable efficiency and experience advantages
  before competitors can respond
    ↓
Dilemma
  "Invest Early vs. Wait for Maturity" — the insight supports the left pole
    ↓
Scenario
  "Nærværende og Digital" occupies the "Invest Early" position on this dilemma
    ↓
Recommendation
  Launch AI proof-of-concept within 0–6 months; do not wait for product
  simplification to be complete
    ↓
Initiative
  AI POC: can AI handle the current product complexity? (0–6 month horizon)
    ↓
KPI
  STP rate: baseline ~0%, target 25% by 2028
```

If the client challenges the 25% STP target in the board meeting, the consultant can traverse this chain in the application and show that it rests on the 80/20 automation model, which rests on the scenario recommendation, which rests on the insight about the competitive window, which rests on the BCG data point and three corroborating interview quotes. The reasoning is preserved — not lost in a slide deck.

### 7.3 Cross-Cutting Relationships

Beyond the primary chain, the graph supports additional lateral relationships:

- A **finding** can support multiple **insights**
- An **insight** can feed multiple **dilemmas** (on different poles)
- A **dilemma** can influence multiple **scenarios**
- A **design principle** can be operationalised by multiple **KPIs**
- An **initiative** can address multiple **recommendations**
- A **slide** can render content from multiple nodes of different types

The graph is directed and acyclic within an engagement. Circular reasoning (where a recommendation supports a finding that was used to derive the recommendation) is flagged as a validation error.

---

## 8. Key Workflows

### 8.1 The Målbillede (Target Operating Model) Workflow

This workflow, derived directly from Project 2, represents a complete strategy project lifecycle. It is the primary workflow the application must support end-to-end.

#### Phase 1: Mobilisation (typical duration: 1–2 weeks)

1. Create new engagement in Module 1
2. Define scope, ambition level, success criteria, and key decisions to be made
3. Build stakeholder map and coverage matrix in Module 2
4. Generate initial hypothesis set in Module 1
5. Auto-generate interview guides for each interviewee profile
6. Schedule interviews and assign to team members
7. Prepare and share kick-off materials with client via Module 6

#### Phase 2: Analysis (typical duration: 2–3 weeks)

1. Conduct interviews; capture structured notes and quotes in Module 2
2. Apply coding taxonomy to all transcripts as interviews are completed
3. Run desk research in parallel: competitor profiles, trend analysis, benchmarks
4. Update hypothesis board as evidence accumulates
5. Synthesis: promote themes to dilemmas in Module 3
6. Build initial scenarios with dilemma positioning
7. Prepare working session materials in Module 4

#### Phase 3: Working Sessions (typical duration: 2 × half-day)

1. Present analysis and dilemmas to client team via Module 4
2. Capture decisions and open questions in Module 6 decision log
3. Update hypothesis board with confirmed/rejected status
4. Refine scenarios based on client input
5. Agree recommended scenario and design principles in Module 3
6. Log unresolved questions for Phase 4 follow-up

#### Phase 4: Consolidation (typical duration: 2–3 weeks)

1. Finalise operating model delta and design principles in Module 3
2. Build roadmap with dependency mapping in Module 5
3. Define KPI architecture with baselines and targets in Module 5
4. Assemble final board presentation in Module 4
5. Run confidence report: all claims in the presentation traced to sources
6. Deliver presentation; capture follow-up decisions in Module 6

---

### 8.2 The Inspiration Session Workflow

This shorter workflow, derived from Project 1, supports the preparation of a strategic inspiration or thought leadership session for a client's top management team. Typical duration: 2–4 weeks.

1. Pull relevant trend analysis from the Intelligence Engine library (Module 2)
2. Run targeted competitor scans and update profiles (Module 2)
3. Select and customise international benchmarks for the client's context (Module 2)
4. Build the narrative arc in Module 4: trends → competitive position → opportunities → dilemmas → next steps
5. Generate financial estimates where needed using Module 3 modelling tools
6. Produce a confidence-scored presentation where every claim is sourced (Module 4)
7. Prepare discussion facilitation guide in Module 6

---

### 8.3 Retroactive Update Propagation

When a node in the reasoning graph is updated — a finding revised, a hypothesis rejected, a scenario modified — the application must:

1. Identify all downstream nodes that depend on the changed node
2. Flag each affected downstream node for review
3. Notify the responsible team member
4. Flag any presentation slides that render content from affected nodes
5. Log the change with a timestamp and author in the audit trail

This ensures that a late-breaking interview insight that changes a key dilemma position cascades visibly through to the recommendation and slide content, rather than creating silent inconsistencies in the final deliverable.

---

## 9. Non-Functional Requirements & Constraints

### 9.1 Knowledge Reuse

Every artefact created in the application is potentially reusable across engagements. Competitive profiles, trend entries, benchmark case studies, framework templates, and KPI definitions should all be available in a **searchable library**. When starting a new engagement in the same sector, a consultant should be able to pull in relevant library assets rather than starting from scratch.

The reuse model must handle **versioning**: a competitor profile from six months ago may be partially outdated. The application should track the date of last update for each data point and flag entries older than a configurable staleness threshold (default: 90 days for financial KPIs, 180 days for strategy descriptions).

### 9.2 Confidentiality & Data Separation

Client-specific data (interview transcripts, client financials, internal strategic documents) must be strictly separated from shared library assets. A consultant working on Client A must not be able to see confidential data from Client B, even if both engagements are in the same industry.

The sharing model for library assets (e.g. a trend analysis or benchmark case study derived from one engagement) must be explicitly managed — a consultant must actively promote an artefact to the shared library, and the promotion must strip or anonymise any client-specific context.

### 9.3 Traceability & Audit

Every claim that appears in a client-facing output must be traceable to its source. The application must be able to generate a **traceability report** for any presentation:

- A list of every factual assertion in the presentation
- The source node it came from
- The confidence level
- The date the source was accessed or created
- The reasoning path from source to slide

This is both a quality assurance mechanism and a professional risk management tool.

### 9.4 Iterative, Non-Linear Use

The application must support the non-linear nature of strategy work. Consultants do not complete Phase 1 before starting Phase 2. The application must handle retroactive updates gracefully, propagating changes through the reasoning chain and flagging affected downstream artefacts without requiring the user to manually track dependencies.

### 9.5 Team Collaboration

Strategy projects are team efforts. Multiple consultants work simultaneously on different parts of the analysis. The application must support:

- Concurrent editing with conflict resolution
- Role-based access (e.g. a junior analyst can add findings but not change the recommended scenario)
- A clear audit trail of who changed what and when
- Notification of relevant team members when upstream nodes they depend on are changed

### 9.6 Performance & Scale

The core graph operations — traversing the reasoning chain, generating the traceability report, propagating updates — must be performant on engagements of realistic scale. A typical large strategy project may involve:

- 15–20 interviews producing 50,000–100,000 words of transcript
- 200–400 coded segments across 30–50 codes
- 50–100 findings linked to 20–40 insights
- 8–12 dilemmas and 3–4 scenarios
- 20–40 roadmap initiatives with complex dependency relationships
- A 25–40 slide board presentation with ~150 sourced claims

All read operations on this scale must return in under 2 seconds.

---

## 10. Next Steps

This document represents the foundational specification — a statement of what the application needs to do and why, grounded in evidence from real consulting projects. The following areas require detailed specification before design and development can begin:

| Area | Detailed Specification Required | Priority |
|---|---|---|
| **Qualitative Coding Engine** | Coding taxonomy design, UI for code application, synthesis workflow, quote management model | High |
| **Core Data Model** | Full entity-relationship model, graph schema, versioning strategy, retroactive update propagation rules | High |
| **Intelligence Engine — Competitive** | Data ingestion model, KPI extraction rules, staleness management, comparison view specification | High |
| **Scenario Builder** | Dilemma-to-scenario link model, comparison matrix view, recommendation logic | High |
| **Presentation Builder** | Live data link architecture, confidence scoring algorithm, audience variant model | Medium |
| **KPI Architecture** | Three-tier model data structure, baseline/target tracking, design principle linkage | Medium |
| **Knowledge Library** | Reuse model, confidentiality boundaries, versioning and staleness, search and discovery | Medium |
| **Collaboration Layer** | Decision log structure, open questions tracking, client portal specification | Medium |
| **Roadmap Builder** | Dependency graph model, horizon configuration, initiative card data structure | Medium |
| **Access Control** | Role definitions, engagement-level vs. library-level permissions, audit trail requirements | Medium |

---

*End of Specification — Version 1.0 — Draft for Review*

*Prepared based on analysis of GF Forsikring × H&B consulting projects, March 2026*
