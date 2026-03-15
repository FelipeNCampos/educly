# Send Password Reset Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Update `send-password-reset` to target a single user by email and return a recovery link that `UpdatePassword` can consume.

**Architecture:** Swap the Supabase lookup from `listUsers()` to `admin.getUserByEmail()` so we always hit the intended account, then request a `type: "recovery"` link so the front-end can read the `recovery` tokens from the hash fragment.

**Tech Stack:** Supabase Deno Edge runtime, Supabase Admin SDK (`@supabase/supabase-js`), Deno testing harness, `denomailer` for SMTP.

---

### Task 1: Recovery-link handler Improvements

**Files:**
- Modify: `supabase/functions/send-password-reset/index.ts:255-360`
- Create: `supabase/functions/send-password-reset/__tests__/handler.test.ts`

**Step 1: Write the failing test**

```ts
import { assertEquals } from "https://deno.land/std@0.203.0/testing/asserts.ts";
import { handler } from "../index.ts"; // adjust export

Deno.test("handler requests user by email and recovery link", async () => {
  const mockSupabase = createMockSupabase({
    auth: {
      admin: {
        getUserByEmail: async ({ email }) => (email === "exists@example.com" ? { id: "user-id" } : null),
        generateLink: async ({ type }) => ({ properties: { action_link: "https://..." } }),
      },
    },
  });
  const response = await handler(new Request("https://example.com", { method: "POST", body: JSON.stringify({ email: "exists@example.com" }) }));
  assertEquals(response.status, 200);
  assertEquals(mockSupabase.auth.admin.lastGenerateType, "recovery");
});
```

Expect this test to fail because `handler` still calls `listUsers`/`magiclink` and does not expose a testable handler.

**Step 2: Run test to verify it fails**

Run: `deno test supabase/functions/send-password-reset/__tests__/handler.test.ts`
Expected: FAIL with spies showing `listUsers` or `magiclink` being invoked instead of `getUserByEmail`/`recovery`.

**Step 3: Write minimal implementation**

Update `handler` to be exported for testing, replace `listUsers()` with `supabase.auth.admin.getUserByEmail(email)`, guard against `null`, and request `generateLink({ type: "recovery", ... })` so the action link now embeds the recovery tokens.

**Step 4: Run test to verify it passes**

Run: `deno test supabase/functions/send-password-reset/__tests__/handler.test.ts`
Expected: PASS now that the handler uses the new API and exposes `generateLink` calls.

**Step 5: Commit**

```bash
git add supabase/functions/send-password-reset/index.ts supabase/functions/send-password-reset/__tests__/handler.test.ts
git commit -m "fix: send password reset recovery link"
``` 
