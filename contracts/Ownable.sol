pragma solidity ^0.4.23;

/// @title Ownable
/// @dev The Ownable contract has an owner address, and provides basic authorization control functions, this simplifies
/// and the implementation of "user permissions".
contract Ownable {
    address public owner;
    address public newOwnerCandidate;

    event OwnershipRequested(address indexed _by, address indexed _to);
    event OwnershipTransferred(address indexed _from, address indexed _to);

    /// @dev The Ownable constructor sets the original `owner` of the contract to the sender
    /// account.
    constructor() public {
        owner = msg.sender;
    }

    /// @dev Reverts if called by any account other than the owner.
    modifier onlyOwner() {
        if (msg.sender != owner) {
            revert();
        }

        _;
    }

    modifier onlyOwnerCandidate() {
        if (msg.sender != newOwnerCandidate) {
            revert();
        }

        _;
    }

    /// @dev Proposes to transfer control of the contract to a newOwnerCandidate.
    /// @param _newOwnerCandidate address The address to transfer ownership to.
    function requestOwnershipTransfer(address _newOwnerCandidate) external onlyOwner {
        require(_newOwnerCandidate != address(0));

        newOwnerCandidate = _newOwnerCandidate;

        emit OwnershipRequested(msg.sender, newOwnerCandidate);
    }

    /// @dev Accept ownership transfer. This method needs to be called by the previously proposed owner.
    function acceptOwnership() external onlyOwnerCandidate {
        address previousOwner = owner;

        owner = newOwnerCandidate;
        newOwnerCandidate = address(0);

        emit OwnershipTransferred(previousOwner, owner);
    }
}
