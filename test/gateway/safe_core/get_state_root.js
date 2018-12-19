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

const SafeCore = artifacts.require("./SafeCore.sol");
const MockMembersManager = artifacts.require('MockMembersManager.sol');
const web3 = require('../../test_lib/web3.js');
const BN = require('bn.js');

const zeroBytes =
  "0x0000000000000000000000000000000000000000000000000000000000000000";

contract('SafeCore.getStateRoot()', function (accounts) {

  let remoteChainId,
    blockHeight,
    stateRoot,
    maxNumberOfStateRoots,
    membersManager,
    safeCore,
    owner,
    worker;

  beforeEach(async function () {

    owner = accounts[2];
    worker = accounts[3];
    remoteChainId = new BN(1410);
    blockHeight = new BN(5);
    stateRoot = web3.utils.sha3("dummy_state_root");
    maxNumberOfStateRoots = new BN(10);
    membersManager = await MockMembersManager.new(owner, worker);

    safeCore = await SafeCore.new(
      remoteChainId,
      blockHeight,
      stateRoot,
      maxNumberOfStateRoots,
      membersManager.address,
    );

  });

  it('should return the latest state root block height that was set ' +
    'while deployment', async () => {

      let latestStateRoot = await safeCore.getStateRoot.call(blockHeight);
      assert.strictEqual(
        latestStateRoot,
        stateRoot,
        `Latest state root from the contract must be ${stateRoot}.`,
      );

    });

  it('should return the zero bytes for non committed block heights', async () => {

    blockHeight = blockHeight.addn(500);

    let latestStateRoot = await safeCore.getStateRoot.call(blockHeight);
    assert.strictEqual(
      latestStateRoot,
      zeroBytes,
      `Latest state root from the contract must be ${zeroBytes}.`,
    );

  });

  it('should return the latest committed state root', async () => {

    blockHeight = blockHeight.addn(50000);
    stateRoot = web3.utils.sha3("dummy_state_root_1");

    await safeCore.commitStateRoot(
      blockHeight,
      stateRoot,
      { from: owner },
    );

    let latestStateRoot = await safeCore.getStateRoot.call(blockHeight);
    assert.strictEqual(
      latestStateRoot,
      stateRoot,
      `Latest state root from the contract must be ${stateRoot}.`,
    );

  });

});
