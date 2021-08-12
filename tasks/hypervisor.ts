import { formatEther } from "ethers/lib/utils";
import { task } from "hardhat/config";
import { FeeAmount } from "./shared/utilities";

const DAY = 60 * 60 * 24;

task("library-hypervisorDeployer", "Deploy Hypervisor contract").setAction(
  async (cliArgs, { ethers, run, network }) => {
    console.log("Network");
    console.log("  ", network.name);
    console.log("Task Args");

    // compile

    await run("compile");

    // get signer

    const signer = (await ethers.getSigners())[0];
    console.log("Signer");
    console.log("  at", signer.address);
    console.log("  ETH", formatEther(await signer.getBalance()));

    // deploy library

    const Deployer = await ethers.getContractFactory("HypervisorDeployer", {
      libraries: {
        TickMath: "0x308C3E60585Ad4EAb5b7677BE0566FeaD4cb4746",
      },
    });
    const hyperVisorDeployer = await Deployer.deploy();

    console.log(`HyperVisor Library Deployer deployed at ${hyperVisorDeployer.address}`);
  }
);
//HyperVisor library :  0x3240E8CD74E3d90Cc14eFb1840485cC58248f30d on kovan-optimism
task("deploy-hypervisor-factory", "Deploy HypervisorFactory contract").setAction(
  async (cliArgs, { ethers, run, network }) => {
    //TODO cli args
    // goerli
    const args = {
      uniswapFactory: "0x1f98431c8ad98523631ae4a59f267346ea31f984",
      hyperVisorDeployerLibrary:"0x3240E8CD74E3d90Cc14eFb1840485cC58248f30d"
    };

    console.log("Network");
    console.log("  ", network.name);
    console.log("Task Args");
    console.log(args);

    // compile

    await run("compile");

    // get signer

    const signer = (await ethers.getSigners())[0];
    console.log("Signer");
    console.log("  at", signer.address);
    console.log("  ETH", formatEther(await signer.getBalance()));

    // deploy contracts

    const HypervisorFactory = await ethers.getContractFactory("HypervisorFactory", {
      libraries: {
        HypervisorDeployer: args.hyperVisorDeployerLibrary
      },
    });

    const hypervisorFactory = await HypervisorFactory.deploy(args.uniswapFactory);
    console.log(`HyperVisor Factory deployed at ${hypervisorFactory.address}`);
    //await hypervisorFactory.deployTransaction.wait(5);
    // await run("verify:verify", {
    //   address: hypervisorFactory.address,
    //   constructorArguments: [args.uniswapFactory],
    // });
  }
);

task("verify-factory", "Deploy Hypervisor contract").setAction(
  async (cliArgs, { ethers, run, network }) => {
    // TODO cli args
    // goerli
    const args = {
      uniswapFactory: "0xd52773156198DcB6c8Af84ced386fFecc02975CC",
      factory: "0x67C11b788448C149eB08839Af6025Fe6dc80CFbC",
      token0: "0xFfEc41C97e070Ab5EBeB6E24258B38f69EED5020",
      token1: "0x1F3BeD559565b56dAabed5790af29ffEd628c4B6",
      fee: FeeAmount.MEDIUM,
    };

    console.log("Network");
    console.log("  ", network.name);
    console.log("Task Args");
    console.log(args);

    // compile

    await run("compile");

    // get signer

    const signer = (await ethers.getSigners())[0];
    console.log("Signer");
    console.log("  at", signer.address);
    console.log("  ETH", formatEther(await signer.getBalance()));

    const hypervisorFactory = await ethers.getContractAt(
      "HypervisorFactory",
      args.factory,
      signer
    );

    // await hypervisor.deployTransaction.wait(5)
    await run("verify:verify", {
      address: hypervisorFactory.address,
      constructorArguments: [args.uniswapFactory],
    });
  }
);
//VISOR Token  on optimism-kovan: 0x5B650f3897cc19869DFc36F863568b21BDb50CCF
//HyperVisor Factory on optimims-kovan : 0x158886084901605ae9c5F68e7182225c756085fD
//Weth-Dai Hypervisor on Optimism-Kovan: 0x962B02c971a4829d1a33b1b0411EdaaecF9d0D49
//weth-Dai pool on Optimism-Kovan: 0xE80E25982EC9E1e339d15F98F6f73db5F607D8b0
//Weth-Usdc HyperVisor on Optimism-Kovan: 0x9Fb6eA81D2cAa05a45b93189d8c7114384835112
//weth-Usdc pool on Optimism-Kovan: 0xFF918CF56fBe39E282ae12e69592D7061F1BE7e3
task("deploy-hypervisor", "Deploy Hypervisor contract").setAction(
  async (cliArgs, { ethers, run, network }) => {
    // TODO cli args
    // goerli
    const args = {
      factory: "0x158886084901605ae9c5F68e7182225c756085fD",
      token0: "0x4200000000000000000000000000000000000006", //WETH Token on Optimism -Kovan
      token1: "0x7f5c764cbc14f9669b88837ca1490cca17c31607", //USDC token on Optimism-Kovan
      fee: FeeAmount.MEDIUM,
      name: "Visor WETH USDC pool",
      symbol: "vWETHUSDC",
    };

    console.log("Network");
    console.log("  ", network.name);
    console.log("Task Args");
    console.log(args);

    // compile

    await run("compile");

    // get signer

    const signer = (await ethers.getSigners())[0];
    console.log("Signer");
    console.log("  at", signer.address);
    console.log("  ETH", formatEther(await signer.getBalance()));

    const hypervisorFactory = await ethers.getContractAt(
      "HypervisorFactory",
      args.factory,
      signer
    );

    const Hypervisor = await hypervisorFactory.createHypervisor(
      args.token0,
      args.token1,
      args.fee,
      args.name,
      args.symbol
    );

    // verify

    // console.log("Verifying source on etherscan");

    // await hypervisor.deployTransaction.wait(5);

    // await run("verify:verify", {
    //   address: hypervisor.address,
    // });

    //Getting pool for token0,token1 with fee
    const getHypervisor = await hypervisorFactory.getHypervisor(
      args.token0,
      args.token1,
      args.fee
    );
    console.log("deployed hypervisor", getHypervisor);
    const hypervisor = await ethers.getContractAt("Hypervisor", getHypervisor, signer);

    const poolAddress = await hypervisor.pool();
    console.log("uniswap-v3 pool address", poolAddress);
  }
);

task("verify-hypervisor", "Deploy Hypervisor contract").setAction(
  async (cliArgs, { ethers, run, network }) => {
    const signer = (await ethers.getSigners())[0];
    const hypervisorAddress = "0xfb7260e2faE6EF1A33E4Fd5C69E71291C48cA9c7";
    // TODO cli args
    // goerli
    const args = {
      pool: "0xba9D3f004F7fb378260525cf26F701853CE244eD",
      owner: signer.address,
      baseLower: -1800,
      baseUpper: 1800,
      limitLower: -600,
      limitUpper: 0,
    };

    console.log("Network");
    console.log("  ", network.name);
    console.log("Task Args");
    console.log(args);
    console.log(Object.values(args));

    await run("compile");

    // get signer

    console.log("Signer");
    console.log("  at", signer.address);
    console.log("  ETH", formatEther(await signer.getBalance()));

    const hypervisor = await ethers.getContractAt("Hypervisor", hypervisorAddress, signer);

    // await hypervisor.deployTransaction.wait(5)
    await run("verify:verify", {
      address: hypervisor.address,
      constructorArguments: Object.values(args),
    });
  }
);
