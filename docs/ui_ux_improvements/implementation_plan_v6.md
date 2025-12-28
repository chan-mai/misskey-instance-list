# UI/UX Improvements Plan - Round 6

## Goal Description
Replace the native JavaScript `alert()` with a custom in-site popup/modal for displaying the full "denied/ignored" reason on mobile.

## Proposed Changes

### Components

#### [MODIFY] [InstanceListModal.vue](file:///c:/Users/Nswk/Documents/GitHub/misskey-instance-list/misskey-instance-list/app/components/ui/servers/InstanceListModal.vue)
- **State**: Add `selectedReason` ref to track the currently displayed reason.
- **Logic**: Replace `alertReason` with `openReason` that sets `selectedReason`.
- **UI**: Add a custom modal overlay that appears when `selectedReason` is not null.
    - **Backdrop**: Fixed overlay with dark background.
    - **Content**: Centered box showing the reason text.
    - **Interaction**: Close on click outside or "Close" button.
    - **Z-Index**: Ensure it appears above the current modal.

## Verification Plan
### Manual Verification
- **Mobile View**: Open "Stats" -> "Denied" or "Ignored" list.
- **Interaction**: Click "REASON" (Check Reason).
- **Result**: Verify a nice custom modal appears instead of a browser alert.
- **Closing**: Verify clicking the close button or backdrop dismisses it.
