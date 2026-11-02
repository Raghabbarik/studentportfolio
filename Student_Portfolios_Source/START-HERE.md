# Student Portfolios — Complete Source Code

This ZIP contains 10 independent portfolio projects, corresponding to the 10 published websites. Each project has its own distinct public UI, component tree, animation approach, sample profile, storage configuration, and existing Site identity. All 10 designs are separately implemented; the shared editor still saves each student’s details dynamically.

## Included features

- 10 distinct portfolio designs: Editorial Index, Bento Studio, Swiss Grid, Bold Poster, Personal Journal, Scroll Chapters, Split Profile, Developer Terminal, Playful Board, and Project Gallery.
- Distinct project browsers: hover preview index, spotlight tiles, grid rows, poster blocks, accordion stories, parallax chapters, a timeline feed, command tabs, draggable cards, and a manually controlled gallery carousel.
- Animated headings, scroll entrances, spring interactions, and reduced-motion support. A Pause motion control is available on every portfolio.
- Editor for name, role, heading, biography, contact details, social links, skills, projects, education, experience, and achievements.
- Each website retains its own design; students can customize its accent color and introduction alignment.
- Photo, project image, and PDF résumé uploads (up to 5 MB).
- Persistent online profile storage, owner/student editing permissions, and conflicting-edit protection.

## Windows / PowerShell setup

Use Node.js 22.13 or newer. Node.js 24 is suitable for this project's declared runtime requirement.

Extract the ZIP completely. Choose one project folder, for example `student-portfolio-01`, and open PowerShell in that folder.

```powershell
npm.cmd install -g pnpm@11.25.0
pnpm.cmd install --frozen-lockfile
pnpm.cmd run build
node scripts/setup-local.mjs
pnpm.cmd run dev
```

Open the local URL printed by the server (normally `http://localhost:5173`). Do not double-click a source file to open the website. Keep PowerShell running while using the local website. Stop it with Ctrl+C before starting another project on the same port.

`setup-local.mjs` initializes the local database using the included schema migration and remembers the migrations it applied. Run it after the first build on a fresh extracted project. It creates a development-only `.dev.vars` file with `OWNER_EMAIL=seedy@sites.test`, matching the starter's localhost test sign-in. This is a simulated local account, not a real student account. Use `/edit` to enter the editor through that local sign-in flow. If you already created a local database manually, do not replay its migration; use your existing initialized database instead.

For macOS/Linux, use `npm` and `pnpm` instead of `npm.cmd` and `pnpm.cmd`.

## Where to change the code

| File | Purpose |
| --- | --- |
| `lib/sample.ts` | Initial/sample details for that student |
| `app/portfolio-view.tsx` | Portfolio sections, layout, and interactions |
| `app/globals.css` | Shared styling and dashboard layout |
| `app/creative-portfolio.css` | This portfolio’s unique design and responsive styles |
| `app/portfolio-kit.tsx` | Shared data, safe links, project dialog and motion helpers |
| `app/portfolio-base.css` | Common helper styles and accessibility rules |
| `DESIGN.md` | Design-specific editing notes |
| `app/edit/editor.tsx` | Editing dashboard |
| `app/chatgpt-auth.ts` | ChatGPT identity helpers |
| `lib/storage.ts` | Database access and owner/student authorization |
| `app/api/profile/route.ts` | Read/save portfolio data |
| `app/api/access/route.ts` | Assign or revoke student editing access |
| `app/api/upload/route.ts` | Upload photos and PDF résumés |
| `app/api/media/[id]/route.ts` | Serve uploaded files |
| `db/schema.ts` and `drizzle/` | Database schema and generated migration |
| `.openai/hosting.json` | Existing Site identity and logical storage bindings |

Once a portfolio has been saved through the editor, its database record takes precedence over `lib/sample.ts`. Change the saved details through the editor rather than expecting edits to sample data to overwrite them.

## Student access on the published websites

1. Sign in to the website using your owner ChatGPT account.
2. Open **Edit portfolio**, then **Access**.
3. Save the student's ChatGPT email address.
4. In the Site's **Share** settings, grant that same email access to visit the website.
5. Give the student the website link ending in `/edit`.

Each project has a separate database and student assignment. The owner retains access and can change or remove the assigned student's editing permission. No student has been assigned yet; the projects contain sample details.

## Hosting requirements

These projects use React, Vinext, Vite, Motion, Cloudflare Workers, D1 for profile storage, and R2 for uploaded files. The published websites currently use ChatGPT Sites for real sign-in and trusted identity headers. The `OWNER_EMAIL` production value is configured separately in Sites; production settings and credentials are not included in the ZIP.

The source is not a drop-in standard Vercel project. Hosting elsewhere requires an equivalent authentication integration, trusted identity handling, configured D1/R2 storage bindings, migration application, and Worker deployment. Never trust arbitrary identity headers from public requests. The local test sign-in must stay limited to localhost development.

The existing `.openai/hosting.json` files identify the already published Sites. Keep these IDs when updating those Sites. For a separate new deployment, configure its own identity and storage rather than accidentally targeting the original Site.

## Data and dependencies

This is a code export. It excludes installed dependencies, Git history, build output, local databases, uploaded files, tokens, and private environment values. Install dependencies after extracting. Existing production data and files remain on their respective websites and are not copied into the ZIP.

The included pnpm lockfiles preserve the dependency resolution used by the projects. The original starter documentation is kept as `README-STARTER.md`. Vendored license notices are included.

## Published websites

- Student 01: https://satyam-student-portfolio-01.malliksatyam46.chatgpt.site
- Student 02: https://satyam-student-portfolio-02.malliksatyam46.chatgpt.site
- Student 03: https://satyam-student-portfolio-03.malliksatyam46.chatgpt.site
- Student 04: https://satyam-student-portfolio-04.malliksatyam46.chatgpt.site
- Student 05: https://satyam-student-portfolio-05.malliksatyam46.chatgpt.site
- Student 06: https://satyam-student-portfolio-06.malliksatyam46.chatgpt.site
- Student 07: https://satyam-student-portfolio-07.malliksatyam46.chatgpt.site
- Student 08: https://satyam-student-portfolio-08.malliksatyam46.chatgpt.site
- Student 09: https://satyam-student-portfolio-09.malliksatyam46.chatgpt.site
- Student 10: https://satyam-student-portfolio-10.malliksatyam46.chatgpt.site
