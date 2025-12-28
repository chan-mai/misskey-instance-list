# UI/UX Improvements Plan - Round 7

## Goal Description
Refine mobile reason popup design and z-index.

## Proposed Changes

### Components

#### [MODIFY] [InstanceListModal.vue](file:///c:/Users/Nswk/Documents/GitHub/misskey-instance-list/misskey-instance-list/app/components/ui/servers/InstanceListModal.vue)
- **Design**:
  - Remove `shadow-xl`.
  - Add `border border-neutral-200 dark:border-neutral-800` for solid definition.
  - Simplify `rounded-xl` to `rounded-lg` (optional, but requested "solid").
- **Z-Index**:
  - Increase `z-[60]` to `z-[100]` (or higher) to ensure it appears above the `BaseModal` (which likely has `z-50`).
  - Ensure it is truly above the list.

## Verification Plan
### Manual Verification
- **Visual**: Check popup is flat/solid (no shadow).
- **Layering**: Check popup is clearly on top of the list and modal.
