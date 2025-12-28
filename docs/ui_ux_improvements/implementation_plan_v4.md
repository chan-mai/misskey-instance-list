# UI/UX Improvements Plan - Round 4

## Goal Description
Address user feedback regarding ServerCard aesthetics and mobile experience for denied/ignored lists.

## Proposed Changes

### Components

#### [MODIFY] [ServerCard.vue](file:///c:/Users/Nswk/Documents/GitHub/misskey-instance-list/misskey-instance-list/app/components/ui/servers/ServerCard.vue)
- **Text Shadow**: Remove `drop-shadow-md`, `drop-shadow-sm` classes from text elements. The user specifically asked to remove it *on hover*, but usually these are static or updated on hover? I'll check if there are `group-hover:drop-shadow` classes or just general ones that the user wants gone to look cleaner. The code has `drop-shadow-md` on the `h3` and `drop-shadow-sm` on others. I will remove them to flatten the design as requested.
- **Language SVG**: Replace the current icon with a "Globe" icon (e.g., standard globe representing internet/languages).

#### [MODIFY] [InstanceListModal.vue](file:///c:/Users/Nswk/Documents/GitHub/misskey-instance-list/misskey-instance-list/app/components/ui/servers/InstanceListModal.vue)
- **Mobile Reason Display**:
    - Current: Truncated text chip.
    - New (Mobile): Show a button labeled "Reason" (or "理由").
    - Action: Clicking the button shows the full reason in a popup.
    - Implementation:
        - Use `window.alert(item.reason)` for the popup mechanism as it represents a native "popup" and is mobile-friendly.
        - Show this button mainly on mobile (`sm:hidden`).
        - Keep the full text (or the previous truncated text? "Mobile time... make it reason button") on desktop?
        - User said "statsのdenied,ingnored domainのリストにて、モバイル時その理由をreasonボタンにして..." (In stats denied/ignored list, on mobile, make the reason a reason button...).
        - So: Desktop -> Keep text. Mobile -> Button.

## Verification Plan
### Manual Verification
- **ServerCard**: Check text legibility without shadow. Check Globe icon.
- **Stats Modal**:
    - Open Denied/Ignored list.
    - Resize to mobile.
    - Check "Reason" button appears.
    - Click it -> Check Alert shows full text.
    - Resize to desktop -> Check text is shown (not button).
