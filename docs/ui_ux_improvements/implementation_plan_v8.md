# UI/UX Improvements Plan - Round 8

## Goal Description
Replace the popup modal for mobile reason display with an in-place "expand" interaction that overlays the reason text over the URL row.

## Proposed Changes

### Components

#### [MODIFY] [InstanceListModal.vue](file:///c:/Users/Nswk/Documents/GitHub/misskey-instance-list/misskey-instance-list/app/components/ui/servers/InstanceListModal.vue)
- **State**: Replace `selectedReason` (single string) with `expandedItems` (Set of strings) to track expanded domains.
- **Logic**: Add `toggleReason(domain)` function.
- **UI**:
    - Remove the custom popup modal.
    - Modify the list item container to be `relative`.
    - Mobile View:
        - Collapsed: Show "REASON" button (same style as before).
        - Expanded: Render an `absolute inset-0` div that covers the row.
            - Background: Solid (match theme).
            - Content: Full reason text.
            - Interaction: Click to close (or specific close button).

## Verification Plan
### Manual Verification
- **Mobile View**: Open "Stats" -> "Denied" list.
- **Interaction**: Click "REASON".
- **Result**: Area expands (overlays) to show full text. URL is covered.
- **Closing**: Click to close/collapse.
