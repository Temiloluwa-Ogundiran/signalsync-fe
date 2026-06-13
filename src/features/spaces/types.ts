export interface Space {
  id: string;
  name: string;
  description: string;
  members: string;
  roi: string;
  tags: string[];
  image: string;
  isVerified: boolean;
  activeTraders: number;
}

export const MOCK_SPACES: Space[] = [
  {
    id: "1",
    name: "ICT Inner Circle",
    description: "Mastering smart money concepts and institutional order flow.",
    members: "14.2k",
    roi: "+125%",
    tags: ["Forex", "Smart Money"],
    image: "https://picsum.photos/400/200?random=1",
    isVerified: true,
    activeTraders: 1240,
  },
  {
    id: "2",
    name: "Crypto Degens",
    description: "High risk, high reward altcoin setups and memecoin hunting.",
    members: "8.5k",
    roi: "+450%",
    tags: ["Crypto", "High Risk"],
    image: "https://picsum.photos/400/200?random=2",
    isVerified: false,
    activeTraders: 850,
  },
  {
    id: "3",
    name: "Gold Scalpers",
    description: "Sniper entries on XAUUSD during London & NY sessions.",
    members: "22k",
    roi: "+85%",
    tags: ["Gold", "Scalping"],
    image: "https://picsum.photos/400/200?random=3",
    isVerified: true,
    activeTraders: 3100,
  },
  {
    id: "4",
    name: "Indices Futures",
    description: "Daily analysis and live trading for US30 and NAS100.",
    members: "5.1k",
    roi: "+62%",
    tags: ["Indices", "Futures"],
    image: "https://picsum.photos/400/200?random=4",
    isVerified: false,
    activeTraders: 420,
  },
];
