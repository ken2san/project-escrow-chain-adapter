// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract Escrow {
    address public owner;
    mapping(address => uint256) public points;

    event PointsAwarded(address indexed to, uint256 amount);
    event PointsTransferred(address indexed from, address indexed to, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function awardPoints(address to, uint256 amount) external onlyOwner {
        require(to != address(0), "Invalid address");
        require(amount > 0, "Amount must be > 0");
        points[to] += amount;
        emit PointsAwarded(to, amount);
    }

    function pointsOf(address user) external view returns (uint256) {
        return points[user];
    }

    function transferPoints(address to, uint256 amount) external {
        require(to != address(0), "Invalid address");
        uint256 bal = points[msg.sender];
        require(bal >= amount, "Insufficient balance");
        // checks-effects-interactions
        points[msg.sender] = bal - amount;
        points[to] += amount;
        emit PointsTransferred(msg.sender, to, amount);
    }
}
