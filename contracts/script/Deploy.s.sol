// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script} from "forge-std/Script.sol";
import {console} from "forge-std/console.sol";
import {TokenLaunchpad} from "../src/TokenLaunchpad.sol";

contract Deploy is Script {
    function run() external returns (TokenLaunchpad launchpad) {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        console.log(address(deployer));

        vm.startBroadcast(deployerPrivateKey);
        launchpad = new TokenLaunchpad(deployer);
        vm.stopBroadcast();
    }
}
