#! /usr/bin/env node

const {Client} = require("pg")
const pool = require("./pool")
const SQL = `
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
        first_name VARCHAR(50) NOT NULL,
        last_name VARCHAR(50) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        is_admin BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS clubhouses (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by INTEGER UNIQUE NOT NULL,

  CONSTRAINT fk_creator
    FOREIGN KEY (created_by)
    REFERENCES users(id)
    ON DELETE CASCADE
);
    CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  title VARCHAR(100) NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  user_id INTEGER NOT NULL,
  clubhouse_id INTEGER NOT NULL,

  CONSTRAINT fk_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_clubhouse
    FOREIGN KEY (clubhouse_id)
    REFERENCES clubhouses(id)
    ON DELETE CASCADE
);
    CREATE TABLE IF NOT EXISTS club_memberships (
        id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
        user_id INTEGER NOT NULL,
        clubhouse_id INTEGER NOT NULL,
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        CONSTRAINT fk_user
            FOREIGN KEY (user_id)
            REFERENCES users(id)
            ON DELETE CASCADE,

        CONSTRAINT fk_clubhouse
            FOREIGN KEY (clubhouse_id)
            REFERENCES clubhouses(id)
            ON DELETE CASCADE,

  CONSTRAINT unique_membership
    UNIQUE (user_id, clubhouse_id)
);
`
async function main() {
  console.log("seeding...");
  
    const client = new Client({
    connectionString: `postgresql://oscar:2605@localhost:5432/members_only`,
  });
  await client.connect();
  await client.query(SQL);
  await client.end();
  console.log("done");
}

main();