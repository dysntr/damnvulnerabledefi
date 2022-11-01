// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

import "hardhat/console.sol";

/**
 * @title ClimberTimelock
 * @author Damn Vulnerable DeFi (https://damnvulnerabledefi.xyz)
 */
contract ClimberTimelock is AccessControl {
    using Address for address;

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant PROPOSER_ROLE = keccak256("PROPOSER_ROLE");

    // Possible states for an operation in this timelock contract
    enum OperationState {
        Unknown,
        Scheduled,
        ReadyForExecution,
        Executed
    }

    // Operation data tracked in this contract
    struct Operation {
        uint64 readyAtTimestamp; // timestamp at which the operation will be ready for execution
        bool known; // whether the operation is registered in the timelock
        bool executed; // whether the operation has been executed
    }

    // Operations are tracked by their bytes32 identifier
    mapping(bytes32 => Operation) public operations;

    uint64 public delay = 1 hours;

    constructor(address admin, address proposer) {
        _setRoleAdmin(ADMIN_ROLE, ADMIN_ROLE);
        _setRoleAdmin(PROPOSER_ROLE, ADMIN_ROLE);

        // deployer + self administration
        _setupRole(ADMIN_ROLE, admin);
        _setupRole(ADMIN_ROLE, address(this));

        _setupRole(PROPOSER_ROLE, proposer);
    }

    function getOperationState(bytes32 id) public view returns (OperationState) {
        Operation memory op = operations[id];

        if (op.executed) {
            console.log("OperationState.Executed");
            return OperationState.Executed;
        } else if (op.readyAtTimestamp >= block.timestamp) {
            console.log("OperationState.ReadyForExecution");
            return OperationState.ReadyForExecution;
        } else if (op.readyAtTimestamp > 0) {
            console.log("OperationState.Scheduled");
            return OperationState.Scheduled;
        } else {
            console.log("OperationState.Unknown");
            return OperationState.Unknown;
        }
    }

    function getOperationId(
        address[] calldata targets,
        uint256[] calldata values,
        bytes[] calldata dataElements,
        bytes32 salt
    ) public view returns (bytes32) {
        console.log(
            "getOperationState",
            Strings.toHexString(uint256(keccak256(abi.encode(targets, values, dataElements, salt))))
        );

        return keccak256(abi.encode(targets, values, dataElements, salt));
    }

    function schedule(
        address[] calldata targets,
        uint256[] calldata values,
        bytes[] calldata dataElements,
        bytes32 salt
    ) external onlyRole(PROPOSER_ROLE) {
        console.log("entered schedule()");
        require(targets.length > 0 && targets.length < 256);
        require(targets.length == values.length);
        require(targets.length == dataElements.length);

        bytes32 id = getOperationId(targets, values, dataElements, salt);
        require(getOperationState(id) == OperationState.Unknown, "Operation already known");

        operations[id].readyAtTimestamp = uint64(block.timestamp) + delay;
        operations[id].known = true;
    }

    /** Anyone can execute what has been scheduled via `schedule` */
    function execute(
        address[] calldata targets,
        uint256[] calldata values,
        bytes[] calldata dataElements,
        bytes32 salt
    ) external payable {
        console.log("enter execute");
        console.log("target.length", targets.length);
        console.log("values.length", values.length);
        console.log("dataElements.length", dataElements.length);
        require(targets.length > 0, "Must provide at least one target");
        require(targets.length == values.length);
        require(targets.length == dataElements.length);

        console.log("passed excuted require 1");
        bytes32 id = getOperationId(targets, values, dataElements, salt);

        for (uint8 i = 0; i < targets.length; i++) {
            console.log("i", i);
            console.log("target i", targets[i]);
            //console.log("dataElements[i]", abi.encodePacked(bytes32(dataElements[i])));
            console.log("values[i]", values[i]);
            targets[i].functionCallWithValue(dataElements[i], values[i]);
        }
        require(
            getOperationState(id) == OperationState.ReadyForExecution,
            "Operation not in Ready state"
        );
        operations[id].executed = true;
    }

    function bytes32ToString(bytes32 _bytes32) public pure returns (string memory) {
        uint8 i = 0;
        while (i < 32 && _bytes32[i] != 0) {
            i++;
        }
        bytes memory bytesArray = new bytes(i);
        for (i = 0; i < 32 && _bytes32[i] != 0; i++) {
            bytesArray[i] = _bytes32[i];
        }
        return string(bytesArray);
    }

    function updateDelay(uint64 newDelay) external {
        console.log("updateDelay");
        require(msg.sender == address(this), "Caller must be timelock itself");
        require(newDelay <= 14 days, "Delay must be 14 days or less");
        delay = newDelay;
        console.log("delay", delay);
    }

    receive() external payable {}
}
