export interface User {
  id: number;
  email: string;
  name: string;
}

export interface Board {
  id: number;
  title: string;
  owner_id: number;
  created_at: string;
}

export interface Column {
  id: number;
  title: string;
  position: number;
  board_id: number;
  tasks: Task[];
}

export interface Task {
  id: number;
  title: string;
  description: string | null;
  position: number;
  column_id: number;
  created_at: string;
  updated_at: string;
}

export interface BoardDetail {
  id: number;
  title: string;
  owner_id: number;
  created_at: string;
  columns: Column[];
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface RegisterResponse {
  id: number;
  email: string;
  name: string;
}
