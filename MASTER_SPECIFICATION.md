# MASTER_SPECIFICATION.md
### MyInspireTag — Product & Engineering Blueprint
**Source of truth:** Client-provided UX workflow image (`the_ux_menu_visually-explained_designed.png`)
**Status:** Specification only — no implementation performed
**Purpose:** Single source of truth for all future feature work on this product

> **How to read this document.** Every statement in this spec is derived directly from what is visibly depicted in the attached UX image (screens, labels, copy, icons, states). Where the image does not show something explicitly, that gap is called out in a blockquote like this:
> **Assumption / Open Question:** ...
>
> Nothing in this document is invented as a "nice idea" — assumptions are logical inferences needed to make the depicted flows functional, and they are flagged so the client/product owner can confirm or correct them before engineering commits to them.

---

## 1. Product Vision

**What this is.** MyInspireTag is a physical-product-plus-companion-app experience built around a wearable/keepable "Tag" (an NFC/QR-enabled object — the image shows a purchasable variant named "Ocean Shell," styled as a shell-shaped charm/keychain). When the Tag is scanned, the app delivers a curated inspirational quote as a full-screen moment ("Today's Quote Experience"). The app then lets the user save, share, and reflect on that quote, browse their history of received quotes, favorite the ones that resonate, contribute their own quotes to the community, and subscribe to a Premium plan for unlimited, category-selectable inspiration.

**Who it's for.** Individuals seeking a small daily ritual of motivation/inspiration — the tone of the quotes ("Stay positive, work hard, make it happen," "Believe in yourself and all that you are," "Dream it. Wish it. Do it.") and the categories offered (Love, Strength, Healing, Faith, Gratitude) point to a wellness/mindfulness/self-improvement audience. The presence of a "Gifted Tag" order type indicates the product is also positioned as a **gift item** — someone can buy a Tag for another person.

**Primary user.** A logged-in consumer who owns (or was gifted) a physical Tag and uses the companion app daily. The Profile screen shows a concrete example persona: "Teo B," member since May 2026 — a single-user personal account model (not a household/team account).

**Business goal.** Recurring subscription revenue (Premium Plan, billed monthly at **$4.99**, confirmed by the Orders screen) layered on top of one-time/gift hardware sales (physical Tags, e.g., "Ocean Shell" variant at **$19.99**). Community-submitted quotes (Submit Quote feature) reduce content-sourcing cost and increase engagement/retention by making users co-creators. The daily-limit-for-free / unlimited-for-premium mechanic is the core upgrade lever.

> **Assumption:** The exact hardware technology (NFC vs. QR vs. both) is not shown; the sidebar icon for "Scan History" resembles a QR-style icon and the app is referred to by the client as involving a "tag," so this spec uses **"Tag"** as the generic term for the physical scannable object and does not assume a specific technology.

---

## 2. Core Product Flow

The end-to-end journey, reconstructed from the screens and the footer value-proposition strip ("Scan a tag or tap Inspire → Receive a daily inspiring quote → Save your favorites and reflect → Build your journey of inspiration"):

```
Landing / Marketing (not shown in image)
        ↓
Sign Up / Log In (not shown — inferred, since every screen shown is behind auth
        and a persistent "Log Out" control exists)
        ↓
Purchase a Tag  ───────────────►  (or receive a "Gifted Tag" from someone else)
        ↓                                          (Orders screen logs this purchase)
Receive physical Tag
        ↓
Scan Tag  ── OR ──  Tap "Inspire" in the app (bottom tab)
        ↓
"Today's Quote Experience" (full-screen curated quote reveal)
        ↓
   ┌────────────┬─────────────┬─────────────┐
   ↓            ↓             ↓             ↓
 Save         Share        Reflect      (do nothing)
   ↓                          ↓
Favorites            Reflection attached to entry
   ↓                          ↓
        (every quote received, saved or not, is logged)
        ↓
Scan History  +  My Quotes (aggregated library)
        ↓
Try to get another quote same day
        ↓
   ┌─────────────────────┬──────────────────────────┐
   ↓ FREE USER            ↓ PREMIUM USER
Daily limit reached    Choose a Category (Love, Strength,
→ countdown timer      Healing, Faith, Gratitude) or "Surprise Me"
→ "Notify Me"          → unlimited new "Today's Quote Experience" loops
→ upsell "Go Premium"
        ↓
   Subscription screen (view plan, benefits, next billing date)
        ↓
   Manage Subscription → (upgrade/change/cancel — external portal assumed)
        ↓
Profile (account identity + settings, reachable at any time)

In parallel, at any time:
Submit Quote → user contributes an original quote to the community
        (see Section 7 — Quote Lifecycle, for what happens after submission)
```

> **Assumption:** The Landing page, Sign Up/Log In screens, and the "Home" tab's actual screen content are **not depicted** in the image. This spec treats them as existing but out of scope for detailed screen specification (see Section 4).

---

## 3. Navigation Structure

The image shows **two parallel navigation systems** that must be reconciled:

### 3.1 Desktop/Tablet Sidebar (left rail, always visible)
A vertical, flat list of **7 primary destinations** plus a Log Out control:

1. Scan History
2. My Quote(s)
3. Submit Quote
4. Favorites
5. Orders
6. Subscription
7. Profile
8. **Log Out** (visually separated at the bottom, red/destructive styling)

Each item has an icon, a bold title, and a one-line description directly beneath it (e.g., "View your previous scans and quotes received."). This is a **flat hierarchy** — no nested/child items are shown under any sidebar entry.

### 3.2 Mobile Bottom Tab Bar (4 tabs, shown on every phone mockup)
`Home` · `Inspire` · `Library` · `Profile`

This is a **compressed** navigation model relative to the sidebar. Cross-referencing which tab is highlighted/active on each screen mockup:

| Screen | Active bottom tab |
|---|---|
| Scan History | Library |
| My Quotes | Library |
| Submit Quote | Library |
| Favorites | Library |
| Orders | Library |
| Subscription | Library |
| Profile | Profile |
| Today's Quote Experience | Inspire |

> **Assumption / Open Question:** The image never shows the "Library" tab's own landing screen (i.e., what appears the instant a user taps "Library" before drilling into Scan History/My Quotes/etc.). The most consistent interpretation is that **"Library" is a hub/menu screen on mobile** that surfaces the same destinations the desktop sidebar lists flat (Scan History, My Quotes, Submit Quote, Favorites, Orders, Subscription) — effectively the mobile equivalent of the sidebar, minus Profile (which gets its own dedicated tab) and possibly minus Log Out (likely relocated inside Profile on mobile). **This mapping is inferred, not shown, and should be confirmed with the client before building the mobile IA.**
>
> **Open Question:** Where does "Submit Quote" live in the bottom tab bar? It is grouped under "Library" here by inference, but given its emphasis in the sidebar (with its own dedicated description "Share a quote that inspires you with the community"), it may deserve more prominent placement (e.g., a 5th tab, or a floating action button). Needs client confirmation.
>
> **Open Question:** No screen for the "Home" tab is shown. It's reasonable to assume it's a dashboard/summary screen, but its exact content (recent activity? streak? shortcut to Inspire?) is **not specified by this image** and must not be invented. Flag for client clarification or a follow-up UX mockup.

### 3.3 Screen Hierarchy Summary

```
App Shell (authenticated)
├── Home (tab)                      — content unspecified
├── Inspire (tab)
│   ├── Today's Quote Experience    — entry point from Scan or "Inspire" tap
│   └── Inspire Flow (post-quote)
│       ├── Free variant (countdown + Notify Me + upsell)
│       └── Premium variant (category picker + Surprise Me)
├── Library (tab, mobile) / flat items (sidebar, desktop)
│   ├── Scan History
│   ├── My Quotes
│   ├── Submit Quote
│   ├── Favorites
│   ├── Orders
│   └── Subscription
└── Profile (tab / sidebar item)
    ├── Edit Profile        (child, list row — no screen shown)
    ├── Preferences          (child, list row — no screen shown)
    ├── Notification Settings (child, list row — no screen shown)
    ├── Privacy              (child, list row — no screen shown)
    ├── Help & Support       (child, list row — no screen shown)
    └── About Us             (child, list row — no screen shown)
```

> **Assumption:** All six Profile sub-rows are shown only as tappable list items with a chevron; none of their destination screens are depicted. Treat them as confirmed **entry points** whose internal screen designs are **not yet specified**.

---

## 4. Screen Specifications

For each screen: Purpose, User Goal, Displayed Information, Available Actions, Entry Point, Exit Point, Dependencies.

### 4.1 Scan History
- **Purpose:** Chronological record of every time the user scanned their Tag (or received a quote), with the quote received at each event.
- **User Goal:** "What have I received, and when?"
- **Displayed Information:** Header count ("18 Scans"); entries grouped under date headers ("Today," "Yesterday," then explicit dates like "May 30, 2026"); each row shows a thumbnail image, the quote text (truncated with quotation marks), and a timestamp (e.g., "6:00 PM").
- **Available Actions:** Tap a row (chevron affordance) to presumably open quote detail; implicit scroll for full history (18 scans, only ~6 visible).
- **Entry Point:** Sidebar "Scan History" (desktop) / Library hub (mobile) / directly after a scan event could also log here.
- **Exit Point:** Back arrow returns to previous screen (Library hub or dashboard); tapping a row presumably opens a quote detail view (not shown — **Assumption:** detail view reuses the "Today's Quote Experience" layout in a "read-only/historical" mode).
- **Dependencies:** Requires quote-delivery events to exist (i.e., depends on the Scan/Inspire flow having run at least once).

### 4.2 My Quotes
- **Purpose:** Aggregated library of **all** quotes the user has ever received (superset of Favorites, and derived from Scan History events).
- **User Goal:** "Show me every quote I've collected, in one place, browsable as a grid."
- **Displayed Information:** Header with a filter dropdown ("All Quotes ⌄"); 2-column card grid, each card showing a background image, the quote text overlaid, and the date received.
- **Available Actions:** Change filter (dropdown — options not shown; **Assumption:** likely filter by category and/or date range and/or favorited-only); tap a card to view quote detail (**Assumption**, not shown).
- **Entry Point:** Sidebar "My Quote" / Library hub.
- **Exit Point:** Hamburger/menu icon on the left of the header (**Assumption:** opens the sidebar/drawer on mobile) or back navigation via bottom tabs.
- **Dependencies:** Same underlying quote-received data as Scan History; likely the same data source with a different presentation (grid vs. timeline list).

> **Assumption:** "My Quote" (sidebar label, singular) and "My Quotes" (screen header, plural) refer to the same single feature; treated as one feature throughout this document.

### 4.3 Submit Quote
- **Purpose:** Let a user contribute an original quote to the community/content pool.
- **User Goal:** "Share something inspiring I wrote or heard."
- **Displayed Information:** Icon badge, title "Share Inspiration," subtitle "Your words can inspire someone today."; static encouragement copy under the submit button ("Thank you for spreading inspiration.").
- **Available Actions:** Fill quote text (textarea, required — no character counter shown but should be assumed necessary); fill "Who said it? (Optional)" (author/attribution, optional); choose a category (dropdown, required — no explicit "(optional)" label, unlike the author field); tap "Submit Quote" (primary button).
- **Entry Point:** Sidebar "Submit Quote" / Library hub.
- **Exit Point:** Back arrow; **Assumption:** after successful submission, user is either returned to a confirmation state or redirected to My Quotes / a "My Submissions" view — **not shown in the image**, must be confirmed with client.
- **Dependencies:** Category list must match whatever taxonomy the product uses for curated quotes (see Section 6 for the taxonomy observed in the Premium category picker: Love, Strength, Healing, Faith, Gratitude).

> **Assumption / Open Question (important):** The image shows only the submission form — it does **not** show a moderation queue, a "pending review" status, or any admin approval UI. Standard practice for community-submitted content is to require review before publication, but **this spec does not assert that as confirmed fact** — it is called out explicitly in Section 7 (Quote Lifecycle) as an assumption requiring client confirmation, since asserting it as certain would violate the "do not invent" instruction.

### 4.4 Favorites
- **Purpose:** Quick access to the subset of received quotes the user explicitly chose to keep.
- **User Goal:** "Show me only the quotes I loved enough to save."
- **Displayed Information:** Header count ("8 Saved Quotes"); list rows with thumbnail, quote text, date, and a filled red heart icon on the right.
- **Available Actions:** Tap the heart to un-favorite (implied by the heart being an interactive toggle, consistent with standard favorite-icon conventions); tap a row to view detail (**Assumption**).
- **Entry Point:** Sidebar "Favorites" / Library hub; also reachable via the "Save" action on "Today's Quote Experience."
- **Exit Point:** Back arrow.
- **Dependencies:** A quote must first exist in Scan History / My Quotes before it can be favorited (favoriting happens via the "Save" action on the quote-reveal screen).

### 4.5 Orders
- **Purpose:** Transaction/purchase history for both subscription billing and physical Tag purchases (including gifted ones).
- **User Goal:** "What have I bought, and what's the status?"
- **Displayed Information:** Status filter tabs — All / Completed / Processing; order rows showing order number (#1234, #1233, #1232, #1231), a product/plan label ("Premium Plan (Monthly)" or "Gifted Tag – Ocean Shell"), a date, a price ($4.99 or $19.99), and a status badge ("Completed," green).
- **Available Actions:** Switch tabs to filter by status; tap a row for order detail (**Assumption**, not shown).
- **Entry Point:** Sidebar "Orders" / Library hub.
- **Exit Point:** Back arrow.
- **Dependencies:** Requires a purchase/checkout flow to exist upstream (Tag purchase, gift purchase, subscription purchase) — none of those checkout screens are shown in this image.

> **Observation:** The presence of a "Processing" tab implies order statuses beyond just "Completed" exist (e.g., a physical Tag order can be "Processing" while it ships). **Assumption:** the full status enum likely also includes something like "Cancelled" or "Refunded," but only "Completed" is actually shown as a populated example; the rest is inferred from the tab affordance itself.

### 4.6 Subscription
- **Purpose:** Show current plan, its benefits, and billing status; provide access to manage the plan.
- **User Goal:** "What am I paying for, and when do I get billed next?"
- **Displayed Information:** Crown icon; plan name "Premium Plan"; status "You're on Premium"; a checklist of 6 benefits (Unlimited quotes, All categories, Daily new inspiration, Save unlimited quotes, Write reflections, Ad-free experience); "Next Billing Date: Jul 1, 2026."
- **Available Actions:** "Manage Subscription" button (outline style — visually secondary compared to the primary purple buttons elsewhere, consistent with routing to an external billing portal rather than an in-app flow).
- **Entry Point:** Sidebar "Subscription" / Library hub; also reachable via the upsell link on the Free-user Inspire Flow ("Go Premium for unlimited inspiration").
- **Exit Point:** Back arrow; "Manage Subscription" presumably exits to a billing portal (**Assumption**, standard pattern; not shown).
- **Dependencies:** Requires a purchase/checkout flow for users who are NOT yet Premium (that screen/state is not shown — only the "already Premium" state is depicted). **Assumption/Open Question:** the Free-user equivalent of this screen (what a non-subscriber sees on the Subscription page, presumably a "compare plans" or "Upgrade" screen) is **not shown** and must be designed/confirmed separately.

### 4.7 Profile
- **Purpose:** Account identity and settings hub.
- **User Goal:** "Manage who I am and how the app behaves for me."
- **Displayed Information:** Avatar photo, name ("Teo B"), email ("teobitola@gmail.com"), membership start date ("Member since May 2026"); a list of 6 settings entries: Edit Profile, Preferences, Notification Settings, Privacy, Help & Support, About Us.
- **Available Actions:** Tap any row to drill into that setting (all chevron-affordanced, destinations not shown).
- **Entry Point:** Sidebar "Profile" / bottom tab "Profile."
- **Exit Point:** Each row exits to its own (unshown) sub-screen; "Log Out" is available from the sidebar on desktop (**Open Question:** where does Log Out live on mobile, since the bottom tab bar has no explicit Log Out affordance — likely inside this Profile screen, but not shown here).
- **Dependencies:** None beyond authentication.

### 4.8 Today's Quote Experience
- **Purpose:** The core, signature moment of the product — the full-screen reveal of a curated quote.
- **User Goal:** "Receive my inspiration for right now."
- **Displayed Information:** Full-bleed background photo; quote text overlaid ("Stay positive, work hard, make it happen."); a small heart/like icon beneath the text.
- **Available Actions:** Bottom action bar with four icons — **Save**, **Inspire** (large, centered, highlighted — the active tab indicator, though it may double as a "get inspired again" action), **Share**, **Reflect**.
- **Entry Point:** Scanning the physical Tag, OR tapping "Inspire" in the bottom tab bar.
- **Exit Point:** Any of the four action-bar icons, or standard tab navigation away.
- **Dependencies:** A quote must be available to deliver (depends on daily-limit logic for Free users — see Inspire Flow below).

> **Assumption:** The small heart icon directly under the quote text (distinct from the "Save" action icon in the bottom bar) is ambiguous — it could be a decorative/branding element, a duplicate "like" affordance, or a live counter of how many people liked this quote community-wide. **Not confirmed by the image; flag for client clarification.**
>
> **Cross-screen relationship:** The **Reflect** action here directly corresponds to the "Write reflections" line item in the Subscription benefits checklist (Section 4.6). This strongly implies **Reflect may be a Premium-gated action** for Free users, though the image does not show a locked/upsell state for it specifically. **Assumption**, needs confirmation.

### 4.9 Inspire Flow (After Quote) — Free User variant
- **Purpose:** Tell a Free user they've already used today's quote and set expectations for the next one.
- **User Goal:** "When can I get another one, and can I skip the wait?"
- **Displayed Information:** Hourglass icon; "You've received today's inspiration!"; live countdown ("Come back in 23h 14m 32s for a new quote."); upsell copy ("Go Premium for unlimited inspiration" with "unlimited" styled as a link).
- **Available Actions:** "Notify Me" button (primary, purple); tap the "unlimited" link to go to the upgrade/Subscription flow.
- **Entry Point:** Tapping "Inspire" (or re-scanning the Tag) after the daily quote has already been claimed.
- **Exit Point:** "Notify Me" (presumably schedules a push/email notification — **Assumption**, mechanism not shown); upsell link → Subscription screen.
- **Dependencies:** Requires a per-user "last quote claimed at" timestamp and a subscription-tier check.

### 4.10 Inspire Flow (After Quote) — Premium User variant
- **Purpose:** Let a Premium user actively choose what kind of inspiration they want next, on demand, with no cap.
- **User Goal:** "Give me a quote about X right now" (or surprise me).
- **Displayed Information:** "Choose a Category" header; a list of 5 categories, each with a distinct icon and accent color — **Love** (heart, pink), **Strength** (bicep, orange/tan), **Healing** (leaf, green), **Faith** (icon, tan), **Gratitude** (sun, yellow); a distinctly styled "Surprise Me" option (dice icon, neutral gray) below the category list.
- **Available Actions:** Tap a category → presumably routes back into "Today's Quote Experience" with a quote from that category; tap "Surprise Me" → presumably a random category/quote.
- **Entry Point:** Tapping "Inspire" (or re-scanning) as a Premium subscriber, at any time, with no daily cap.
- **Exit Point:** Selecting a category or Surprise Me loops back to Section 4.8 (Today's Quote Experience) with new content.
- **Dependencies:** Requires the underlying quote content pool to be tagged by category (Love/Strength/Healing/Faith/Gratitude), and requires the subscription-tier check used in 4.9.

> **Important taxonomy note:** The five categories shown here — **Love, Strength, Healing, Faith, Gratitude** — are the only category taxonomy explicitly evidenced by this image. Any other category naming used elsewhere (in earlier designs, other documents, or existing systems) should be **reconciled against this image as the source of truth**, or explicitly flagged as a discrepancy for the client to resolve, rather than silently merged or guessed at.

---

## 5. User Roles

The image directly evidences three of the four requested roles. **Admin is not depicted anywhere in this image** — no admin screens, moderation queues, or content-management UI appear.

### Guest (not authenticated)
> **Assumption:** Not shown. Presumed to have access only to marketing/landing content and the sign-up/purchase flow, with no access to any of the 9 screens documented in Section 4 (all of which sit behind a persistent Log Out control, implying auth is required).

### Authenticated User — Free tier
Can: scan/tap for **one** quote per day; save quotes to Favorites (**Open Question:** is there a cap, given "Save unlimited quotes" is listed as a *Premium* benefit — see Section 6); view Scan History and My Quotes; submit quotes via Submit Quote; view Orders; view/upgrade Subscription; manage Profile. Cannot: choose a quote category on demand; get more than one quote per day without upgrading; (**Assumption**) write Reflections, per the cross-screen relationship noted in 4.8; (**Assumption**) is shown ads, per "Ad-free experience" being listed as a Premium-exclusive benefit.

### Authenticated User — Premium tier
Everything a Free user can do, plus: unlimited quotes per day; full category selection (Love, Strength, Healing, Faith, Gratitude) or Surprise Me; (**Assumption**) unlimited saved Favorites; (**Assumption**) ability to write Reflections; ad-free experience; sees "You're on Premium" status and billing info on the Subscription screen.

### Admin
> **Not depicted in this image at all.** No admin dashboard, moderation queue, user-management, or content-management screens are shown. Given that Submit Quote exists as a user-facing feature, **it is a reasonable but unconfirmed inference** that some admin capability exists to review/approve/reject submitted quotes (see Section 7). **This entire role must be treated as out of scope for this specification until a dedicated admin UX artifact is provided.**

---

## 6. Subscription Rules

| Rule | Free | Premium |
|---|---|---|
| Quotes per day | **1** (hard cap, countdown to reset) | **Unlimited** |
| Category selection | Not available (quote just "arrives") | Full picker: Love, Strength, Healing, Faith, Gratitude, or Surprise Me |
| Saved favorites | (**Assumption:** limited/capped — see note below) | "Save unlimited quotes" (explicit) |
| Reflections | (**Assumption:** locked) | "Write reflections" (explicit) |
| Ads | (**Assumption:** shown) | "Ad-free experience" (explicit) |
| Price | Free | **$4.99/month** (from Orders evidence) |
| Billing cycle | — | Monthly, with a visible "Next Billing Date" |
| Upgrade entry points | (a) upsell link on the Free Inspire Flow screen ("Go Premium for unlimited inspiration"); (b) Subscription screen itself | — |
| Downgrade/cancel | — | "Manage Subscription" button → external portal (**Assumption**) |

> **Assumption:** The Free-tier cap on saved Favorites is inferred purely from the wording "Save **unlimited** quotes" being listed as a Premium benefit (implying Free must have *some* limit for that word to carry meaning) — but no specific number is shown anywhere. **Must be confirmed with the client before implementation** (e.g., is it 5? 10? 20?).
>
> **Locked features summary (Free tier):** category choice, quotes beyond 1/day, (assumed) reflections, (assumed) ad-free viewing, (assumed) unlimited favorites.

---

## 7. Quote Lifecycle

Two distinct lifecycles are evidenced by the image and must not be conflated:

### 7.1 Curated/System Quote → User
```
Quote exists in the content pool, tagged with a category
(Love / Strength / Healing / Faith / Gratitude)
        ↓
User scans Tag or taps Inspire
        ↓
   Free: system auto-selects a quote (no category choice), capped at 1/day
   Premium: user picks a category (or Surprise Me), no cap
        ↓
Delivered as "Today's Quote Experience" (full-screen reveal)
        ↓
   ┌── Save → added to Favorites
   ├── Share → (Assumption: native OS share sheet — mechanism not shown)
   └── Reflect → (Assumption, Premium-gated) a personal note attached to this entry
        ↓
Always logged to Scan History (timestamped) and My Quotes (aggregated library),
regardless of whether the user Saved/Shared/Reflected
```

### 7.2 User-Submitted Quote → Community
```
User fills out Submit Quote form: quote text (required),
author/"who said it" (optional), category (required — dropdown, not labeled optional)
        ↓
Tap "Submit Quote"
        ↓
> ASSUMPTION — NOT CONFIRMED BY THE IMAGE:
> Pending Review (admin moderation queue)
>        ↓
>   Admin Approves ──────────────► Published (joins the curated content pool,
>                                   now deliverable to other users in 7.1)
>   Admin Rejects  ──────────────► User notified, quote does not become visible
>        ↓ (mechanism/UI for approval, rejection, and user notification
>            of the outcome is not shown anywhere in this image)
```

> This entire "pending review" branch is flagged as an assumption because: (a) it is standard practice for any product accepting public-facing user-generated content, and (b) the existence of a "category" field on the submission form implies submitted quotes are meant to re-enter the same categorized pool used in 7.1 — but the image provides **zero direct evidence** of a moderation step, a status indicator on the user's own submissions, or an admin interface. **This must be confirmed with the client before an approval workflow is engineered as fact**, since the alternative (quotes publish instantly with no review) is equally plausible from the image alone and carries very different trust/safety implications.

---

## 8. QR / Tag Workflow

- **Tag:** A physical, purchasable object. At least one named design variant is evidenced: "Ocean Shell" ($19.99, per Orders). Tags can be bought for oneself or as a "Gifted Tag" for someone else.
- **Activation:** Not shown. **Assumption:** a Tag likely must be linked/activated to a specific user account (standard pattern for personalized NFC/QR products) before it can deliver personalized quotes and log to that user's Scan History.
- **Assignment:** Not shown in detail. **Open Question:** for a "Gifted Tag" order, does the *purchaser's* account get charged while the *recipient* activates and owns the Tag going forward? Or does the purchaser's own account receive the Tag? The image only confirms the order line item exists ("Gifted Tag – Ocean Shell") — the mechanics of gifting/transfer are not shown.
- **Scan:** Scanning the physical Tag is one of the two entry points into "Today's Quote Experience" (the other being tapping "Inspire" manually in-app).
- **Daily Experience:** The first scan/tap of the day yields a new quote. For Free users this is capped at exactly one per day; for Premium users, every scan/tap can yield a new quote, optionally with a chosen category.
- **Repeated Scan (Free):** **Assumption** (logically inferred, not directly shown as a distinct screen state): scanning again after the daily quote has already been claimed routes the user to the Inspire Flow "Free User" screen (countdown + Notify Me + upsell) rather than granting a second quote.
- **Repeated Scan (Premium):** Routes to the Inspire Flow "Premium User" category-picker screen, enabling unlimited fresh quotes on demand.

---

## 9. Feature Specifications

*(Only features with direct visual evidence are detailed. Two requested example features — "Gift Messages" and "Notifications" as a dedicated inbox — are explicitly called out as NOT shown.)*

**Scan History** — see Section 4.1.
**Favorites** — see Section 4.4.
**My Quotes** — see Section 4.2.
**Submit Quote** — see Section 4.3.
**Orders** — see Section 4.5.
**Subscription** — see Section 4.6.
**Profile** — see Section 4.7.
**Settings** — Not a standalone top-level screen; represented as three of the six Profile sub-rows (Preferences, Notification Settings, Privacy). No settings screen content is shown.

> **Gift Messages:** Not depicted as a distinct feature anywhere in the image. The only gifting-related evidence is the **"Gifted Tag – Ocean Shell"** line item on the Orders screen, which confirms tag-gifting exists as a *purchase type* but says nothing about whether a personal message can be attached, how it's delivered, or whether the recipient sees it in-app. **Do not build a "Gift Messages" feature from this document alone — it requires client clarification or a dedicated mockup.**
>
> **Notifications:** No dedicated notifications inbox/screen is shown. The only two notification-adjacent touchpoints are: (1) the "Notify Me" button on the Free-tier Inspire Flow screen, and (2) the "Notification Settings" row inside Profile. Treat push/email notification *infrastructure* as implied-necessary (to fulfill "Notify Me"), but a notifications *screen/inbox* is not evidenced and should not be assumed.

---

## 10. Relationships Between Features

```
Scan Tag / Tap Inspire
        │
        ▼
Today's Quote Experience ───────────┬── Save ──────► Favorites
        │                           ├── Share ─────► (external, OS share)
        │                           └── Reflect ───► (Premium-only, assumed)
        ▼
Always logged ──► Scan History  +  My Quotes (same underlying event, two views:
                                                timeline vs. aggregated grid)
        │
        ▼
Daily cap reached?
   ├── No (Premium) ──► Inspire Flow (Premium) ──► category/Surprise Me ──┐
   │                                                                       │
   └── Yes (Free) ────► Inspire Flow (Free) ──► "Notify Me" or            │
                          "Go Premium" link ──► Subscription ──► Orders   │
                                                                            │
                          ◄─────────────────── loops back ────────────────┘

Submit Quote ──► (assumed) Admin review ──► Published ──► re-enters the
                                                            curated pool used
                                                            at the very top
                                                            of this diagram

Profile is a cross-cutting hub — reachable from anywhere, ties account
identity to every other feature (whose orders, whose favorites, whose
subscription, whose submitted quotes).

Orders and Subscription are tightly coupled: every subscription charge
and every Tag purchase (including gifts) appears as an Orders line item.
```

---

## 11. Backend Requirements

*(Description only — no implementation. Framed for a MERN-style stack, per the engineering persona of this task; the image itself is technology-agnostic.)*

### 11.1 Tag
- **Expected API:** create/register a Tag, link/activate a Tag to a user account, fetch Tag(s) owned by a user, mark a Tag as gifted (purchaser ≠ owner).
- **Database Model:** Tag(id, designVariant, purchaserUserId, ownerUserId, isGift, activatedAt, createdAt).
- **Permissions:** Only an authenticated user can activate a Tag to their own account.
- **Validation:** A Tag code/ID must be unique and only activatable once.
- **Business Rules:** Gifted Tags require an activation step by the recipient (**Assumption** — see Section 8 open question).

### 11.2 Scan / Quote Delivery Event
- **Expected API:** record a scan/inspire-tap event; fetch a quote to deliver (respecting daily-cap-for-Free / category-choice-for-Premium logic); fetch scan history (paginated, grouped by day); fetch "my quotes" aggregated view (paginated, filterable).
- **Database Model:** ScanEvent(id, userId, quoteId, deliveredAt, source[scan|inspire-tap]).
- **Permissions:** Authenticated users only; delivery logic must check subscription tier server-side (not just client-side) to enforce the daily cap.
- **Validation:** Reject a "new quote" request from a Free user who has already claimed today's quote; return the existing daily quote plus a countdown to next eligibility instead.
- **Business Rules:** One delivery per Free user per rolling 24h window (see Section 17); unlimited for Premium.

### 11.3 Quote (curated content pool)
- **Expected API:** fetch a random or category-filtered quote for delivery; admin CRUD (out of scope per Section 5, Admin not evidenced).
- **Database Model:** Quote(id, text, author (optional), category [love|strength|healing|faith|gratitude], source[curated|user-submitted], submittedByUserId (nullable), status, createdAt).
- **Permissions:** Read access for delivery is open to any authenticated user; write access is admin/system only (except via the Submit Quote pipeline).
- **Validation:** Category must be one of the five confirmed values (Section 4.10).
- **Business Rules:** See Section 7.2 for the assumed review pipeline.

### 11.4 Favorite
- **Expected API:** add/remove a favorite; fetch a user's favorites (paginated).
- **Database Model:** Favorite(id, userId, quoteId/scanEventId, createdAt).
- **Permissions:** A user can only favorite/unfavorite their own entries.
- **Validation:** Enforce the (assumed) Free-tier favorites cap server-side if one is confirmed to exist (Section 6).
- **Business Rules:** Favoriting requires the quote to already exist in the user's Scan History/My Quotes (a user cannot favorite a quote they never received).

### 11.5 Submit Quote
- **Expected API:** submit a new pending quote; (assumed) fetch the current user's own submissions with status; (assumed, admin-only) list/approve/reject pending submissions.
- **Database Model:** reuses the Quote model (11.3) with `source: "user-submitted"`, `submittedByUserId`, and a `status` field.
- **Permissions:** Any authenticated user can submit; only admin (assumed role, not evidenced) can approve/reject.
- **Validation:** Quote text required (min/max length not specified by the image — **Open Question**); author optional; category required.
- **Business Rules:** See Section 7.2 — flagged as an assumption pending client confirmation.

### 11.6 Order
- **Expected API:** create an order (Tag purchase, gift purchase, subscription purchase); fetch a user's orders (paginated, filterable by status).
- **Database Model:** Order(id, userId, type [tag|gifted-tag|subscription], label, amount, currency, status [processing|completed|...], createdAt).
- **Permissions:** A user can only view their own orders.
- **Validation:** Amount and type must match a known product/plan catalog entry.
- **Business Rules:** Every Tag purchase and every subscription billing cycle produces an Order record (per the Orders screen evidence).

### 11.7 Subscription
- **Expected API:** fetch current subscription status/plan/benefits/next billing date; initiate upgrade/checkout; (assumed) manage/cancel via portal redirect.
- **Database Model:** Subscription(id, userId, plan [free|premium], status, currentPeriodEnd, priceId, createdAt).
- **Permissions:** A user can only view/manage their own subscription.
- **Validation:** Downstream feature checks (daily cap, category access, favorites cap, reflections, ads) must all read from this single source of truth.
- **Business Rules:** $4.99/month Premium plan (Section 6).

### 11.8 Profile
- **Expected API:** fetch/update current user profile; fetch/update preferences and notification settings; fetch privacy settings.
- **Database Model:** User(id, name, email, avatarUrl, memberSince, ...). Sub-documents or related tables for Preferences and NotificationSettings.
- **Permissions:** A user can only view/edit their own profile.
- **Validation:** Standard profile field validation (email format, etc.) — not detailed by the image.
- **Business Rules:** None evidenced beyond basic account ownership.

---

## 12. Frontend Requirements

*(Per-screen technical planning, as explicitly requested by the template — this is standard engineering translation of the UX, not new product invention.)*

For every screen documented in Section 4, the following apply:

- **Components:** A shared "list-row" component (thumbnail + text + meta + chevron) reused identically across Scan History, My Quotes-as-list, and Favorites; a shared "card" component for My Quotes' grid mode; a shared status-badge component for Orders; a shared category-pill component for the Premium Inspire Flow; a shared countdown-timer component for the Free Inspire Flow; a shared empty-state component (not directly shown, but required wherever a list can be empty — e.g., zero scans, zero favorites, zero orders).
- **Hooks:** Data-fetching hooks per feature (scan history, my quotes, favorites, orders, subscription status, profile), plus a shared "current subscription tier" hook that gates UI across Inspire Flow, Subscription, and any Premium-only affordances (Reflect, category picker).
- **State:** Local UI state for filters/dropdowns (My Quotes' "All Quotes" filter, Orders' tab selection); global/shared state for auth session and subscription tier (needed on nearly every screen).
- **React Query (or equivalent):** List/detail fetches for Scan History, My Quotes, Favorites, Orders should be cached and paginated; mutations for Save/Unfavorite, Submit Quote, and quote-delivery requests should invalidate the relevant list caches on success (e.g., saving a quote should invalidate the Favorites list and update the My Quotes/Scan History entry's saved state).
- **Loading States:** Skeleton placeholders for list/grid screens (Scan History, My Quotes, Favorites, Orders) and for the Today's Quote Experience hero while the image/quote loads.
- **Empty States:** Required for Scan History (never scanned), My Quotes (none received yet), Favorites (none saved), Orders (no purchases yet). None of these are visually specified by the image — copy/illustration to be designed separately.
- **Error States:** Standard retry-capable error UI for all data-fetching screens; explicit handling for the "quote delivery" call failing (e.g., network issue when tapping Inspire).
- **Responsive Behavior:** The image shows only mobile-width mockups plus a desktop-width sidebar — implying a responsive shell where the sidebar (desktop/tablet) collapses into the bottom tab bar (mobile), per Section 3.

---

## 13. UX Rules

Derived from consistent visual patterns observed across the mockups:

- **Color system:** Dark theme throughout (near-black backgrounds). **Two accent colors** are used with apparent intent: **amber/gold** for brand identity and premium/status signaling (logo, crown icon, "Premium Plan," the active "Inspire" tab highlight), and **violet/purple** for primary call-to-action buttons (Submit Quote, Notify Me). Category icons each carry their own accent color (pink/Love, orange-tan/Strength, green/Healing, tan/Faith, yellow/Gratitude) — category color-coding should be preserved consistently anywhere categories appear.
- **Status colors:** Green for "Completed" order status and for "checked" Premium benefit items; red for the favorited heart icon and for the destructive Log Out control.
- **Iconography:** Every navigation destination (sidebar and bottom tabs) pairs an icon with a text label — icons are never used alone for primary navigation.
- **List pattern:** Every list-based screen (Scan History, Favorites, and My Quotes-as-list-equivalent) uses the same visual grammar: thumbnail → text → meta (date/time) → chevron. This pattern should be built once and reused (see Section 12).
- **Buttons:** Primary actions use solid, full-width, rounded buttons (Submit Quote, Notify Me); secondary/management actions use outline buttons (Manage Subscription).
- **Badges/Pills:** Status is always communicated via a rounded pill/badge (order status, and implicitly quote category tags) rather than plain text.
- **Countdown/urgency:** The Free-tier daily limit uses a live countdown timer as a soft-urgency mechanic paired with a low-friction alternative ("Notify Me") rather than a hard dead-end.
- **Navigation:** Back-arrow-plus-title header pattern is consistent across every secondary screen (everything except Today's Quote Experience and Inspire Flow, which are full-bleed/immersive and de-emphasize chrome).
- **Transitions/Animations:** Not directly evidenced by static mockups — **Assumption:** standard slide/fade transitions between list → detail and tab → tab should be used, consistent with the product's calm, reflective tone; nothing jarring given the wellness-adjacent positioning.
- **Toasts/Modals:** Not directly evidenced — **Assumption:** confirmation feedback (e.g., "Quote saved," "Quote submitted") likely uses a toast, and destructive actions (e.g., Log Out) likely use a confirmation modal, consistent with common product conventions, but neither is shown in this image.
- **Accessibility:** Not evidenced by static mockups; standard requirements (contrast, tap target size, screen-reader labels for icon-only controls like the bottom-bar action icons) should be treated as baseline engineering requirements regardless of the source image.

---

## 14. Future Expansion

*(Clearly speculative — not implied as committed scope by the image. Listed because they are natural extensions of what IS shown.)*

- Admin moderation dashboard for Submit Quote review (see Section 7.2/Section 5 — currently a confirmed gap, not just a future nice-to-have).
- A dedicated Reflections journal/history view (currently the Reflect action exists, but no screen shows *viewing* past reflections).
- A full Notifications inbox (currently only "Notify Me" and "Notification Settings" exist as touchpoints, not a screen).
- Streak/gamification layer, loosely suggested by the tagline "Build your journey of inspiration."
- Multi-Tag management, if a user can own more than one Tag (e.g., one for themselves, one received as a gift).
- Social/community layer beyond quote submission (e.g., seeing who else favorited a quote, given the ambiguous "like" heart icon noted in Section 4.8).
- Multi-language support for quotes and UI.
- Offline access to previously received quotes.

---

## 15. Implementation Roadmap

**Phase 1 — Authentication**
Sign up, log in, log out (Log Out control already evidenced in the sidebar), session/auth state shared across the whole app shell.

**Phase 2 — Dashboard / App Shell**
Sidebar (desktop) and bottom tab bar (mobile) navigation shell; Profile screen (identity display + settings entry points); Home tab (content TBD — Open Question from Section 3).

**Phase 3 — QR/Tag Experience**
Tag activation/linking; Scan event capture; "Today's Quote Experience" screen; Save/Share/Reflect actions; Scan History screen.

**Phase 4 — Quote System**
My Quotes aggregated view; Favorites; the curated content pool with category taxonomy (Love/Strength/Healing/Faith/Gratitude); daily-cap enforcement for Free users; Inspire Flow (both Free and Premium variants).

**Phase 5 — Community**
Submit Quote form and submission pipeline; (pending client confirmation) admin review workflow from Section 7.2.

**Phase 6 — Subscription**
Subscription screen (Premium state); upgrade/checkout flow (Free-state screen not shown, needs design); Orders screen and order logging for both Tag purchases and subscription billing.

**Phase 7 — Admin**
Entirely undefined by this image; requires a dedicated UX artifact before scoping. At minimum, if Phase 5's review assumption is confirmed, an admin moderation queue is required here.

**Phase 8 — Production Hardening**
Empty/error/loading states across all list screens (Section 12); accessibility pass; notification infrastructure for "Notify Me"; gifting mechanics for Tags (Section 8 open questions).

---

## 16. Technical Notes

- **Reusable Components:** List-row (thumbnail+text+meta+chevron), Quote card (grid mode), Status badge/pill, Category pill (with per-category color), Countdown timer, Bottom tab bar, Sidebar nav, Empty state, Loading skeleton.
- **Reusable Hooks:** `useSubscriptionTier` (gates category picker, Reflect action, favorites cap, ads), `useDailyQuoteEligibility` (Free-tier cap + countdown), `useScanHistory`, `useMyQuotes`, `useFavorites`, `useOrders`.
- **Shared Services:** A quote-delivery service (encapsulates the Free/Premium branching logic in one place so it isn't duplicated across the Today's Quote Experience and Inspire Flow screens), an orders/billing service, a Tag activation service.
- **Shared Layouts:** A single authenticated app-shell layout combining the sidebar (desktop) / bottom-tab-bar (mobile) responsively, with Profile and the Library-grouped screens (Section 3.3) nested inside it.
- **Global State:** Auth/session, current subscription tier (read very frequently across screens — should not require a fresh fetch on every screen), current user profile summary (for avatar/name display).
- **Caching Strategy:** Cache list data (Scan History, My Quotes, Favorites, Orders) with invalidation on the relevant mutation (favorite/unfavorite, submit quote, new order); cache subscription tier with a short TTL since it directly gates functionality and must stay fresh after an upgrade.
- **Folder Structure (suggested, generic):** feature-based grouping mirroring Section 3.3 (`scan-history/`, `my-quotes/`, `submit-quote/`, `favorites/`, `orders/`, `subscription/`, `profile/`, `inspire/`), with a `shared/` or `components/ui/` directory for the cross-feature primitives listed above.

---

## 17. Product Rules

- Free users receive **exactly one** curated quote per rolling ~24-hour period; a live countdown shows time until the next one is available.
- Free users **cannot** choose a quote category; Premium users can choose from **Love, Strength, Healing, Faith, Gratitude**, or select **Surprise Me** for a random pick.
- Premium unlocks: unlimited quotes, all categories, daily new inspiration, (assumed) unlimited saved favorites, (assumed) the ability to write reflections, and an ad-free experience.
- Premium is billed **monthly at $4.99** (confirmed by Orders evidence).
- Tags are a physical product; at least one named variant ("Ocean Shell") is priced at **$19.99** and can be purchased for oneself or as a **Gifted Tag** for someone else.
- Every quote delivery event is logged to Scan History (timestamped, grouped by day) and aggregated into My Quotes, regardless of whether the user saves/shares/reflects on it.
- Favoriting is a toggle (heart icon) available from both the delivery moment (Save action) and presumably from within My Quotes/Scan History detail views.
- Submitting a quote requires quote text and a category; attributing an author/source is optional.
- Orders can be in at least two statuses: "Completed" (confirmed, populated in the example data) and "Processing" (confirmed as a filter tab, though no example order is shown in that state).
- A persistent Log Out control is available from the sidebar on desktop; its mobile equivalent location is unconfirmed (Section 3.2).
- All "library"-type destinations (Scan History, My Quotes, Submit Quote, Favorites, Orders, Subscription) are reachable as flat, equal-priority items from the desktop sidebar; on mobile they are inferred to collapse under a single "Library" tab (Section 3.2 — flagged as an assumption).

> **Unconfirmed rules requiring explicit client sign-off before engineering treats them as fact:**
> 1. Whether submitted quotes require admin approval before publication (Section 7.2).
> 2. The exact Free-tier cap (if any) on saved Favorites (Section 6).
> 3. Whether "Reflect" is Premium-gated (Section 4.8/4.6 cross-reference).
> 4. Whether Free users see ads, and where/how (Section 6, inferred only from "Ad-free experience" being a Premium benefit).
> 5. The mechanics of Tag gifting/transfer (Section 8).
> 6. The content of the "Home" tab (Section 3.2/15).

---

## 18. AI Development Rules

Future AI-assisted (or human) implementation work on this product **must** follow these rules:

1. **This document is the single source of truth.** No feature, screen, copy string, category name, price, or business rule should be implemented unless it is either (a) directly documented above as evidenced by the source UX image, or (b) explicitly approved by the client as a resolution to one of the flagged Assumptions/Open Questions.
2. **Never invent behavior to fill a gap.** If a screen, flow, or rule is not covered here (e.g., Admin, Landing, Home tab content, checkout flows), stop and request clarification or a follow-up mockup rather than guessing.
3. **Never break existing architecture.** Any implementation must fit within the navigation structure (Section 3), screen hierarchy (Section 3.3), and shared component/hook strategy (Sections 12 and 16) defined here.
4. **Reuse before creating.** Before building any new component, hook, or service, check Sections 12 and 16 for an existing reusable equivalent (e.g., the shared list-row pattern must not be re-implemented per screen).
5. **Never duplicate components or logic.** The list-row pattern, category-pill pattern, and subscription-tier gating logic in particular must exist in exactly one place each and be shared across every screen that needs them.
6. **Maintain consistency across all screens.** Colors, iconography, badge/pill styling, and button hierarchy (primary/solid vs. secondary/outline) must follow the patterns documented in Section 13 everywhere, not just on the screens where they were first observed.
7. **Respect the Free/Premium gating boundary everywhere.** Any new feature must be explicitly classified as Free, Premium-only, or Free-with-limits, consistent with Section 6, and gated server-side (Section 11.2), not just hidden client-side.
8. **Flag, don't guess, on ambiguity.** When a task requires a decision this document leaves open (see the six unconfirmed rules at the end of Section 17), surface that ambiguity to the client/product owner explicitly rather than silently choosing an interpretation.
9. **No feature ships outside the defined user flow.** Every new feature must be traceable to a position in the Core Product Flow (Section 2) and the Relationships diagram (Section 10) before it is built.
10. **Treat Admin as unscoped.** No admin functionality should be built from this document alone; it requires its own UX artifact and, once provided, its own addendum to this specification.

---

*End of MASTER_SPECIFICATION.md*