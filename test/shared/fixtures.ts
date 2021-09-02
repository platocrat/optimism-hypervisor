import { BigNumber } from "ethers";
import { ethers } from "hardhat";

import {
  TestERC20,
  UniswapV3Factory,
  SwapRouter,
  NonfungiblePositionManager,
  HypervisorFactory,
  MockUniswapV3PoolDeployer,
} from "../../typechain-ovm";

import { Fixture } from "ethereum-waffle";

interface UniswapV3Fixture {
  factory: UniswapV3Factory;
  router: SwapRouter;
  nft: NonfungiblePositionManager;
  libraries: any;
}

// Helper method for deploying libraries
const deployLib = async (name: string, libraries?: any): Promise<string> => {
  console.log(`Deploying ${ name }`);
  const lib = await (await ethers.getContractFactory(name, { libraries })).deploy({
    gasLimit: 40_690_000, gasPrice: 15_000_000
  });
  console.log("deployed");
  return lib.address;
};

async function uniswapV3Fixture(): Promise<UniswapV3Fixture> {
  const position = await deployLib("Position");
  const oracle = await deployLib("Oracle");
  const tick = await deployLib("Tick");
  const tickBitmap = await deployLib("TickBitmap");
  const tickMath = await deployLib("TickMath");
  const swapMath = await deployLib("SwapMath");

  const libraries = {
    Position: position,
    Oracle: oracle,
    Tick: tick,
    TickMath: tickMath,
    TickBitmap: tickBitmap,
    SwapMath: swapMath,
  };
  const factoryFactory = await ethers.getContractFactory("UniswapV3Factory", {
    libraries: {
      UniswapV3PoolDeployer: await deployLib("UniswapV3PoolDeployer", libraries),
    },
  });
  const factory = (await factoryFactory.deploy({
    gasLimit: 40_690_000, gasPrice: 15_000_000
  })) as UniswapV3Factory;
  console.log("fee tick spacing", await factory.feeAmountTickSpacing(3000));
  const tokenFactory = await ethers.getContractFactory("TestERC20");
  const WETH = (await tokenFactory.deploy(
    BigNumber.from(2).pow(255),
    {
      gasLimit: 40_690_000, gasPrice: 15_000_000
    }
  )) as TestERC20; // TODO: change to real WETH

  const routerFactory = await ethers.getContractFactory("SwapRouter");
  const router = (
    await routerFactory.deploy(
      factory.address,
      WETH.address,
      {
        gasLimit: 40_690_000, gasPrice: 15_000_000
      }
    )
  ) as SwapRouter;

  const nonfungiblePositionLibraryFactory = await ethers.getContractFactory(
    "NonfungiblePositionLibrary",
    {
      libraries: {
        TickMath: tickMath,
      },
    }
  );
  const nonfungiblePositionLibrary = await nonfungiblePositionLibraryFactory.deploy({
    gasLimit: 40_690_000, gasPrice: 15_000_000
  });
  const nftFactory = await ethers.getContractFactory("NonfungiblePositionManager", {
    libraries: {
      NonfungiblePositionLibrary: nonfungiblePositionLibrary.address,
    },
  });
  console.log("deploying nft");
  const nft = (await nftFactory.deploy(
    factory.address,
    WETH.address,
    ethers.constants.AddressZero,
    {
      gasLimit: 40_690_000, gasPrice: 15_000_000
    }
  )) as NonfungiblePositionManager; // TODO: third parameter is wrong
  console.log("deployed");
  return { factory, router, nft, libraries };
}

interface TokensFixture {
  token0: TestERC20;
  token1: TestERC20;
  token2: TestERC20;
}

/**
 * @todo 
 * GasLimit and GasPrice for deployment for Hypervisor tests
 * 
 * tx.gasLimit = 38110000 and tx.gasPrice = 15000000
 * 
 * 
 * 
 * GasLimit and GasPrice for deployment for ETHUSDT Hypervisor tests
 * 
 * tx.gasLimit = 38110000 and tx.gasPrice = 15000000
 */


async function tokensFixture(): Promise<TokensFixture> {
  const tokenFactory = await ethers.getContractFactory("TestERC20");
  const tokenA = (await tokenFactory.deploy(
    BigNumber.from(2).pow(255),
    {
      gasLimit: 40_690_000, gasPrice: 15_000_000
    }
  )) as TestERC20;
  const tokenB = (await tokenFactory.deploy(
    BigNumber.from(2).pow(255),
    {
      gasLimit: 40_690_000, gasPrice: 15_000_000
    }
  )) as TestERC20;
  const tokenC = (await tokenFactory.deploy(
    BigNumber.from(2).pow(255),
    {
      gasLimit: 40_690_000, gasPrice: 15_000_000
    }
  )) as TestERC20;

  const [token0, token1, token2] = [tokenA, tokenB, tokenC].sort((tokenA, tokenB) =>
    tokenA.address.toLowerCase() < tokenB.address.toLowerCase() ? -1 : 1
  );

  return { token0, token1, token2 };
}

interface HypervisorFactoryFixture {
  hypervisorFactory: HypervisorFactory;
}

async function hypervisorFactoryFixture(
  factory: UniswapV3Factory,
  libraries: any
): Promise<HypervisorFactoryFixture> {
  const HypervisorDeployerAddress = await deployLib("HypervisorDeployer", {
    TickMath: libraries.TickMath,
  });
  const hypervisorFactoryFactory = await ethers.getContractFactory("HypervisorFactory", {
    libraries: {
      HypervisorDeployer: HypervisorDeployerAddress,
    },
  });
  console.log("deploying hypervisor factory");
  const hypervisorFactory = (await hypervisorFactoryFactory.deploy(factory.address, {
    gasLimit: 40_690_000, gasPrice: 15_000_000, // Recommended tx.gasLimit = 38_110_000
  })) as HypervisorFactory;
  return { hypervisorFactory };
}

interface OurFactoryFixture {
  ourFactory: MockUniswapV3PoolDeployer;
}

async function ourFactoryFixture(): Promise<OurFactoryFixture> {
  const ourFactoryFactory = await ethers.getContractFactory("MockUniswapV3PoolDeployer");
  const ourFactory = (await ourFactoryFactory.deploy({
    gasLimit: 40_690_000, gasPrice: 15_000_000
  })) as MockUniswapV3PoolDeployer;
  return { ourFactory };
}

type allContractsFixture = UniswapV3Fixture & TokensFixture & OurFactoryFixture;

export const fixture: Fixture<allContractsFixture> =
  async function (): Promise<allContractsFixture> {
    const { factory, router, nft, libraries } = await uniswapV3Fixture();
    const { token0, token1, token2 } = await tokensFixture();
    const { ourFactory } = await ourFactoryFixture();

    return {
      token0,
      token1,
      token2,
      factory,
      router,
      nft,
      ourFactory,
      libraries,
    };
  };

type HypervisorTestFixture = UniswapV3Fixture & TokensFixture & HypervisorFactoryFixture;

export const hypervisorTestFixture: Fixture<HypervisorTestFixture> =
  async function (): Promise<HypervisorTestFixture> {
    const { factory, router, nft, libraries } = await uniswapV3Fixture();
    const { token0, token1, token2 } = await tokensFixture();
    const { hypervisorFactory } = await hypervisorFactoryFixture(factory, libraries);

    return {
      token0,
      token1,
      token2,
      factory,
      router,
      nft,
      hypervisorFactory,
      libraries,
    };
  };
