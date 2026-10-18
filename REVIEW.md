# Engineering review

Reviewed the tracked source, routing, configuration, and service integrations.
Frontend markup, styles, and intended user flows were preserved in this cleanup.

## Assessment

The small component structure and shared Supabase client are reasonable for this
application. It needs stronger authorization boundaries and a documented data
contract before it can be considered production-hardened.

## Findings requiring follow-up

1. **High — Authorization is not consistently enforced in the client.**
   `src/main.jsx` mounts the article manager and creative form directly;
   `Dashboard.jsx` checks for a session only on its own route. The email allowlist
   in `GoogleSignIn.jsx` runs in the login component and cannot secure database
   requests. Verify deployed row-level security for both tables, require approved
   identities for writes/deletes, and add a shared route guard for all dashboard
   routes. Database policies are absent here, so actual server access could not
   be verified. A client route guard alone is not an authorization boundary.
2. **Medium — Article field names disagree.** `ArticleForm.jsx` writes `title`,
   while `ArticleTable.jsx` reads `article.name` for display and deletion prompts.
   Confirm the deployed schema and standardize the contract across both repos.
3. **Medium — Authentication and network handling need consolidation.** Login,
   dashboard, and Google sign-in each subscribe to auth separately. The sign-in
   listener awaits another auth call inside the callback; move that work outside
   the callback when consolidating session handling. Requests have no common
   exception handling or cancellation, and creative deletion uses an arbitrary
   refresh delay. Test sign-in, expired sessions, failed saves, and deletion.
4. **Low — OAuth callback is deployment-specific.** The production callback is
   hardcoded, making local and alternate deployments harder to exercise.

## Cleanup completed

- Removed the unrelated, unreferenced nested React Router starter application.
- Removed unused state that caused lint to fail and stale debugging comments.
- Added project documentation, public environment examples, Node version selection,
  and independent lint/build CI for this repository.
- Expanded environment and local Supabase state ignore rules.

## Verification limits

Lint and production build validate static correctness and bundling. No automated
behavior tests existed at review time. Live authentication, table permissions,
content writes, and visual browser behavior were not exercised.
