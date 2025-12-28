# UI/UX Improvements Plan

## Goal Description
Implement several UI/UX improvements requested by the user, including fixing alignment issues, updating filter options, improving mobile responsiveness, and fixing theme toggle icons.

## Proposed Changes

### Types
#### [MODIFY] [api.ts](file:///c:/Users/Nswk/Documents/GitHub/misskey-instance-list/misskey-instance-list/app/types/api.ts)
- Add `language: string | null` to `Instance` interface.

### Components

#### [MODIFY] [ServerCard.vue](file:///c:/Users/Nswk/Documents/GitHub/misskey-instance-list/misskey-instance-list/app/components/ui/servers/ServerCard.vue)
- Fix vertical alignment of user count SVG (likely needing `translate-y` or baseline adjustment).
- Display primary language (`instance.language`) in the card.

#### [MODIFY] [FilterDrawer.vue](file:///c:/Users/Nswk/Documents/GitHub/misskey-instance-list/misskey-instance-list/app/components/ui/servers/FilterDrawer.vue)
- Update email filter options: Change "任意" (Optional) to "不要" (Not Required) to match user request "All/Not Required/Required".

#### [MODIFY] [FilterTabs.vue](file:///c:/Users/Nswk/Documents/GitHub/misskey-instance-list/misskey-instance-list/app/components/ui/servers/FilterTabs.vue)
- Increase margin/gap for Grid/List view toggle.
- Mobile: Hide "FILTERS" text (show icon only).
- Remove filter count bubble (both mobile/desktop).
- Ensure button indicates active state clearly (it currently highlights if active, but maybe needs to simply look "active" without the count).

#### [MODIFY] [InstanceListModal.vue](file:///c:/Users/Nswk/Documents/GitHub/misskey-instance-list/misskey-instance-list/app/components/ui/servers/InstanceListModal.vue)
- Add stronger truncation logic for server names on mobile to ensure they fit within the div (e.g., character limit or strict CSS truncation).

#### [MODIFY] [ThemeToggle.vue](file:///c:/Users/Nswk/Documents/GitHub/misskey-instance-list/misskey-instance-list/app/components/shared/ThemeToggle.vue)
- Swap the icons displayed in the toggle button to show the *current* theme's icon instead of the *switch to* icon.

## Verification Plan
### Manual Verification
- **ServerCard**: Check SVG alignment and language display.
- **Filters**: Check options are "すべて/不要/必須".
- **Filter Button**: Check "FILTERS" text hidden on mobile, count removed, margins increased.
- **Stats List**: Check server name truncation on small screens.
- **Theme Toggle**: Check icons match current theme (Sun for Light, Moon for Dark).
