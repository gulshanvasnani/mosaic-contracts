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

const OSTPrime = artifacts.require('OSTPrime');

const BN = require('bn.js');

const MockOrganization = artifacts.require('MockOrganization');

const Utils = require('../../../test/test_lib/utils');

const NullAddress = Utils.NULL_ADDRESS;
contract('OSTPrime.constructor()', (accounts) => {
  const TOKEN_SYMBOL = 'ST';
  const TOKEN_NAME = 'Simple Token';
  const TOKEN_DECIMALS = new BN(18);

  let valueTokenAddress;
  let ostPrime;
  let organization;
  let owner;
  let worker;

  beforeEach(async () => {
    valueTokenAddress = accounts[2];
    owner = accounts[3];
    worker = accounts[4];
    organization = await MockOrganization.new(owner, worker);
  });

  it('should pass with right set of parameters', async () => {
    ostPrime = await OSTPrime.new(valueTokenAddress, organization.address);

    const valueToken = await ostPrime.valueToken.call();
    assert.strictEqual(
      valueToken,
      valueTokenAddress,
      `Token address from contract must be ${valueTokenAddress}.`,
    );

    // token supports previous ABIs
    const token = await ostPrime.token.call();
    assert.strictEqual(
      token,
      valueTokenAddress,
      `Token address from contract must be ${valueTokenAddress}.`,
    );

    const name = await ostPrime.name.call();
    assert.strictEqual(
      name,
      TOKEN_NAME,
      `Token name from contract must be ${TOKEN_NAME}.`,
    );

    const symbol = await ostPrime.symbol.call();
    assert.strictEqual(
      symbol,
      TOKEN_SYMBOL,
      `Token symbol from contract must be ${TOKEN_SYMBOL}.`,
    );

    const decimals = await ostPrime.decimals.call();
    assert.strictEqual(
      TOKEN_DECIMALS.eq(decimals),
      true,
      `Token decimals from contract must be ${TOKEN_DECIMALS}.`,
    );

    const initialized = await ostPrime.initialized.call();
    assert.strictEqual(
      initialized,
      false,
      'initialized value from contract should be false.',
    );

    const organizationAddress = await ostPrime.organization();
    assert.strictEqual(
      organizationAddress,
      organization.address,
      `Organization address from the contract must be equal to ${
        organization.address
      }.`,
    );
  });

  it('should fail if value token address is zero', async () => {
    valueTokenAddress = NullAddress;
    await Utils.expectRevert(
      OSTPrime.new(valueTokenAddress, organization.address),
      'Value token address should not be zero.',
    );
  });

  it('should fail if organization address is zero', async () => {
    organization = NullAddress;
    await Utils.expectRevert(
      OSTPrime.new(valueTokenAddress, organization),
      'Organization contract address must not be zero.',
    );
  });
});
