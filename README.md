# c2pa-react-cawg-component

A plugin for [c2pa-react-component](https://github.com/matthewrappard/c2pa-react-component) that renders [CAWG (Creator Assertions Working Group)](https://creator-assertions.github.io/) manifest data — including author, publisher, and the full `stds.schema-org.CreativeWork` assertion — at three progressive levels of detail.

## Requirements

This package is a plugin for `c2pa-react-component`. Install both:

```bash
npm install c2pa-react-cawg-component c2pa-react-component
```

### Peer dependencies

| Package | Version |
|---|---|
| `react` | `^18.0.0 \|\| ^19.0.0` |
| `react-dom` | `^18.0.0 \|\| ^19.0.0` |

## CSS

Import the stylesheet once at the root of your app:

```ts
import "c2pa-react-cawg-component/style.css";
```

**Next.js App Router** — add it to `app/layout.tsx`:

```tsx
import "c2pa-react-cawg-component/style.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>{children}</body>
    </html>
  );
}
```

## Usage

Pass `CAWGManifest` as a plugin to the `C2paManifest` component from `c2pa-react-component`:

```tsx
import { C2paManifest } from "c2pa-react-component";
import { CAWGManifest } from "c2pa-react-cawg-component";
import type { VerificationOutcome } from "c2pa-react-component-types";
import "c2pa-react-cawg-component/style.css";

export function MediaCard({ outcome }: { outcome: VerificationOutcome }) {
  return (
    <C2paManifest
      manifest={outcome}
      plugin={[CAWGManifest]}
    />
  );
}
```

## Component

### `CAWGManifest`

Renders CAWG creator assertion data from a C2PA manifest at a configurable level of detail.

```tsx
import { CAWGManifest } from "c2pa-react-cawg-component";

<CAWGManifest manifest={verificationOutcome} level={1} />
```

#### Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `manifest` | `VerificationOutcome` | required | Verification result from the C2PA SDK |
| `level` | `1 \| 2 \| 3` | `1` | Initial disclosure level |
| `className` | `string` | — | CSS class applied to the root element |

#### Disclosure levels

| Level | What is shown |
|---|---|
| `1` | Compact card: title, claim generator (thumbnail or initials badge), "More Info" button |
| `2` | Extends level 1 with author and publisher from the `stds.schema-org.CreativeWork` assertion |
| `3` | Full `stds.schema-org.CreativeWork` assertion — all present Schema.org fields rendered as key/value pairs |

Clicking "More Info" advances from level 1 → 2 → 3. Clicking "Small View" at level 3 returns to level 1.

## Types

Types are provided by the shared `c2pa-react-component-types` package, which is installed automatically as a dependency.

```ts
import type {
  VerificationOutcome,
  Manifest,
  ManifestStore,
  PluginC2PA,
} from "c2pa-react-component-types";
```

## Local development

Use [yalc](https://github.com/wclr/yalc) to consume the library in another local project without publishing to npm.

**Install yalc globally (once):**

```bash
npm install -g yalc
```

**Start watch mode in this repo:**

```bash
# Terminal 1 — rebuild on every save
npm run dev:lib

# Terminal 2 — push updates to yalc's local store
yalc push --watch
```

**In your consuming project:**

```bash
yalc add c2pa-react-cawg-component
npm install
```

**Revert to the published npm version:**

```bash
yalc remove c2pa-react-cawg-component
npm install
```

## License

MIT
