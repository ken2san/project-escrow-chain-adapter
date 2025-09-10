
// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

contract CounterTestStub {
	// minimal placeholder used by some toolchains/tests. Replace with real test contract if needed.
	uint256 public counter;

	function increment() public {
		counter++;
	}

	function get() public view returns (uint256) {
		return counter;
	}
}
