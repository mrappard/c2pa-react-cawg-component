# c2pa-react-component

A React component library for displaying [C2PA](https://c2pa.org/) manifest information — provenance, validation state, signing details, and ingredient history.

## Installation

```bash
npm install c2pa-react-component @xyflow/react
```

`@xyflow/react` is a required peer dependency (used by the provenance graph component).

### Peer dependencies

| Package | Version |
|---|---|
| `react` | `^18.0.0 \|\| ^19.0.0` |
| `react-dom` | `^18.0.0 \|\| ^19.0.0` |
| `@xyflow/react` | `^12.0.0` |

## CSS

Import the stylesheet once at the root of your app. Without it, components will render unstyled.

```ts
import "c2pa-react-component/style.css";
```

**Next.js App Router** — add it to `app/layout.tsx`:

```tsx
import "c2pa-react-component/style.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>{children}</body>
    </html>
  );
}
```

## Components

### `C2paManifest`

Displays C2PA manifest data at a configurable level of detail. Levels progress from a minimal icon badge up to a full provenance graph.

```tsx
import { C2paManifest, type VerificationOutcome } from "c2pa-react-component";

<C2paManifest manifest={verificationOutcome} level={2} />
```

#### Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `manifest` | `VerificationOutcome` | required | The verification result from a C2PA SDK |
| `level` | `1 \| 2 \| 3 \| 4 \| 5` | `3` | Initial disclosure level |
| `className` | `string` | — | CSS class applied to the root element |
| `onViewMore` | `() => void` | — | Custom callback when the user requests more detail |
| `defaultViewMore` | `boolean` | — | When `true`, the built-in level progression is used instead of a custom `onViewMore` |

#### Disclosure levels

| Level | What is shown |
|---|---|
| `1` | Icon-only badge (clickable) |
| `2` | Compact summary: active manifest, signing info, provenance chain |
| `3` | Interactive provenance graph (default) |
| `4` | Detailed manifest with assertions and ingredients |
| `5` | Full raw manifest detail |

When `defaultViewMore` is `true`, clicking "View more" automatically advances through levels `1 → 2 → 3 → 4 → 5 → 1`.

---

### `C2paProvenanceGraph`

An interactive node graph visualising the full ingredient/manifest chain. Powered by React Flow.

```tsx
import { C2paProvenanceGraph, type ManifestStore } from "c2pa-react-component";

<C2paProvenanceGraph manifest={manifestStore} height={500} />
```

#### Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `manifest` | `ManifestStore` | required | The manifest store from `VerificationOutcome.manifestStore` |
| `height` | `number` | `400` | Height of the graph container in pixels |
| `className` | `string` | — | CSS class applied to the root element |

The graph is interactive: nodes are draggable, the view auto-fits on load, and a minimap and zoom controls are included.

---

### `CRIcon`

The Content Credentials "cr" icon as an inline SVG component.

```tsx
import { CRIcon } from "c2pa-react-component";

<CRIcon size={24} />
```

---

## Types

All types are re-exported from the package root.

```ts
import type {
  VerificationOutcome,
  ManifestStore,
  ManifestEntry,
  Ingredient,
  Assertion,
  SignatureInfo,
  ValidationResults,
  ValidationResult,
  DisclosureLevel,
  C2paManifestProps,
  C2paProvenanceGraphProps,
} from "c2pa-react-component";
```

### `VerificationOutcome`

The top-level type passed to `C2paManifest`.

```ts
interface VerificationOutcome {
  state: boolean;
  manifests: Manifest[];
  manifestStore: ManifestStore | undefined;
}
```

### `ManifestStore`

```ts
interface ManifestStore {
  activeManifest: string;
  manifests: Record<string, ManifestEntry>;
  validation_status?: ValidationResult[];
  validation_results?: {
    activeManifest: ValidationResults;
    ingredientDeltas?: IngredientDelta[];
  };
  validation_state?: "Valid" | "Invalid" | "Unknown";
}
```

---

## Usage example

```tsx
import { C2paManifest } from "c2pa-react-component";
import type { VerificationOutcome } from "c2pa-react-component";

export function MediaCard({ outcome }: { outcome: VerificationOutcome }) {
  return (
    <div>
      <img src="/photo.jpg" alt="Photo" />
      <C2paManifest
        manifest={outcome}
        level={2}
        defaultViewMore
      />
    </div>
  );
}
```

---

## Framework notes

### Next.js App Router

This library ships as ESM. No additional `transpilePackages` configuration is needed. Import the CSS in your root layout as shown above.

If you are using `"use client"` components that import from this library, the import works as-is — no dynamic import wrapper is required.

### Vite / Create React App

No special configuration needed. Import the CSS once in your entry file (e.g. `main.tsx`).

---

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
# Add the local package
yalc add c2pa-react-component
npm install
```

After that, any save in this repo triggers a rebuild and the consuming project picks up the changes automatically — no reinstall required.

**Revert to the published npm version:**

```bash
yalc remove c2pa-react-component
npm install
```

---

## License

MIT
