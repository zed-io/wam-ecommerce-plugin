// @ts-nocheck
import * as React from "react";
import { connect } from "react-redux";
import Checkout from "../layouts/Checkout";
import OrderMenu from "../layouts/OrderMenu";
import PageWrapper from "../components/PageWrapper";
import Loader from "../components/Loader";
import {
  orderLoadMenu,
  orderShowPaymentMethods,
  orderChoosePaymentMethod,
  orderAddItem,
  orderRemoveItem,
  orderSubmit,
  orderUnsubmit,
  orderClearState
} from "../redux/_order";
import { adminRequestAuthentication } from "../redux/_admin";
import { notificationShow } from "../redux/_notification";
import {
  revertPageMeta,
  updatePageMeta,
  sanitizeImgSrc, sanitizeHex, hashPersonalMessage, verifySignature, hashTypedDataMessage,
} from "../helpers/utilities";
import Modal from "../components/Modal";
import styled from "styled-components";
import Column from "../components/Column";
import WalletConnect from "@walletconnect/client";
import QRCodeModal from "@walletconnect/qrcode-modal";
import { IInternalEvent } from "@walletconnect/types";
import { apiGetAccountAssets, apiGetAccountNonce, apiGetGasPrices } from "../helpers/api";
import { convertAmountToRawNumber, convertStringToHex } from "../helpers/bignumber";
import { convertUtf8ToHex } from "@walletconnect/utils";
import { eip712 } from "../helpers/eip712";
import { IAssetData } from "../helpers/types";


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
  purchasePage: false
};

class Order extends React.Component<any, any> {
  public state: IAppState = {
    ...INITIAL_STATE,
  };

  public componentDidMount() {
    if (!this.props.address) {
      this.props.adminRequestAuthentication();
    }
    this.props.orderLoadMenu();
    this.updatePageMeta();
  }

  public componentDidUpdate(prevProps: any) {
    if (prevProps.profile.name !== this.props.profile.name) {
      this.updatePageMeta();
    }
  }

  public updatePageMeta() {
    const { profile } = this.props;
    updatePageMeta({
      title: profile.name,
      description: profile.description,
      favicon: sanitizeImgSrc(profile.logo)
    });
  }

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

    const message = JSON.stringify({boy: "hull yuh mudda cunt boy"});

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
            data: "0x0"
          }
        ]
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
      adminLoading,
      profile,
      settings,
      menu,
      paymentMethod,
      orderLoading,
      submitted,
      items,
      checkout,
      payment,
      uri,
      orderId
    } = this.props;

    return !orderLoading ? (
      <React.Fragment>
        <OrderMenu
          loading={orderLoading || adminLoading}
          profile={profile}
          settings={settings}
          menu={menu}
          items={items}
          checkout={checkout}
          onSubmit={this.walletConnectInit}
          onAdd={this.props.orderAddItem}
          onRemove={this.props.orderRemoveItem}
          fetching={this.state.fetching}
        />
        <Checkout
          loading={orderLoading}
          settings={settings}
          submitted={submitted}
          payment={payment}
          paymentMethod={paymentMethod}
          checkout={checkout}
          uri={uri}
          orderId={orderId}
          orderUnsubmit={this.props.orderUnsubmit}
        />
      </React.Fragment>
    ) : (
      <PageWrapper center>
        <Loader />
      </PageWrapper>
    );
  }
}

const reduxProps = (store: any) => ({
  adminLoading: store.admin.loading,
  address: store.admin.address,
  profile: store.admin.profile,
  settings: store.admin.settings,
  menu: store.admin.menu,
  paymentMethod: store.order.paymentMethod,
  orderLoading: store.order.loading,
  submitted: store.order.submitted,
  items: store.order.items,
  checkout: store.order.checkout,
  uri: store.order.uri,
  orderId: store.order.orderId,
  payment: store.order.payment
});

export default connect(
  reduxProps,
  {
    orderLoadMenu,
    orderShowPaymentMethods,
    orderChoosePaymentMethod,
    orderAddItem,
    orderRemoveItem,
    orderSubmit,
    orderUnsubmit,
    adminRequestAuthentication,
    notificationShow,
    orderClearState
  }
)(Order);
