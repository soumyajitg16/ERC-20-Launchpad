// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console} from "forge-std/Test.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {LaunchedToken} from "../src/LaunchedToken.sol";
import {TokenLaunchpad} from "../src/TokenLaunchpad.sol";

contract TokenLaunchpadTest is Test {
    TokenLaunchpad private launchpad;
    address private creator = address(0xBEEF);

    function setUp() public {
        launchpad = new TokenLaunchpad(address(this));
        vm.deal(creator, 1 ether);
    }

    function testLaunchTokenStoresMetadataAndMintsSupply() public {
        uint256 initialSupply = 1_000_000 ether;

        vm.startPrank(creator);
        address tokenAddress = launchpad.launchToken{value: launchpad.CREATION_FEE()}(
            "Launch Token",
            "LCH",
            initialSupply
        );
        vm.stopPrank();
        
        console.log(address(this));
        assertEq(launchpad.getTokenCount(), 1);

        TokenLaunchpad.TokenInfo memory info = launchpad.getToken(0);
        assertEq(info.tokenAddress, tokenAddress);
        assertEq(info.name, "Launch Token");
        assertEq(info.symbol, "LCH");
        assertEq(info.initialSupply, initialSupply);
        assertEq(info.owner, creator);
        assertEq(IERC20(tokenAddress).balanceOf(creator), initialSupply);
        assertEq(IERC20(tokenAddress).totalSupply(), initialSupply);
        assertEq(LaunchedToken(tokenAddress).owner(), creator);
        assertEq(LaunchedToken(tokenAddress).name(), "Launch Token");
        assertEq(LaunchedToken(tokenAddress).symbol(), "LCH");
        assertTrue(tokenAddress != launchpad.tokenImplementation());
        assertGt(tokenAddress.code.length, 0);
        assertGt(launchpad.tokenImplementation().code.length, tokenAddress.code.length);
    }

    function testLaunchTokenRevertsWithoutExactFee() public {
        vm.prank(creator);
        vm.expectRevert(
            abi.encodeWithSelector(
                TokenLaunchpad.InvalidCreationFee.selector,
                launchpad.CREATION_FEE(),
                0.005 ether
            )
        );
        launchpad.launchToken{value: 0.005 ether}("Launch Token", "LCH", 1 ether);
    }

    function testEachLaunchCreatesDistinctCloneFromSameImplementation() public {
        vm.startPrank(creator);
        address firstToken = launchpad.launchToken{value: launchpad.CREATION_FEE()}(
            "First Token",
            "FST",
            100 ether
        );
        address secondToken = launchpad.launchToken{value: launchpad.CREATION_FEE()}(
            "Second Token",
            "SND",
            200 ether
        );
        vm.stopPrank();

        assertEq(launchpad.getTokenCount(), 2);
        assertTrue(firstToken != secondToken);
        assertTrue(firstToken != launchpad.tokenImplementation());
        assertTrue(secondToken != launchpad.tokenImplementation());
        assertEq(IERC20(firstToken).totalSupply(), 100 ether);
        assertEq(IERC20(secondToken).totalSupply(), 200 ether);
    }
}
