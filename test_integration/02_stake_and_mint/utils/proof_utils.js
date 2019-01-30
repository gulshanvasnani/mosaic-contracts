// Copyright 2019 OpenST Ltd.
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
//
// ----------------------------------------------------------------------------
//
// http://www.simpletoken.org/
//
// ----------------------------------------------------------------------------

const rlp = require('rlp');

// This is the position of message outbox defined in GatewayBase.sol
const MESSAGE_OUTBOX_OFFSET = '7';

// This is the position of message inbox defined in GatewayBase.sol
const MESSAGE_INBOX_OFFSET = '8';


class ProofUtils {
    /**
     *
     * @param sourceWeb3 Web3 instance connected to source chain.
     * @param targetWeb3 Web3 instance connected to target chain.
     */
    constructor(sourceWeb3, targetWeb3) {
        this.sourceWeb3 = sourceWeb3;
        this.targetWeb3 = targetWeb3;
    }

    /**
     * Get proof for inbox
     *
     * @param address Address of ethereum account for which proof needs to be
     *                generated.
     * @param keys Array of keys for a mapping in solidity.
     * @param blockNumber Block number.
     *
     * @return {Object} Proof data.
     */
    async getInboxProof(address, keys = [], blockNumber) {
        const proof = await this._getProof(
            this.targetWeb3,
            MESSAGE_INBOX_OFFSET,
            address,
            keys,
            blockNumber,
        );
        return proof;
    }

    /**
     * Get proof for outbox
     *
     * @param address Address of ethereum account for which proof needs to be
     *                generated.
     * @param keys Array of keys for a mapping in solidity.
     * @param blockNumber Block number.
     *
     * @return {Object} Proof data.
     */
    async getOutboxProof(address, keys = [], blockNumber) {
        const proof = await this._getProof(
            this.sourceWeb3,
            MESSAGE_OUTBOX_OFFSET,
            address,
            keys,
            blockNumber,
        );
        return proof;
    }

    /**
     * Get proof data
     *
     * @param index Storage index.
     * @param address Address of ethereum account for which proof needs to be
     *                generated.
     * @param keys Array of keys for a mapping in solidity.
     * @param blockNumber Block number.
     *
     * @return {Object} Proof data.
     */
    async _getProof(web3, index, address, keys, blockNumber) {
        if (!blockNumber) {
            const block = await web3.eth.getBlock('latest');
            blockNumber = await web3.utils.toHex(block.number);
        }

        const storageKey = this._storagePath(
            web3,
            index,
            keys,
        );

        const proof = await this._fetchProof(
            web3,
            address,
            [storageKey],
            blockNumber,
        );

        const proofData = proof.result;
        proofData.block_number = blockNumber;
        return proofData;
    }

    /**
     * @param address Address of ethereum account for which proof needs to be
     *                generated.
     * @param storageKeys Array of keys for a mapping in solidity.
     * @param blockNumber Block number.
     * @return {Promise<Proof>}
     */
    async _fetchProof(web3, address, storageKeys = [], blockNumber = 'latest') {
        const params = [address, storageKeys, blockNumber];
        return new Promise(((resolve, reject) => {
            web3.currentProvider.send({
                jsonrpc: '2.0',
                method: 'eth_getProof',
                params,
                id: new Date().getTime(),
            }, (err, response) => {
                if (response) {
                    const accountProof = response.result.accountProof;
                    const storageProofs = response.result.storageProof;

                    response.result.serializedAccountProof = this._serializeProof(accountProof);
                    response.result.encodedAccountValue = this._encodedAccountValue(
                        response.result.serializedAccountProof,
                    );

                    storageProofs.forEach((sp) => {
                        sp.serializedProof = this._serializeProof(sp.proof);
                    });
                    resolve(response);
                }
                reject(err);
            });
        }));
    }

    _storagePath(web3, storageIndex, mappings) {
        let path = '';

        if (mappings && mappings.length > 0) {
            mappings.map((mapping) => {
                path = `${path}${web3.utils.padLeft(mapping, 64)}`;
            });
        }

        path = `${path}${web3.utils.padLeft(storageIndex, 64)}`;
        path = web3.utils.sha3(path, { encoding: 'hex' });

        return path;
    }

    /**
     *
     * @param proof Array of nodes representing merkel proof.
     * @return {string | *} Serialized proof.
     * @private
     */
    _serializeProof(proof) {
        const serializedProof = [];
        proof.forEach(p => serializedProof.push(rlp.decode(p)));
        return `0x${rlp.encode(serializedProof).toString('hex')}`;
    }

    /**
     *  Fetch rlp encoded account value (nonce, balance, codehash, storageRoot)
     * @param accountProof
     * @return {string}
     * @private
     */
    _encodedAccountValue(accountProof) {
        const decodedProof = rlp.decode(accountProof);
        const leafElement = decodedProof[decodedProof.length - 1];
        return `0x${leafElement[leafElement.length - 1].toString('hex')}`;
    }
}

module.exports = ProofUtils;
