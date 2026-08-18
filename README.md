# CareerOS User Manual

**Your career, managed like a product.**

CareerOS is a career-management dashboard for students and early-career professionals. It brings job applications, deadlines, interview preparation, daily priorities, and career insights into one workspace.

## Open CareerOS

Visit [career-os-coral.vercel.app](https://career-os-coral.vercel.app).

CareerOS works in current desktop and mobile browsers. For the best dashboard experience, use the latest version of Chrome, Edge, Firefox, or Safari.

## 1. Create an account

You can register with Google or an email address.

### Continue with Google

1. Select **Continue with Google**.
2. Choose your Google account.
3. Review the requested basic profile access.
4. After approval, CareerOS returns you to the dashboard.

### Register with email

1. Select **Create an account** below the sign-in form.
2. Enter your full name, email address, and a password of at least eight characters.
3. Select **Create account**.
4. Open the confirmation message sent to your email address.
5. Follow the confirmation link, then sign in to CareerOS.

If the message does not arrive, check the spam, junk, and promotions folders and confirm that the email address was entered correctly.

## 2. Sign in and sign out

To sign in, use the same Google account or email/password combination used during registration.

To sign out:

1. Select your profile at the bottom of the sidebar.
2. Select **Sign out** in the profile window.

For security, sign out when using CareerOS on a shared device.

## 3. Edit your profile

1. Select your name and avatar at the bottom of the sidebar.
2. Update any of the following:
   - Full name
   - Professional headline
   - Location
3. Select **Save profile**.

Your private career profile can also store university, graduation year, CGPA, skills, experience, projects, portfolio, GitHub, LinkedIn, LeetCode, and Kaggle links. Your name, initials, headline, and dashboard greeting update immediately. Profile changes are saved securely with your CareerOS account. Your email address is controlled by your sign-in provider and cannot be edited from this window.

## 4. Understand the dashboard

The **Overview** page summarizes your job search:

- **Applications sent** — total applications represented in the current dashboard.
- **In progress** — applications that are still active.
- **Response rate** — the displayed response percentage.
- **Interviews** — upcoming or active interview opportunities.
- **Application pipeline** — roles grouped by Saved, Applied, OA, Interview, and Offer stages.
- **Today’s focus** — the most important tasks for the day.
- **Recent applications** — the latest opportunities in your pipeline.
- **Coming up** — approaching interviews, assessments, and follow-ups.
- **Career insight** — a highlighted pattern from the dashboard data.

## 5. Add an application

1. Select **Add application** in the upper-right corner.
2. Enter the company name and role.
3. Select **Add to pipeline**.

The application appears at the top of **Recent applications** and is saved to your account. Applications remain available after refreshing, signing out, or changing devices. Only you can access your records.

## 6. Search applications

Use the search field at the top of the dashboard to filter recent applications by:

- Company
- Role
- Location

Clear the search field to restore the complete list.

## 7. Manage your workspace

Use **Career Coach** to generate a focused three-step plan from your current pipeline. Notifications and the calendar collect dated applications and workspace records into one actionable list.

## 8. Navigate CareerOS

The sidebar contains the following workspace areas:

- Overview
- Applications
- Jobs
- Companies
- Interviews
- Network
- Resume Lab
- Interview Prep
- Documents
- Analytics

Every navigation item opens a dedicated workspace:

- **Applications** is the durable recruiting system of record. Live jobs can prefill a new application; each record stores its source, resume version, compensation, referral, recruiter, tailored cover letter, notes, deadline, match score, and an automatically appended stage timeline.
- **Jobs** loads current openings from public direct-employer Greenhouse feeds and ranks them by your preferred roles, locations, work modes, and latest AI resume profile. Every live card links to the employer's hosted posting and shows its source and update date. If feeds are unavailable, CareerOS labels and uses a small starter catalog instead of presenting it as live data.
- **Companies** combines employers detected in applications with structured target-company research: industry, locations, website, career page, dream rating, priority, and notes.
- **Interviews** provides a monthly calendar and agenda. Schedule individual rounds with company, role, date, time, format, meeting link, and preparation notes.
- **Offers** provides a side-by-side decision table for base salary, bonus, equity, location, growth, learning, culture, commute, and a normalized overall score.
- **Network** is a relationship CRM for recruiters, alumni, referrers, and hiring teams, including relationship stage, LinkedIn, email, follow-up date, and notes.
- **Resume Lab** securely uploads private PDF, DOC, and DOCX resume versions up to 10 MB. Each card stores its target-role notes and opens the original file through a short-lived signed link.
- **Interview Prep** uploads private prep material and question-bank documents in PDF, Word, text, PNG, or JPG formats.
- **Documents** uploads private certificates, offer letters, marksheets, portfolio files, and other career documents.
- **Analytics** calculates stage distribution, response/interview/offer conversion, applications by role, applications by location, weekly activity, role breadth, and company breadth from your real applications.
- **AI Match** compares a selected uploaded resume with a pasted job description. It produces a transparent 100-point recruiter rubric, evidence-backed strengths and gaps, mandatory-requirement coverage, likely recruiter objections, truthful resume changes, and interview-preparation priorities. Select **Build my job-board profile** to extract an evidence-only reusable candidate profile and personalize live job ranking. Reports and profiles are stored privately in the signed-in account.
- **AI Studio** generates evidence-grounded cover letters, recruiter outreach and follow-ups, and JD-specific interview plans. Assets are stored privately as workspace documents or preparation records, can be reopened after a refresh, and include a verification checklist and integrity note.
- **Mail Tracker** can connect a separate Gmail OAuth grant using the metadata-only scope. It reads sender, subject, date, and labels—not message bodies or attachments—classifies likely applications, assessments, interviews, offers, rejections, and job alerts, and requires user review. An approved signal can be added to the private workspace as a review item; CareerOS does not silently mutate an application. Gmail is unavailable until the administrator completes the activation steps below.

### Configure CareerOS AI

The AI feature runs only on the server through the Gemini API. Add `GEMINI_API_KEY` to Vercel for Production and Preview, and optionally set `GEMINI_MODEL` (the default is `gemini-3.6-flash`). Never prefix the API key with `NEXT_PUBLIC_` or expose it in browser code.

AI Match reports include a persistent, analysis-aware conversation. Follow-up questions automatically include the selected resume, job description, original recruiter report, and the last 20 messages. Run `supabase/migrations/20260818170000_enable_ai_conversations.sql` once to allow account-scoped conversation updates.

### Activate Gmail metadata tracking

1. Apply `supabase/migrations/20260815100000_mailbox_connections.sql` in the Supabase SQL editor.
2. In Google Cloud, enable the Gmail API and create a Web application OAuth client.
3. Add `https://career-os-coral.vercel.app/api/mail/callback` as an authorized redirect URI.
4. Configure the OAuth consent screen with `openid`, `email`, and `https://www.googleapis.com/auth/gmail.metadata`.
5. In Vercel, add `GOOGLE_MAIL_CLIENT_ID`, `GOOGLE_MAIL_CLIENT_SECRET`, and a random `MAILBOX_ENCRYPTION_KEY` of at least 32 characters to Production and Preview, then redeploy.

Refresh tokens are AES-256-GCM encrypted before storage. CareerOS intentionally does not request Gmail message-body or send-mail access.

### Configure live job sources

CareerOS works without a paid job API by using public employer-published Greenhouse feeds. Optionally set `GREENHOUSE_BOARDS` to comma-separated board tokens for target employers. For broader India-wide aggregation, an Adzuna or equivalent licensed API account is still required; CareerOS does not scrape LinkedIn or mislabel static data as current openings.

Workspace records are private to the signed-in account and persist in Supabase after the production database migration has been applied.

## 9. Troubleshooting

### Google reports that the provider is not enabled

The Google authentication provider has not been enabled or saved in the CareerOS authentication service. Contact the CareerOS administrator and include a screenshot of the error.

### The confirmation email did not arrive

- Check spam, junk, and promotions folders.
- Wait a few minutes before trying again.
- Confirm that the address entered during registration is correct.
- Avoid repeatedly submitting the form, because email services may temporarily rate-limit requests.

### Sign-in returns to the login page

1. Refresh the page once.
2. Allow cookies for `career-os-coral.vercel.app` and `supabase.co`.
3. Disable strict tracking protection for the sign-in attempt.
4. Try a private window or another supported browser.

### Profile changes do not appear

- Confirm that **Profile updated** appears after saving.
- Refresh the dashboard.
- Ensure you are signed in to the intended account.

### The dashboard looks outdated

Perform a hard refresh:

- Windows/Linux: `Ctrl + Shift + R`
- macOS: `Command + Shift + R`

## 10. Privacy and account safety

- CareerOS never asks you to share your Google password.
- Google authentication occurs on Google’s official sign-in page.
- Never publish passwords, authentication codes, or private credentials in GitHub issues.
- Profile information is stored with the authenticated Supabase account.
- Application records are stored in the hosted Supabase PostgreSQL database and protected by per-user Row Level Security.
- Use **Sign out** before leaving a shared computer.

## Support

When reporting a problem, include:

- What you were trying to do
- The page or feature involved
- The exact error message
- A screenshot with passwords, tokens, and personal information hidden
- Browser and device type

Repository: [github.com/kagent2704/CareerOS](https://github.com/kagent2704/CareerOS)
