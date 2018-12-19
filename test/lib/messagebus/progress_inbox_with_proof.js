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
const messageBusUtilsKlass = require('./messagebus_utils');
const messageBusUtils = new messageBusUtilsKlass();

let MessageStatusEnum = {

    Undeclared: 0,
    Declared: 1,
    Progressed: 2,
    DeclaredRevocation: 3,
    Revoked: 4
};

contract('MessageBus.progressInboxWithProof()', async (accounts) => {
    let params;

    beforeEach(async function () {

        await messageBusUtils.deployedMessageBus();
        params = messageBusUtils.defaultParams(accounts);
    });

    it('should fail when source message is undeclared', async () => {
        let message = 'Message on source must be Declared or Progressed.';
        params.message = message;

        params.messageStatus = MessageStatusEnum.Undeclared;
        await messageBusUtils.progressInboxWithProof(params, false);

    });

    it('should fail when source message is declared revocation', async () => {
        let message = 'Message on source must be Declared or Progressed.';
        params.message = message;

        params.messageStatus = MessageStatusEnum.DeclaredRevocation;
        await messageBusUtils.progressInboxWithProof(params, false);

    });

    it('should fail if target message is Undeclared and source is declared', async () => {
        let message = 'Message on target must be Declared.';
        params.message = message;

        params.messageStatus = MessageStatusEnum.Declared;
        await messageBusUtils.progressInboxWithProof(params, false);

    });

    it('should fail if target message is Undeclared and source is progressed', async () => {
        let message = 'Message on target must be Declared.';
        params.message = message;

        params.messageStatus = MessageStatusEnum.Progressed;
        await messageBusUtils.progressInboxWithProof(params, false);

    });

    it('should fail when target message is progressed and source message is' +
        ' declared', async () => {
        let message = 'Message on target must be Declared.';
        params.message = message;

        await messageBusUtils.confirmMessage(params, true);
        params.messageStatus = MessageStatusEnum.Declared;
        await messageBusUtils.progressInboxWithProof(params, true);

        await messageBusUtils.progressInboxWithProof(params, false);
    });

    it('should fail when target message is progressed and source message is' +
        ' progressed', async () => {
        let message = 'Message on target must be Declared.';
        params.message = message;

        await messageBusUtils.confirmMessage(params, true);
        params.messageStatus = MessageStatusEnum.Progressed;
        await messageBusUtils.progressInboxWithProof(params, true);

        await messageBusUtils.progressInboxWithProof(params, false);
    });

    it('should fail when target is revoked and source message is declared', async () => {
        let message = 'Message on target must be Declared.';
        params.message = message;

        await messageBusUtils.confirmMessage(params, true);
        await messageBusUtils.confirmRevocation(params, true);

        params.messageStatus = MessageStatusEnum.Declared;
        await messageBusUtils.progressInboxWithProof(params, false);

    });

    it('should fail when target is revoked and source message is progressed', async () => {
        let message = 'Message on target must be Declared.';
        params.message = message;

        await messageBusUtils.confirmMessage(params, true);
        await messageBusUtils.confirmRevocation(params, true);

        params.messageStatus = MessageStatusEnum.Progressed;
        await messageBusUtils.progressInboxWithProof(params, false);

    });

});
