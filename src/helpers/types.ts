export interface IAssetData {
  symbol: string;
  name: string;
  decimals: string;
  contractAddress: string;
  balance?: string;
}

export interface IChainData {
  name: string;
  short_name: string;
  chain: string;
  network: string;
  chain_id: number;
  network_id: number;
  rpc_url: string;
  native_currency: IAssetData;
}
export interface ITxData {
  from: string;
  to: string;
  nonce: string;
  gasPrice: string;
  gasLimit: string;
  value: string;
  data: string;
}

export interface IBlockScoutTx {
  value: string;
  txreceipt_status: string;
  transactionIndex: string;
  to: string;
  timeStamp: string;
  nonce: string;
  isError: string;
  input: string;
  hash: string;
  gasUsed: string;
  gasPrice: string;
  gas: string;
  from: string;
  cumulativeGasUsed: string;
  contractAddress: string;
  confirmations: string;
  blockNumber: string;
  blockHash: string;
}

export interface IBlockScoutTokenTx {
  value: string;
  transactionIndex: string;
  tokenSymbol: string;
  tokenName: string;
  tokenDecimal: string;
  to: string;
  timeStamp: string;
  nonce: string;
  input: string;
  hash: string;
  gasUsed: string;
  gasPrice: string;
  gas: string;
  from: string;
  cumulativeGasUsed: string;
  contractAddress: string;
  confirmations: string;
  blockNumber: string;
  blockHash: string;
}

export interface IParsedTx {
  timestamp: string;
  hash: string;
  from: string;
  to: string;
  nonce: string;
  gasPrice: string;
  gasUsed: string;
  fee: string;
  value: string;
  input: string;
  error: boolean;
  asset: IAssetData;
  operations: ITxOperation[];
}

export interface ITxOperation {
  asset: IAssetData;
  value: string;
  from: string;
  to: string;
  functionName: string;
}

export interface IGasPricesResponse {
  fastWait: number;
  avgWait: number;
  blockNum: number;
  fast: number;
  fastest: number;
  fastestWait: number;
  safeLow: number;
  safeLowWait: number;
  speed: number;
  block_time: number;
  average: number;
}

export interface IGasPrice {
  time: number;
  price: number;
}

export interface IGasPrices {
  timestamp: number;
  slow: IGasPrice;
  average: IGasPrice;
  fast: IGasPrice;
}

export interface IMethodArgument {
  type: string;
}

export interface IMethod {
  signature: string;
  name: string;
  args: IMethodArgument[];
}

export interface IMenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
}

export interface IOrderItem extends IMenuItem {
  quantity: number;
}

export interface ICheckoutDetails {
  rawtotal: number;
  subtotal: number;
  tax: number;
  nettotal: number;
}

export interface INativeCurrency {
  symbol: string;
  currency: string;
  decimals: number;
  alignment: string;
  assetLimit: number;
}

export interface IPaymentMethodDisplay {
  color: string;
  imgSrc: string;
}

export interface IPaymentMethodDisplayMap {
  [name: string]: IPaymentMethodDisplay;
}

export interface IPaymentMethod {
  type: string;
  chainId: number;
  assetSymbol: string;
}

export type IBusinessType =
  | "cafe"
  | "bar"
  | "fast_food"
  | "bistro"
  | "diner"
  | "buffet"
  | "food_truck"
  | "casual_restaurant"
  | "fine_dining"
  | "popup_restaurant";

export interface IProfile {
  id: string;
  name: string;
  description: string;
  logo: string;
  type: IBusinessType;
  country: string;
  email: string;
  phone: string;
}

export interface ISettings {
  taxRate: number;
  taxIncluded: boolean;
  taxDisplay: boolean;
  paymentMethods: IPaymentMethod[];
  paymentCurrency: string;
  paymentAddress: string;
}

export type IMenu = IMenuItem[];

export interface IData {
  profile: IProfile;
  settings: ISettings;
}

export type IPaymentStatus = "pending" | "success" | "failure";

export interface IPayment {
  status: IPaymentStatus;
  result: any;
}

export interface IOrderDetails {
  items: IOrderItem[];
  checkout: ICheckoutDetails;
}

export interface IOrderJson {
  id: string;
  timestamp: number;
  items: IOrderItem[];
  checkout: ICheckoutDetails;
  payment: IPayment;
}

export interface IThreadPost {
  author: string;
  message: string;
  postId: string;
  timestamp: number;
}

export interface INativeCurrencyBalance {
  currency: string;
  amount: string;
}

export interface IAssetNativeBalance {
  asset: IAssetData;
  balance: INativeCurrencyBalance;
}

export interface IAvailableBalance {
  assetBalances: IAssetNativeBalance[];
  total: INativeCurrencyBalance;
}
