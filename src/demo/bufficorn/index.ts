// @ts-nocheck
import { IMenu, IData, IProfile, ISettings } from "../../helpers/types";

import logo from "./logo.png";

import paria from "./images/paria.png";
import lorraine from "./images/dame-lorraine.png";
import downTheIslands from "./images/down-the-islands.png";
import sands from "./images/maracas-sands.png";
// import cappuccino from "./images/cappuccino.jpg";
// import tea from "./images/tea.jpg";
// import blueberryMuffin from "./images/blueberry-muffin.jpg";
// import chocolateMuffin from "./images/chocolate-muffin.jpg";
// import scone from "./images/scone.jpg";
// import croissant from "./images/croissant.jpg";
// import almondCroissant from "./images/almond-croissant.jpg";
import PAYMENT_METHODS from "../../constants/paymentMethods";

const menu: IMenu = [
  {
    id: "moon-over-paria",
    name: "Moon Over Paria",
    description: "Moon Over Paria Candle",
    price: 43.0,
    image: paria
  },
  {
    id: "dame-lorraine",
    name: "Dame Lorraine",
    description: "Dame Lorraine Candle",
    price: 43.0,
    image: lorraine
  },
  {
    id: "down-the-islands",
    name: "Down The Islands",
    description: "Down the Islands Candle",
    price: 37.0,
    image: downTheIslands
  },
  {
    id: "maracas-sands",
    name: "Maracas Sands",
    description: "Maracas Sands - Pure Soy Candle",
    price: 37.0,
    image: sands
  },
  // {
  //   id: "cappuccino",
  //   name: "Cappuccino",
  //   description: "Large cup with 1 shot and foam",
  //   price: 3.5,
  //   image: cappuccino
  // },
  // {
  //   id: "tea",
  //   name: "Tea",
  //   description: "Large cup with loose leaf tea",
  //   price: 2.5,
  //   image: tea
  // },
  // {
  //   id: "blueberry-muffin",
  //   name: "Blueberry Muffin",
  //   description: "Muffin with blueberries",
  //   price: 2.5,
  //   image: blueberryMuffin
  // },
  // {
  //   id: "chocolate-muffin",
  //   name: "Chocolate Muffin",
  //   description: "Muffin with chocolate chips",
  //   price: 2.5,
  //   image: chocolateMuffin
  // },
  // {
  //   id: "scone",
  //   name: "Scone",
  //   description: "Plain scope with jam",
  //   price: 2.5,
  //   image: scone
  // },
  // {
  //   id: "croissant",
  //   name: "Croissant",
  //   description: "Plain croissant",
  //   price: 2.5,
  //   image: croissant
  // },
  // {
  //   id: "almond-croissant",
  //   name: "Almond Croissant",
  //   description: "Croissant with almond filling",
  //   price: 2.5,
  //   image: almondCroissant
  // }
];

const profile: IProfile = {
  id: "bufficorn-cafe",
  name: "Nudge",
  description: "Local roasted café in Denver",
  logo,
  type: "cafe",
  country: "US",
  email: "",
  phone: ""
};

const settings: ISettings = {
  taxRate: 11,
  taxIncluded: false,
  taxDisplay: true,
  paymentMethods: PAYMENT_METHODS,
  paymentCurrency: "USD",
  paymentAddress: ""
};

const data: IData = {
  profile,
  settings
};

export default { data, menu };
