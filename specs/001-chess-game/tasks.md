# Tasks: Aplikasi Permainan Catur

**Input**: Design documents from `specs/001-chess-game/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Testing**: Test tasks are included because SC-001 and SC-006 explicitly require 100-scenario validation, and each user story defines acceptance scenarios.

**Organization**: Tasks are grouped by user story. Shared project and domain infrastructure is established before story work.

## Phase 1: Setup

**Purpose**: Initialize the web app with the exact installed Node.js/npm versions and tooling selected in [plan.md](./plan.md).

- [X] T001 Create `package.json`, `package-lock.json`, and `.npmrc` with exact dependency versions from `specs/001-chess-game/plan.md`, Node.js `20.10.0`, npm `10.2.3`, `engine-strict=true`, and the `dev`, `build`, `test`, and `test:e2e` scripts.
- [X] T002 [P] Configure Vite, TypeScript, and the React entry point in `vite.config.ts`, `tsconfig.json`, `tsconfig.app.json`, `index.html`, and `src/main.tsx`.
- [X] T003 [P] Configure Vitest/jsdom and Playwright in `vitest.config.ts`, `playwright.config.ts`, and `tests/setup.ts`.
- [X] T004 [P] Create `scripts/copy-stockfish.mjs` to copy only the pinned Stockfish 19.0.1 `lite-single` JS/WASM pair into `public/engine/`, and record its GPL-3.0 notice in `THIRD_PARTY_NOTICES.md`.
- [X] T005 [P] Create the initial Indonesian app shell and responsive global styles in `src/App.tsx` and `src/styles/global.css`.

## Phase 2: Foundational

**Purpose**: Establish shared game-state and engine boundaries that all user stories depend on.

**Checkpoint**: Complete this phase before implementing any user-story UI.

- [X] T006 [P] Write the 100 legal/illegal move scenarios in `tests/unit/game-rules.test.ts` for castling, en passant, promotion, check protection, and unchanged position/turn/history after an invalid move; run and record failures before T008.
- [X] T007 [P] Write mocked Worker lifecycle tests in `tests/unit/stockfish-client.test.ts` for UCI readiness, stale responses, timeouts, and surfaced engine errors; run and record failures before T009.
- [X] T008 [P] Implement the in-memory game, position, and move model in `src/game/game-state.ts` using `chess.js`; enforce “Hanya `active` menerima langkah pemain,” “Wajib ketika pion dipromosikan,” “Langkah yang ditolak tidak menambah riwayat atau mengubah giliran,” automatic insufficient-material draws, and player claims for threefold/fifty-move draws.
- [X] T009 [P] Implement the UCI Worker client in `src/engine/stockfish-client.ts`; support engine states `loading`, `ready`, `thinking`, and `error`, bound `skillLevel` to integer `0–20`, and report initialization/search failures without changing the last board position.

## Phase 3: User Story 1 — Memulai dan memainkan pertandingan melawan komputer (Priority: P1) 🎯 MVP

**Goal**: Start from the standard position as White, make legal moves, receive legal Stockfish replies as Black, and adapt computer strength to recent move quality.

**Independent Test**: Start a fresh game, make legal White moves, verify a legal Black reply after each move, reject illegal moves without changing state, and confirm adaptive level changes from a controlled move-quality sequence.

### Tests for User Story 1

- [X] T010 [P] [US1] Write 100 adaptive-policy cases in `tests/unit/adaptive-difficulty.test.ts`; cover initial level `10`, the five-move window, average loss `≤50 cp` increasing one level, `≥200 cp` decreasing one level, the neutral range, and bounds `0–20`; run and record failures before T013.
- [X] T011 [P] [US1] Write board interaction tests in `tests/components/ChessBoard.test.tsx` for legal destinations, rejected moves, turn indication, and all four promotion choices; run and record failures before T014.
- [X] T012 [P] [US1] Write browser scenarios in `tests/e2e/gameplay.spec.ts` for starting as White, a legal computer reply, responsive phone/desktop use, no horizontal scrolling, and board/turn updates within one second in at least 95% of measured moves; run and record failures before T015.

### Implementation for User Story 1

- [X] T013 [P] [US1] Implement the recent-move centipawn-loss policy in `src/game/adaptive-difficulty.ts`; start at level `10`, keep at most five losses, raise/lower one level at the plan thresholds, and clamp to `0–20`.
- [X] T014 [P] [US1] Implement the responsive board and square selection in `src/components/ChessBoard.tsx` and `src/components/ChessSquare.tsx`; show legal destinations and require a promotion choice of queen, rook, bishop, or knight.
- [X] T015 [US1] Connect player moves, Stockfish analysis/replies, turn state, last-move display, and surfaced engine-error/retry behavior in `src/App.tsx`; apply only legal engine moves and keep the board responsive while the Worker thinks.

**Checkpoint**: User Story 1 is playable independently. Validate the rule suite, adaptive policy, computer response, and both target viewport classes.

## Phase 4: User Story 2 — Menyelesaikan pertandingan dan mengetahui hasilnya (Priority: P1)

**Goal**: Display checkmate, stalemate, and supported draw results; permit eligible draw claims and block further moves after the game ends.

**Independent Test**: Load fixture positions for checkmate, stalemate, insufficient material, threefold repetition, and the fifty-move rule; verify the correct result/claim and that neither player nor computer can move after termination.

### Tests for User Story 2

- [X] T016 [P] [US2] Write and run result-state regression tests in `tests/unit/game-results.test.ts` for checkmate, stalemate, insufficient material, threefold repetition claims, and fifty-move claims.
- [X] T017 [P] [US2] Write result-view tests in `tests/components/GameStatus.test.tsx` for winner/draw wording, available draw claims, and disabled post-game input; run and record failures before T019.
- [X] T018 [P] [US2] Write terminal-game browser scenarios in `tests/e2e/game-results.spec.ts`, including that a completed game remains unchanged after attempted input; run and record failures before T020.

### Implementation for User Story 2

- [X] T019 [US2] Implement result, check, and draw-claim presentation in `src/components/GameStatus.tsx` using the result reasons from `data-model.md`.
- [X] T020 [US2] Integrate terminal-state and draw-claim actions in `src/App.tsx`; prevent player and Worker moves after `finished`.

**Checkpoint**: User Story 2 is independently verifiable with fixture positions and is integrated with a complete playable game.

## Phase 5: User Story 3 — Memulai pertandingan baru (Priority: P2)

**Goal**: Start a clean game after completion or replace an active game only after confirmation; canceling preserves the existing game.

**Independent Test**: From an active game, cancel a new-game request and compare the position, turn, and adaptive history; then confirm and verify the standard starting position and White-to-move state. Repeat after a finished game.

### Tests for User Story 3

- [X] T021 [P] [US3] Write confirmation-dialog tests in `tests/components/NewGameDialog.test.tsx` for active-game confirmation, cancel preservation, and immediate start when no game is active; run and record failures before T023.
- [X] T022 [P] [US3] Write reset-flow browser scenarios in `tests/e2e/new-game.spec.ts` for cancel, confirmed reset, and starting a new game after a result; run and record failures before T024.

### Implementation for User Story 3

- [X] T023 [US3] Implement the new-game confirmation dialog in `src/components/NewGameDialog.tsx` with explicit confirm and cancel actions.
- [X] T024 [US3] Wire the new-game action in `src/App.tsx` to reset `src/game/game-state.ts` and adaptive history; preserve all state when the dialog is canceled.

**Checkpoint**: User Story 3 works from both active and finished games without erasing state on cancel.

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validate the planned setup, build output, and documented end-to-end flows.

- [ ] T025 Run the usability checks in `specs/001-chess-game/quickstart.md`; verify at least 9 of 10 first-time users start and make a legal move for each side within one minute, and at least 19 of 20 users understand new-game confirmation and retain the match after canceling; record the outcomes in `quickstart.md`.
- [X] T026 Run the commands and scenarios in `specs/001-chess-game/quickstart.md`; verify `npm ci`, `npm test`, `npm run test:e2e`, `npm run build`, the two local engine assets, and the license notice in `public/engine/` and `THIRD_PARTY_NOTICES.md`.

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: T001 first; T002–T005 can proceed in parallel after dependencies and scripts are defined.
- **Foundational (Phase 2)**: Depends on Setup. T006–T007 are parallel test-first tasks; T008–T009 implement the tested domain and Worker boundaries.
- **User Story 1 (Phase 3)**: Depends on Foundational. Its tests are written before implementation; T013 and T014 can proceed in parallel, followed by T015 integration.
- **User Story 2 (Phase 4)**: Depends on User Story 1 because result UI integrates with its playable game flow and shared `src/App.tsx`.
- **User Story 3 (Phase 5)**: Depends on User Stories 1 and 2 because reset must work from both active and finished states.
- **Polish (Phase 6)**: Depends on all selected stories.

### User Story Dependencies

- **US1 (P1)**: Starts after Foundational; no dependency on another user story.
- **US2 (P1)**: Extends the game flow and `src/App.tsx` from US1.
- **US3 (P2)**: Uses active and terminal game states from US1 and US2.

### Parallel Opportunities

- After T001, T002, T003, T004, and T005 touch separate files and can be split among contributors.
- T006 and T007 can be authored concurrently; after they pass, T008 and T009 work on separate files.
- For US1, T010–T012 are separate test files; after they are written, T013 and T014 can be implemented concurrently.
- For US2, T016–T018 are separate test files and can be authored concurrently.
- For US3, T021 and T022 can be authored concurrently.
- US2/US3 implementation should not be parallelized with another story's `src/App.tsx` integration.

## Parallel Execution Examples

### User Story 1

1. In parallel: T010 adaptive-policy unit tests, T011 board component tests, and T012 gameplay/viewport browser tests.
2. After those tests are written: T013 adaptive policy and T014 board components can proceed in parallel.
3. Then complete T015 integration and run the US1 checkpoint.

### User Story 2

1. In parallel: T016 result-state tests, T017 status component tests, and T018 browser result scenarios.
2. Implement T019 independently, then integrate T020 in the shared app.

### User Story 3

1. In parallel: T021 dialog tests and T022 reset browser scenarios.
2. Implement T023 dialog, then wire T024 into the app and game-state reset.

## Implementation Strategy

### MVP First (User Story 1)

1. Complete Setup and Foundational phases.
2. Complete US1 tests before its implementation tasks.
3. Deliver a responsive game that starts as White, accepts only legal moves, receives legal computer replies, and adapts challenge.
4. Stop at the US1 checkpoint and validate it independently before adding result UI and new-game flows.

### Incremental Delivery

1. Setup + Foundational → shared app and game boundaries ready.
2. US1 → playable adaptive chess MVP.
3. US2 → complete match results and draw handling.
4. US3 → safe restart after active or completed games.
5. Polish → validate the quickstart and production engine assets.

## Notes

- Every task uses the required checkbox, sequential ID, optional `[P]`, story label for story phases, and an explicit file path.
- `[P]` means the task can proceed concurrently without editing the same files or relying on incomplete work.
- Test tasks are ordered before their corresponding implementation tasks; foundational rule and Worker tests precede their shared implementations.
- Stockfish distribution must retain its GPL-3.0 notice and comply with the applicable source-distribution terms.

## Phase 7: Convergence

- [X] T027 CRITICAL: Preserve the board, turn, and adaptive history while the new-game confirmation is open in `src/App.tsx`, including when the computer finishes thinking; resume safely on cancel, and add a regression scenario in `tests/e2e/new-game.spec.ts` per Constitution I and FR-010 (contradicts).
- [X] T028 CRITICAL: Surface Worker failures that occur while the engine is idle or ready in `src/engine/stockfish-client.ts` and `src/App.tsx`, preserving the position and offering retry; cover idle failure and recovery in `tests/unit/stockfish-client.test.ts` and `tests/e2e/engine-error.spec.ts` per Constitution II and IV (partial).
- [X] T029 CRITICAL: Extend `tests/unit/adaptive-difficulty.test.ts` to verify the exact inclusive 50 cp and 200 cp thresholds and mixed five-move windows, including just-inside neutral values, per Constitution V and T010 (partial).
- [X] T030 CRITICAL: Extend `tests/e2e/gameplay.spec.ts` to measure board and turn updates following legal moves from both sides with the real local Worker, and verify at least 95% complete within one second on the supported viewport classes per Constitution V and SC-003 (partial).
- [ ] T031 Conduct the still-open participant usability checks specified by T025 and record actual results in `specs/001-chess-game/quickstart.md`; do not mark this task complete without the required participants and evidence per T025 (missing).
