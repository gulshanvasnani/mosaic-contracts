pragma solidity ^0.5.0;

import "../../gateway/SafeCore.sol";

/**
 * @title MockSafeCore contract
 *
 * @notice Used for test only
 */
contract MockSafeCore is SafeCore {


    /*  Public functions */

    /**
     * @notice Contract constructor.
     *
     * @param _remoteChainId The chain id of the chain that is tracked by this
     *                       core.
     * @param _blockHeight Block height at which _stateRoot needs to store.
     * @param _stateRoot State root hash of given _blockHeight.
     * @param _maxStateRoots The max number of state roots to store in the
     *                       circular buffer.
     * @param _membersManager Address of a members manager contract.
     */
    constructor(
        uint256 _remoteChainId,
        uint256 _blockHeight,
        bytes32 _stateRoot,
        uint256 _maxStateRoots,
        IsMemberInterface _membersManager
    )
        SafeCore(
            _remoteChainId,
            _blockHeight,
            _stateRoot,
            _maxStateRoots,
            _membersManager
        )
        public
    {}

    /**
     * @notice Get the mocked state root.
     *
     * @dev This is for testing only so the data is mocked here. Also please
     *      note the Core contract has defined this function as view,
     *      so to keep this overridden function as view, reading a storage
     *      variable.
     *
     * @return bytes32 Mocked state root.
     */
    function getStateRoot(uint256)
        external
        view
        returns (bytes32)
    {
        // Hashing dummy data.
        return keccak256(abi.encodePacked("dummy data"));
    }
}
