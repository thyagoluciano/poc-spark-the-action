---
description: Execute the implementation plan by processing and executing all tasks defined in tasks.md
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Outline

0. **Feature Selection (Active Spec Detection — worktree-aware)**:
   - Get the current git branch: `git rev-parse --abbrev-ref HEAD`
   - List specs from current directory: `ls -d specs/[0-9]*/ 2>/dev/null`
   - List specs from all worktrees: `for wt in .worktrees/*/; do ls -d "$wt"specs/[0-9]*/ 2>/dev/null; done`
   - List active worktrees: `git worktree list`
   - For each spec directory found, check its status:
     - Has `tasks.md`? Count total tasks (`- [ ]` + `- [x]`/`- [X]`) and completed tasks (`- [x]`/`- [X]`)
     - Has `plan.md`? Has `spec.md`?
   - **If multiple specs exist OR current branch doesn't match any spec**, present a selection table:

     ```text
     Specs encontradas no projeto:

     | #  | Spec                        | Worktree                  | Status     | Progresso      |
     |----|----------------------------|---------------------------|------------|----------------|
     | 1  | 001-client-site-refactor    | .worktrees/001-...        | Em andamento | 12/45 tasks  |
     | 2  | 002-payment-integration     | .worktrees/002-...        | Planejada    | 0/0 tasks    |

     → Qual spec você quer implementar? (número ou "nova" para criar uma nova)
     ```

   - **If user chooses an existing spec**: Locate the worktree for that spec's branch (check `.worktrees/<branch>/` or `git worktree list`). If no worktree exists, create one: `git worktree add .worktrees/<branch> <branch>`. Use the worktree's absolute path as working directory for all subsequent operations.
   - **If user chooses "nova"**: Inform to run `/speckit.specify` first and stop execution
   - **If only one spec exists AND current branch matches it**: Proceed automatically (no prompt needed)

1. Run `.specify/scripts/bash/check-prerequisites.sh --json --require-tasks --include-tasks` from repo root and parse FEATURE_DIR and AVAILABLE_DOCS list. All paths must be absolute. For single quotes in args like "I'm Groot", use escape syntax: e.g 'I'\''m Groot' (or double-quote if possible: "I'm Groot").

2. **Check checklists status** (if FEATURE_DIR/checklists/ exists):
   - Scan all checklist files in the checklists/ directory
   - For each checklist, count:
     - Total items: All lines matching `- [ ]` or `- [X]` or `- [x]`
     - Completed items: Lines matching `- [X]` or `- [x]`
     - Incomplete items: Lines matching `- [ ]`
   - Create a status table:

     ```text
     | Checklist | Total | Completed | Incomplete | Status |
     |-----------|-------|-----------|------------|--------|
     | ux.md     | 12    | 12        | 0          | ✓ PASS |
     | test.md   | 8     | 5         | 3          | ✗ FAIL |
     | security.md | 6   | 6         | 0          | ✓ PASS |
     ```

   - Calculate overall status:
     - **PASS**: All checklists have 0 incomplete items
     - **FAIL**: One or more checklists have incomplete items

   - **If any checklist is incomplete**:
     - Display the table with incomplete item counts
     - **STOP** and ask: "Some checklists are incomplete. Do you want to proceed with implementation anyway? (yes/no)"
     - Wait for user response before continuing
     - If user says "no" or "wait" or "stop", halt execution
     - If user says "yes" or "proceed" or "continue", proceed to step 3

   - **If all checklists are complete**:
     - Display the table showing all checklists passed
     - Automatically proceed to step 3

3. Load and analyze the implementation context:
   - **REQUIRED**: Read tasks.md for the complete task list and execution plan
   - **REQUIRED**: Read plan.md for tech stack, architecture, and file structure
   - **IF EXISTS**: Read data-model.md for entities and relationships
   - **IF EXISTS**: Read contracts/ for API specifications and test requirements
   - **IF EXISTS**: Read research.md for technical decisions and constraints
   - **IF EXISTS**: Read quickstart.md for integration scenarios

4. **Execution Mode Selection**:

   After loading tasks.md, analyze the task graph:
   - Count total tasks, tasks with `[P]` marker, and tasks with `| deps:` metadata
   - Identify how many tasks can run in parallel per phase
   - Present the execution mode selection:

   ```text
   Análise do grafo de tasks:
   - Total: XX tasks
   - Paralelizáveis: XX tasks com [P]
   - Com dependências explícitas: XX tasks com | deps:

   Como deseja executar a implementação?

   | Modo | Engine                        | Paralelismo | Recomendado para                        |
   |------|-------------------------------|-------------|-----------------------------------------|
   | A    | **Agent Teams**               | Alto        | Muitas tasks independentes, features grandes. Múltiplas instâncias Claude Code com task list compartilhada. Teammates reivindicam tasks autonomamente. |
   | B    | **Subagents (worktree)**      | Médio       | Tasks em áreas diferentes do codebase. Agents isolados em worktrees git paralelos. |
   | C    | **Subagents (in-context)**    | Médio       | Tasks leves que não precisam de isolamento git. Agents paralelos no mesmo contexto. |
   | D    | **Sequencial**                | Nenhum      | Features pequenas, tasks acopladas. Execução task a task, fase por fase. Mais seguro. |

   → Sua escolha (A/B/C/D):
   ```

   **Mode A — Agent Teams**:
   - Requires `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` in settings env (already configured)
   - **YOU MUST use the TeamCreate tool** to create an agent team. Do NOT just describe the team — actually call the tool.
   - Lead agent (you) handles Setup + Foundational phases sequentially first
   - Once Foundational completes, tell Claude to create an agent team with one teammate per independent user story
   - Each teammate receives: the tasks for its story, plan.md context, and dependency list
   - Teammates auto-claim tasks from the shared task list respecting `| deps:` ordering
   - Lead monitors completion via automatic teammate notifications and runs Polish phase at the end
   - **How to spawn the team** — say this to trigger team creation:
     ```text
     Create an agent team to implement this feature. Each teammate handles one user story:
     - Teammate "US1": Implement tasks T012-T017 (User Story 1). Context: [plan.md summary, relevant file paths, tech stack]. Dependencies: [list deps]
     - Teammate "US2": Implement tasks T020-T023 (User Story 2). Context: [plan.md summary, relevant file paths, tech stack]. Dependencies: [list deps]
     - Teammate "US3": Implement tasks T026-T028 (User Story 3). Context: [plan.md summary, relevant file paths, tech stack]. Dependencies: [list deps]
     Rules: Respect task dependencies (| deps:). Mark tasks [X] in tasks.md when done. Commit after each task.
     ```
   - **Important**: Claude will internally use TeamCreate to spawn the team, TaskCreate for the shared task list, and SendMessage for inter-agent communication. Each teammate is a full independent Claude Code session with its own context window.
   - **Teammate context**: Teammates automatically load CLAUDE.md, MCP servers, and skills from the project. They do NOT inherit the lead's conversation history, so include all necessary context in the spawn prompt (plan.md summary, file structure, tech stack, task details).
   - **Communication**: Teammates message each other directly and notify the lead automatically when idle. Use Shift+Down to cycle through teammates in in-process mode.
   - **Cleanup**: When all tasks are done, ask the lead to clean up the team before proceeding to Polish phase.

   **Mode B — Subagents (worktree)**:
   - Use the Agent tool with `isolation: "worktree"` parameter
   - Lead agent handles Setup + Foundational sequentially
   - For each independent user story, spawn a subagent with worktree isolation:
     ```text
     Agent(subagent_type="general-purpose", isolation="worktree", prompt="Implement US1 tasks: ...")
     ```
   - Each subagent works in an isolated copy of the repo
   - After all subagents complete, lead merges results and runs Polish phase
   - **Best for**: Tasks that modify many files and benefit from git isolation

   **Mode C — Subagents (in-context)**:
   - Use the Agent tool WITHOUT worktree isolation
   - Lead agent handles Setup + Foundational sequentially
   - For parallel [P] tasks within a phase, spawn multiple subagents simultaneously:
     ```text
     # Launch these in parallel (single message with multiple Agent tool calls):
     Agent(prompt="Implement T012: Create Entity1 model in src/models/entity1.py")
     Agent(prompt="Implement T013: Create Entity2 model in src/models/entity2.py")
     ```
   - Subagents work in the same repo — careful with file conflicts
   - **Best for**: Small, focused tasks on different files

   **Mode D — Sequential**:
   - Execute tasks one by one, in order, respecting all dependencies
   - Simplest and safest — no coordination overhead
   - **Best for**: Small features, tightly coupled tasks, or debugging

5. **Project Setup Verification** (Sequential mode, or lead agent in parallel modes):
   - **REQUIRED**: Create/verify ignore files based on actual project setup:

   **Detection & Creation Logic**:
   - Check if the following command succeeds to determine if the repository is a git repo (create/verify .gitignore if so):

     ```sh
     git rev-parse --git-dir 2>/dev/null
     ```

   - Check if Dockerfile* exists or Docker in plan.md → create/verify .dockerignore
   - Check if .eslintrc* exists → create/verify .eslintignore
   - Check if eslint.config.* exists → ensure the config's `ignores` entries cover required patterns
   - Check if .prettierrc* exists → create/verify .prettierignore
   - Check if .npmrc or package.json exists → create/verify .npmignore (if publishing)
   - Check if terraform files (*.tf) exist → create/verify .terraformignore
   - Check if .helmignore needed (helm charts present) → create/verify .helmignore

   **If ignore file already exists**: Verify it contains essential patterns, append missing critical patterns only
   **If ignore file missing**: Create with full pattern set for detected technology

   **Common Patterns by Technology** (from plan.md tech stack):
   - **Node.js/JavaScript/TypeScript**: `node_modules/`, `dist/`, `build/`, `*.log`, `.env*`
   - **Python**: `__pycache__/`, `*.pyc`, `.venv/`, `venv/`, `dist/`, `*.egg-info/`
   - **Java**: `target/`, `*.class`, `*.jar`, `.gradle/`, `build/`
   - **C#/.NET**: `bin/`, `obj/`, `*.user`, `*.suo`, `packages/`
   - **Go**: `*.exe`, `*.test`, `vendor/`, `*.out`
   - **Ruby**: `.bundle/`, `log/`, `tmp/`, `*.gem`, `vendor/bundle/`
   - **PHP**: `vendor/`, `*.log`, `*.cache`, `*.env`
   - **Rust**: `target/`, `debug/`, `release/`, `*.rs.bk`, `*.rlib`, `*.prof*`, `.idea/`, `*.log`, `.env*`
   - **Kotlin**: `build/`, `out/`, `.gradle/`, `.idea/`, `*.class`, `*.jar`, `*.iml`, `*.log`, `.env*`
   - **C++**: `build/`, `bin/`, `obj/`, `out/`, `*.o`, `*.so`, `*.a`, `*.exe`, `*.dll`, `.idea/`, `*.log`, `.env*`
   - **C**: `build/`, `bin/`, `obj/`, `out/`, `*.o`, `*.a`, `*.so`, `*.exe`, `autom4te.cache/`, `config.status`, `config.log`, `.idea/`, `*.log`, `.env*`
   - **Swift**: `.build/`, `DerivedData/`, `*.swiftpm/`, `Packages/`
   - **R**: `.Rproj.user/`, `.Rhistory`, `.RData`, `.Ruserdata`, `*.Rproj`, `packrat/`, `renv/`
   - **Universal**: `.DS_Store`, `Thumbs.db`, `*.tmp`, `*.swp`, `.vscode/`, `.idea/`

   **Tool-Specific Patterns**:
   - **Docker**: `node_modules/`, `.git/`, `Dockerfile*`, `.dockerignore`, `*.log*`, `.env*`, `coverage/`
   - **ESLint**: `node_modules/`, `dist/`, `build/`, `coverage/`, `*.min.js`
   - **Prettier**: `node_modules/`, `dist/`, `build/`, `coverage/`, `package-lock.json`, `yarn.lock`, `pnpm-lock.yaml`
   - **Terraform**: `.terraform/`, `*.tfstate*`, `*.tfvars`, `.terraform.lock.hcl`
   - **Kubernetes/k8s**: `*.secret.yaml`, `secrets/`, `.kube/`, `kubeconfig*`, `*.key`, `*.crt`

5. Parse tasks.md structure and extract:
   - **Task phases**: Setup, Tests, Core, Integration, Polish
   - **Task dependencies**: Sequential vs parallel execution rules
   - **Task details**: ID, description, file paths, parallel markers [P]
   - **Execution flow**: Order and dependency requirements

7. **Execute implementation** following the selected mode and task plan:

   **For ALL modes**:
   - Parse `| deps: T00X, T00Y` from each task line to build the dependency graph
   - A task is "ready" when ALL its deps are marked `[X]` (complete)
   - Phase gates are implicit: all Setup tasks must complete before Foundational, etc.
   - **Follow TDD approach**: Execute test tasks before their corresponding implementation tasks
   - **Validation checkpoints**: Verify each phase completion before proceeding

   **For Mode A (Agent Teams)**:
   - Lead (you) executes Setup + Foundational phases sequentially
   - At the user story phase gate, ask Claude to create an agent team — Claude will use TeamCreate internally to spawn teammates
   - Give each teammate a detailed spawn prompt containing: its task list, plan.md context summary, file structure, tech stack, and dependency list. Teammates do NOT inherit your conversation history.
   - The shared task list allows teammates to self-claim ready tasks. Tasks have states: pending, in progress, completed. Dependent tasks auto-unblock when prerequisites complete.
   - Lead receives automatic notifications when teammates go idle or finish. Use Shift+Down to check progress.
   - When all user story tasks are complete, shut down teammates and clean up the team, then execute Polish phase
   - **If team creation doesn't trigger**: Verify `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` is set in `.claude/settings.json` under the `env` key

   **For Mode B (Subagents with worktree)**:
   - Lead executes Setup + Foundational phases sequentially
   - At each user story phase, spawn one Agent per story with `isolation: "worktree"`
   - Each agent gets: task list, plan context, file structure
   - After all agents complete, lead reviews results and runs Polish phase
   - If agent made changes, merge worktree branch into feature branch

   **For Mode C (Subagents in-context)**:
   - Lead executes phases sequentially
   - Within each phase, group all `[P]` tasks that share the same resolved deps
   - Launch those groups as parallel Agent tool calls in a single message
   - Wait for results, mark `[X]`, then proceed to next batch of ready tasks

   **For Mode D (Sequential)**:
   - Execute tasks one by one in topological order (respecting deps)
   - Complete each phase before moving to the next

8. **Implementation execution rules** (all modes):
   - **Setup first**: Initialize project structure, dependencies, configuration
   - **Tests before code**: If tests are included, write them first and ensure they fail
   - **Core development**: Implement models, services, CLI commands, endpoints
   - **Integration work**: Database connections, middleware, logging, external services
   - **Polish and validation**: Unit tests, performance optimization, documentation

9. **Progress tracking and error handling**:
   - Report progress after each completed task (or batch in parallel modes)
   - Halt execution if any non-parallel task fails
   - For parallel tasks [P], continue with successful tasks, report failed ones
   - Provide clear error messages with context for debugging
   - Suggest next steps if implementation cannot proceed
   - **IMPORTANT**: For completed tasks, mark as `[X]` in tasks.md immediately
   - In parallel modes, coordinate task marking to avoid conflicts (lead marks, or use atomic writes)

10. **Completion validation**:
    - Verify all required tasks are completed
    - Check that implemented features match the original specification
    - Validate that tests pass and coverage meets requirements
    - Confirm the implementation follows the technical plan
    - Report final status with summary of completed work
    - For parallel modes: verify no merge conflicts between agent outputs

Note: This command assumes a complete task breakdown exists in tasks.md. If tasks are incomplete or missing, suggest running `/speckit.tasks` first to regenerate the task list.
