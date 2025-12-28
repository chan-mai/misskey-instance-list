# UI/UX Improvements Plan - Round 2

## Goal Description
Address user feedback regarding SVG alignment, mobile list view layout, margins in filter tabs, and component usage in stats page.

## Proposed Changes

### Components

#### [MODIFY] [ServerCard.vue](file:///c:/Users/Nswk/Documents/GitHub/misskey-instance-list/misskey-instance-list/app/components/ui/servers/ServerCard.vue)
- **SVG Alignment**: Remove `mb-0.5`. Use `flex items-center` effectively. The parent `span` already has `flex items-center`. The SVG might need `block` or specific line-height adjustments. I will try removing the margin and ensuring `items-center` is doing its job, potentially adding `self-center` or checking if `gap-1` is causing visual offset usually fixed by `translate-y`. A common fix for icon/text alignment is `text-[0px]` on parent or ensuring strict height. I'll revert the `mb-0.5` and try `relative top-[1px]` or similar fine-tuning if `items-center` isn't enough, or check font metrics. Actually, `flex items-center` should work. I'll try removing `mb-0.5` and checking structure.
- **Mobile List View**: "Start text from half of the image". I will interpret this as making the image width narrower on mobile, so the text column starts earlier (effectively "gaining width").
    - Current: `h-32 aspect-square` -> 128px wide.
    - Change: On mobile (`< sm`?), make image width smaller, e.g., `w-20` (80px) or `w-24` (96px), while keeping `h-32`? That would crop the image. `object-cover` handles cropping.
    - I will add a class to restrict image width on list view for mobile.

#### [MODIFY] [FilterTabs.vue](file:///c:/Users/Nswk/Documents/GitHub/misskey-instance-list/misskey-instance-list/app/components/ui/servers/FilterTabs.vue)
- **Margins**:
    - Reduce gap between "Grid/List Group" and "Filter Button". Change parent `gap-4` to `gap-2` (or similar).
    - Increase gap between "Grid Button" and "List Button". Add `gap-1` or `gap-2` to their container.

#### [MODIFY] [stats.vue](file:///c:/Users/Nswk/Documents/GitHub/misskey-instance-list/misskey-instance-list/app/pages/stats.vue)
- **StateLoading**: Replace manual loading spinner with `<StateLoading message="Loading statistics" />`.

## Verification Plan
### Manual Verification
- **ServerCard SVG**: Check alignment visually.
- **ServerCard List Mobile**: Check if text has more room and image is narrower.
- **FilterTabs**: Check spacing between buttons and groups.
- **Stats**: Check loading state appearance.
