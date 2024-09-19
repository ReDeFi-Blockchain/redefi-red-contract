pragma solidity 0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

abstract contract IERC20Transfer {
    function _transfer(
        address sender,
        address recipient,
        uint256 amount
    ) internal virtual;
}

abstract contract EIP712Domain {
    bytes32 public DOMAIN_SEPARATOR;
}

library EIP712 {
    // keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)")
    bytes32 public constant EIP712_DOMAIN_TYPEHASH = 0x8b73c3c69bb8fe3d512ecc4cf759cc79239f7b179b0ffacaa9a75d522b39400f;

    function makeDomainSeparator(string memory name, string memory version)
        internal
        view
        returns (bytes32)
    {
        uint256 chainId;
        assembly {
            chainId := chainid()
        }

        return
            keccak256(
                abi.encode(
                    EIP712_DOMAIN_TYPEHASH,
                    keccak256(bytes(name)),
                    keccak256(bytes(version)),
                    address(this),
                    bytes32(chainId)
                )
            );
    }

    function recover(
        bytes32 domainSeparator,
        uint8 v,
        bytes32 r,
        bytes32 s,
        bytes memory typeHashAndData
    ) internal pure returns (address) {
        bytes32 digest = keccak256(
            abi.encodePacked(
                "\x19\x01",
                domainSeparator,
                keccak256(typeHashAndData)
            )
        );
        address recovered = ecrecover(digest, v, r, s);
        require(recovered != address(0), "EIP712: invalid signature");
        return recovered;
    }
}

contract TransferWithApprove is IERC20Transfer, EIP712Domain {
    // keccak256("TransferWithAuthorization(address from,address to,uint256 value,uint256 validAfter,uint256 validBefore,bytes32 nonce)")
    bytes32 public constant TRANSFER_WITH_AUTHORIZATION_TYPEHASH = 0x7c7c6cdb67a18743f49ec6fa9b35f50d52ed05cbed4cc592e13b44501c1a2267;

    // keccak256("ReceiveWithAuthorization(address from,address to,uint256 value,uint256 validAfter,uint256 validBefore,bytes32 nonce)")
    bytes32 public constant RECEIVE_WITH_AUTHORIZATION_TYPEHASH = 0xd099cc98ef71107a616c4f0f941f04c322d8e254fe26b3c6668db87aae413de8;

    mapping(address => mapping(bytes32 => bool)) internal _authorizationStates;

    event AuthorizationUsed(address indexed authorizer, bytes32 indexed nonce);

    string internal constant _INVALID_SIGNATURE_ERROR = "EIP3009: invalid signature";
    IERC20 _token;

    constructor(IERC20 token) {
        _token = token;
        DOMAIN_SEPARATOR = bytes32(0xfa42bdd4f159c374d628e9ef5d75f62a2d8083ac22e1f40093b3481bc6dd1285);
    }

    function authorizationState(address authorizer, bytes32 nonce)
        external
        view
        returns (bool)
    {
        return _authorizationStates[authorizer][nonce];
    }

    function transferWithAuthorization(
        address from,
        address to,
        uint256 value,
        uint256 validAfter,
        uint256 validBefore,
        bytes32 nonce,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external {
        require(block.timestamp > validAfter, "EIP3009: authorization is not yet valid");
        require(block.timestamp < validBefore, "EIP3009: authorization is expired");
        require(
            !_authorizationStates[from][nonce],
            "EIP3009: authorization is used"
        );

        bytes memory data = abi.encode(
            TRANSFER_WITH_AUTHORIZATION_TYPEHASH,
            from,
            to,
            value,
            validAfter,
            validBefore,
            nonce
        );
        require(
            EIP712.recover(DOMAIN_SEPARATOR, v, r, s, data) == from,
            "EIP3009: invalid signature"
        );

        _authorizationStates[from][nonce] = true;
        emit AuthorizationUsed(from, nonce);

        _transfer(from, to, value);
    }

    function _transfer(
        address sender,
        address recipient,
        uint256 amount
    ) internal override{
        _token.transferFrom(sender, recipient, amount);
    }
}