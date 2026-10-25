# Google and email integrations

## Google sign-in

In Supabase Auth, enable Google and add the Google OAuth web client ID and secret. In Google Cloud, add Supabase's callback URI to the OAuth client:

`https://<your-project-ref>.supabase.co/auth/v1/callback`

Add the deployed app's `/app` and `/app/settings` URLs (including any configured base path) to Supabase's allowed redirect URLs. Google sign-in requests basic OpenID, email, and profile access.

## Google Calendar

Enable the Google Calendar API in the same Google Cloud project. Add this additional authorized redirect URI to the OAuth web client:

`https://<your-site-host>/<optional-base-path>/api/google/calendar/callback`

The Calendar connection requests the `calendar.events` scope. It uses OAuth authorization code flow on the server; Google refresh tokens are encrypted before they are stored in Supabase. Generate `GOOGLE_TOKEN_ENCRYPTION_KEY` with `openssl rand -base64 32`. Keep all server credentials out of browser-visible `NEXT_PUBLIC_` variables.

The app creates or updates only its own all-day events in the user's primary calendar: saved application dates and closing dates for saved opportunities. Disconnecting stops future synchronization but leaves existing events in the user's calendar.

## Application-date email alerts

Create a Resend API key and verify the sender address/domain. Set `RESEND_API_KEY` and `RESEND_FROM_EMAIL` in the server environment. Learners must opt in under Settings; an email is sent when they set or change a planned application date. Turning off the preference or pausing email notifications prevents delivery. Weekly digests, new-match emails, and closing-date emails are preferences only and are not yet delivered.

## Deployment

Apply the Supabase migrations, then configure the variables listed in `.env.example` in the deployment environment. These integrations require a Node.js deployment that runs the Next.js API routes; static-only hosting cannot complete OAuth callbacks, calendar sync, or email delivery.
