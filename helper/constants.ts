interface Constants {
    [key: string]: {
        [key: string]: string;
    }; 
}

const constants: Constants = {
    // mainnet
    "1": { // "31337" for local forked testnet:
        addressListFactory: "0xD57b41649f822C51a73C44Ba0B3da4A880aF0029",
        uniswapV2Router: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
        swapManager: "0xe382d9f2394A359B01006faa8A1864b8a60d2710",

        USDC: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        DAI: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
        WETH: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        LINK: "0x514910771AF9Ca656af840dff83E8264EcF986CA",

        compUSDC: "0x39AA39c021dfbaE8faC545936693aC917d5E7563",
        COMP: "0xc00e94Cb662C3520282E6f5717214004A7f26888",
        comptroller: "0x3d9819210A31b4961b30EF54bE2aeD79B9c9Cd3B"
    },
    // kovan
    "42": {
        addressListFactory: "0x2A62975b1Dc4f6F8201E15C97E400f51724C8158",
        USDC: "0xe22da380ee6B445bb8273C81944ADEB6E8450422",
    }
}

export default constants;