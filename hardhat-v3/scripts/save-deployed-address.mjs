import fs from 'fs';
import path from 'path';

// デプロイ済みのコントラクトアドレス（実際のアドレスに変更してください）
const DEPLOYED_ADDRESS = '0x9A676e781A523b5d0C0e43731313A708CB607508';

const deployedContracts = {
  Escrow: {
    address: DEPLOYED_ADDRESS,
    network: 'localhost',
    chainId: 31337,
    deployedAt: new Date().toISOString()
  },
  defaultAccounts: {
    user1: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    user2: '0xbD3e33013aA42e6835146f726aE5B0Ad745Cc453'
  }
};

// フロントエンドの public フォルダに保存
const outputPath = path.join(process.cwd(), 'frontend', 'public', 'deployed-contracts.json');
const outputDir = path.dirname(outputPath);

// ディレクトリが存在しない場合は作成
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

fs.writeFileSync(outputPath, JSON.stringify(deployedContracts, null, 2));
console.log(`✅ Contract addresses saved to: ${outputPath}`);
console.log(`📋 Escrow contract: ${DEPLOYED_ADDRESS}`);