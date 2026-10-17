export type SignoffStatus = 'beklemede' | 'onaylandi' | 'revizyon_istendi';

export interface Agency {
  id: string;
  user_id: string;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  agency_id: string;
  name: string;
  client_name: string;
  client_email: string;
  created_at: string;
  updated_at: string;
}

export interface Signoff {
  id: string;
  project_id: string;
  agency_id: string;
  title: string;
  description: string;
  additional_fee: number;
  file_url: string | null;
  status: SignoffStatus;
  token: string;
  signature_data: string | null;
  signed_at: string | null;
  signer_ip: string | null;
  revision_notes: string | null;
  pdf_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface SignoffWithProject extends Signoff {
  project?: Project;
  agency?: Agency;
}
