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

Your name, initials, headline, and dashboard greeting update immediately. Profile changes are saved securely with your CareerOS account. Your email address is controlled by your sign-in provider and cannot be edited from this window.

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

## 7. Manage today’s focus

Select the circle beside a task to mark it complete. Completed tasks are crossed out visually.

> Current limitation: task completion is session-only and resets after a page refresh.

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

The current release provides the complete Overview experience. Other navigation items display interaction feedback while their dedicated workspaces are being developed.

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
