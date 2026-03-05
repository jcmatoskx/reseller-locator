# Evolt Reseller Locator

A production-ready reseller locator built with Next.js 15, Tailwind CSS, Leaflet + OpenStreetMap.

## Pages

| Route | Description |
|-------|-------------|
| `/` | Redirects to `/embed` |
| `/embed` | **Primary embed page** — map + list UI for iframe |
| `/r/[slug]` | Individual reseller detail page with SEO meta + JSON-LD |

---

## Run Locally

```bash
# Install dependencies
npm install

# Start development server
npm run dev
# → http://localhost:3000

# Build for production
npm run build
npm start
```

---

## Deploy

### Vercel (recommended)

```bash
npm i -g vercel
vercel
# Follow prompts — set project root to this directory
```

Set environment variables in the Vercel dashboard if needed (none required for basic operation).

Your site will be available at `https://your-project.vercel.app`

For a custom domain like `resellers.evolt.pt`:
1. In Vercel dashboard → Settings → Domains → Add `resellers.evolt.pt`
2. At your DNS provider, add a CNAME: `resellers` → `cname.vercel-dns.com`

---

## Iframe Embed Snippet for WordPress (evolt.pt)

### Fixed Height Version (simple)

```html
<iframe
  src="https://resellers.evolt.pt/embed"
  width="100%"
  height="620"
  frameborder="0"
  scrolling="no"
  style="border:none; border-radius:16px; box-shadow:0 4px 24px rgba(0,0,0,0.10);"
  title="Evolt Reseller Locator"
  loading="lazy"
  allow="geolocation"
></iframe>
```

> **Note:** The `allow="geolocation"` attribute is required for the "Near me" button to work in the iframe.

---

### Auto-Resize Version (recommended)

The `/embed` page automatically posts its height to the parent frame via `postMessage`.

**Step 1 — Embed the iframe:**

```html
<iframe
  id="evolt-reseller-iframe"
  src="https://resellers.evolt.pt/embed"
  width="100%"
  height="600"
  frameborder="0"
  scrolling="no"
  style="border:none; border-radius:16px; box-shadow:0 4px 24px rgba(0,0,0,0.10); display:block;"
  title="Evolt Reseller Locator"
  loading="lazy"
  allow="geolocation"
></iframe>
```

**Step 2 — Add the resize listener (in your theme's footer or a custom HTML block):**

```html
<script>
(function () {
  var iframe = document.getElementById('evolt-reseller-iframe');
  if (!iframe) return;
  window.addEventListener('message', function (event) {
    // IMPORTANT: verify origin in production
    if (
      event.origin !== 'https://resellers.evolt.pt' &&
      event.origin !== 'http://localhost:3000'
    ) return;
    if (event.data && event.data.type === 'evolt-reseller-height') {
      iframe.style.height = event.data.height + 'px';
    }
  });
})();
</script>
```

**WordPress — where to add the script:**

Option A: Use a plugin like "Insert Headers and Footers" → paste in Footer section.

Option B: In your theme's `functions.php`:
```php
function evolt_reseller_script() {
    if (is_page('resellers')) { // adjust to your page slug
        ?>
        <script>
        (function () {
          var iframe = document.getElementById('evolt-reseller-iframe');
          if (!iframe) return;
          window.addEventListener('message', function (event) {
            if (event.origin !== 'https://resellers.evolt.pt') return;
            if (event.data && event.data.type === 'evolt-reseller-height') {
              iframe.style.height = event.data.height + 'px';
            }
          });
        })();
        </script>
        <?php
    }
}
add_action('wp_footer', 'evolt_reseller_script');
```

---

## CSP Header Guidance for Embedding on evolt.pt

The reseller locator is configured with:

```
Content-Security-Policy: frame-ancestors 'self' https://evolt.pt https://www.evolt.pt
```

This means the `/embed` page will **only** load inside iframes on `evolt.pt` (and `www.evolt.pt`).

If you need to add other allowed origins (e.g., staging environments), edit `next.config.ts`:

```ts
{
  key: 'Content-Security-Policy',
  value: "frame-ancestors 'self' https://evolt.pt https://www.evolt.pt https://staging.evolt.pt",
}
```

**On evolt.pt itself**, no special CSP changes are needed to embed the iframe — the parent site doesn't need to declare anything special to display an iframe.

---

## Data Model

Edit `data/resellers.json` to add/update resellers. Fields:

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique ID (`pt-city-slug`) |
| `name` | string | Display name |
| `slug` | string | URL slug for `/r/[slug]` |
| `countryCode` | string | ISO 3166-1 alpha-2 (`PT`) |
| `city` | string | City name |
| `address` | string | Full street address |
| `postcode` | string | Postal code (`0000-000`) |
| `lat` / `lng` | number | Coordinates |
| `phone` | string | E.164 format (`+351 …`) |
| `email` | string | Contact email |
| `website` | string | Full URL |
| `hours` | object | Keys: mon/tue/wed/thu/fri/sat/sun → `"09:00-18:00"` or `"Fechado"` |
| `services` | array | One or more of: `sales`, `support`, `warranty`, `training`, `demo` |
| `partnerType` | string | `authorized_reseller` or `premium_partner` |
| `active` | boolean | Set to `false` to hide without deleting |

---

## Adding a New Country

1. Add resellers to `data/resellers.json` with the appropriate `countryCode`
2. The country filter dropdown will automatically populate from the data
3. Update Nominatim geocoding in `lib/geocoding.ts` — remove or widen the `countrycodes=pt` query param

---

## Tech Stack

- **Next.js 15** (App Router, TypeScript, static generation for `/r/[slug]`)
- **Tailwind CSS 3** (custom design tokens, no external component libraries)
- **Leaflet 1.9** + **CartoDB Positron tiles** (clean, minimal map style)
- **Nominatim** (OpenStreetMap geocoding — free, rate-limited to 1 req/sec)
- **Haversine formula** (client-side distance calculation)
