# Product Requirements Document

# Maali Mentor (مالی مینٹر)

AI-powered Urdu financial literacy coach for Pakistan.

## 1. Product Summary

Maali Mentor helps Urdu-speaking users learn practical personal finance through short lessons, voice or text tutoring, quizzes, and a simple simulation of financial decisions. The product should be easy to start, localized for Pakistan, and focused on helping users move from confusion to action.

### Problem

Many users in Pakistan want to improve their finances but face three main barriers:

* Most financial content is in English.
* Common finance terms are hard to understand.
* Generic AI chatbots answer questions, but do not guide users through a learning path.

### Solution

Maali Mentor provides:

* Urdu and Roman Urdu tutoring.
* A guided learning path that starts from basics.
* A short quiz after each lesson.
* A simple simulator to show the effect of saving, spending, and inflation.
* Localized examples for Pakistan.

## 2. Development First Priority

Build in this order:

1. App shell and navigation.
2. Text-based tutor in Roman Urdu and Urdu.
3. Basic onboarding to identify user level.
4. One lesson path: budgeting, saving, and inflation.
5. Quiz after the lesson.
6. Simple financial simulator with a few yearly decisions.
7. Dashboard showing progress and completed lessons.

This order keeps the first version small and testable.

### Build Principles

* Build the simplest working version first.
* Prefer one complete user flow over many partial features.
* Keep each phase shippable on its own.
* Add voice only after the text flow is stable.

## 3. MVP Scope

### In Scope

* Urdu / Roman Urdu chat tutor.
* Voice input and optional voice response.
* Basic onboarding questions.
* A small concept flow: budgeting, saving, inflation, emergency fund, mutual funds.
* Short quiz system with pass/fail mastery.
* Simple Pakistan-focused financial simulator.
* Progress tracking and basic dashboard.

### Out of Scope for MVP

* Full banking integrations.
* Real-time market data.
* Large knowledge graph.
* Advanced tax planning.
* Multi-user social features.
* Complex gamification systems.

## 4. Target Users

### Primary Users

* Young professionals who earn money but do not know how to manage it.
* Homemakers or small business owners who prefer Urdu and voice interaction.
* First-time investors who need local guidance before choosing a financial product.

### Key Needs

* Simple language.
* Local examples.
* No jargon.
* Clear next steps.

## 5. Core User Flow

1. User opens the app.
2. User chooses Urdu, Roman Urdu, or voice.
3. User answers a few onboarding questions.
4. App recommends a starting lesson.
5. Tutor explains the topic in simple language.
6. User takes a short quiz.
7. User tries a simulator scenario.
8. User sees progress on the dashboard.

## 6. Functional Requirements

### Tutor

* Accept text input in Urdu or Roman Urdu.
* Accept voice input.
* Respond in simple, respectful Urdu.
* Use everyday examples.
* Keep answers short unless the user asks for more detail.

### Learning Path

* Start with basics before advanced topics.
* Unlock the next topic after the current one is understood.
* Keep the lesson structure consistent.

### Quiz

* Ask 3 to 5 questions after a lesson.
* Support multiple choice and short spoken answers.
* Mark mastery based on score.
* Suggest review if the score is too low.

### Simulator

* Show the impact of saving, spending, and inflation over a few turns.
* Use simple choices, not a complex game.
* Make the outcome easy to understand visually.

### Dashboard

* Show completed lessons.
* Show quiz progress.
* Show simulator outcome.
* Show the next recommended lesson.

## 7. Content Scope

The first version should focus on a small local finance set:

* Budgeting.
* Saving.
* Emergency fund.
* Inflation.
* Mutual funds.
* Basic Islamic finance concepts.

Use Pakistan-specific language and examples where helpful, but avoid overloading the MVP with detailed regulatory or tax content.

## 8. Success Metrics

The MVP is successful if:

* A user can finish onboarding and the first lesson in one session.
* The tutor feels understandable in Urdu or Roman Urdu.
* The quiz shows whether the user learned the concept.
* The simulator clearly demonstrates why inflation matters.
* The dashboard shows visible progress.

## 9. Non-Goals

Do not build these in the first version:

* Full financial advisory features.
* Personalized investment recommendations.
* Live market integrations.
* Heavy architectural complexity.
* Pitch-deck content inside the PRD.

## 10. Suggested Build Plan

### Phase 1: App Foundation

Deliverables:

* App shell with home, tutor, and progress screens.
* Basic navigation between screens.
* Onboarding questions and user level selection.

Exit criteria:

* A new user can open the app and complete onboarding.
* The app shows a recommended starting lesson.

### Phase 2: Learning Flow

Deliverables:

* Text tutor for the first lesson path.
* Lesson content for budgeting, saving, and inflation.
* Quiz after the lesson.
* Pass/fail mastery state.

Exit criteria:

* A user can complete one lesson and receive a quiz result.
* The app can recommend the next topic based on the result.

### Phase 3: Simulator and Progress

Deliverables:

* Simple financial simulator with a few yearly choices.
* Progress tracking for completed lessons and quiz outcomes.
* Dashboard summary of learning activity.

Exit criteria:

* A user can run one simulation and see the impact of choices.
* Progress is visible after completing a lesson.

### Phase 4: Voice and Polish

Deliverables:

* Voice input.
* Optional voice response.
* UI polish and mobile cleanup.
* Expanded content after the core flow works.

Exit criteria:

* The full flow works in text first, then voice.
* The app is usable on desktop and mobile.

## 11. Open Questions

* Which lesson should be the first default entry point?
* Should voice be required for MVP or added after the text flow is stable?
* Which two or three localized examples are most useful for the first release?
