pragma solidity ^0.8.0;

import "@gnosis.pm/safe-contracts/contracts/base/ModuleManager.sol";
import "@gnosis.pm/safe-contracts/contracts/common/Enum.sol";

/*
 * @notice UNSAFE CODE - DO NOT USE IN PRODUCTION
 */
contract ControllerModule is ModuleManager {
    function setup() public {}

    // Allows anyone to execute a call from the controlled wallet
    function executeCall(
        address to,
        uint256 value,
        bytes memory data
    ) public {
        // `manager` represents the wallet under control
        require(this.execTransactionFromModule(to, value, data, Enum.Operation.Call));
    }

    // Allows anyone to become the wallet's owner
    function becomeOwner(address proxy, address currentOwner) public {
        console.log("entering becomeOwner");
        executeCall(
            address(proxy),
            0,
            abi.encodeWithSignature(
                "swapOwner(address,address,address)",
                address(0x1),
                currentOwner,
                msg.sender
            )
        );
    }
}
