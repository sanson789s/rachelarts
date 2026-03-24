# Artist Notification Setup Guide

To ensure Rachel receives notifications even when not actively on the website, you can set up **Supabase Edge Functions** to bridge into Email or Discord.

## 1. Discord Webhooks (Recommended)
This is the easiest way to get instant mobile notifications on your phone.

1.  **Create a Discord Webhook**:
    -   Go to your Discord Server settings -> Integrations -> Webhooks.
    -   Create a new webhook and copy the URL.
2.  **Supabase Edge Function**:
    -   In your Supabase dashboard, go to **Edge Functions**.
    -   Create a new function called `notify-artist`.
    -   Use the following snippet to send a POST request to your Discord Webhook whenever a new row is inserted into the `commissions` table.

```typescript
// Add logic to listen to 'INSERT' on 'commissions'
const DISCORD_WEBHOOK_URL = 'YOUR_WEBHOOK_URL_HERE';

await fetch(DISCORD_WEBHOOK_URL, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    content: "🎨 **New Commission Request!**",
    embeds: [{
      title: "New Query Received",
      description: "A new client has submitted a commission query. Check the dashboard to review.",
      color: 0xFF64A0
    }]
  })
});
```

## 2. Email Notifications (Resend)
If you prefer email, you can integrate [Resend](https://resend.com) with Supabase Edge Functions.

1.  Sign up for Resend.
2.  Add your API Key to Supabase Secrets:
    `supabase secrets set RESEND_API_KEY=re_xxx`
3.  Modify the Edge Function to use the Resend SDK to send an email to `rachelstudio9@gmail.com`.

## 3. Database Triggers
Once your function is deployed, add a **Database Trigger** in Supabase:
-   **Table**: `commissions`
-   **Events**: `INSERT`
-   **Hook**: `notify-artist` (your edge function)

---

> [!TIP]
> This ensures Rachel never misses a potential client even if the browser tab is closed!
