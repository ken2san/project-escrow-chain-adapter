# Escrow / Points — SPEC

このドキュメントは本リポジトリの簡易 Escrow（ポイント）コントラクトの仕様を定義します。
開発者がコントラクト実装・テスト・フロントエンド統合を行うための共通契約書です。

**目的**: オーナーが任意アドレスに「ポイント」を付与でき、ユーザー同士でポイントを移転できる最小限のオンチェーン MVP。

**設計方針（要点）**

- シンプルな状態モデル: mapping(address => uint256) のポイントだけを保つ。
- アクセス制御: `awardPoints` はコントラクトの `owner` のみ実行可能。
- 安全性: Solidity 0.8.x を想定し、整数オーバーフローは言語レベルで保護される。
- イベント重視: 重要な状態変更はイベントで通知する（フロントはイベントで更新を受け取る）。

**コントラクト API（外部公開関数）**

- `owner() public view returns (address)`

  - コントラクト所有者アドレスを返す。

- `awardPoints(address to, uint256 amount) public`

  - 説明: オーナーが `to` に `amount` のポイントを付与する。
  - 要件: `onlyOwner`。
  - イベント: `PointsAwarded(to, amount)` を発行。

- `transferPoints(address to, uint256 amount) public`

  - 説明: 呼び出し元のアドレスから `to` へ `amount` を移す。
  - 要件: 呼び出し元のポイント残高 >= `amount`。
  - イベント: `PointsTransferred(from, to, amount)` を発行。

- `pointsOf(address who) public view returns (uint256)`
  - 説明: `who` の現在のポイント残高を返す。

**イベント**

- `event PointsAwarded(address indexed to, uint256 amount);`
- `event PointsTransferred(address indexed from, address indexed to, uint256 amount);`

（追加で必要なら `OwnershipTransferred` を持たせること）

**エラー / リバート条件**

- transfer: 残高不足は revert（例: `require(balance >= amount, "Insufficient balance")`）。
- award: `onlyOwner` でなければ revert。
- 無効アドレス（0x0）を警告して拒否することが望ましい。

**ストレージ**

- `mapping(address => uint256) private _points;`
- `address private _owner;`

**アクセス制御 / 初期化**

- コントラクトのコンストラクタで `owner = msg.sender` にセット。
- 必要であれば `transferOwnership` を実装しても良い。

**フロントエンド統合: `deployed-contracts.json` スキーマ**
フロントエンドはローカル開発で `frontend/src/deployed-contracts.json`（および `frontend/public/deployed-contracts.json`）を読み、利用します。
スクリプト `scripts/deploy.mjs` はこの形式で書き出すことを想定します。

JSON スキーマ（例）:

{
"chainId": 31337,
"networkName": "localhost",
"deployedAt": "2025-09-21T12:34:56.000Z",
"contracts": [
{
"name": "Escrow",
"address": "0x...",
"abi": [ /* コントラクト ABI */ ]
}
],
"defaultAccounts": [
"0xaaa...",
"0xbbb...",
"0xccc..."
]
}

- `chainId`: 数値（例: 31337）
- `networkName`: 文字列（例: "localhost"）
- `deployedAt`: ISO8601 タイムスタンプ
- `contracts`: 配列。各要素は `name`, `address`, `abi`。
- `defaultAccounts`: ローカルテストでのデフォルトアカウントアドレス（フロントで即表示/選択に使う）

**開発ワークフロー（ローカル）**

- 推奨フロー（既存構成を前提: `hardhat-v3` がサブディレクトリ）:

  1. `cd hardhat-v3`
  2. `npx hardhat node` を起動（または `npx hardhat node --port 8545`）
  3. 別のターミナルでデプロイ: `node scripts/deploy.mjs --rpc http://127.0.0.1:8545`（`DEV_MNEMONIC` を環境変数で与えると同じアカウントが得られる）
  4. フロントを起動: `cd ../frontend && npm run dev`（`frontend` は `deployed-contracts.json` を読み込む）

- 環境変数（テスト/デプロイ用）:
  - `DEV_MNEMONIC` - Hardhat の固定 mnemonic。ノード再起動時でも同じ unlocked accounts を得たいときに使う。
  - `DEV_PK0/DEV_PK1/DEV_PK2` - テスト専用に使うプライベートキー（`.env` に入れる想定、公開リポジトリにコミットしないこと）。
  - `RPC_URL` - JSON-RPC エンドポイント（テストフレーム用）

**デプロイスクリプトの期待挙動（`hardhat-v3/scripts/deploy.mjs`）**

- ESM スクリプト。
- 指定 RPC に接続してデプロイを行い、`frontend/src/deployed-contracts.json` と `frontend/public/deployed-contracts.json` を上書き（または作成）する。
- 出力は上記 JSON スキーマに従う。
- 例: `node scripts/deploy.mjs --rpc http://127.0.0.1:8545` または `RPC_URL=http://127.0.0.1:8545 node scripts/deploy.mjs`

**テストの期待と注意点**

- Ethers v6 は BigInt を返すため、テストは BigInt と比較する（例: `expect(bal).to.equal(100n)`）。
- ローカル node（Hardhat）の automining に注意。複数トランザクションを素早く送る場合は nonce を明示するか `await tx.wait()` を適切に使う。
- Provider の `getSigner()` は read-only なことがある（環境依存）。テストでは `DEV_PK*` から `Wallet` を作るか、アンロック済のプロバイダを使用するフェールバックを組む。

**例: `deployed-contracts.json`（実例）**

{
"chainId": 31337,
"networkName": "localhost",
"deployedAt": "2025-09-21T12:34:56.000Z",
"contracts": [
{
"name": "Escrow",
"address": "0x5FbDB2315678afecb367f032d93F642f64180aa3",
"abi": [ /* Escrow ABI (省略) */ ]
}
],
"defaultAccounts": [
"0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
"0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
"0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc"
]
}

**運用メモ / ガイドライン**

- 本番用の鍵やシークレットは `.env` に置き、リポジトリにはコミットしない。
- テストデータの再現性を高めるため、`DEV_MNEMONIC` を使ってローカルノードのアカウントを固定すると便利。
- 何らかの変更で ABI やアドレス形式が変わったら `scripts/deploy.mjs` を更新し、フロントに反映させること。

---

この SPEC を土台に `Escrow.sol` の実装レビュー、テストカバレッジ追加、`deploy.mjs` と `dev-start.sh` の実装を進めます。希望があれば英語版の要約も作成できます。
