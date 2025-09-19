// Contract types and interfaces
export interface Transaction {
  buyer: string;
  seller: string;
  amount: bigint;
  state: number; // 0: Created, 1: AwaitingDelivery, 2: Completed, 3: Refunded
}

export interface EscrowContract {
  createTransaction: (seller: string, options: { value: bigint }) => Promise<any>;
  releaseFunds: (transactionId: number) => Promise<any>;
  refundFunds: (transactionId: number) => Promise<any>;
  awardPoints: (to: string, amount: number) => Promise<any>;
  transferPoints: (to: string, amount: number) => Promise<any>;
  transactions: (id: number) => Promise<Transaction>;
  points: (address: string) => Promise<bigint>;
}

export const TRANSACTION_STATES = {
  0: 'Created',
  1: 'Awaiting Delivery',
  2: 'Completed',
  3: 'Refunded'
} as const;