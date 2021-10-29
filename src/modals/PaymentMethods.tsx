// @ts-nocheck
import * as React from "react";
import styled from "styled-components";
import { IPaymentMethod } from "../helpers/types";
import ButtonWithImage from "../components/ButtonWithImage";
import { fonts } from "../styles";
import { getPaymentMethodDisplay } from "../helpers/utilities";

const SColumnRowWrap = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
`;

const SButtonWithImage = styled(ButtonWithImage)`
  margin: 10px;
  font-size: ${fonts.size.h5};
  max-width: 250px;
`;

const PaymentMethods = (props: any) => {
  const { settings, callback } = props;
  if (
    !(settings && settings.paymentMethods && settings.paymentMethods.length)
  ) {
    return null;
  }
  return (
    <SColumnRowWrap>
      {settings.paymentMethods.map((method: IPaymentMethod, i) => {
        if (i === 1) {
          const display = getPaymentMethodDisplay(method.assetSymbol);
          return (
            <SButtonWithImage
              imgSize={40}
              imgSrc={display.imgSrc}
              color={display.color}
              key={`${method.type}-${method.assetSymbol}-${method.chainId}`}
              onClick={() => callback(method)}
            >
              Wam
            </SButtonWithImage>
          );
        }
        return null;
      })}
    </SColumnRowWrap>
  );
};

export default PaymentMethods;
