# components/ui

Primitives live here. Buttons, cards, inputs, dialogs, tooltips.

This is where `shadcn` puts things when you run `pnpm dlx shadcn@latest add
button`, and following that convention means the tool and the repo agree about
where files go.

The rule: **nothing in here knows what Sagas is.** A button doesn't know about
claims. A card doesn't know about places. If a component needs to understand the
data, it belongs in `src/features/` instead.

It's empty because the design system is yours to build. That's the largest piece
of version one.
