# BLOCKCHAIN AGENT INTERFACE (for AI agents / automation)

Purpose

- Provide a minimal, precise description of what this front-end expects from a local Hardhat deployment so an external AI agent can prepare, package, and hand over the required artifacts and connection details.

Requirements summary (exact keys and file names)

- RPC endpoint: `http://127.0.0.1:8545` (default) — front-end reads `REACT_APP_RPC_URL` env var
- Chain ID: `31337` (Hardhat default) — front-end expects chainId to match
- Contract artifacts (required):
  - `artifacts/Contracts/PointsManager.sol/PointsManager.json` (ABI + bytecode optional)
  - `deploy_addresses.json` (JSON mapping of contract names to addresses)
- Env file keys (front-end will read `./.env.local`):
  - `REACT_APP_RPC_URL` — RPC url
  - `REACT_APP_POINTS_ADDR` — deployed PointsManager contract address

Artifact formats (examples)

- `deploy_addresses.json`:

```json
{
  "PointsManager": "0x1234567890abcdef...",
  "Escrow": "0xabcdef0123456789..."
}
```

- `PointsManager.json` (standard hardhat artifact excerpt):

```json
{
  "abi": [
    /* ABI array */
  ],
  "bytecode": "0x...",
  "linkReferences": {}
}
```

Required capabilities for agent

1. Start a Hardhat node and run deployment scripts.
   - Command (example): `npx hardhat node` then `npx hardhat run scripts/deploy.js --network localhost`
2. Output or copy the following into a zip / folder for the front-end:
   - `deploy_addresses.json`
   - `artifacts/.../PointsManager.json` (ABI)
   - Optional: `private_keys.json` (array of test accounts private keys) — sensitive, local only
3. Produce a short `metadata.json` with the following fields:

```json
{
  "rpc": "http://127.0.0.1:8545",
  "chainId": 31337,
  "contracts": {
    "PointsManager": "0x..."
  },
  "abiFiles": ["artifacts/Contracts/PointsManager.sol/PointsManager.json"],
  "privateKeys": ["0x..."]
}
```

Packaging structure (what the front-end expects to receive)

```
package.zip
├─ deploy_addresses.json
├─ metadata.json
├─ artifacts/
│  └─ Contracts/PointsManager.sol/PointsManager.json
└─ private_keys.json   (optional)
```

Agent actions (end-to-end)

1. Run Hardhat node and deploy contracts. Capture deploy addresses.
2. Copy artifact(s) and addresses into a folder and write `metadata.json`.
3. Zip the folder and provide it to the front-end team (or place it in a shared drive).

How the front-end will use the package

- The front-end expects you to unpack and place files at project root (or specify env var paths). Example `.env.local` content it will read:

```
REACT_APP_RPC_URL=http://127.0.0.1:8545
REACT_APP_POINTS_ADDR=0x1234... (from deploy_addresses.json)
```

Notes & Security

- Private keys are for local testing only. Do not share them in public channels.
- Absolute paths in `metadata.json` are allowed but relative paths are preferred.

Contact: attach logs (`hardhat-deploy.log`) or sample `npx hardhat run` output if anything fails.

---

Generated for integration with this front-end repo.
