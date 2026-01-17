# Magic Link Email Template

Use these templates in Supabase Dashboard → Authentication → Email Templates

---

## Subject Line

```
Your login link for RedditLeadAI
```

---

## Email Body (HTML)

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 480px; width: 100%; border-collapse: collapse;">

          <!-- Logo -->
          <tr>
            <td align="center" style="padding-bottom: 32px;">
              <div style="display: inline-flex; align-items: center; gap: 8px;">
                <div style="width: 32px; height: 32px; background: linear-gradient(135deg, #a855f7, #ec4899); border-radius: 8px;"></div>
                <span style="font-size: 20px; font-weight: 700; color: #ffffff;">RedditLeadAI</span>
              </div>
            </td>
          </tr>

          <!-- Main Card -->
          <tr>
            <td style="background-color: #1e293b; border-radius: 16px; padding: 40px 32px; text-align: center;">

              <!-- Icon -->
              <div style="width: 56px; height: 56px; background: rgba(168, 85, 247, 0.15); border-radius: 12px; margin: 0 auto 24px; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 28px;">✉️</span>
              </div>

              <!-- Heading -->
              <h1 style="margin: 0 0 12px; font-size: 24px; font-weight: 700; color: #ffffff;">
                Sign in to your account
              </h1>

              <!-- Subtext -->
              <p style="margin: 0 0 32px; font-size: 15px; color: #94a3b8; line-height: 1.6;">
                Click the button below to securely sign in. This link expires in 1 hour and can only be used once.
              </p>

              <!-- CTA Button -->
              <a href="{{ .ConfirmationURL }}"
                 style="display: inline-block; background: linear-gradient(135deg, #a855f7, #ec4899); color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; padding: 14px 32px; border-radius: 12px;">
                Sign In to RedditLeadAI
              </a>

              <!-- Security Note -->
              <p style="margin: 32px 0 0; font-size: 13px; color: #64748b; line-height: 1.5;">
                If you didn't request this email, you can safely ignore it.
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top: 32px;">
              <p style="margin: 0; font-size: 12px; color: #475569;">
                © 2026 RedditLeadAI. All rights reserved.
              </p>
              <p style="margin: 8px 0 0; font-size: 12px; color: #475569;">
                Find high-intent leads on Reddit with AI.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## How to Apply

1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/czsprlynepwebxankjvg/auth/templates)
2. Click **Authentication** → **Email Templates**
3. Select **Magic Link**
4. Paste the subject line in "Subject"
5. Paste the HTML body in "Body"
6. Click **Save**

---

## Alternative: Plain Text Version

If you prefer a simpler text-only email:

**Subject:** `Sign in to RedditLeadAI`

**Body:**
```
Hi there,

Click this link to sign in to RedditLeadAI:

{{ .ConfirmationURL }}

This link expires in 1 hour and can only be used once.

If you didn't request this email, you can safely ignore it.

— The RedditLeadAI Team
```
