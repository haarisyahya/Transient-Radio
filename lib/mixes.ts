export interface Mix {
  id: string;
  index: string;
  title: string;
  artist: string;
  date?: string;
  description?: string;
  /**
   * Path to audio file relative to /public
   * Place your audio files in /public/mixes/
   */
  src: string;
}

/*
  Add your mixes here.
  Place audio files in /public/mixes/
  Update index, title, artist, date, description, and src for each mix.
*/
export const mixes: Mix[] = [
  {
    id: "001",
    index: "001",
    title: "Putulpur Set Final",
    artist: "Theysii",
    date: "2024",
    description: "A live set recorded at Toronto for Putulpur.",
    src: "/mixes/01 Putulpur Set Final.wav",
  },
  {
    id: "002",
    index: "002",
    title: "Paradis Rumbling Mix",
    artist: "Eren Kruger",
    date: "2019",
    description: "A live set recorded at Marley for the Rumbling.",
    src: "/mixes/002.mp3",
  },
  {
    id: "003",
    index: "003",
    title: "Aloo Chaat",
    artist: "RDB",
    date: "2025",
    description: "A live set recorded at Cancun for a wedding.",
    src: "/mixes/003.mp3",
  },
  {
    id: "004",
    index: "004",
    title: "Mistri Mix",
    artist: "Chacha Rasheed",
    date: "2009",
    description: "A live set recorded at Mistri Shah for the Mistris.",
    src: "/mixes/004.mp3",
  },
  {
    id: "005",
    index: "005",
    title: "Malang Mix",
    artist: "Mast Malang",
    date: "2008",
    description: "A live set recorded at Delhi Gate for the Malangs",
    src: "/mixes/005.mp3",
  },
  {
    id: "006",
    index: "006",
    title: "Baboonic Mix",
    artist: "Baboonic Cheeks",
    date: "2012",
    description: "A live set recorded at Lahore Zoo for the baboons.",
    src: "/mixes/006.mp3",
  },
  {
    id: "007",
    index: "007",
    title: "DHA Daddy Mix",
    artist: "Beghairat Bibi",
    date: "2022",
    description: "A live set recorded at DHA Phase 6 for the beghairats.",
    src: "/mixes/007.mp3",
  },
  {
    id: "008",
    index: "008",
    title: "Hess Street hooligans",
    artist: "DJ Thode",
    date: "2016",
    description: "A live set recorded at Hess St, Hamilton for McMaster students.",
    src: "/mixes/008.mp3",
  },
  {
    id: "009",
    index: "009",
    title: "Shaadi Soundgasm",
    artist: "Abrar ul Haq",
    date: "1996",
    description: "A live set recorded at a wedding in Samnabad, Lahore.",
    src: "/mixes/009.mp3",
  },
  {
    id: "010",
    index: "010",
    title: "2011 Throwback Mix",
    artist: "DJ Earworm",
    date: "2012",
    description: "A live set recorded on 9XM.",
    src: "/mixes/010.mp3",
  },

];
