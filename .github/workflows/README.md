# CI explained simply

CI means **Continuous Integration**. When someone changes code, GitHub automatically runs checks on a fresh computer. This helps the team catch problems before merging changes into `main`.

Think of it as an automatic checklist: download the code → install what it needs → check it → report pass or fail.

## What our three pipelines do

| File | What happens | Why it helps |
| --- | --- | --- |
| `frontend-ci.yml` | Install packages, run ESLint, check TypeScript, build the website | Finds code rule violations, type mistakes, and build errors |
| `backend-ci.yml` | Install packages, check Supabase settings, run Vitest tests | Checks backend behavior covered by our tests against a test database |
| `mobile-ci.yml` | Install packages, check TypeScript, read Expo configuration, export the web app | Finds type, configuration, and web export errors |

These files check code; they do not publish or deploy it. The mobile pipeline does not create Android or iOS builds. A green result means the checks passed, not that every possible bug has been ruled out.

## When they run

- **Push:** the branch must be `main`, start with `feature/`, or start with `fix/`, AND the change must include that app's folder or its workflow file.
- **Pull request:** the PR must target `main`, AND include changes to that app's folder or workflow file. The source branch can have any name.
- **Manual:** open the repository's **Actions** tab, choose a workflow, and select **Run workflow**. The workflow must exist on the default branch for this button to be available.

For example, pushing a frontend change to `feature/login` runs frontend CI. A backend-only change does not run frontend CI. Changes to both folders run both pipelines. Editing only this README does not run them.

These are the conditions. We do not need an extra `if` for every step: steps run in order, and a failure normally stops the later checks in that job.

## What the YAML words mean

YAML is a text format where indentation groups settings together. Use spaces consistently.

| Setting | Simple meaning |
| --- | --- |
| `name` | The label shown in GitHub Actions |
| `on` | Events that start the workflow |
| `branches` / `paths` | Which branches and changed files qualify |
| `workflow_dispatch` | Allow someone to start it manually |
| `permissions: contents: read` | Give the workflow token read access to repository contents |
| `jobs` | Groups of work for GitHub to run |
| `runs-on: ubuntu-latest` | Use a fresh GitHub-hosted Ubuntu computer |
| `working-directory` | Folder where shell commands run |
| `steps` | Ordered tasks inside a job |
| `uses` | Run a reusable action, such as downloading the repository |
| `run` | Execute a command, such as `npm test` |
| `env` | Environment settings available to commands |
| `secrets` | Values stored privately in GitHub settings |

Our setup uses Node.js 22. `npm ci` installs packages from `package-lock.json` and fails if it disagrees with `package.json`. The npm cache speeds up later installs; we still run `npm ci` each time.

## Supabase setup for backend CI

We primarily use **Supabase**. Backend CI explicitly sets `DB_PROVIDER` to `supabase` so it uses Supabase instead of the application's MongoDB default.

Before the first backend run:

1. Create a dedicated Supabase test project and apply the database schema and migrations required by the backend. Tests create and change data, so do not point CI at production.
2. In the GitHub repository, open **Settings → Secrets and variables → Actions → New repository secret**.
3. Add `SUPABASE_URL` with the test project's URL.
4. Add `SUPABASE_SERVICE_ROLE_KEY` with that test project's service role key. This is a privileged credential: keep it in GitHub secrets, never in committed code or frontend configuration.

The workflow passes these values to the backend. If either is missing, it stops with a clear error before running tests. Pull requests from forks do not receive repository secrets, so their backend check fails at this setup step; running those database tests needs a separately designed trusted process. Do not expose credentials just to make a check green.

## How to write your own pipeline

1. Decide what should be checked. Find the actual commands in your project's `package.json` and run them locally first.
2. Create a `.yml` file inside `.github/workflows/`.
3. Choose the events under `on`, such as pushes and pull requests.
4. Add a job, choose its machine, check out the code, and install the correct runtime version.
5. Install dependencies, then run the checks from the correct project folder. Configure any database or environment values the checks require.
6. Push a branch, open a PR, and inspect each step in GitHub's Actions logs.

## How to validate it, including AI-written code

- **Check structure:** triggers belong inside `on`, jobs inside `jobs`, and steps inside their job. A YAML parser catches formatting problems; `actionlint` also checks GitHub Actions-specific rules.
- **Check commands:** every npm script must exist. Verify the runtime version, folder paths, lockfile, and database settings.
- **Check triggers:** try a relevant change and an unrelated change. Confirm the expected workflows run or skip.
- **Check failure detection:** temporarily introduce a type error or failing test on a test branch. Confirm CI turns red, then revert the change. Watch for `continue-on-error` or `|| true`, which can hide failures.
- **Read the logs:** confirm the intended checks actually ran. Local success alone does not prove a clean GitHub runner will pass.

CI prevents merging only if repository rules require its checks. Be careful when making path-filtered workflows required: a skipped workflow can leave a check pending and block the PR.

## Changes made here

Fixed indentation in all three workflows, corrected branch patterns to `feature/**` and `fix/**`, and configured backend CI for Supabase with a missing-credentials check. The application checks themselves remain the same.
