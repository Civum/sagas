# De7 component design draft

**Status:** Draft; team review pending. This is a design artifact, not visitor-facing landing-page copy.

**Story:** De7 — The components the map and a narrative page need

## Design basis

The team adopts the current neutral values in `apps/landing/src/tokens.css` as
the starting token set for De7. The source labels these values temporary while
the shared De1 token work is completed; De7 should use the same names and remain
ready for those values to be replaced centrally.

The components use these starting tokens:

- `--background` and `--foreground` for the page and primary text.
- `--muted` and `--muted-foreground` for secondary surfaces and text.
- `--border` for boundaries and `--ring` for keyboard focus.
- `--radius` for shared corner treatment.
- Existing spacing and type scale from the Tailwind preset rather than
  component-specific values.

The design must meet WCAG 2.1 AA contrast and keep the list view available for
keyboard and screen-reader users.

## Component sketches and states

### 1. Map pin

```text
normal       selected        loading        empty map
  ●            ◉              ···             No places yet
site icon    focus ring       hidden          Try another area
```

- **Normal:** location marker with a non-numeric site-type icon.
- **Selected:** marker receives the shared focus ring and identifies the
  selected site in the list.
- **Loading:** marker is withheld while its site data is loading; the list
  retains a labeled loading row.
- **Empty:** no pin is rendered; the map/list region says “No places yet” and
  offers a way to try another area.
- **Disagreement:** not a pin state. Detail disagreement belongs on the site
  narrative, never as a pin score, color, or warning.

### 2. Site list item

```text
normal                         selected
┌──────────────────────┐       ┌──────────────────────┐
│ Corner shop          │       │▌ Corner shop         │
│ shop · Main Street   │       │  shop · Main Street  │
└──────────────────────┘       └──────────────────────┘

loading                        empty
┌──────────────────────┐       No places in this area.
│ [loading site name]  │       Try another area.
│ [loading context]    │
└──────────────────────┘
```

- **Normal:** site name, place context, and the same site icon as the map.
- **Selected:** visible focus/selection treatment and map selection sync.
- **Loading:** labeled skeleton or text state that does not imply failure.
- **Empty:** the list says “No places in this area” and provides a next action;
  it does not look like a failed request.
- **Long name:** “The Community Hall and Former Market on North Main Street”
  wraps to additional lines without truncating identifying words.

### 3. Narrative-page header

```text
normal                         loading
Site name                      [loading site name]
place context · record status  [loading place context]

long name                      empty
The Community Hall and         No story is available for this place yet.
Former Market on North Main    Return to places.
Street · record status
```

- **Normal:** site identity and place context.
- **Loading:** labeled page-loading state.
- **Empty:** the header remains grounded in the selected place while the page
  says no story is available yet.
- **Long name:** the example wraps across lines while preserving the full name.
- **Disagreement:** no header warning or score; disagreement appears beside
  the affected detail in the narrative.

### 4. Memory with source

```text
normal                         loading
Memory passage                 [loading memory passage]
— Ana Rivera (invented)       [loading source record]

long name                      empty
Memory passage                 No memories are available for this place yet.
— The North Main Street        No additional evidence records yet.
Historical Society (invented)  The source record remains attributed.
```

- **Normal:** memory text, attribution, and source-record link.
- **Loading:** labeled passage-loading state.
- **Empty:** the page identifies the absence of memories without calling the
  source record or thin data a failure.
- **Long name:** the example wraps contributor and source labels.
- **Disagreement:** the affected detail can open its competing readings;
  unrelated text remains unchanged.

### 5. Competing detail versions

```text
normal                              loading
Detail                              [loading detail]
┌──────────────┐  ┌──────────────┐  [loading sources]
│ reading one  │  │ reading two  │
│ source A     │  │ source B     │  empty
└──────────────┘  └──────────────┘  No details have been added yet.

long name
┌────────────────────────┐  ┌────────────────────────┐
│ The first detailed     │  │ A different detailed   │
│ reading of this place  │  │ reading of this place  │
└────────────────────────┘  └────────────────────────┘
```

- **Normal:** equal-prominence readings with attribution and source links.
- **Loading:** labeled detail-loading state.
- **Empty:** the section says no details have been added and does not invent a
  reading or source.
- **Long name:** readings remain readable and expand vertically.
- **Disagreement:** this is the disagreement state; no winner, tally, score,
  or settled label is shown.

### 6. Record with contributor

```text
normal                         loading
Record title or media          [loading record]
Brought by contributor         [loading attribution]

long name                      empty
Record title from the          No additional evidence records yet.
Community Historical           The memory remains attributed.
Society (invented)
collection
```

- **Normal:** record, contributor, and source context.
- **Loading:** labeled record-loading state.
- **Empty:** the source record remains attributed while the record area says
  “No additional evidence records yet.” Every memory has its source record;
  additional evidence is optional.
- **Unavailable source:** if the source record has not loaded, show
  “[source record unavailable]” with the memory still clearly marked as
  awaiting its source, rather than presenting an evidence-empty state.
- **Long name:** contributor and collection names wrap as shown.
- **Disagreement:** records remain attributed; disagreement is shown on the
  affected detail rather than on the record as a whole.

## Review questions

- Are the selected states sufficient for each component, especially the map
  pin's lack of a disagreement state?
- Which site-type icons belong in the first implementation?
- Which data needed by these sketches is missing from the current read model?
- Should the selected map/list relationship use the same focus treatment on
  both sides?
