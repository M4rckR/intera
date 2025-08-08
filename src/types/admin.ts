export type Manager = {
  id: number;
  recontact: boolean;
  reminder: boolean;
  user: {
    id: number;
    name: string;
    last_name: string;
  };
};

export type AdminPanelProps = {
  managers: Manager[];
}; 