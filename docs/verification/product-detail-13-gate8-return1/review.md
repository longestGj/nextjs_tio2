# Gate 8 Return 1 self-review

Review range: `d75043ba5bf379b804d567db39871019dc778704..8cee4e8a77de22710dcd95ca9933401f116655c2`

## Finding disposition

- `PD13-D32-G9-ROOT-F01`: closed in the replacement Gate 8 candidate. The shared Cookie Settings dialog handles both Tab boundaries and keeps focus within the open modal.
- Close button, Escape and backdrop dismissal restore the original trigger.
- Consent copy, inactive Analytics state and zero-storage behavior remain unchanged.
- The implementation is shared by Product Detail, Home, Product Hub, M-350 and Applications; there is no page-private replacement.

## Scope review

The production change is one `onKeyDown` handler in `components/sites/tio2-my/consent/malaysia-cookie-settings.tsx`. The only added test file is `tests/cookie-settings-focus.spec.ts`. The full contract and browser suites passed on the replacement build, so unrelated Product Detail content, routing, metadata, Schema, held actions and layout behavior remain regression-covered.

No remaining Critical, Important or Minor findings were identified in this targeted self-review. Independent Gate 9 recheck remains authoritative.

## Explicit limits

The three user-excepted checks remain `USER_EXCEPTED / NOT_TESTED / NON_BLOCKING`: physical devices, manual named assistive technology, and native browser/operating-system 200% zoom. No Gate 9 decision, Gate 10, merge, push, PR, deployment, publication or indexing action was performed.
