-- ====================================================================
-- LHS — Lawyer Hiring System
-- PostgreSQL Database Schema
-- ====================================================================

-- Create the database (run this separately as a superuser if needed):
-- CREATE DATABASE lhsdb;
-- \c lhsdb

-- ── Admin Users ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tbladmin (
    "ID"            SERIAL          PRIMARY KEY,
    "AdminName"     VARCHAR(120)    NOT NULL,
    "AdminuserName" VARCHAR(20)     NOT NULL UNIQUE,
    "MobileNumber"  BIGINT,
    "Email"         VARCHAR(120)    UNIQUE,
    "Password"      VARCHAR(120)    NOT NULL,
    "AdminRegdate"  TIMESTAMP       NOT NULL DEFAULT NOW(),
    "UserType"      INTEGER         NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_admin_username ON tbladmin ("AdminuserName");
CREATE INDEX IF NOT EXISTS idx_admin_email    ON tbladmin ("Email");

COMMENT ON TABLE  tbladmin               IS 'Admin panel users';
COMMENT ON COLUMN tbladmin."UserType"    IS '0 = Admin, 1 = Super Admin';
COMMENT ON COLUMN tbladmin."Password"    IS 'bcrypt hashed password';


-- ── Practice Areas ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tblpracticearea (
    "id"            SERIAL          PRIMARY KEY,
    "PracticeArea"  VARCHAR(200)    NOT NULL,
    "AddedBy"       VARCHAR(20),
    "CreationDate"  TIMESTAMP       NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE tblpracticearea IS 'Legal practice area categories';


-- ── Site Pages ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tblpage (
    "ID"                SERIAL          PRIMARY KEY,
    "PageType"          VARCHAR(200)    NOT NULL UNIQUE,
    "PageTitle"         VARCHAR(200)    NOT NULL,
    "PageDescription"   TEXT            NOT NULL,
    "Email"             VARCHAR(200),
    "MobileNumber"      BIGINT,
    "UpdationDate"      TIMESTAMP       NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_page_type ON tblpage ("PageType");

COMMENT ON TABLE  tblpage              IS 'CMS pages (aboutus, contact, terms, privacy)';
COMMENT ON COLUMN tblpage."PageType"   IS 'Slug identifier, e.g. aboutus, contact';


-- ── Lawyers ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tbllawyers (
    "id"                SERIAL          PRIMARY KEY,
    "LawyerName"        VARCHAR(200)    NOT NULL,
    "LawyerEmail"       VARCHAR(200),
    "LawyerMobileNo"    BIGINT,
    "OfficeAddress"     TEXT,
    "City"              VARCHAR(255),
    "State"             VARCHAR(255),
    "LanguagesKnown"    TEXT,
    "ProfilePic"        VARCHAR(200),
    "LawyerExp"         BIGINT,
    "PracticeAreas"     TEXT,
    "Courts"            TEXT,
    "Website"           VARCHAR(150),
    "Description"       TEXT,
    "RegDate"           TIMESTAMP       NOT NULL DEFAULT NOW(),
    "IsPublic"          INTEGER         NOT NULL DEFAULT 0,
    "AddedBy"           VARCHAR(120)
);

CREATE INDEX IF NOT EXISTS idx_lawyer_name     ON tbllawyers ("LawyerName");
CREATE INDEX IF NOT EXISTS idx_lawyer_city     ON tbllawyers ("City");
CREATE INDEX IF NOT EXISTS idx_lawyer_state    ON tbllawyers ("State");
CREATE INDEX IF NOT EXISTS idx_lawyer_public   ON tbllawyers ("IsPublic");
CREATE INDEX IF NOT EXISTS idx_lawyer_regdate  ON tbllawyers ("RegDate" DESC);

COMMENT ON TABLE  tbllawyers             IS 'Lawyer/advocate profiles';
COMMENT ON COLUMN tbllawyers."IsPublic"  IS '0 = Private (admin only), 1 = Visible on public site';
COMMENT ON COLUMN tbllawyers."PracticeAreas" IS 'Comma-separated list of practice areas';
COMMENT ON COLUMN tbllawyers."Courts"        IS 'Comma-separated list of courts practiced in';
