import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { Company, Client, PaymentProfile, Invoice, EditorDocument, AuthorizationLetter, BackupData, ActivityLog } from '@/types';

let dbPath = path.join(process.cwd(), 'data', 'prototype_studio.db');
if (!fs.existsSync(dbPath)) {
  const fallback = path.join(process.cwd(), 'prototype of invoice system', 'data', 'prototype_studio.db');
  if (fs.existsSync(fallback)) {
    dbPath = fallback;
  }
}

// VERCEL FIX: Vercel serverless functions have a read-only filesystem except for /tmp.
// better-sqlite3 requires a writable filesystem to open the database file.
if (process.env.VERCEL) {
  const vercelDbPath = path.join('/tmp', 'prototype_studio.db');
  
  // If the DB doesn't exist in /tmp yet (cold start), copy it from the bundled deployment
  if (!fs.existsSync(vercelDbPath) && fs.existsSync(dbPath)) {
    try {
      fs.copyFileSync(dbPath, vercelDbPath);
    } catch (e) {
      console.error('Failed to copy bundled DB to /tmp:', e);
    }
  }
  
  dbPath = vercelDbPath;
} else {
  const dataDir = path.dirname(dbPath);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

let db: any;
try {
  db = new Database(dbPath);
} catch (error) {
  console.error("Failed to initialize database at", dbPath, error);
  // Fallback to in-memory if disk fails entirely
  db = new Database(':memory:');
}


// Enable WAL mode & busy timeout
try {
  db.pragma('journal_mode = WAL');
  db.pragma('busy_timeout = 10000');
} catch (e) {}

// Initialize schema
try {
  db.exec(`
    CREATE TABLE IF NOT EXISTS companies (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      legal_name TEXT NOT NULL,
      tagline TEXT,
      address_line1 TEXT NOT NULL,
      address_line2 TEXT,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      zip TEXT NOT NULL,
      country TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT NOT NULL,
      website TEXT NOT NULL,
      prefix TEXT NOT NULL,
      default_currency TEXT DEFAULT 'USD',
      primary_color TEXT NOT NULL,
      secondary_color TEXT,
      default_notes TEXT NOT NULL,
      default_signatory_name TEXT NOT NULL,
      default_signatory_title TEXT NOT NULL,
      logo_url TEXT NOT NULL,
      watermark_url TEXT,
      signature_url TEXT NOT NULL,
      stamp_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS clients (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      contact_person TEXT,
      address_line1 TEXT NOT NULL,
      address_line2 TEXT,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      zip TEXT NOT NULL,
      country TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      website TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS payment_profiles (
      id TEXT PRIMARY KEY,
      company_id TEXT NOT NULL,
      profile_name TEXT NOT NULL,
      bank_name TEXT NOT NULL,
      bank_location TEXT,
      account_name TEXT NOT NULL,
      account_type TEXT DEFAULT 'Checking',
      currency TEXT DEFAULT 'USD',
      account_number TEXT NOT NULL,
      routing_number TEXT,
      routing_number_wire TEXT,
      swift_code TEXT,
      bank_address TEXT,
      reference_instructions TEXT,
      additional_instructions TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS invoices (
      id TEXT PRIMARY KEY,
      company_id TEXT NOT NULL,
      client_id TEXT,
      invoice_number TEXT NOT NULL UNIQUE,
      invoice_date TEXT NOT NULL,
      due_date TEXT NOT NULL,
      service_period_start TEXT,
      service_period_end TEXT,
      service_period_label TEXT,
      currency TEXT DEFAULT 'USD',
      service_description TEXT,
      role TEXT,
      consultant TEXT,
      bill_to TEXT NOT NULL,
      line_items TEXT NOT NULL,
      subtotal REAL NOT NULL,
      tax_rate REAL DEFAULT 0,
      tax_amount REAL DEFAULT 0,
      discount_amount REAL DEFAULT 0,
      total REAL NOT NULL,
      notes TEXT NOT NULL,
      payment_profile_id TEXT,
      payment_details TEXT NOT NULL,
      signatory TEXT NOT NULL,
      document_name TEXT,
      status TEXT DEFAULT 'draft',
      is_sample INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS authorization_letters (
      id TEXT PRIMARY KEY,
      company_id TEXT NOT NULL,
      letter_number TEXT,
      letter_date TEXT NOT NULL,
      salutation TEXT NOT NULL,
      representative_name TEXT NOT NULL,
      company_name TEXT NOT NULL,
      relationship TEXT NOT NULL,
      purpose TEXT NOT NULL,
      opening_text TEXT,
      duties_text TEXT,
      validity_statement TEXT,
      signatory_name TEXT NOT NULL,
      signatory_title TEXT NOT NULL,
      signatory_signature_url TEXT,
      show_signature INTEGER DEFAULT 1,
      stamp_url TEXT,
      show_stamp INTEGER DEFAULT 1,
      document_name TEXT,
      status TEXT DEFAULT 'draft',
      is_sample INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS editor_documents (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      source_type TEXT NOT NULL,
      original_pdf_url TEXT,
      page_count INTEGER DEFAULT 1,
      objects TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS activity_logs (
      id TEXT PRIMARY KEY,
      action TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      description TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  try { db.exec('ALTER TABLE companies ADD COLUMN stamp_url TEXT'); } catch (e) {}
  try { db.exec('ALTER TABLE invoices ADD COLUMN consultant TEXT'); } catch (e) {}
  try { db.exec('ALTER TABLE authorization_letters ADD COLUMN show_signature INTEGER DEFAULT 1'); } catch (e) {}
  try { db.exec('ALTER TABLE authorization_letters ADD COLUMN show_stamp INTEGER DEFAULT 1'); } catch (e) {}
} catch (e) {}

// Seed function
export function seedDatabase() {
  try {
    const compCount = db.prepare('SELECT COUNT(*) as count FROM companies').get() as { count: number } | undefined;
    if (compCount && compCount.count > 0) {
      return;
    }

    // Insert XYZ Company LLC
    db.prepare(`
      INSERT INTO companies (
        id, name, legal_name, tagline, address_line1, address_line2, city, state, zip, country,
        phone, email, website, prefix, default_currency, primary_color, secondary_color,
        default_notes, default_signatory_name, default_signatory_title,
        logo_url, watermark_url, signature_url, stamp_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'xyz-company',
      'XYZ Company',
      'XYZ Company LLC',
      'Enterprise Solutions & Technology Consulting',
      '100 Enterprise Way',
      'Suite 400',
      'New York',
      'NY',
      '10001',
      'United States',
      '+1 (212) 555-0190',
      'billing@xyzcompany.com',
      'www.xyzcompany.com',
      'XYZ',
      'USD',
      '#0f172a',
      '#2563eb',
      JSON.stringify([
        'Payment is requested within 14 calendar days of issuance.',
        'Please cite invoice reference on all electronic remittances.',
        'Thank you for your partnership with XYZ Company LLC.'
      ]),
      'Alex Morgan',
      'CEO & Founder',
      '/assets/company/logo.png',
      '/assets/company/watermark.png',
      '/assets/signatures/alex_morgan.png',
      '/assets/seals/xyz_seal.png'
    );

    // Insert Sample Clients
    const insertClient = db.prepare(`
      INSERT INTO clients (id, name, contact_person, address_line1, city, state, zip, country, email, phone, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertClient.run(
      'client-acme',
      'Acme Solutions Inc.',
      'Sarah Jenkins',
      '100 Corporate Parkway, Suite 400',
      'New York',
      'NY',
      '10001',
      'United States',
      'billing@acmesolutions.com',
      '+1 212 555 0199',
      'Enterprise cloud infrastructure client.'
    );

    insertClient.run(
      'client-apex',
      'Apex Global Technologies',
      'David Miller',
      '500 Innovation Blvd, Floor 8',
      'Austin',
      'TX',
      '78701',
      'United States',
      'ap@apexglobal.tech',
      '+1 512 555 0142',
      'Biannual DevOps consulting agreement.'
    );

    insertClient.run(
      'client-nexus',
      'Nexus Dynamics Corp',
      'Elena Rostova',
      '250 Enterprise Center, Suite 1200',
      'Chicago',
      'IL',
      '60601',
      'United States',
      'finance@nexusdynamics.io',
      '+1 312 555 0177',
      'Software modernization contract.'
    );

    // Insert Sample Payment Profile
    db.prepare(`
      INSERT INTO payment_profiles (
        id, company_id, profile_name, bank_name, bank_location, account_name,
        account_type, currency, account_number, routing_number, routing_number_wire,
        swift_code, reference_instructions, additional_instructions
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'pay-primary',
      'xyz-company',
      'XYZ Primary Operating Account',
      'Example Commercial Bank, N.A.',
      'New York, NY, United States',
      'XYZ Company LLC',
      'Corporate Checking',
      'USD',
      '1029384756',
      '021000021',
      '021000021',
      'EXMPUS33XXX',
      'Invoice {INVOICE_NUMBER}',
      'Please send proof of remittance to hello@example.com'
    );

    // Insert Sample Invoice (Demonstrating Consultant Name)
    db.prepare(`
      INSERT INTO invoices (
        id, company_id, client_id, invoice_number, invoice_date, due_date,
        service_period_start, service_period_end, service_period_label, currency,
        service_description, role, consultant, bill_to, line_items, subtotal,
        tax_rate, tax_amount, discount_amount, total, notes, payment_profile_id,
        payment_details, signatory, document_name, status, is_sample
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'inv-sample-001',
      'xyz-company',
      'client-acme',
      'XYZ-2026-0001',
      '2026-09-10',
      '2026-09-24',
      '2026-08-01',
      '2026-08-31',
      'August 2026 Service Period',
      'USD',
      'Enterprise Cloud Architecture & DevOps Transformation',
      'Senior Cloud Solutions Architect',
      'Jordan Smith',
      JSON.stringify({
        name: 'Acme Solutions Inc.',
        contact_person: 'Sarah Jenkins',
        address_line1: '100 Corporate Parkway, Suite 400',
        city: 'New York',
        state: 'NY',
        zip: '10001',
        country: 'United States',
        email: 'billing@acmesolutions.com'
      }),
      JSON.stringify([
        {
          id: 'li-1',
          description: 'Cloud Infrastructure Architecture & Kubernetes Modernization',
          sub_description: 'Multi-region high availability cluster design and deployment',
          quantity: 160,
          unit: 'Hours',
          rate: 150,
          amount: 24000
        },
        {
          id: 'li-2',
          description: 'CI/CD Pipeline Automation & Security Compliance Audit',
          sub_description: 'Automated release orchestration with SOC2 compliance checks',
          quantity: 40,
          unit: 'Hours',
          rate: 175,
          amount: 7000
        }
      ]),
      31000,
      0,
      0,
      0,
      31000,
      JSON.stringify([
        'Services rendered on an hourly consulting basis by assigned specialist.',
        'Payment due within 14 calendar days of issuance.',
        'Thank you for partnering with XYZ Company LLC.'
      ]),
      'pay-primary',
      JSON.stringify({
        bank_name: 'Example Commercial Bank, N.A.',
        bank_location: 'New York, NY, United States',
        account_name: 'XYZ Company LLC',
        account_number: '1029384756',
        routing_number: '021000021',
        swift_code: 'EXMPUS33XXX',
        reference_instructions: 'Invoice XYZ-2026-0001'
      }),
      JSON.stringify({
        name: 'Alex Morgan',
        title: 'CEO & Founder',
        company: 'XYZ Company LLC',
        signature_url: '/assets/signatures/alex_morgan.png'
      }),
      'Invoice-XYZ-2026-0001.pdf',
      'saved',
      1
    );

    // Insert Sample Authorization Letters
    db.prepare(`
      INSERT INTO authorization_letters (
        id, company_id, letter_number, letter_date, salutation, representative_name,
        company_name, relationship, purpose, opening_text, duties_text, validity_statement,
        signatory_name, signatory_title, signatory_signature_url, show_signature,
        stamp_url, show_stamp, document_name, status, is_sample
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'letter-sample-001',
      'xyz-company',
      'AL-XYZ-2026-001',
      '10 September 2026',
      'To Whom It May Concern,',
      'Jordan Smith',
      'XYZ Company LLC',
      'Senior Solutions Consultant',
      'for commercial contract execution, technical representations, and billing-related activities on behalf of the company.',
      '',
      'XYZ Company LLC confirms that the above-named representative is authorized to perform assigned technical duties, execute statements of work, and communicate with commercial clients on behalf of the company in connection with legitimate business operations.',
      'This authorization shall remain in effect until revoked in writing by XYZ Company LLC.',
      'Alex Morgan',
      'CEO & Founder',
      '/assets/signatures/alex_morgan.png',
      1,
      '/assets/seals/xyz_seal.png',
      1,
      'Authorization-Letter-Jordan-Smith.pdf',
      'issued',
      1
    );

    db.prepare(`
      INSERT INTO authorization_letters (
        id, company_id, letter_number, letter_date, salutation, representative_name,
        company_name, relationship, purpose, opening_text, duties_text, validity_statement,
        signatory_name, signatory_title, signatory_signature_url, show_signature,
        stamp_url, show_stamp, document_name, status, is_sample
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'letter-sample-002',
      'xyz-company',
      'AL-XYZ-2026-002',
      '10 September 2026',
      'To Whom It May Concern,',
      'Taylor Reed',
      'XYZ Company LLC',
      'Authorized Technical Representative',
      'for banking operations, client onboarding, and official vendor correspondence.',
      '',
      'XYZ Company LLC confirms that the above-named representative is authorized to perform assigned corporate duties on behalf of the company.',
      'This authorization shall remain in effect until revoked in writing by XYZ Company LLC.',
      'Alex Morgan',
      'CEO & Founder',
      '/assets/signatures/alex_morgan.png',
      0,
      '/assets/seals/xyz_seal.png',
      0,
      'Authorization-Letter-Taylor-Reed-Print.pdf',
      'draft',
      1
    );

    // Insert Sample Editor Document
    db.prepare(`
      INSERT INTO editor_documents (id, name, source_type, original_pdf_url, page_count, objects)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      'doc-sample-001',
      'Commercial NDA Agreement Template',
      'blank',
      '',
      1,
      JSON.stringify([
        {
          id: 'obj-title',
          page: 1,
          type: 'text',
          x: 50,
          y: 60,
          width: 500,
          height: 40,
          content: 'NON-DISCLOSURE AND CONFIDENTIALITY AGREEMENT',
          fontSize: 16,
          fontWeight: 'bold',
          color: '#0f172a',
          textAlign: 'center'
        },
        {
          id: 'obj-divider',
          page: 1,
          type: 'line',
          x: 50,
          y: 110,
          width: 500,
          height: 2,
          color: '#2563eb'
        },
        {
          id: 'obj-body',
          page: 1,
          type: 'text',
          x: 50,
          y: 130,
          width: 500,
          height: 120,
          content: 'This Agreement is entered into by XYZ Company LLC and the receiving party for the purpose of preventing the unauthorized disclosure of proprietary business information.',
          fontSize: 11,
          color: '#334155',
          textAlign: 'left'
        }
      ])
    );

    // Insert Activity Logs
    const insertLog = db.prepare(`
      INSERT INTO activity_logs (id, action, entity_type, entity_id, description)
      VALUES (?, ?, ?, ?, ?)
    `);

    insertLog.run('log-1', 'INITIALIZED', 'backup', 'system', 'Invoice & Document Studio prototype initialized with XYZ Company LLC profile.');
    insertLog.run('log-2', 'CREATED', 'invoice', 'inv-sample-001', 'Created sample invoice XYZ-2026-0001 with consultant Jordan Smith.');
    insertLog.run('log-3', 'ISSUED', 'authorization_letter', 'letter-sample-001', 'Issued representative authorization letter for Jordan Smith.');
  } catch (e) {}
}

// Auto-seed on startup
try {
  seedDatabase();
} catch (e) {}

export const dbService = {
  // Activity Logging
  logActivity(action: string, entity_type: ActivityLog['entity_type'], entity_id: string, description: string) {
    const id = `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    try {
      db.prepare(`
        INSERT INTO activity_logs (id, action, entity_type, entity_id, description)
        VALUES (?, ?, ?, ?, ?)
      `).run(id, action, entity_type, entity_id, description);
    } catch (e) {
      console.error('Failed to log activity:', e);
    }
  },

  getActivityLogs(limit = 50): ActivityLog[] {
    return db.prepare('SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT ?').all(limit) as ActivityLog[];
  },

  // Companies
  getCompanies(): Company[] {
    const rows = db.prepare('SELECT * FROM companies ORDER BY name ASC').all() as any[];
    return rows.map(r => ({
      ...r,
      default_notes: JSON.parse(r.default_notes)
    }));
  },

  getCompany(id: string): Company | null {
    const r = db.prepare('SELECT * FROM companies WHERE id = ?').get(id) as any;
    if (!r) return null;
    return {
      ...r,
      default_notes: JSON.parse(r.default_notes)
    };
  },

  updateCompany(id: string, data: Partial<Company>): Company {
    const current = this.getCompany(id);
    if (!current) throw new Error(`Company ${id} not found`);
    const merged = { ...current, ...data };
    db.prepare(`
      UPDATE companies SET
        name = ?, legal_name = ?, tagline = ?, address_line1 = ?, address_line2 = ?,
        city = ?, state = ?, zip = ?, country = ?, phone = ?, email = ?,
        website = ?, prefix = ?, default_currency = ?, primary_color = ?,
        secondary_color = ?, default_notes = ?, default_signatory_name = ?,
        default_signatory_title = ?, logo_url = ?, watermark_url = ?,
        signature_url = ?, stamp_url = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      merged.name, merged.legal_name, merged.tagline || '', merged.address_line1,
      merged.address_line2 || '', merged.city, merged.state, merged.zip,
      merged.country, merged.phone, merged.email, merged.website, merged.prefix,
      merged.default_currency, merged.primary_color, merged.secondary_color || '',
      JSON.stringify(merged.default_notes), merged.default_signatory_name,
      merged.default_signatory_title, merged.logo_url, merged.watermark_url || '',
      merged.signature_url, merged.stamp_url || '', id
    );
    this.logActivity('UPDATED', 'client', id, `Updated company profile: ${merged.name}`);
    return this.getCompany(id)!;
  },

  // Clients
  getClients(search?: string): Client[] {
    if (search) {
      const q = `%${search}%`;
      return db.prepare('SELECT * FROM clients WHERE name LIKE ? OR contact_person LIKE ? OR email LIKE ? ORDER BY name ASC').all(q, q, q) as Client[];
    }
    return db.prepare('SELECT * FROM clients ORDER BY name ASC').all() as Client[];
  },

  getClient(id: string): Client | null {
    return (db.prepare('SELECT * FROM clients WHERE id = ?').get(id) as Client) || null;
  },

  createClient(client: Client): Client {
    const id = client.id || `client-${Date.now()}`;
    db.prepare(`
      INSERT INTO clients (
        id, name, contact_person, address_line1, address_line2, city, state, zip,
        country, email, phone, website, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, client.name, client.contact_person || '', client.address_line1,
      client.address_line2 || '', client.city, client.state, client.zip,
      client.country, client.email || '', client.phone || '',
      client.website || '', client.notes || ''
    );
    this.logActivity('CREATED', 'client', id, `Created client: ${client.name}`);
    return this.getClient(id)!;
  },

  updateClient(id: string, data: Partial<Client>): Client {
    const current = this.getClient(id);
    if (!current) throw new Error(`Client ${id} not found`);
    const merged = { ...current, ...data };
    db.prepare(`
      UPDATE clients SET
        name = ?, contact_person = ?, address_line1 = ?, address_line2 = ?,
        city = ?, state = ?, zip = ?, country = ?, email = ?, phone = ?,
        website = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      merged.name, merged.contact_person || '', merged.address_line1,
      merged.address_line2 || '', merged.city, merged.state, merged.zip,
      merged.country, merged.email || '', merged.phone || '',
      merged.website || '', merged.notes || '', id
    );
    this.logActivity('UPDATED', 'client', id, `Updated client: ${merged.name}`);
    return this.getClient(id)!;
  },

  saveClient(client: Client): Client {
    if (client.id && this.getClient(client.id)) {
      return this.updateClient(client.id, client);
    }
    return this.createClient(client);
  },

  deleteClient(id: string) {
    db.prepare('DELETE FROM clients WHERE id = ?').run(id);
    this.logActivity('DELETED', 'client', id, `Deleted client record ID: ${id}`);
  },

  // Payment Profiles
  getPaymentProfiles(companyId?: string): PaymentProfile[] {
    if (companyId) {
      return db.prepare('SELECT * FROM payment_profiles WHERE company_id = ? ORDER BY profile_name ASC').all(companyId) as PaymentProfile[];
    }
    return db.prepare('SELECT * FROM payment_profiles ORDER BY profile_name ASC').all() as PaymentProfile[];
  },

  getPaymentProfile(id: string): PaymentProfile | null {
    return (db.prepare('SELECT * FROM payment_profiles WHERE id = ?').get(id) as PaymentProfile) || null;
  },

  createPaymentProfile(profile: PaymentProfile): PaymentProfile {
    const id = profile.id || `pay-${Date.now()}`;
    db.prepare(`
      INSERT INTO payment_profiles (
        id, company_id, profile_name, bank_name, bank_location, account_name,
        account_type, currency, account_number, routing_number, routing_number_wire,
        swift_code, bank_address, reference_instructions, additional_instructions
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, profile.company_id, profile.profile_name, profile.bank_name,
      profile.bank_location || '', profile.account_name, profile.account_type || 'Checking',
      profile.currency || 'USD', profile.account_number, profile.routing_number || '',
      profile.routing_number_wire || '', profile.swift_code || '', profile.bank_address || '',
      profile.reference_instructions || '', profile.additional_instructions || ''
    );
    return this.getPaymentProfile(id)!;
  },

  updatePaymentProfile(id: string, data: Partial<PaymentProfile>): PaymentProfile {
    const current = this.getPaymentProfile(id);
    if (!current) throw new Error(`Profile ${id} not found`);
    const merged = { ...current, ...data };
    db.prepare(`
      UPDATE payment_profiles SET
        profile_name = ?, bank_name = ?, bank_location = ?, account_name = ?,
        account_type = ?, currency = ?, account_number = ?, routing_number = ?,
        routing_number_wire = ?, swift_code = ?, bank_address = ?,
        reference_instructions = ?, additional_instructions = ?
      WHERE id = ?
    `).run(
      merged.profile_name, merged.bank_name, merged.bank_location || '',
      merged.account_name, merged.account_type || 'Checking', merged.currency,
      merged.account_number, merged.routing_number || '', merged.routing_number_wire || '',
      merged.swift_code || '', merged.bank_address || '', merged.reference_instructions || '',
      merged.additional_instructions || '', id
    );
    return this.getPaymentProfile(id)!;
  },

  savePaymentProfile(profile: PaymentProfile): PaymentProfile {
    if (profile.id && this.getPaymentProfile(profile.id)) {
      return this.updatePaymentProfile(profile.id, profile);
    }
    return this.createPaymentProfile(profile);
  },

  deletePaymentProfile(id: string) {
    db.prepare('DELETE FROM payment_profiles WHERE id = ?').run(id);
  },

  // Invoices
  getInvoices(options?: { companyId?: string; search?: string; status?: string }): Invoice[] {
    let sql = 'SELECT * FROM invoices WHERE 1=1';
    const params: any[] = [];

    if (options?.companyId) {
      sql += ' AND company_id = ?';
      params.push(options.companyId);
    }
    if (options?.status) {
      sql += ' AND status = ?';
      params.push(options.status);
    }
    if (options?.search) {
      sql += ' AND (invoice_number LIKE ? OR bill_to LIKE ? OR consultant LIKE ?)';
      params.push(`%${options.search}%`, `%${options.search}%`, `%${options.search}%`);
    }

    sql += ' ORDER BY created_at DESC';
    const rows = db.prepare(sql).all(...params) as any[];
    return rows.map(r => ({
      ...r,
      is_sample: Boolean(r.is_sample),
      bill_to: JSON.parse(r.bill_to),
      line_items: JSON.parse(r.line_items),
      notes: JSON.parse(r.notes),
      payment_details: JSON.parse(r.payment_details || '{}'),
      signatory: JSON.parse(r.signatory)
    }));
  },

  getInvoice(id: string): Invoice | null {
    const r = db.prepare('SELECT * FROM invoices WHERE id = ?').get(id) as any;
    if (!r) return null;
    return {
      ...r,
      is_sample: Boolean(r.is_sample),
      bill_to: JSON.parse(r.bill_to),
      line_items: JSON.parse(r.line_items),
      notes: JSON.parse(r.notes),
      payment_details: JSON.parse(r.payment_details || '{}'),
      signatory: JSON.parse(r.signatory)
    };
  },

  saveInvoice(invoice: Invoice): Invoice {
    const id = invoice.id || `inv-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const inv = { ...invoice, id };
    const existing = db.prepare('SELECT id FROM invoices WHERE id = ?').get(id);
    if (existing) {
      db.prepare(`
        UPDATE invoices SET
          company_id = ?, client_id = ?, invoice_number = ?, invoice_date = ?,
          due_date = ?, service_period_start = ?, service_period_end = ?,
          service_period_label = ?, currency = ?, service_description = ?,
          role = ?, consultant = ?, bill_to = ?, line_items = ?, subtotal = ?,
          tax_rate = ?, tax_amount = ?, discount_amount = ?, total = ?,
          notes = ?, payment_profile_id = ?, payment_details = ?, signatory = ?,
          document_name = ?, status = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(
        inv.company_id, inv.client_id || null, inv.invoice_number,
        inv.invoice_date, inv.due_date, inv.service_period_start || '',
        inv.service_period_end || '', inv.service_period_label || '',
        inv.currency, inv.service_description || '', inv.role || '',
        inv.consultant || '', JSON.stringify(inv.bill_to), JSON.stringify(inv.line_items),
        inv.subtotal, inv.tax_rate || 0, inv.tax_amount || 0,
        inv.discount_amount || 0, inv.total, JSON.stringify(inv.notes),
        inv.payment_profile_id || null, JSON.stringify(inv.payment_details),
        JSON.stringify(inv.signatory), inv.document_name || '', inv.status,
        id
      );
      this.logActivity('UPDATED', 'invoice', id, `Updated invoice: ${inv.invoice_number}`);
    } else {
      db.prepare(`
        INSERT INTO invoices (
          id, company_id, client_id, invoice_number, invoice_date, due_date,
          service_period_start, service_period_end, service_period_label, currency,
          service_description, role, consultant, bill_to, line_items, subtotal,
          tax_rate, tax_amount, discount_amount, total, notes, payment_profile_id,
          payment_details, signatory, document_name, status, is_sample
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        id, inv.company_id, inv.client_id || null, inv.invoice_number,
        inv.invoice_date, inv.due_date, inv.service_period_start || '',
        inv.service_period_end || '', inv.service_period_label || '',
        inv.currency, inv.service_description || '', inv.role || '',
        inv.consultant || '', JSON.stringify(inv.bill_to), JSON.stringify(inv.line_items),
        inv.subtotal, inv.tax_rate || 0, inv.tax_amount || 0,
        inv.discount_amount || 0, inv.total, JSON.stringify(inv.notes),
        inv.payment_profile_id || null, JSON.stringify(inv.payment_details),
        JSON.stringify(inv.signatory), inv.document_name || '', inv.status,
        inv.is_sample ? 1 : 0
      );
      this.logActivity('CREATED', 'invoice', id, `Created new invoice: ${inv.invoice_number}`);
    }
    return this.getInvoice(id)!;
  },

  deleteInvoice(id: string) {
    const inv = this.getInvoice(id);
    db.prepare('DELETE FROM invoices WHERE id = ?').run(id);
    this.logActivity('DELETED', 'invoice', id, `Deleted invoice: ${inv?.invoice_number || id}`);
  },

  // Authorization Letters
  getAuthorizationLetters(options?: { companyId?: string; search?: string; status?: string }): AuthorizationLetter[] {
    let sql = 'SELECT * FROM authorization_letters WHERE 1=1';
    const params: any[] = [];

    if (options?.companyId) {
      sql += ' AND company_id = ?';
      params.push(options.companyId);
    }
    if (options?.status) {
      sql += ' AND status = ?';
      params.push(options.status);
    }
    if (options?.search) {
      sql += ' AND (letter_number LIKE ? OR representative_name LIKE ? OR purpose LIKE ?)';
      params.push(`%${options.search}%`, `%${options.search}%`, `%${options.search}%`);
    }

    sql += ' ORDER BY created_at DESC';
    const rows = db.prepare(sql).all(...params) as any[];
    return rows.map(r => ({
      ...r,
      show_stamp: Boolean(r.show_stamp),
      show_signature: r.show_signature === undefined || r.show_signature === null ? true : Boolean(r.show_signature),
      is_sample: Boolean(r.is_sample)
    }));
  },

  getAuthorizationLetter(id: string): AuthorizationLetter | null {
    const r = db.prepare('SELECT * FROM authorization_letters WHERE id = ?').get(id) as any;
    if (!r) return null;
    return {
      ...r,
      show_stamp: Boolean(r.show_stamp),
      show_signature: r.show_signature === undefined || r.show_signature === null ? true : Boolean(r.show_signature),
      is_sample: Boolean(r.is_sample)
    };
  },

  saveAuthorizationLetter(letter: AuthorizationLetter): AuthorizationLetter {
    const id = letter.id || `letter-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const l = { ...letter, id };
    const existing = db.prepare('SELECT id FROM authorization_letters WHERE id = ?').get(id);

    if (existing) {
      db.prepare(`
        UPDATE authorization_letters SET
          company_id = ?, letter_number = ?, letter_date = ?, salutation = ?,
          representative_name = ?, company_name = ?, relationship = ?,
          purpose = ?, opening_text = ?, duties_text = ?, validity_statement = ?,
          signatory_name = ?, signatory_title = ?, signatory_signature_url = ?,
          show_signature = ?, stamp_url = ?, show_stamp = ?, document_name = ?,
          status = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(
        l.company_id, l.letter_number || '', l.letter_date, l.salutation,
        l.representative_name, l.company_name, l.relationship,
        l.purpose, l.opening_text || '', l.duties_text || '', l.validity_statement || '',
        l.signatory_name, l.signatory_title, l.signatory_signature_url || '',
        l.show_signature ? 1 : 0, l.stamp_url || '', l.show_stamp ? 1 : 0,
        l.document_name || '', l.status, id
      );
      this.logActivity('UPDATED', 'authorization_letter', id, `Updated letter for: ${l.representative_name}`);
    } else {
      db.prepare(`
        INSERT INTO authorization_letters (
          id, company_id, letter_number, letter_date, salutation, representative_name,
          company_name, relationship, purpose, opening_text, duties_text, validity_statement,
          signatory_name, signatory_title, signatory_signature_url, show_signature,
          stamp_url, show_stamp, document_name, status, is_sample
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        id, l.company_id, l.letter_number || '', l.letter_date, l.salutation,
        l.representative_name, l.company_name, l.relationship,
        l.purpose, l.opening_text || '', l.duties_text || '', l.validity_statement || '',
        l.signatory_name, l.signatory_title, l.signatory_signature_url || '',
        l.show_signature ? 1 : 0, l.stamp_url || '', l.show_stamp ? 1 : 0,
        l.document_name || '', l.status, l.is_sample ? 1 : 0
      );
      this.logActivity('CREATED', 'authorization_letter', id, `Created authorization letter for: ${l.representative_name}`);
    }
    return this.getAuthorizationLetter(id)!;
  },

  deleteAuthorizationLetter(id: string) {
    db.prepare('DELETE FROM authorization_letters WHERE id = ?').run(id);
    this.logActivity('DELETED', 'authorization_letter', id, `Deleted authorization letter ID: ${id}`);
  },

  // Editor Documents
  getEditorDocuments(): EditorDocument[] {
    const rows = db.prepare('SELECT * FROM editor_documents ORDER BY updated_at DESC').all() as any[];
    return rows.map(r => ({
      ...r,
      objects: JSON.parse(r.objects)
    }));
  },

  getEditorDocument(id: string): EditorDocument | null {
    const r = db.prepare('SELECT * FROM editor_documents WHERE id = ?').get(id) as any;
    if (!r) return null;
    return {
      ...r,
      objects: JSON.parse(r.objects)
    };
  },

  saveEditorDocument(doc: EditorDocument): EditorDocument {
    const id = doc.id || `doc-${Date.now()}`;
    const d = { ...doc, id };
    const existing = db.prepare('SELECT id FROM editor_documents WHERE id = ?').get(id);
    if (existing) {
      db.prepare(`
        UPDATE editor_documents SET
          name = ?, source_type = ?, original_pdf_url = ?, page_count = ?,
          objects = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(d.name, d.source_type, d.original_pdf_url || '', d.page_count, JSON.stringify(d.objects), id);
      this.logActivity('UPDATED', 'editor', id, `Updated canvas document: ${d.name}`);
    } else {
      db.prepare(`
        INSERT INTO editor_documents (id, name, source_type, original_pdf_url, page_count, objects)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(id, d.name, d.source_type, d.original_pdf_url || '', d.page_count, JSON.stringify(d.objects));
      this.logActivity('CREATED', 'editor', id, `Created canvas document: ${d.name}`);
    }
    return this.getEditorDocument(id)!;
  },

  deleteEditorDocument(id: string) {
    db.prepare('DELETE FROM editor_documents WHERE id = ?').run(id);
    this.logActivity('DELETED', 'editor', id, `Deleted editor document ID: ${id}`);
  },

  // Full Database Backup & Restore
  exportAllData(): BackupData {
    this.logActivity('EXPORTED', 'backup', 'system', 'Exported complete database snapshot archive.');
    return {
      version: 1,
      exportedAt: new Date().toISOString(),
      companies: this.getCompanies(),
      clients: this.getClients(),
      invoices: this.getInvoices(),
      paymentProfiles: this.getPaymentProfiles(),
      authorizationLetters: this.getAuthorizationLetters(),
      editorDocuments: this.getEditorDocuments(),
      activityLogs: this.getActivityLogs(100),
    };
  },

  exportBackup(): BackupData {
    return this.exportAllData();
  },

  importBackup(data: BackupData, mode: 'replace' | 'merge' = 'replace') {
    return this.importAllData(data, mode);
  },

  importAllData(data: BackupData, mode: 'replace' | 'merge' = 'replace') {
    if (!data || data.version !== 1) {
      throw new Error(`Unsupported backup format or version: ${data?.version}`);
    }

    const transaction = db.transaction(() => {
      if (mode === 'replace') {
        db.prepare('DELETE FROM activity_logs').run();
        db.prepare('DELETE FROM editor_documents').run();
        db.prepare('DELETE FROM authorization_letters').run();
        db.prepare('DELETE FROM invoices').run();
        db.prepare('DELETE FROM payment_profiles').run();
        db.prepare('DELETE FROM clients').run();
        db.prepare('DELETE FROM companies').run();
      }

      let compCount = 0;
      if (Array.isArray(data.companies)) {
        for (const comp of data.companies) {
          const exists = db.prepare('SELECT id FROM companies WHERE id = ?').get(comp.id);
          if (exists) {
            this.updateCompany(comp.id, comp);
          } else {
            db.prepare(`
              INSERT INTO companies (
                id, name, legal_name, tagline, address_line1, address_line2, city, state, zip, country,
                phone, email, website, prefix, default_currency, primary_color, secondary_color,
                default_notes, default_signatory_name, default_signatory_title,
                logo_url, watermark_url, signature_url, stamp_url
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).run(
              comp.id, comp.name, comp.legal_name, comp.tagline || '', comp.address_line1,
              comp.address_line2 || '', comp.city, comp.state, comp.zip, comp.country,
              comp.phone, comp.email, comp.website, comp.prefix, comp.default_currency,
              comp.primary_color, comp.secondary_color || '', JSON.stringify(comp.default_notes),
              comp.default_signatory_name, comp.default_signatory_title, comp.logo_url,
              comp.watermark_url || '', comp.signature_url, comp.stamp_url || ''
            );
          }
          compCount++;
        }
      }

      let clientCount = 0;
      if (Array.isArray(data.clients)) {
        for (const client of data.clients) {
          const exists = db.prepare('SELECT id FROM clients WHERE id = ?').get(client.id);
          if (exists) {
            this.updateClient(client.id, client);
          } else {
            this.createClient(client);
          }
          clientCount++;
        }
      }

      let profileCount = 0;
      if (Array.isArray(data.paymentProfiles)) {
        for (const p of data.paymentProfiles) {
          const exists = db.prepare('SELECT id FROM payment_profiles WHERE id = ?').get(p.id);
          if (exists) {
            this.updatePaymentProfile(p.id, p);
          } else {
            this.createPaymentProfile(p);
          }
          profileCount++;
        }
      }

      let invCount = 0;
      if (Array.isArray(data.invoices)) {
        for (const inv of data.invoices) {
          this.saveInvoice(inv);
          invCount++;
        }
      }

      let letterCount = 0;
      if (Array.isArray(data.authorizationLetters)) {
        for (const l of data.authorizationLetters) {
          this.saveAuthorizationLetter(l);
          letterCount++;
        }
      }

      let docCount = 0;
      if (Array.isArray(data.editorDocuments)) {
        for (const doc of data.editorDocuments) {
          this.saveEditorDocument(doc);
          docCount++;
        }
      }

      this.logActivity('IMPORTED', 'backup', 'system', `Database restored with ${mode} mode (${invCount} invoices, ${letterCount} letters).`);

      return {
        companies: compCount,
        clients: clientCount,
        invoices: invCount,
        paymentProfiles: profileCount,
        authorizationLetters: letterCount,
        editorDocuments: docCount
      };
    });

    return transaction();
  }
};

export default db;
