import { IChainData } from "../helpers/types";

const SUPPORTED_CHAINS: IChainData[] = [
  {
    name: "Ethereum Mainnet",
    native_currency: {
      symbol: "ETH",
      name: "Ether",
      decimals: "18",
      contractAddress: "",
      balance: "",
    },
    short_name: "eth",
    chain: "ETH",
    network: "mainnet",
    chain_id: 1,
    network_id: 1,
    rpc_url: "https://mainnet.infura.io/"
  },
  {
    name: "Ethereum Ropsten",
    native_currency: {
      symbol: "ETH",
      name: "Ether",
      decimals: "18",
      contractAddress: "",
      balance: "",
    },
    short_name: "rop",
    chain: "ETH",
    network: "ropsten",
    chain_id: 3,
    network_id: 3,
    rpc_url: "https://ropsten.infura.io/"
  },
  {
    name: "Ethereum Rinkeby",
    native_currency: {
      symbol: "ETH",
      name: "Ether",
      decimals: "18",
      contractAddress: "",
      balance: "",
    },
    short_name: "rin",
    chain: "ETH",
    network: "rinkeby",
    chain_id: 4,
    network_id: 4,
    rpc_url: "https://rinkeby.infura.io/"
  },
  {
    name: "Ethereum Görli",
    native_currency: {
      symbol: "ETH",
      name: "Ether",
      decimals: "18",
      contractAddress: "",
      balance: "",
    },
    short_name: "gor",
    chain: "ETH",
    network: "goerli",
    chain_id: 5,
    network_id: 5,
    rpc_url: "https://rpc.goerli.mudit.blog/"
  },
  {
    name: "Ethereum Kovan",
    native_currency: {
      symbol: "ETH",
      name: "Ether",
      decimals: "18",
      contractAddress: "",
      balance: "",
    },
    short_name: "kov",
    chain: "ETH",
    network: "kovan",
    chain_id: 42,
    network_id: 42,
    rpc_url: "https://kovan.infura.io/"
  },
  {
    name: "Ethereum Classic Mainnet",
    native_currency: {
      symbol: "ETH",
      name: "Ether",
      decimals: "18",
      contractAddress: "",
      balance: "",
    },
    short_name: "etc",
    chain: "ETC",
    network: "mainnet",
    chain_id: 61,
    network_id: 1,
    rpc_url: "https://ethereumclassic.network"
  },
  {
    name: "POA Network Sokol",
    native_currency: {
      symbol: "ETH",
      name: "Ether",
      decimals: "18",
      contractAddress: "",
      balance: "",
    },
    short_name: "poa",
    chain: "POA",
    network: "sokol",
    chain_id: 77,
    network_id: 1,
    rpc_url: "https://sokol.poa.network"
  },
  {
    name: "POA Network Core",
    native_currency: {
      symbol: "ETH",
      name: "Ether",
      decimals: "18",
      contractAddress: "",
      balance: "",
    },
    short_name: "skl",
    chain: "POA",
    network: "core",
    chain_id: 99,
    network_id: 2,
    rpc_url: "https://core.poa.network"
  },
  {
    name: "xDAI Chain",
    native_currency: {
      symbol: "ETH",
      name: "Ether",
      decimals: "18",
      contractAddress: "",
      balance: "",
    },
    short_name: "xdai",
    chain: "xDAI",
    network: "mainnet",
    chain_id: 100,
    network_id: 1,
    rpc_url: "https://dai.poa.network"
  }
];

export default SUPPORTED_CHAINS;
