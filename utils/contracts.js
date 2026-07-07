import { parseAbi } from "viem";

export const factoryAddress = process.env.NEXT_PUBLIC_FACTORY_ADDRESS;

export const creationFeeEth = "0.01";

export const tokenLaunchpadAbi = parseAbi([
  "error EmptyName()",
  "error EmptySymbol()",
  "error InvalidSupply()",
  "error InvalidCreationFee(uint256 expected, uint256 received)",
  "error InvalidTokenIndex(uint256 index)",
  "error FeeWithdrawalFailed()",
  "event TokenImplementationDeployed(address indexed implementation)",
  "event TokenLaunched(address indexed tokenAddress, address indexed owner, string name, string symbol, uint256 initialSupply)",
  "function CREATION_FEE() view returns (uint256)",
  "function tokenImplementation() view returns (address)",
  "function launchToken(string name, string symbol, uint256 initialSupply) payable returns (address tokenAddress)",
  "function getTokenCount() view returns (uint256)",
  "function getToken(uint256 index) view returns ((address tokenAddress, string name, string symbol, uint256 initialSupply, address owner, uint256 createdAt))",
  "function getAllTokens() view returns ((address tokenAddress, string name, string symbol, uint256 initialSupply, address owner, uint256 createdAt)[])"
]);

export const erc20Abi = parseAbi([
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address account) view returns (uint256)"
]);
