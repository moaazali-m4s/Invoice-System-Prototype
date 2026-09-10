# Invoice & Document Studio — Generic Prototype

A complete, production-grade local web application designed for enterprise invoice generation, representative authorization letters, visual PDF editing, and local SQLite data management.

This prototype uses the fictional corporate identity of **XYZ Company LLC** and is 100% confidential-free, portfolio-safe, and standalone.

## Core Capabilities
- **Invoice Studio**: Dual-panel interactive editor with real-time live preview, multiple line items, tax/discount calculation, and consultant name assignment.
- **Authorization Letter Builder**: Official company representative letters with custom authorization scope, validity statements, and physical print toggles.
- **Visual PDF Editor**: Interactive canvas to annotate, add text, shapes, signatures, and export documents.
- **Client & Payment Profiles**: Full CRUD directory for commercial clients and banking instructions.
- **Data Management & Backup**: Export version 1 JSON snapshots and restore using Restore & Replace or Merge & Update workflows.
- **Local SQLite Engine**: Fast, local-first database with WAL mode.
- **Vector PDF Generator**: Headless Puppeteer rendering engine for high-resolution, printable documents.

## Running the Prototype
```bash
# Start development server on port 3001
npm run dev

# Or build and run production server
npm run build
npm start
```
