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
//
// ----------------------------------------------------------------------------
//
// http://www.simpletoken.org/
//
// ----------------------------------------------------------------------------
//

'use strict';

const MessageBus = artifacts.require('MessageBusWrapper'),
    utils = require('../../test_lib/utils'),
    web3 = require('../../test_lib/web3.js');

let messageBus;

const MessageBusUtils = function () {
};
MessageBusUtils.prototype = {

    defaultParams: function (accounts) {
        let intentHash = web3.utils.soliditySha3({
                type: 'bytes32',
                value: 'intent'
            })
            , nonce = 1
            , gasPrice = 0x12A05F200
            , sender = accounts[7]
            , messageTypeHash = web3.utils.soliditySha3({
                type: 'bytes32',
                value: 'gatewaylink'
            })
            , gasLimit = 0
            , gasConsumed = 0
            ,
            messageHash = '0x9bdab5cbc3ebd8d50e3831bc73da35c1170e21bfb7145e41ce4a952b977a8f84'
            , messageStatus = 1
            , generatedHashLock = utils.generateHashLock()
            , unlockSecret = generatedHashLock.s
            , hashLock = generatedHashLock.l
            , messageBoxOffset = 1
            ,
            rlpParentNodes = '0xf9019ff901318080a09d4484981c7edad9f3182d5ae48f8d9d37920c6b38a2871cebef30386741a92280a0e159e6e0f6ff669a91e7d4d1cf5eddfcd53dde292231841f09dd29d7d29048e9a0670573eb7c83ac10c87de570273e1fde94c1acbd166758e85aeec2219669ceb5a06f09c8eefdb579cae94f595c48c0ee5e8052bef55f0aeb3cc4fac8ec1650631fa05176aab172a56135b9d01a89ccada74a9d11d8c33cbd07680acaf9704cbec062a0df7d6e63240928af91e7c051508a0306389d41043954c0e3335f6f37b8e53cc18080a03d30b1a0d2a61cafd83521c5701a8bf63d0020c0cd9e844ad62e9b4444527144a0a5aa2db9dc726541f2a493b79b83aeebe5bc8f7e7910570db218d30fa7d2ead18080a0b60ddc26977a026cc88f0d5b0236f4cee7b93007a17e2475547c0b4d59d16c3d80f869a034d7a0307ecd0d12f08317f9b12c4d34dfbe55ec8bdc90c4d8a6597eb4791f0ab846f8440280a0e99d9c02761142de96f3c92a63bb0edb761a8cd5bbfefed1e72341a94957ec51a0144788d43dba972c568df04560b995d9e57b58ef09fddf3b68cba065997efff7'
            ,
            storageRoot = '0x9642e5c7f830dbf5cb985c9a2755ea2e5e560dbe12f98fd19d9b5b6463c2e771';

        let params = {
            messageTypeHash: messageTypeHash,
            intentHash: intentHash,
            nonce: nonce,
            sender: sender,
            hashLock: hashLock,
            gasLimit: gasLimit,
            gasConsumed: gasConsumed,
            messageStatus: messageStatus,
            gasPrice: gasPrice,
            messageHash: messageHash,
            unlockSecret: unlockSecret,
            messageBoxOffset: messageBoxOffset,
            rlpParentNodes: rlpParentNodes,
            storageRoot: storageRoot
        };
        return params;
    },

    deployedMessageBus: async function () {

        messageBus = await MessageBus.new();
        return messageBus;

    },

    declareMessage: async function (params, changeState) {

        let messageTypeHash = params.messageTypeHash,
            intentHash = params.intentHash,
            nonce = params.nonce,
            gasPrice = params.gasPrice,
            gasLimit = params.gasLimit,
            sender = params.sender,
            hashLock = params.hashLock,
            gasConsumed = params.gasConsumed;

        if (changeState === false) {
            await utils.expectRevert(
                messageBus.declareMessage(
                    messageTypeHash,
                    intentHash,
                    nonce,
                    gasPrice,
                    gasLimit,
                    sender,
                    hashLock,
                    gasConsumed
                ),
                params.message
            );

        }
        else {
            await messageBus.declareMessage(
                messageTypeHash,
                intentHash,
                nonce,
                gasPrice,
                gasLimit,
                sender,
                hashLock,
                gasConsumed
            );
        }
    },

    progressOutbox: async function (params, changeState) {

        let messageTypeHash = params.messageTypeHash,
            intentHash = params.intentHash,
            nonce = params.nonce,
            gasPrice = params.gasPrice,
            gasLimit = params.gasLimit,
            sender = params.sender,
            hashLock = params.hashLock,
            gasConsumed = params.gasConsumed,
            unlockSecret = params.unlockSecret;

        if (changeState === false) {

            await utils.expectRevert(
                messageBus.progressOutbox(
                    messageTypeHash,
                    intentHash,
                    nonce,
                    gasPrice,
                    gasLimit,
                    sender,
                    hashLock,
                    gasConsumed,
                    unlockSecret
                ),
                params.message
            );

        }
        else {

            await messageBus.progressOutbox(
                messageTypeHash,
                intentHash,
                nonce,
                gasPrice,
                gasLimit,
                sender,
                hashLock,
                gasConsumed,
                unlockSecret
            );
        }
    },

    declareRevocationMessage: async function (params, changeState) {

        let messageTypeHash = params.messageTypeHash,
            intentHash = params.intentHash,
            nonce = params.nonce,
            gasPrice = params.gasPrice,
            gasLimit = params.gasLimit,
            sender = params.sender,
            hashLock = params.hashLock,
            gasConsumed = params.gasConsumed;

        if (changeState === false) {
            await utils.expectRevert(
                messageBus.declareRevocationMessage.call(
                    messageTypeHash,
                    intentHash,
                    nonce,
                    gasPrice,
                    gasLimit,
                    sender,
                    hashLock,
                    gasConsumed
                ),
                params.message
            )
            ;
        }
        else {
            await messageBus.declareRevocationMessage(
                messageTypeHash,
                intentHash,
                nonce,
                gasPrice,
                gasLimit,
                sender,
                hashLock,
                gasConsumed
            );
        }
    },

    progressInbox: async function (params, changeState) {

        let messageTypeHash = params.messageTypeHash,
            intentHash = params.intentHash,
            nonce = params.nonce,
            gasPrice = params.gasPrice,
            gasLimit = params.gasLimit,
            sender = params.sender,
            hashLock = params.hashLock,
            gasConsumed = params.gasConsumed,
            unlockSecret = params.unlockSecret;

        if (changeState === false) {

            await utils.expectRevert(
                messageBus.progressInbox.call(
                    messageTypeHash,
                    intentHash,
                    nonce,
                    gasPrice,
                    gasLimit,
                    sender,
                    hashLock,
                    gasConsumed,
                    unlockSecret
                ),
                params.message
            );
        }
        else {

            await messageBus.progressInbox(
                messageTypeHash,
                intentHash,
                nonce,
                gasPrice,
                gasLimit,
                sender,
                hashLock,
                gasConsumed,
                unlockSecret
            );
        }
    },

    progressInboxRevocation: async function (params, changeState) {

        let messageTypeHash = params.messageTypeHash,
            intentHash = params.intentHash,
            nonce = params.nonce,
            sender = params.sender,
            messageStatus = params.messageStatus,
            rlpParentNodes = params.rlpParentNodes,
            messageBoxOffset = params.messageBoxOffset,
            storageRoot = params.storageRoot,
            hashLock = params.hashLock;

        if (changeState === false) {

            await utils.expectRevert(
                messageBus.progressInboxRevocation.call(
                    messageTypeHash,
                    intentHash,
                    nonce,
                    sender,
                    messageBoxOffset,
                    rlpParentNodes,
                    storageRoot,
                    messageStatus,
                    hashLock
                ),
                params.message
            );
        }
        else {
            await messageBus.progressInboxRevocation(
                messageTypeHash,
                intentHash,
                nonce,
                sender,
                messageBoxOffset,
                rlpParentNodes,
                storageRoot,
                messageStatus,
                hashLock
            )

        }
    },

    progressOutboxRevocation: async function (params, changeState) {

        let messageTypeHash = params.messageTypeHash,
            intentHash = params.intentHash,
            nonce = params.nonce,
            sender = params.sender,
            messageStatus = params.messageStatus,
            rlpParentNodes = params.rlpParentNodes,
            messageBoxOffset = params.messageBoxOffset,
            storageRoot = params.storageRoot,
            hashLock = params.hashLock;

        if (changeState === false) {

            await utils.expectRevert(
                messageBus.progressOutboxRevocation.call(
                    messageTypeHash,
                    intentHash,
                    nonce,
                    sender,
                    messageBoxOffset,
                    rlpParentNodes,
                    storageRoot,
                    messageStatus,
                    hashLock
                ),
                params.message
            );
        }

        else {
            await messageBus.progressOutboxRevocation(
                messageTypeHash,
                intentHash,
                nonce,
                sender,
                messageBoxOffset,
                rlpParentNodes,
                storageRoot,
                messageStatus,
                hashLock
            );
        }
    },

    confirmRevocation: async function (params, changeState) {

        let messageTypeHash = params.messageTypeHash,
            intentHash = params.intentHash,
            nonce = params.nonce,
            rlpParentNodes = params.rlpParentNodes,
            messageBoxOffset = params.messageBoxOffset,
            storageRoot = params.storageRoot,
            sender = params.sender,
            hashLock = params.hashLock;

        if (changeState === false) {

            await utils.expectRevert(
                messageBus.confirmRevocation(
                    messageTypeHash,
                    intentHash,
                    nonce,
                    sender,
                    messageBoxOffset,
                    rlpParentNodes,
                    storageRoot,
                    hashLock
                ),
                params.message
            );
        }
        else {

            await messageBus.confirmRevocation(
                messageTypeHash,
                intentHash,
                nonce,
                sender,
                messageBoxOffset,
                rlpParentNodes,
                storageRoot,
                hashLock
            );

        }
    },

    confirmMessage: async function (params, changeState) {

        let messageTypeHash = params.messageTypeHash,
            intentHash = params.intentHash,
            nonce = params.nonce,
            sender = params.sender,
            rlpParentNodes = params.rlpParentNodes,
            storageRoot = params.storageRoot,
            messageBoxOffset = params.messageBoxOffset,
            hashLock = params.hashLock;

        if (changeState === false) {

            await utils.expectRevert(
                messageBus.confirmMessage(
                    messageTypeHash,
                    intentHash,
                    nonce,
                    sender,
                    rlpParentNodes,
                    storageRoot,
                    messageBoxOffset,
                    hashLock
                ),
                params.message
            );

        }
        else {
            await messageBus.confirmMessage(
                messageTypeHash,
                intentHash,
                nonce,
                sender,
                rlpParentNodes,
                storageRoot,
                messageBoxOffset,
                hashLock
            );
        }
    },

    progressOutboxWithProof: async function (params, changeState) {

        let messageTypeHash = params.messageTypeHash,
            intentHash = params.intentHash,
            nonce = params.nonce,
            sender = params.sender,
            messageStatus = params.messageStatus,
            rlpParentNodes = params.rlpParentNodes,
            storageRoot = params.storageRoot,
            hashLock = params.hashLock,
            messageBoxOffset = params.messageBoxOffset;
        ;

        if (changeState === false) {

            await utils.expectThrow(
                messageBus.progressOutboxWithProof.call(
                    messageTypeHash,
                    intentHash,
                    nonce,
                    sender,
                    rlpParentNodes,
                    storageRoot,
                    messageStatus,
                    hashLock,
                    messageBoxOffset
                )
            );
        }
        else {

            await messageBus.progressOutboxWithProof(
                messageTypeHash,
                intentHash,
                nonce,
                sender,
                rlpParentNodes,
                storageRoot,
                messageStatus,
                hashLock,
                messageBoxOffset
            );

        }
    },

    progressInboxWithProof: async function (params, changeState) {

        let messageTypeHash = params.messageTypeHash,
            intentHash = params.intentHash,
            nonce = params.nonce,
            sender = params.sender,
            messageStatus = params.messageStatus,
            rlpParentNodes = params.rlpParentNodes,
            storageRoot = params.storageRoot,
            hashLock = params.hashLock,
            messageBoxOffset = params.messageBoxOffset;

        if (changeState === false) {
            await utils.expectRevert(
                messageBus.progressInboxWithProof(
                    messageTypeHash,
                    intentHash,
                    nonce,
                    sender,
                    rlpParentNodes,
                    storageRoot,
                    messageStatus,
                    hashLock,
                    messageBoxOffset
                ),
                params.message
            );
        }
        else {

            await messageBus.progressInboxWithProof(
                messageTypeHash,
                intentHash,
                nonce,
                sender,
                rlpParentNodes,
                storageRoot,
                messageStatus,
                hashLock,
                messageBoxOffset
            );

        }
    },

    getOutboxStatus: async function (msgHash) {

        return messageBus.getOutboxStatus.call(msgHash);

    },

    getInboxStatus: async function (msgHash) {

        return messageBus.getInboxStatus.call(msgHash);

    },

    utils: utils
};

module.exports = MessageBusUtils;
