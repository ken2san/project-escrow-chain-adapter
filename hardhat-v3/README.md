# Local dev (Hardhat v3) — Quick start

Quick commands to run the local development flow used in this project.

- Start the dev environment (node, deploy, seed, frontend):

```bash
./dev-start.sh
```

- Stop the dev environment:

```bash
./dev-stop.sh
```

- React DevTools (recommended):

Install the official React DevTools for better component debugging:
https://react.dev/link/react-devtools

- Clearing a runtime local override

The app prefers `public/deployed-contracts.json` but will surface a `localStorage.deployedContractAddress` override if present. To clear it from the browser console:

```js
localStorage.removeItem("deployedContractAddress");
window.location.reload();
```

Or use the in-app "Clear Local Override" button in the Contract Connection panel.

---

If seeding fails intermittently due to nonce/automine behavior, the repo includes a hardened `scripts/award-points.mjs` that retries on nonce conflicts.
