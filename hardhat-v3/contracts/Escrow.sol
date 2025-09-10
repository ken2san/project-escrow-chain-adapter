// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Escrow {
    enum State { AwaitingPayment, AwaitingDelivery, Completed, Refunded }

    struct Transaction {
        address payable buyer;
        address payable seller;
        uint256 amount;
        State state;
    }

    mapping(uint256 => Transaction) public transactions;
    uint256 public nextTransactionId;

    event TransactionCreated(uint256 transactionId, address buyer, address seller, uint256 amount);
    event FundsReleased(uint256 transactionId);
    event FundsRefunded(uint256 transactionId);

    function createTransaction(address payable _seller) public payable {
        require(msg.value > 0, "Amount must be greater than zero.");
        transactions[nextTransactionId] = Transaction({
            buyer: payable(msg.sender),
            seller: _seller,
            amount: msg.value,
            state: State.AwaitingDelivery
        });
        emit TransactionCreated(nextTransactionId, msg.sender, _seller, msg.value);
        nextTransactionId++;
    }

    function releaseFunds(uint256 _transactionId) public {
        Transaction storage trx = transactions[_transactionId];
        require(trx.seller == msg.sender, "Only seller can release funds.");
        require(trx.state == State.AwaitingDelivery, "Transaction is not awaiting delivery.");

        trx.state = State.Completed;
        trx.seller.transfer(trx.amount);
        emit FundsReleased(_transactionId);
    }

    function refundFunds(uint256 _transactionId) public {
        Transaction storage trx = transactions[_transactionId];
        require(trx.buyer == msg.sender, "Only buyer can request refund.");
        require(trx.state == State.AwaitingDelivery, "Transaction is not awaiting delivery.");

        trx.state = State.Refunded;
        trx.buyer.transfer(trx.amount);
        emit FundsRefunded(_transactionId);
    }
}
