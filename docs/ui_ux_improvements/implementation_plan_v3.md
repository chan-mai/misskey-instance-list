# UI/UX Improvements Plan - Round 3

## Goal Description
Fix persistent UI issues: ServerCard SVG alignment, Stats page loading spinner shape, and Stats modal truncation on mobile.

## Proposed Changes

### Components

#### [MODIFY] [ServerCard.vue](file:///c:/Users/Nswk/Documents/GitHub/misskey-instance-list/misskey-instance-list/app/components/ui/servers/ServerCard.vue)
- **SVG Alignment**: The user reports the "face is shifted" in the user icon.
    - Action: Replace the complex path with a simpler, standard `user` icon (Heroicons version) that is known to be balanced.
    - Also ensure `items-center` is sufficient or add `self-center`.
    - Same for "Notes" icon if needed, but user specifically mentioned user count SVG.

#### [MODIFY] [StateLoading.vue](file:///c:/Users/Nswk/Documents/GitHub/misskey-instance-list/misskey-instance-list/app/components/shared/StateLoading.vue)
- **Spinner Shape**: User reports it's square.
    - Investigation: The file `StateLoading.vue` shows `rounded-full`.
    - Possibility: The `rounded-full` class might be being overridden or not applied correctly in some context?
    - Action: Ensure `rounded-full` is present (it is). I will explicitly double check if I can make it more robust, maybe `border-radius: 9999px` style just in case, or check if `stats.vue` style block interferes.
    - **Wait**, I might have edited `stats.vue` but the user is seeing the *spinner* which is inside `StateLoading`.
    - I will add `rounded-full` again or force it. But wait, if it's already there...
    - Maybe the user means the *container*? No, "loadingで丸ではなく四角形が回っている" (square is rotating instead of circle). That clearly sounds like missing border-radius on the spinner element.
    - I will verify `StateLoading.vue` content again. It *does* have `rounded-full`.
    - **Hypothesis**: Could there be *another* loading component? Or `stats.vue` had a local spinner before? I replaced it.
    - Maybe the user is looking at the `StateEmpty` or `InstanceListModal` loading state?
    - `InstanceListModal.vue` has a spinner too.
    - **Let's check `InstanceListModal.vue` loading state.**

#### [MODIFY] [InstanceListModal.vue](file:///c:/Users/Nswk/Documents/GitHub/misskey-instance-list/misskey-instance-list/app/components/ui/servers/InstanceListModal.vue)
- **Spinner**: Check if the spinner in `InstanceListModal` has `rounded-full`.
- **Reason Truncation**:
    - For `denied`/`ignored` lists (mobile):
    - Add `max-w-[200px]` (or similar) and `truncate` to the reason tag container on mobile.
    - Ensure layout doesn't break.

## Verification Plan
### Manual Verification
- **ServerCard**: Verify new user icon looks aligned.
- **Spinner**: Check `InstanceListModal` spinner. Check `StateLoading` again. Ensure all spinners have `rounded-full`.
- **Modal Truncation**: Resize to mobile, open Denied/Ignored modal, check long reasons are truncated.
