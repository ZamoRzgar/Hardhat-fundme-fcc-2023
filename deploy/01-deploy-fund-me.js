// async function deployeFunc(hre) {
// hre.getNamedAccounts
// hre.deployments
// }
//modeule.exports.defult = deployFunc(hre);

//const { getNamedAccounts, deployments } = hre;

const {
    networkConfig,
    developmentChains,
} = require("../helper-hardhat-config"); //this line just pulls out the networkconfig from herlper-hadrhat-config.js
const { network } = require("hardhat");
const { verify } = require("../utils/verify");

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainId = network.config.chainId;

    let ethUsdPriceFeedAddress;
    if (chainId == 31337) {
        const ethUsdAggregator = await deployments.get("MockV3Aggregator");
        ethUsdPriceFeedAddress = ethUsdAggregator.address;
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"];
    }
    log("----------------------------------------------------");
    log("Deploying FundMe and waiting for confirmations...");
    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: [ethUsdPriceFeedAddress],
        log: true,
        // we need to wait if on a live network so we can verify properly
        waitConfirmations: network.config.blockConfirmations || 1,
    });
    log(`FundMe deployed at ${fundMe.address}`);

    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        //verify takes a contract address
        await verify(fundMe.address, [ethUsdPriceFeedAddress]);
    }
};

module.exports.tags = ["all", "fundme"];
