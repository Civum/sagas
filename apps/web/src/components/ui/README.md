# components/ui

Primitives live here: buttons, cards, inputs, dialogs and tooltips.

This is where `shadcn` puts things when you run `pnpm dlx shadcn@latest add
button`, and following that convention means the tool and the repo agree about
where files go.

The rule: **nothing in here knows what Sagas is.** A button doesn't know about
claims. A card doesn't know about places. If a component needs to understand the
data, it belongs in `src/features/` instead.

It's empty because the component library is yours to build, starting with story
A1 in `apps/web/BACKLOG.md`.
