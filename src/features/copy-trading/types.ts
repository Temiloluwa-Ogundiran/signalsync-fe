export interface Account {
  id: string;
  name: string;
  broker: string;
  type: "Prop" | "Personal";
  balance: string;
  status: "connected" | "disconnected";
}

export const MOCK_ACCOUNTS: Account[] = [
  {
    id: "acc1",
    name: "FTMO #18292",
    broker: "FTMO",
    type: "Prop",
    balance: "$102,450.00",
    status: "connected",
  },
  {
    id: "acc2",
    name: "Personal IC Markets",
    broker: "IC Markets",
    type: "Personal",
    balance: "$4,240.50",
    status: "connected",
  },
  {
    id: "acc3",
    name: "MFF Phase 2",
    broker: "MFF",
    type: "Prop",
    balance: "$50,000.00",
    status: "disconnected",
  },
];

export const MOCK_STREAMS = [
  {
    id: 1,
    name: "Gold Killers",
    owner: "Sarah Snipe",
    tags: ["Scalping", "Gold"],
    winRate: "78%",
    status: "active",
    profit: "+$1,240",
  },
  {
    id: 2,
    name: "London Alpha",
    owner: "Tom Trade",
    tags: ["Forex", "Swing"],
    winRate: "65%",
    status: "active",
    profit: "+$850",
  },
  {
    id: 3,
    name: "Crypto Whale",
    owner: "BitMan",
    tags: ["BTC", "Risk"],
    winRate: "45%",
    status: "paused",
    profit: "-$120",
  },
];

export type MockStream = (typeof MOCK_STREAMS)[0];

export const MOCK_TRADES = [
  {
    id: 101,
    stream: "Gold Killers",
    pair: "XAUUSD",
    type: "BUY",
    entry: "2035.50",
    current: "2038.10",
    sl: "2032.00",
    tp: "2045.00",
    pl: "+$260.00",
    plPercent: "+1.2%",
    accountId: "acc1",
  },
  {
    id: 102,
    stream: "Gold Killers",
    pair: "XAUUSD",
    type: "BUY",
    entry: "2036.00",
    current: "2038.10",
    sl: "2033.00",
    tp: "2045.00",
    pl: "+$210.00",
    plPercent: "+0.9%",
    accountId: "acc1",
  },
  {
    id: 103,
    stream: "London Alpha",
    pair: "GBPUSD",
    type: "SELL",
    entry: "1.2650",
    current: "1.2640",
    sl: "1.2680",
    tp: "1.2600",
    pl: "+$100.00",
    plPercent: "+0.4%",
    accountId: "acc1",
  },
  {
    id: 104,
    stream: "London Alpha",
    pair: "EURUSD",
    type: "SELL",
    entry: "1.0850",
    current: "1.0860",
    sl: "1.0880",
    tp: "1.0800",
    pl: "-$50.00",
    plPercent: "-0.2%",
    accountId: "acc2",
  },
];
