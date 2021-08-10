// SPDX-License-Identifier: BUSL-1.1
pragma solidity =0.7.6;

import "./Hypervisor.sol";

library HypervisorDeployer {
    /// @dev Deploys a Hypervisor with the given parameters
    /// @param token0 The first token of the pool by address sort order
    /// @param token1 The second token of the pool by address sort order
    /// @param fee The fee collected upon every swap in the pool, denominated in hundredths of a bip
    function deploy(
        address token0,
        address token1,
        uint24 fee,
        address pool,
        address owner,
        string memory name,
        string memory symbol
    ) public returns (address hypervisor) {
        hypervisor = address(
            new Hypervisor{salt: keccak256(abi.encodePacked(token0, token1, fee))}(
                pool,
                owner,
                name,
                symbol
            )
        );
    }
}
