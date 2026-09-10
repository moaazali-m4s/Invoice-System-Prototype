export interface Company {
  id: string; // 'xyz-company'
  name: string;
  legal_name: string;
  tagline?: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone: string;
  email: string;
  website: string;
  prefix: string;
  default_currency: string;
  primary_color: string;
  secondary_color?: string;
  default_notes: string[];
  default_signatory_name: string;
  default_signatory_title: string;
  logo_url: string;
  watermark_url?: string;
  signature_url: string;
  stamp_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Client {
  id: string;
  name: string;
  contact_person?: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  email?: string;
  phone?: string;
  website?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PaymentProfile {
  id: string;
  company_id: string;
  profile_name: string;
  bank_name: string;
  bank_location?: string;
  account_name: string;
  account_type: string;
  currency: string;
  account_number: string;
  routing_number?: string;
  routing_number_wire?: string;
  swift_code?: string;
  bank_address?: string;
  reference_instructions?: string;
  additional_instructions?: string;
  created_at?: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  sub_description?: string;
  quantity: number;
  unit?: string;
  rate: number;
  amount: number;
}

export interface Signatory {
  name: string;
  title: string;
  company?: string;
  signature_url: string;
}

export interface BillTo {
  name: string;
  contact_person?: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone?: string;
  email?: string;
}

export interface Invoice {
  id: string;
  company_id: string;
  client_id?: string;
  invoice_number: string;
  invoice_date: string;
  due_date: string;
  service_period_start?: string;
  service_period_end?: string;
  service_period_label?: string;
  currency: string;
  service_description?: string;
  role?: string;
  consultant?: string;
  bill_to: BillTo;
  line_items: InvoiceItem[];
  subtotal: number;
  tax_rate?: number;
  tax_amount?: number;
  discount_amount?: number;
  total: number;
  notes: string[];
  payment_profile_id?: string;
  payment_details: Partial<PaymentProfile>;
  signatory: Signatory;
  document_name?: string;
  status: 'draft' | 'saved' | 'sent' | 'paid';
  is_sample?: boolean | number;
  created_at?: string;
  updated_at?: string;
}

export interface AuthorizationLetter {
  id: string;
  company_id: string;
  letter_number?: string;
  letter_date: string;
  salutation: string;
  representative_name: string;
  company_name: string;
  relationship: string;
  purpose: string;
  opening_text?: string;
  duties_text?: string;
  validity_statement?: string;
  signatory_name: string;
  signatory_title: string;
  signatory_signature_url?: string;
  show_signature?: boolean | number;
  stamp_url?: string;
  show_stamp?: boolean | number;
  document_name?: string;
  status: 'draft' | 'saved' | 'issued';
  is_sample?: boolean | number;
  created_at?: string;
  updated_at?: string;
}

export interface PDFEditorObject {
  id: string;
  page: number;
  type: 'text' | 'image' | 'signature' | 'rect' | 'line';
  x: number;
  y: number;
  width: number;
  height: number;
  content?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: 'normal' | 'bold';
  fontStyle?: 'normal' | 'italic';
  textAlign?: 'left' | 'center' | 'right';
  color?: string;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  opacity?: number;
  rotation?: number;
  imageUrl?: string;
}

export interface EditorDocument {
  id: string;
  name: string;
  source_type: 'blank' | 'uploaded';
  original_pdf_url?: string;
  page_count: number;
  objects: PDFEditorObject[];
  created_at: string;
  updated_at: string;
}

export interface ActivityLog {
  id: string;
  action: string;
  entity_type: 'invoice' | 'authorization_letter' | 'client' | 'backup' | 'editor';
  entity_id: string;
  description: string;
  created_at: string;
}

export interface BackupData {
  version: number;
  exportedAt: string;
  companies: Company[];
  clients: Client[];
  invoices: Invoice[];
  paymentProfiles: PaymentProfile[];
  authorizationLetters: AuthorizationLetter[];
  editorDocuments: EditorDocument[];
  activityLogs?: ActivityLog[];
}
