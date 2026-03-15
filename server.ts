import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import admin from "firebase-admin";
import Razorpay from "razorpay";
import crypto from "crypto";

console.log("Starting server.ts...");

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Admin
try {
  const projectId = process.env.FIREBASE_PROJECT_ID?.trim().replace(/^["']|["']$/g, '');
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim().replace(/^["']|["']$/g, '');
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.trim().replace(/^["']|["']$/g, '').replace(/\\n/g, '\n');

  if (projectId && clientEmail && privateKey) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
    console.log("Firebase Admin initialized successfully");
  } else {
    console.warn("Firebase Admin not fully initialized. Missing one or more: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY.");
  }
} catch (error) {
  console.error("Firebase Admin initialization error:", error);
}

let db: any;
try {
  console.log("Initializing database...");
  db = new Database("finance.db");
  console.log("Database initialized");
} catch (error) {
  console.error("Database initialization error:", error);
  process.exit(1);
}

// Initialize Database
try {
  db.exec(`
    CREATE TABLE IF NOT EXISTS borrowers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      address TEXT,
      guarantor TEXT,
      guarantor_phone TEXT,
      guarantor_address TEXT,
      surety_details TEXT
    );

    CREATE TABLE IF NOT EXISTS loans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      borrower_id INTEGER NOT NULL,
      principal REAL NOT NULL,
      interest_rate REAL NOT NULL,
      date_given TEXT NOT NULL,
      promise_date TEXT NOT NULL,
      reminder_date TEXT,
      interest_type TEXT CHECK(interest_type IN ('simple', 'cumulative')) NOT NULL,
      FOREIGN KEY (borrower_id) REFERENCES borrowers(id)
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      loan_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      amount REAL NOT NULL,
      type TEXT CHECK(type IN ('interest_only', 'principal_reduction', 'full_settlement')) NOT NULL,
      FOREIGN KEY (loan_id) REFERENCES loans(id)
    );

    CREATE TABLE IF NOT EXISTS documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      borrower_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      data TEXT NOT NULL, -- Base64 encoded data
      date_uploaded TEXT NOT NULL,
      FOREIGN KEY (borrower_id) REFERENCES borrowers(id)
    );

    CREATE TABLE IF NOT EXISTS subscriptions (
      user_id TEXT PRIMARY KEY,
      plan_type TEXT CHECK(plan_type IN ('monthly', 'yearly')) NOT NULL,
      start_date TEXT NOT NULL,
      expiry_date TEXT NOT NULL
    );
  `);
  console.log("Tables created/verified");
} catch (error) {
  console.error("Database table creation error:", error);
}

// Migration: Ensure new columns exist in borrowers table
try {
  const tableInfo = db.prepare("PRAGMA table_info(borrowers)").all() as any[];
  const columnNames = tableInfo.map(info => info.name);

  if (!columnNames.includes('address')) {
    db.exec("ALTER TABLE borrowers ADD COLUMN address TEXT");
  }
  if (!columnNames.includes('user_id')) {
    db.exec("ALTER TABLE borrowers ADD COLUMN user_id TEXT DEFAULT 'legacy_user'");
  }
  if (!columnNames.includes('guarantor_phone')) {
    db.exec("ALTER TABLE borrowers ADD COLUMN guarantor_phone TEXT");
  }
  if (!columnNames.includes('guarantor_address')) {
    db.exec("ALTER TABLE borrowers ADD COLUMN guarantor_address TEXT");
  }
  if (!columnNames.includes('deleted_at')) {
    db.exec("ALTER TABLE borrowers ADD COLUMN deleted_at TEXT");
  }
  if (!columnNames.includes('linked_user_id')) {
    db.exec("ALTER TABLE borrowers ADD COLUMN linked_user_id TEXT");
  }
} catch (error) {
  console.error("Borrowers migration error:", error);
}

// Migration for loans table
try {
  const loanTableInfo = db.prepare("PRAGMA table_info(loans)").all() as any[];
  const loanColumnNames = loanTableInfo.map(info => info.name);
  if (!loanColumnNames.includes('reminder_date')) {
    db.exec("ALTER TABLE loans ADD COLUMN reminder_date TEXT");
  }
} catch (error) {
  console.error("Loans migration error:", error);
}

// Migration: Update transactions table type constraint
try {
  const schema = db.prepare("SELECT sql FROM sqlite_master WHERE name = 'transactions'").get() as any;
  if (schema && !schema.sql.includes('full_settlement')) {
    console.log("Migrating transactions table to support 'full_settlement'...");
    db.transaction(() => {
      db.exec(`
        CREATE TABLE transactions_new (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          loan_id INTEGER NOT NULL,
          date TEXT NOT NULL,
          amount REAL NOT NULL,
          type TEXT CHECK(type IN ('interest_only', 'principal_reduction', 'full_settlement')) NOT NULL,
          FOREIGN KEY (loan_id) REFERENCES loans(id)
        );
        INSERT INTO transactions_new (id, loan_id, date, amount, type)
        SELECT id, loan_id, date, amount, type FROM transactions;
        DROP TABLE transactions;
        ALTER TABLE transactions_new RENAME TO transactions;
      `);
    })();
  }
} catch (error) {
  console.error("Migration error:", error);
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
  });

  // Auth Middleware
  const authenticate = async (req: any, res: any, next: any) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];

    // Handle mock tokens for development
    if (token.startsWith('mock-token')) {
      const uid = token.includes('-') ? token.split('-').slice(2).join('-') : 'dev_user';
      req.user = { uid: uid || 'dev_user' };
      return next();
    }

    // Handle real Firebase tokens
    if (process.env.FIREBASE_PROJECT_ID) {
      try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        req.user = decodedToken;
        next();
      } catch (error) {
        console.error("Auth error:", error);
        res.status(401).json({ error: 'Invalid token' });
      }
    } else {
      // If Firebase is not configured, but we got a real-looking token (JWT),
      // we'll allow it in dev mode by extracting the UID from the payload.
      try {
        const parts = token.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
          if (payload.sub) {
            console.log(`Using unverified UID from token: ${payload.sub}`);
            req.user = { uid: payload.sub, email: payload.email };
            return next();
          }
        }
      } catch (e) {
        console.error("Fallback auth error:", e);
      }
      
      console.warn("Firebase Admin not configured. Using token hash as UID fallback.");
      const fallbackUid = 'unverified_' + Buffer.from(token.substring(0, 32)).toString('hex');
      req.user = { uid: fallbackUid };
      next();
    }
  };

  // API Routes
  app.get("/api/subscription", authenticate, (req: any, res) => {
    try {
      const userId = req.user.uid;
      const subscription = db.prepare("SELECT * FROM subscriptions WHERE user_id = ?").get(userId);
      
      if (!subscription) {
        return res.json({ active: false });
      }

      const now = new Date();
      const expiry = new Date(subscription.expiry_date);
      const active = expiry > now;

      res.json({ 
        active, 
        plan_type: subscription.plan_type,
        expiry_date: subscription.expiry_date 
      });
    } catch (error) {
      console.error("Subscription fetch error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/subscription/create-order", authenticate, async (req: any, res) => {
    try {
      const { plan_type, promo_code } = req.body;
      let amount = plan_type === 'monthly' ? 9900 : 99900; // in paise

      if (promo_code === 'FIRST18') {
        amount = 1800; // 18 Rupees
      }

      const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_dummy',
        key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_secret',
      });

      const options = {
        amount,
        currency: "INR",
        receipt: `receipt_${Date.now()}`,
      };

      const order = await razorpay.orders.create(options);
      res.json(order);
    } catch (error) {
      console.error("Razorpay order creation error:", error);
      res.status(500).json({ error: "Failed to create order" });
    }
  });

  app.post("/api/subscription/verify-payment", authenticate, (req: any, res) => {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan_type } = req.body;
      const userId = req.user.uid;

      const secret = process.env.RAZORPAY_KEY_SECRET || 'dummy_secret';
      const hmac = crypto.createHmac('sha256', secret);
      hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
      const generated_signature = hmac.digest('hex');

      if (generated_signature === razorpay_signature || process.env.NODE_ENV !== 'production') {
        const now = new Date();
        const startDate = now.toISOString();
        const expiryDate = new Date(now);
        
        if (plan_type === 'monthly') {
          expiryDate.setDate(expiryDate.getDate() + 30);
        } else {
          expiryDate.setDate(expiryDate.getDate() + 365);
        }

        const expiryDateStr = expiryDate.toISOString();

        db.prepare(`
          INSERT INTO subscriptions (user_id, plan_type, start_date, expiry_date)
          VALUES (?, ?, ?, ?)
          ON CONFLICT(user_id) DO UPDATE SET
            plan_type = excluded.plan_type,
            start_date = excluded.start_date,
            expiry_date = excluded.expiry_date
        `).run(userId, plan_type, startDate, expiryDateStr);

        res.json({ 
          success: true, 
          active: true, 
          plan_type, 
          expiry_date: expiryDateStr 
        });
      } else {
        res.status(400).json({ error: "Invalid signature" });
      }
    } catch (error) {
      console.error("Payment verification error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/subscription/apply-promo", authenticate, (req: any, res) => {
    try {
      const { promo_code } = req.body;
      const userId = req.user.uid;

      if (promo_code === 'TRACKER') {
        const now = new Date();
        const startDate = now.toISOString();
        const expiryDate = new Date(now);
        expiryDate.setDate(expiryDate.getDate() + 30); // 1 month free

        const expiryDateStr = expiryDate.toISOString();

        db.prepare(`
          INSERT INTO subscriptions (user_id, plan_type, start_date, expiry_date)
          VALUES (?, ?, ?, ?)
          ON CONFLICT(user_id) DO UPDATE SET
            plan_type = excluded.plan_type,
            start_date = excluded.start_date,
            expiry_date = excluded.expiry_date
        `).run(userId, 'monthly', startDate, expiryDateStr);

        res.json({ 
          success: true, 
          active: true, 
          plan_type: 'monthly', 
          expiry_date: expiryDateStr,
          message: "Promo code applied! You got 1 month free access."
        });
      } else if (promo_code === 'FIRST18') {
        res.json({
          success: true,
          discounted: true,
          discountedPrice: 18,
          message: "Promo code applied! Pay only ₹18 for your subscription."
        });
      } else {
        res.status(400).json({ error: "Invalid promo code" });
      }
    } catch (error) {
      console.error("Promo code error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/subscription/subscribe", authenticate, (req: any, res) => {
    try {
      const userId = req.user.uid;
      const { plan_type } = req.body; // 'monthly' or 'yearly'
      
      if (!['monthly', 'yearly'].includes(plan_type)) {
        return res.status(400).json({ error: "Invalid plan type" });
      }

      const now = new Date();
      const startDate = now.toISOString();
      const expiryDate = new Date(now);
      
      if (plan_type === 'monthly') {
        expiryDate.setDate(expiryDate.getDate() + 30);
      } else {
        expiryDate.setDate(expiryDate.getDate() + 365);
      }

      const expiryDateStr = expiryDate.toISOString();

      db.prepare(`
        INSERT INTO subscriptions (user_id, plan_type, start_date, expiry_date)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(user_id) DO UPDATE SET
          plan_type = excluded.plan_type,
          start_date = excluded.start_date,
          expiry_date = excluded.expiry_date
      `).run(userId, plan_type, startDate, expiryDateStr);

      res.json({ 
        success: true, 
        active: true, 
        plan_type, 
        expiry_date: expiryDateStr 
      });
    } catch (error) {
      console.error("Subscription update error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/dashboard", authenticate, (req: any, res) => {
    try {
      const userId = req.user.uid;
      console.log(`Fetching dashboard data for user: ${userId}`);
      const borrowers = db.prepare(`
        SELECT 
          b.id, b.name, b.phone, b.address, b.guarantor, b.guarantor_phone, b.guarantor_address, b.surety_details, b.deleted_at,
          l.id as loan_id, l.principal, l.interest_rate, l.date_given, l.promise_date, l.reminder_date, l.interest_type
        FROM borrowers b
        LEFT JOIN loans l ON b.id = l.borrower_id
        WHERE b.deleted_at IS NULL AND b.user_id = ?
      `).all(userId);

      const transactions = db.prepare(`
        SELECT t.* FROM transactions t
        JOIN loans l ON t.loan_id = l.id
        JOIN borrowers b ON l.borrower_id = b.id
        WHERE b.user_id = ?
        ORDER BY t.date DESC
      `).all(userId);
      
      console.log(`Found ${borrowers.length} active borrowers`);
      res.json({ borrowers, transactions });
    } catch (error) {
      console.error("Dashboard error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/deleted-borrowers", authenticate, (req: any, res) => {
    try {
      const userId = req.user.uid;
      console.log(`Fetching deleted borrowers for user: ${userId}`);
      const borrowers = db.prepare(`
        SELECT 
          b.id, b.name, b.phone, b.address, b.guarantor, b.guarantor_phone, b.guarantor_address, b.surety_details, b.deleted_at,
          l.id as loan_id, l.principal, l.interest_rate, l.date_given, l.promise_date, l.reminder_date, l.interest_type
        FROM borrowers b
        LEFT JOIN loans l ON b.id = l.borrower_id
        WHERE b.deleted_at IS NOT NULL AND b.user_id = ?
        AND datetime(b.deleted_at) > datetime('now', '-90 days')
      `).all(userId);
      console.log(`Found ${borrowers.length} deleted borrowers`);
      res.json(borrowers);
    } catch (error) {
      console.error("Deleted borrowers error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/borrowers/:id/recover", authenticate, (req: any, res) => {
    const id = Number(req.params.id);
    const userId = req.user.uid;
    console.log(`Recovering borrower ID: ${id} for user: ${userId}`);
    const result = db.prepare("UPDATE borrowers SET deleted_at = NULL WHERE id = ? AND user_id = ?").run(id, userId);
    console.log(`Recovery result:`, result);
    res.json({ success: true });
  });

  app.get("/api/borrowers/:id/documents", authenticate, (req: any, res) => {
    const userId = req.user.uid;
    const docs = db.prepare(`
      SELECT d.id, d.name, d.type, d.date_uploaded 
      FROM documents d
      JOIN borrowers b ON d.borrower_id = b.id
      WHERE d.borrower_id = ? AND b.user_id = ?
    `).all(req.params.id, userId);
    res.json(docs);
  });

  app.get("/api/documents/:id", authenticate, (req: any, res) => {
    const userId = req.user.uid;
    const doc = db.prepare(`
      SELECT d.* FROM documents d
      JOIN borrowers b ON d.borrower_id = b.id
      WHERE d.id = ? AND b.user_id = ?
    `).get(req.params.id, userId);
    if (doc) {
      res.json(doc);
    } else {
      res.status(404).json({ error: "Document not found" });
    }
  });

  app.post("/api/borrowers/:id/documents", authenticate, (req: any, res) => {
    const userId = req.user.uid;
    const { name, type, data } = req.body;
    
    // Check ownership
    const borrower = db.prepare("SELECT id FROM borrowers WHERE id = ? AND user_id = ?").get(req.params.id, userId);
    if (!borrower) return res.status(403).json({ error: "Forbidden" });

    const date = new Date().toISOString().split('T')[0];
    const insert = db.prepare("INSERT INTO documents (borrower_id, name, type, data, date_uploaded) VALUES (?, ?, ?, ?, ?)");
    insert.run(req.params.id, name, type, data, date);
    res.json({ success: true });
  });

  app.delete("/api/borrowers/:id", authenticate, (req: any, res) => {
    const borrowerId = Number(req.params.id);
    const userId = req.user.uid;
    console.log(`Deleting borrower ID: ${borrowerId} for user: ${userId}`);
    try {
      const result = db.prepare("UPDATE borrowers SET deleted_at = datetime('now') WHERE id = ? AND user_id = ?").run(borrowerId, userId);
      console.log(`Delete result:`, result);
      if (result.changes === 0) {
        console.warn(`No borrower found with ID: ${borrowerId} for user: ${userId}`);
        return res.status(404).json({ error: "Borrower not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Delete error:", error);
      res.status(500).json({ error: "Failed to delete borrower" });
    }
  });

  app.post("/api/borrowers", authenticate, (req: any, res) => {
    const userId = req.user.uid;
    const { 
      name, phone, address, guarantor, guarantor_phone, guarantor_address, 
      surety_details, principal, interest_rate, date_given, promise_date, interest_type,
      documents // Optional array of { name, type, data }
    } = req.body;
    
    db.transaction(() => {
      const insertBorrower = db.prepare(`
        INSERT INTO borrowers (user_id, name, phone, address, guarantor, guarantor_phone, guarantor_address, surety_details) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      const borrowerResult = insertBorrower.run(userId, name, phone, address, guarantor, guarantor_phone, guarantor_address, surety_details);
      const borrowerId = borrowerResult.lastInsertRowid;

      const insertLoan = db.prepare("INSERT INTO loans (borrower_id, principal, interest_rate, date_given, promise_date, interest_type) VALUES (?, ?, ?, ?, ?, ?)");
      insertLoan.run(borrowerId, principal, interest_rate, date_given, promise_date, interest_type);

      if (documents && Array.isArray(documents)) {
        const insertDoc = db.prepare("INSERT INTO documents (borrower_id, name, type, data, date_uploaded) VALUES (?, ?, ?, ?, ?)");
        const date = new Date().toISOString().split('T')[0];
        for (const doc of documents) {
          insertDoc.run(borrowerId, doc.name, doc.type, doc.data, date);
        }
      }
    })();

    res.json({ success: true });
  });

  app.post("/api/transactions", authenticate, (req: any, res) => {
    const userId = req.user.uid;
    const { loan_id, date, amount, type } = req.body;
    
    // Check ownership
    const loan = db.prepare(`
      SELECT l.id FROM loans l
      JOIN borrowers b ON l.borrower_id = b.id
      WHERE l.id = ? AND b.user_id = ?
    `).get(loan_id, userId);
    if (!loan) return res.status(403).json({ error: "Forbidden" });

    const insertTransaction = db.prepare("INSERT INTO transactions (loan_id, date, amount, type) VALUES (?, ?, ?, ?)");
    insertTransaction.run(loan_id, date, amount, type);
    res.json({ success: true });
  });

  app.patch("/api/loans/:id/reminder-date", authenticate, (req: any, res) => {
    const userId = req.user.uid;
    const { reminder_date } = req.body;
    const loanId = req.params.id;
    
    // Check ownership
    const loan = db.prepare(`
      SELECT l.id FROM loans l
      JOIN borrowers b ON l.borrower_id = b.id
      WHERE l.id = ? AND b.user_id = ?
    `).get(loanId, userId);
    if (!loan) return res.status(403).json({ error: "Forbidden" });

    try {
      db.prepare("UPDATE loans SET reminder_date = ? WHERE id = ?").run(reminder_date, loanId);
      res.json({ success: true });
    } catch (error) {
      console.error("Update reminder date error:", error);
      res.status(500).json({ error: "Failed to update reminder date" });
    }
  });

  // Borrower-specific endpoints
  app.get("/api/borrower/me", authenticate, (req: any, res) => {
    try {
      const userId = req.user.uid;
      const borrower = db.prepare(`
        SELECT b.*, l.id as loan_id, l.principal, l.interest_rate, l.date_given, l.promise_date, l.reminder_date, l.interest_type
        FROM borrowers b
        LEFT JOIN loans l ON b.id = l.borrower_id
        WHERE b.linked_user_id = ? AND b.deleted_at IS NULL
      `).get(userId);
      
      if (!borrower) {
        return res.status(404).json({ error: "Borrower profile not found" });
      }

      const transactions = db.prepare(`
        SELECT t.* FROM transactions t
        JOIN loans l ON t.loan_id = l.id
        WHERE l.borrower_id = ?
        ORDER BY t.date DESC
      `).all(borrower.id);

      res.json({ borrower, transactions });
    } catch (error) {
      console.error("Borrower profile error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/borrowers/:id/link", authenticate, (req: any, res) => {
    try {
      const lenderId = req.user.uid;
      const borrowerId = req.params.id;
      const { linked_user_id } = req.body;

      // Verify lender owns this borrower
      const borrower = db.prepare("SELECT id FROM borrowers WHERE id = ? AND user_id = ?").get(borrowerId, lenderId);
      if (!borrower) return res.status(403).json({ error: "Forbidden" });

      db.prepare("UPDATE borrowers SET linked_user_id = ? WHERE id = ?").run(linked_user_id, borrowerId);
      res.json({ success: true });
    } catch (error) {
      console.error("Link borrower error:", error);
      res.status(500).json({ error: "Failed to link borrower" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    try {
      console.log("Initializing Vite middleware...");
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
      console.log("Vite middleware initialized");
    } catch (error) {
      console.error("Vite middleware initialization error:", error);
    }
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
