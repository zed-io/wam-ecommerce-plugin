// @ts-nocheck
import * as React from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import { colors, fonts } from "../styles";
import { IAssetData, IMenuItem, IOrderItem } from "../helpers/types";
import Button from "../components/Button";
import Summary from "../components/Summary";
import ListItem from "../components/ListItem";
import EmptyState from "../components/EmptyState";
import {
  SColumnWrapper,
  SColumn,
  SColumnOrder,
  SColumnHeader,
  SColumnFooter,
  SColumnList,
  SColumnRow,
  SColumnTitle,
  SGrid,
} from "../components/common";
import ProfileCard from "../components/ProfileCard";
import Modal from "../components/Modal";
import Loader from "../components/Loader";
import WalletConnect from "@walletconnect/client";
import {
  hashPersonalMessage,
  hashTypedDataMessage,
  revertPageMeta,
  sanitizeHex,
  sanitizeImgSrc,
  verifySignature,
} from "../helpers/utilities";
import QRCodeModal from "@walletconnect/qrcode-modal";
import { IInternalEvent } from "@walletconnect/types";
import { apiGetAccountAssets, apiGetAccountNonce, apiGetGasPrices } from "../helpers/api";
import { convertAmountToRawNumber, convertStringToHex } from "../helpers/bignumber";
import { convertUtf8ToHex } from "@walletconnect/utils";
import { eip712 } from "../helpers/eip712";
import Column from "../components/Column";

const SConnectButton = styled(Button as any)`
  border-radius: 8px;
  font-size: ${fonts.size.medium};
  height: 44px;
  width: 100%;
  margin: 12px 0;
`;

const SHeader = styled.div`
  width: 100%;
  background-color: #ffb600;
  color: rgb(${colors.white});
  display: flex;
  align-items: center;
  padding: 0 16px;
  height: 64px;
  & > a {
    display: flex;
    align-items: center;
    margin: 0;
  }
`;

const SListItem = styled(ListItem)`
  margin-bottom: 10px;
`;

const SLanding = styled(Column as any)`
  height: 600px;
`;

const SContainer = styled.div`
  height: 100%;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  word-break: break-word;
`;

const SModalContainer = styled.div`
  width: 100%;
  position: relative;
  word-wrap: break-word;
`;

const SModalTitle = styled.div`
  margin: 1em 0;
  font-size: 20px;
  font-weight: 700;
`;

const SModalParagraph = styled.p`
  margin-top: 30px;
`;

// @ts-ignore
const SBalances = styled(SLanding as any)`
  height: 100%;
  & h3 {
    padding-top: 30px;
  }
`;

const STable = styled(SContainer as any)`
  flex-direction: column;
  text-align: left;
`;

const SRow = styled.div`
  width: 100%;
  display: flex;
  margin: 6px 0;
`;

const SKey = styled.div`
  width: 30%;
  font-weight: 700;
`;

const SValue = styled.div`
  width: 70%;
  font-family: monospace;
`;

interface IAppState {
  connector: WalletConnect | null;
  fetching: boolean;
  connected: boolean;
  chainId: number;
  showModal: boolean;
  pendingRequest: boolean;
  uri: string;
  accounts: string[];
  address: string;
  result: any | null;
  assets: IAssetData[];
  purchasePage: boolean;
}

const INITIAL_STATE: IAppState = {
  connector: null,
  fetching: false,
  connected: false,
  chainId: 1,
  showModal: false,
  pendingRequest: false,
  uri: "",
  accounts: [],
  address: "",
  result: null,
  assets: [],
  purchasePage: false,
};

class OrderMenu extends React.Component<any, any> {
  public state: IAppState = {
    ...INITIAL_STATE,
  };

  public onSubmit = () => {
    if (!this.props.items || !this.props.items.length) {
      this.props.notificationShow("No items added to the order", true);
      return;
    }
    this.props.orderSubmit();

    // if (this.props.paymentMethod) {
    //   this.props.orderSubmit();
    // } else {
    //   this.props.orderShowPaymentMethods();
    // }
  };

  public clearState = () => {
    revertPageMeta();
    this.props.orderClearState();
  };

  public componentWillUnmount() {
    this.clearState();
  }

  public walletConnectInit = async () => {
    // bridge url
    const bridge = "https://bridge.walletconnect.org";

    // create new connector
    const connector = new WalletConnect({ bridge, qrcodeModal: QRCodeModal });

    await this.setState({ connector });

    // check if already connected
    if (!connector.connected) {
      // create new session
      await connector.createSession();
    }

    // subscribe to events
    await this.subscribeToEvents();
  };

  public subscribeToEvents = () => {
    const { connector } = this.state;

    if (!connector) {
      return;
    }

    connector.on("session_update", async (error, payload) => {
      console.log(`connector.on("session_update")`);

      if (error) {
        throw error;
      }

      const { chainId, accounts } = payload.params[0];
      this.onSessionUpdate(accounts, chainId);
    });

    connector.on("connect", (error, payload) => {
      console.log(`connector.on("connect")`);

      if (error) {
        throw error;
      }

      this.onConnect(payload);
    });

    connector.on("disconnect", (error, payload) => {
      console.log(`connector.on("disconnect")`);

      if (error) {
        throw error;
      }

      this.onDisconnect();
    });

    if (connector.connected) {
      const { chainId, accounts } = connector;
      const address = accounts[0];
      this.setState({
        connected: true,
        chainId,
        accounts,
        address,
      });
      this.onSessionUpdate(accounts, chainId);
    }

    this.setState({ connector });
  };

  public killSession = async () => {
    const { connector } = this.state;
    if (connector) {
      connector.killSession();
    }
    this.resetApp();
  };

  public resetApp = async () => {
    await this.setState({ ...INITIAL_STATE });
  };

  public onConnect = async (payload: IInternalEvent) => {
    const { chainId, accounts } = payload.params[0];
    const address = accounts[0];
    await this.setState({
      connected: true,
      chainId,
      accounts,
      address,
    });
    this.getAccountAssets();
  };

  public onDisconnect = async () => {
    this.resetApp();
  };

  public onSessionUpdate = async (accounts: string[], chainId: number) => {
    const address = accounts[0];
    await this.setState({ chainId, accounts, address });
    await this.getAccountAssets();
  };

  public getAccountAssets = async () => {
    const { address, chainId } = this.state;
    this.setState({ fetching: true });
    try {
      // get account balances
      const assets = await apiGetAccountAssets(address, chainId);

      await this.setState({ fetching: false, address, assets });
    } catch (error) {
      console.error(error);
      await this.setState({ fetching: false });
    }
  };

  public toggleModal = () => this.setState({ showModal: !this.state.showModal });

  public testSendTransaction = async () => {
    const { connector, address, chainId } = this.state;

    if (!connector) {
      return;
    }

    // from
    const from = address;

    // to
    const to = address;

    // nonce
    const _nonce = await apiGetAccountNonce(address, chainId);
    const nonce = sanitizeHex(convertStringToHex(_nonce));

    // gasPrice
    const gasPrices = await apiGetGasPrices();
    const _gasPrice = gasPrices.slow.price;
    const gasPrice = sanitizeHex(convertStringToHex(convertAmountToRawNumber(_gasPrice, 9)));

    // gasLimit
    const _gasLimit = 21000;
    const gasLimit = sanitizeHex(convertStringToHex(_gasLimit));

    // value
    const _value = 0;
    const value = sanitizeHex(convertStringToHex(_value));

    // data
    const data = "0x";

    // test transaction
    const tx = {
      from,
      to,
      nonce,
      gasPrice,
      gasLimit,
      value,
      data,
    };

    try {
      // open modal
      this.toggleModal();

      // toggle pending request indicator
      this.setState({ pendingRequest: true });

      // send transaction
      const result = await connector.sendTransaction(tx);

      // format displayed result
      const formattedResult = {
        method: "eth_sendTransaction",
        txHash: result,
        from: address,
        to: address,
        value: "0 ETH",
      };

      // display result
      this.setState({
        connector,
        pendingRequest: false,
        result: formattedResult || null,
      });
    } catch (error) {
      console.error(error);
      this.setState({ connector, pendingRequest: false, result: null });
    }
  };

  public testSignPersonalMessage = async () => {
    const { connector, address, chainId } = this.state;

    if (!connector) {
      return;
    }

    // test message
    const message = "My email is john@doe.com - 1537836206101";

    // encode message (hex)
    const hexMsg = convertUtf8ToHex(message);

    // personal_sign params
    const msgParams = [hexMsg, address];

    try {
      // open modal
      this.toggleModal();

      // toggle pending request indicator
      this.setState({ pendingRequest: true });

      // send message
      const result = await connector.signPersonalMessage(msgParams);

      // verify signature
      const hash = hashPersonalMessage(message);
      const valid = await verifySignature(address, result, hash, chainId);

      // format displayed result
      const formattedResult = {
        method: "personal_sign",
        address,
        valid,
        result,
      };

      // display result
      this.setState({
        connector,
        pendingRequest: false,
        result: formattedResult || null,
      });
    } catch (error) {
      console.error(error);
      this.setState({ connector, pendingRequest: false, result: null });
    }
  };

  public testSignTypedData = async () => {
    const { connector, address, chainId } = this.state;

    if (!connector) {
      return;
    }

    const message = JSON.stringify(eip712.example);

    // eth_signTypedData params
    const msgParams = [address, message];

    try {
      // open modal
      this.toggleModal();

      // toggle pending request indicator
      this.setState({ pendingRequest: true });

      // sign typed data
      const result = await connector.signTypedData(msgParams);

      // verify signature
      const hash = hashTypedDataMessage(message);
      const valid = await verifySignature(address, result, hash, chainId);

      // format displayed result
      const formattedResult = {
        method: "eth_signTypedData",
        address,
        valid,
        result,
      };

      // display result
      this.setState({
        connector,
        pendingRequest: false,
        result: formattedResult || null,
      });
    } catch (error) {
      console.error(error);
      this.setState({ connector, pendingRequest: false, result: null });
    }
  };

  public testCustomMessage = async () => {
    const { connector, address, chainId } = this.state;

    if (!connector) {
      return;
    }

    const message = JSON.stringify({ boy: "hull yuh mudda cunt boy" });

    // eth_signTypedData params
    // const msgParams = [address, message];

    try {
      // open modal
      this.toggleModal();

      // toggle pending request indicator
      this.setState({ pendingRequest: true });

      const instantRequest = {
        id: 1,
        jsonrpc: "2.0",
        method: "eth_customMessage",
        params: [
          {
            from: "0xbc28ea04101f03ea7a94c1379bc3ab32e65e62d3",
            to: "0x0000000000000000000000000000000000000000",
            nonce: 1,
            gas: 100000,
            value: 0,
            data: "0x0",
          },
        ],
      };

      // sign typed data
      const result = await connector.sendCustomRequest(instantRequest);

      // verify signature
      const hash = hashTypedDataMessage(message);
      const valid = await verifySignature(address, result, hash, chainId);

      // format displayed result
      const formattedResult = {
        method: "eth_customMessage",
        address,
        valid,
        result,
      };

      // display result
      this.setState({
        connector,
        pendingRequest: false,
        result: formattedResult || null,
      });
    } catch (error) {
      console.error(error);
      this.setState({ connector, pendingRequest: false, result: null });
    }
  };

  public render() {
    const {
      loading,
      profile,
      settings,
      menu,
      items,
      checkout,
      onSubmit,
      onAdd,
      onRemove,
      fetching,
    } = this.props;
    const {
      assets,
      address,
      connected,
      chainId,
      fetching,
      showModal,
      pendingRequest,
      purchasePage,
      result,
    } = this.state;
    const ratio = 63.33;
    return (
      <React.Fragment>
        <SHeader>
          <Link to="/admin">
            <ProfileCard profile={profile} />
          </Link>
        </SHeader>
        <SColumnWrapper>
          <SColumn width={ratio}>
            <SColumnHeader>
              <SColumnTitle>{`Menu`}</SColumnTitle>
            </SColumnHeader>
            {menu && menu.length ? (
              <SGrid itemMaxWidth={280} itemMaxHeight={120} gap={10}>
                {menu &&
                  menu.map((item: IMenuItem) => (
                    <ListItem
                      key={`menu-${item.name}`}
                      item={item}
                      settings={settings}
                      onClick={() => onAdd(item)}
                    />
                  ))}
              </SGrid>
            ) : (
              <EmptyState loading={loading} />
            )}
          </SColumn>
          <SColumnOrder width={100 - ratio}>
            <SColumnHeader>
              <SColumnTitle>{`Order`}</SColumnTitle>
            </SColumnHeader>
            {items && items.length ? (
              <SColumnList>
                {items.map((item: IOrderItem) => (
                  <SListItem
                    noImage
                    key={`order-${item.name}`}
                    item={item}
                    settings={settings}
                    actions={[
                      { label: "Remove", callback: onRemove },
                      { label: "Add", callback: onAdd },
                    ]}
                  />
                ))}
              </SColumnList>
            ) : (
              <EmptyState loading={loading} />
            )}
            <SColumnFooter>
              <Summary checkout={checkout} settings={settings} />
              <SColumnRow>
                <SConnectButton left onClick={onSubmit} fetching={fetching}>
                  {"Pay"}
                </SConnectButton>
                {/*<Button onClick={onSubmit}>{`Pay`}</Button>*/}
              </SColumnRow>
            </SColumnFooter>
          </SColumnOrder>
        </SColumnWrapper>
        <Modal show={showModal} toggleModal={this.toggleModal}>
          {pendingRequest ? (
            <SModalContainer>
              <SModalTitle>{"Pending Call Request"}</SModalTitle>
              <SContainer>
                <Loader />
                <SModalParagraph>{"Approve or reject request using your wallet"}</SModalParagraph>
              </SContainer>
            </SModalContainer>
          ) : result ? (
            <SModalContainer>
              <SModalTitle>{"Call Request Approved"}</SModalTitle>
              <STable>
                {Object.keys(result).map(key => (
                  <SRow key={key}>
                    <SKey>{key}</SKey>
                    <SValue>{result[key].toString()}</SValue>
                  </SRow>
                ))}
              </STable>
            </SModalContainer>
          ) : (
            <SModalContainer>
              <SModalTitle>{"Call Request Rejected"}</SModalTitle>
            </SModalContainer>
          )}
        </Modal>
      </React.Fragment>
    );
  }
}

export default OrderMenu;
