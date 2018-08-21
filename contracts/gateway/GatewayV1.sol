pragma solidity ^0.4.23;

import "./WorkersInterface.sol";
import "./EIP20Interface.sol";
import "./SimpleStake.sol";
import "./MessageBus.sol";
import "./CoreInterface.sol";
import "./CoGatewayV1.sol" //this will become coGatewayInterface.

contract GatewayV1 {

	event RevertStakeRequested(
		bytes32 messageHash,
		address staker,
		bytes32 intentHash,
		uint256 nonce,
		uint256 gasPrice
	);

	event StakeReverted(
		address staker,
		uint256 amount,
		address beneficiary,
		uint256 fee,
		bytes32 intentHash,
		uint256 gasPrice
	);

	struct StakeRequest {
		uint256 amount;
		address beneficiary;
		uint256 fee;
	}

//uuid of branded token
	bytes32 public uuid;
	//Escrow address to lock staked fund
	address stakeVault;
	//amount in BT which is staked by facilitator
	uint256 public bounty;
	//white listed addresses which can act as facilitator
	WorkersInterface public workers;

	//address of branded token
	EIP20Interface public brandedToken;

	mapping(address/*staker*/ => uint256) nonces;

	mapping(bytes32 /*requestHash*/ => MessageBus.Message) messages;

	MessageBus.MessageBox private messageBox;

	bytes32 constant STAKE_REQUEST_TYPEHASH = keccak256(abi.encode("StakeRequest(uint256 amount,address beneficiary,address staker,uint256 fee,uint256 nonce,uint8 v,bytes32 r,bytes32 s)"));

	bytes32 constant REVERTSTAKEREQUEST_TYPEHASH = keccak256(abi.encode("RevertStakeRequest(bytes32 requestHash,uint256 nonce)"));

	mapping(address/*staker*/ => uint256) nonces;

	mapping(bytes32 /*requestHash*/ => StakeRequest) stakeRequests;

	/**
	 *  @notice Contract constructor.
	 *
	 *  @param  _uuid UUID of utility token.
	 *  @param _bounty Bounty amount that worker address stakes while accepting stake request.
	 *  @param _workers Workers contract address.
	 *  @param _brandedToken Branded token contract address.
	 *  @param _messageBus Message bus library address.
	 */
	constructor(
		EIP20Interface _brandedToken,
		WorkersInterface _workers,
		CoreInterface _core,
		uint256 _bounty
	)
	public
	{
		require(_brandedToken != address(0));
		require(_workers != address(0));

		brandedToken = _brandedToken;
		workers = _workers;
		bounty = _bounty;

		stakeVault = new SimpleStake(brandedToken, address(this), uuid);
	}

	function addCoGateway(
		Cogateway _coGateway,
		uint256 _blockHeight,
		bytes _rlpParentNodesForAccount,
		bytes _rlpParentNodesForStorage)
	external
	returns (bool)
	{
		//can be called by only workers
		//require(_coGateway != address(0));

		// do account merkle proof
		// get the code hash and match it

		// get the storage proof
		// do the merkle proof for storage

		return true;
	}
/*
	function stake(
		uint256 _amount,
		address _beneficiary,
		address _staker,
		bytes32 _hashLock,
		bytes32 _intentHash,
		bytes _signature
	)
	{
		require(_amount > uint256(0));
		require(_beneficiary != address(0));
		require(_staker != address(0));
		require(_hashLock != bytes32(0));
		require(_intentHash != bytes32(0));
		require(_signature != bytes(0));


		bytes32 r;
		bytes32 s;
		uint8 v;
		(r, s, v) = fetchSignatureComponents(_signature);

	}

	
	function fetchSignatureComponents(bytes _signature)
	private
	returns (
		bytes32 r,
		bytes32 s,
		uint8 v
	)
	{
		assembly {
			r := mload(add(_signature, 32))
			s := mload(add(_signature, 64))
			v := byte(0, mload(add(_signature, 96)))
		}
		// Version of signature should be 27 or 28, but 0 and 1 are also possible versions
		if (v < 27) {
			v += 27;
		}
	}

*/

	function revertStaking(
		bytes32 _messageHash,
		bytes _signature)
	external
	returns (address staker_, bytes32 intentHash_, uint256 nonce_ uint256 gasPrice_)
	{
		require(_messageHash != bytes32(0));
		Message storage message = messages[_messageHash];
		require(message.intentHash != bytes32(0));

		require(MessageBus.declareRevocationMessage (
			messageBox,
			STAKE_REQUEST_TYPEHASH,
			message,
			nonces[message.sender],
			_signature));

		staker_ = message.sender;
		intentHash_ = message.intentHash;
		nonce_ = nonces[message.sender];
		gasPrice_ = message.gasPrice;

		emit RevertStakeRequested(_messageHash, staker_, intentHash_, nonces[message.sender], gasPrice_);
	}

	function executeRevertStaking(
		bytes32 _messageHash,
		uint256 _blockHeight,
		bytes _rlpEncodedParentNodes)
	external
	returns (address staker_, uint256 amount_, address beneficiary_, uint256 fee_, bytes32 intentHash_, uint256 gasPrice_)
	{
		require(_messageHash != bytes32(0));

		Message storage message = messages[_messageHash];
		require(message.intentHash != bytes32(0));

		require(MessageBus.executeRevocationMessage (
			messageBox,
			message,
			_messageHash,
			nonces[message.sender],
			outboxOffset,
			_blockHeight,
			_rlpEncodedParentNodes,
			_storageRoot);

		nonces[message.sender]++;

		StakeRequest storage stakeRequest = stakeRequests[_messageHash];

		staker_ = message.sender;
		amount_ = stakeRequest.amount;
		beneficiary_ = stakeRequest.beneficiary;
		fee_ = stakeRequest.fee;
		intentHash_ = message.intentHash;
		gasPrice_ = message.gasPrice;

		require(brandedToken.transfer(staker_, amount_));

		// TODO: think about bounty.

		event StakeReverted(
			staker_,
			amount_,
			beneficiary_,
			fee_,
			intentHash_,
			gasPrice_);
	}

}




