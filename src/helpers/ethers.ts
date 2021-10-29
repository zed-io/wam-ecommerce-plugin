import { utils } from "ethers";
import { mnemonicToSeed, mnemonicToEntropy } from "@ethersproject/hdnode";

export function sha256(str: string): string {
  return utils.sha256(utils.toUtf8Bytes(str));
}

export function isHexString(value: any): boolean {
  return utils.isHexString(value);
}

export function entropyToMnemonic(entropy: string): string {
  return utils.entropyToMnemonic(entropy);
}

export { mnemonicToEntropy, mnemonicToSeed };

export function fromSeed(seed: string): utils.HDNode {
  return utils.HDNode.fromSeed(seed);
}
