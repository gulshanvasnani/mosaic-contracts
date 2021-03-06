pragma solidity ^0.4.23;

// Copyright 2018 OpenST Ltd.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @title AuxiliaryStake tracks the validator deposits of the Mosaic
 *        validators. The set of validators will change with new OSTblocks
 *        opening on auxiliary. This contract should always know the active
 *        validators and their respective stake.
 */
contract AuxiliaryStake {

    /* Structs */

    /**
     * A validator deposited stake on origin to enter the set of validators.
     */
    struct Validator {

        /** The address of the validator on auxiliary. */
        address auxiliaryAddress;

        /** The amount of OST that the validator deposited on origin. */
        uint256 stake;

        /** When set to `true`, check `endHeight` to know the last OSTblock. */
        bool ended;

        /**
         * The OSTblock height where this validator will enter the set of
         * validators. Usually, when a validator deposits at OSTblock height h,
         * then OSTblock h+1 announces that the validator will join in OSTblock
         * h+2.
         * The validator will participate starting from the OSTblock with
         * exactly this height.
         */
        uint256 startHeight;

        /**
         * The OSTblock height where this validator will exit the set of
         * validators. Usually, when a validator withdraws at OSTblock height
         * h, then OSTblock h+1 announces that the validator will leave in
         * OSTblock h+2.
         * The OSTblock with this height will be the first block where the
         * validator does not participate anymore.
         */
        uint256 endHeight;
    }

    /* Public Variables */

    /**
     * The OSTblock gate is the only contract that is allowed to update the
     * OSTblock height.
     */
    address public ostBlockGate;

    /**
     * Tracks the current height of the OSTblock within this contract. We track
     * this here to make certain assertions about newly reported OSTblocks and
     * to know what current height we are voting on.
     */
    uint256 public currentOstBlockHeight;

    /**
     * Maps auxiliary addresses of validators to their details.
     *
     * The initial set will be given at construction. Later, validators can
     * enter and leave the set of validators through the reporting of new
     * OSTblocks to auxiliary. Validators that left the set of validators are
     * still kept in the mapping, with `ended` set to `true`.
     *
     * One address can never stake more than once.
     */
    mapping (address => Validator) public validators;

    /**
     * Maps the OSTblock height to the total stake at that height. The total
     * stake is the sum of all deposits that took place at least two OSTblocks
     * before and that have not withdrawn at least two OSTblocks before.
     */
    mapping (uint256 => uint256) public totalStakes;

    /* Constructor */

    /**
     * @notice Initialise the contract with an initial set of validators.
     *         Provide two arrays with the validators' addresses on auxiliary
     *         and their respective stakes at the same index. If an auxiliary
     *         address and a stake have the same index in the provided arrays,
     *         they are regarded as belonging to the same validator.
     *
     * @param _ostBlockGate The OSTblock gate is the only address that is
     *                      allowed to call methods that update the current
     *                      height of the OSTblock chain.
     * @param _auxiliaryAddresses An array of validators' addresses on
     *                            auxiliary.
     * @param _stakes The stakes of the validators on origin. Indexed the same
     *                way as the _auxiliaryAddresses.
     */
    constructor (
        address _ostBlockGate,
        address[] _auxiliaryAddresses,
        uint256[] _stakes
    )
        public
    {
        require(
            _ostBlockGate != address(0),
            "The address of the validator manager must not be zero."
        );

        require(
            _auxiliaryAddresses.length > 0,
            "The count of initial validators must be at least one."
        );

        ostBlockGate = _ostBlockGate;

        addValidators(_auxiliaryAddresses, _stakes);
    }

    /* External Functions */

    /**
     * @notice Updates the OSTblock height by one and adds the new validators
     *         that should join at this height.
     *         Provide two arrays with the validators' addresses on auxiliary
     *         and their respective stakes at the same index. If an auxiliary
     *         address and a stake have the same index in the provided arrays,
     *         they are regarded as belonging to the same validator.
     *
     * @param _auxiliaryAddresses The addresses of the new validators on the
     *                            auxiliary chain.
     * @param _stakes The stakes of the validators on origin.
     *
     * @return `true` if the update was successful. Reverts otherwise.
     */
    function updateOstBlockHeight(
        address[] _auxiliaryAddresses,
        uint256[] _stakes
    )
        external
        returns (bool success_)
    {
        require(
            msg.sender == ostBlockGate,
            "OSTblock updates must be done by the registered OSTblock gate."
        );

        currentOstBlockHeight++;

        /*
         * Before adding the new validators, copy the total stakes from the
         * previous height. The new validators' stakes for this height will be
         * added on top.
         */
        totalStakes[currentOstBlockHeight] = totalStakes[currentOstBlockHeight - 1];

        addValidators(_auxiliaryAddresses, _stakes);

        success_ = true;
    }

    /* Private Functions */

    /**
     * @notice Add validators to the set of validators. Starting from the
     *         current OSTblock height.
     *
     * @param _auxiliaryAddresses The addresses of the new validators on the
     *                            auxiliary chain.
     * @param _stakes The stakes of the validators on origin.
     */
    function addValidators(
        address[] _auxiliaryAddresses,
        uint256[] _stakes
    )
        private
    {
        require(
            _auxiliaryAddresses.length == _stakes.length,
            "The lengths of the addresses and stakes arrays must be identical."
        );

        for (uint256 i; i < _auxiliaryAddresses.length; i++) {
            address auxiliaryAddress = _auxiliaryAddresses[i];
            uint256 stake = _stakes[i];

            require(
                stake > 0,
                "The stake must be greater zero for all validators."
            );

            require(
                auxiliaryAddress != address(0),
                "The auxiliary address of a validator must not be zero."
            );

            require(
                !validatorExists(auxiliaryAddress),
                "There must not be duplicate addresses in the set of validators."
            );

            validators[auxiliaryAddress] = Validator(
                auxiliaryAddress,
                stake,
                false,
                currentOstBlockHeight,
                0
            );

            totalStakes[currentOstBlockHeight] += stake;
        }
    }

    /**
     * @notice Returns true if the validator is already stored.
     *
     * @param _auxiliaryAddress The address of the validator on the auxiliary
     *                          system.
     *
     * @return `true` if the address has already been registered.
     */
    function validatorExists(
        address _auxiliaryAddress
    )
        private
        view
        returns (bool)
    {
        return validators[_auxiliaryAddress].auxiliaryAddress != address(0);
    }
}
