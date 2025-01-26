export interface TeamMember {
  id: number;
  discord_name: string;
  minecraft_name: string;
  role: string;
}

export const roleOrder = [
  "owner",
  "admin",
  "developer",
  "builder",
  "supporter",
];

export const roleColors: { [key: string]: string } = {
  owner: "#f1c40f",
  admin: "#ff505e",
  developer: "#5ac2de",
  builder: "#00de6d",
  supporter: "#a1101a",
};

export const teamMembers: TeamMember[] = [
  {
    id: 1,
    discord_name: "paranoia8972",
    minecraft_name: "OnThePixel",
    role: "owner",
  },
  {
    id: 2,
    discord_name: "TinyBrickBoy",
    minecraft_name: "TinyBrickBoy",
    role: "owner",
  },
  {
    id: 4,
    discord_name: "jakobonly",
    minecraft_name: "jakobonly",
    role: "admin",
  },
  {
    id: 5,
    discord_name: "jonasrjn",
    minecraft_name: "jonasrjn",
    role: "admin",
  },
  {
    id: 6,
    discord_name: "gamixxhd",
    minecraft_name: "gamixxhd",
    role: "builder",
  },
  {
    id: 7,
    discord_name: "themexot",
    minecraft_name: "themexot",
    role: "supporter",
  },
  {
    id: 8,
    discord_name: "datenflieger",
    minecraft_name: "derdatenflieger",
    role: "developer",
  },
  {
    id: 8,
    discord_name: "Mercyoncrack",
    minecraft_name: "o_o4",
    role: "builder",
  },
];
