# RedditLeadAI - Future Roadmap

> This roadmap outlines the evolution of RedditLeadAI from MVP to a 10k+ user platform.

---

## Phase 1: MVP Launch ✅ (Current)
- Core Reddit scraping via GitHub Actions
- AI lead scoring (MiMo-V2-Flash via OpenRouter)
- Inbox-style dashboard
- Dodo Payments subscriptions
- Google & Magic Link auth

---

## Phase 2: Scale to 500 Users

### The Proxy Pivot
Once you have 500+ users, the GitHub Action's IP address may get rate-limited by Reddit.

**Solution:** Subscribe to a **Residential Proxy** service:
- [Smartproxy](https://smartproxy.com/) - $14/GB
- [Bright Data](https://brightdata.com/) - $15/GB
- [Oxylabs](https://oxylabs.io/) - $15/GB

**Implementation:**
```typescript
// scraper/src/reddit.ts
const proxyUrl = process.env.PROXY_URL; // http://user:pass@proxy.smartproxy.com:10000
const response = await fetch(redditUrl, {
  agent: new HttpsProxyAgent(proxyUrl)
});
```

### Enhanced Analytics
- Lead conversion tracking
- Subreddit performance metrics
- Keyword effectiveness scores

---

## Phase 3: Mobile App (1,000+ Users)

### Option A: Capacitor
Wrap the Next.js dashboard in [Capacitor](https://capacitorjs.com/):
```bash
npm install @capacitor/core @capacitor/cli
npx cap init
npx cap add ios
npx cap add android
```

### Option B: Expo
Build a native mobile app with [Expo](https://expo.dev/):
- React Native with shared business logic
- Push notifications for new leads
- Offline support

---

## Phase 4: Multi-Platform Expansion (2,000+ Users)

Use the same "Invisible Scraper" architecture for:

| Platform | Data Source | Notes |
|----------|-------------|-------|
| **Twitter (X)** | Twitter API v2 | Requires Elevated access |
| **Quora** | Web scraping | Rate limits apply |
| **Hacker News** | Algolia API | Free, fast |
| **ProductHunt** | GraphQL API | Free tier available |
| **IndieHackers** | Web scraping | Community-friendly |

**Architecture stays the same:**
- Same database schema (add `platform` column to posts)
- Same AI scoring logic
- Same dashboard UI

---

## Phase 5: Automatic Karma Building (5,000+ Users)

### Feature: Reddit Karma Bot
Help users build Reddit karma to make their accounts look more authentic.

**How it works:**
1. Identify top posts in user's tracked subreddits
2. Generate generic "nice" comments using AI
3. Queue comments for user approval
4. User posts manually to build karma

**Safety:**
- Never auto-post (against Reddit ToS)
- Suggest only generic, helpful comments
- Rate-limit suggestions to avoid spam patterns

---

## Phase 6: Team Features (Agency Plan)

### Collaboration
- Team workspaces
- Shared lead inbox
- Lead assignment
- Activity feed

### White-Label
- Custom branding for agencies
- Client sub-accounts
- Custom domain support

---

## Phase 7: AI Enhancements

### Competitor Tracking
- Monitor competitor brand mentions
- Alert when competitors get negative feedback
- Suggest competitive positioning

### Sentiment Analysis
- Beyond lead scoring, analyze sentiment
- Identify crisis mentions early
- Track brand health over time

### Auto-Personalization
- Learn from user's past replies
- Adapt tone to match user's style
- Improve draft quality over time

---

## Technical Debt & Improvements

| Priority | Item | Description |
|----------|------|-------------|
| High | Rate Limiting | Implement proper rate limiting on API routes |
| High | Error Monitoring | Add Sentry or LogRocket |
| Medium | Caching | Redis for frequently accessed data |
| Medium | CDN | Cloudflare for static assets |
| Low | GraphQL | Migrate to GraphQL for better mobile support |
| Low | Real-time | WebSockets for live lead notifications |

---

## Revenue Projections

| Users | Avg Revenue/User | MRR |
|-------|------------------|-----|
| 100 | $15 | $1,500 |
| 500 | $18 | $9,000 |
| 1,000 | $20 | $20,000 |
| 5,000 | $22 | $110,000 |
| 10,000 | $25 | $250,000 |

*Assumes mix of Free (40%), Founder (45%), Agency (15%)*

---

## Timeline

```mermaid
gantt
    title RedditLeadAI Growth Timeline
    dateFormat  YYYY-MM
    section MVP
    Core Features     :done, 2026-01, 2026-02
    section Scale
    Proxy Integration :2026-03, 2026-04
    Analytics         :2026-04, 2026-05
    section Mobile
    Capacitor/Expo    :2026-05, 2026-07
    section Expansion
    Twitter           :2026-07, 2026-08
    HackerNews        :2026-08, 2026-09
    section Enterprise
    Team Features     :2026-09, 2026-11
    White-Label       :2026-11, 2027-01
```

---

## Success Metrics

| Metric | Target (6 months) |
|--------|-------------------|
| Registered Users | 1,000 |
| Paying Customers | 150 |
| MRR | $3,000 |
| Churn Rate | < 5% |
| Lead Accuracy | > 80% |
| User Satisfaction | > 4.5/5 |
