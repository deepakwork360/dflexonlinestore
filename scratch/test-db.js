const { Client } = require('pg');

async function test() {
  const passwords = ['Admin', 'admin', 'postgres', '', 'root', '1234', '123456'];
  for (const pw of passwords) {
    console.log(`Testing password: "${pw}"`);
    const client = new Client({
      user: 'postgres',
      host: 'localhost',
      database: 'sneaker_com',
      password: pw,
      port: 5432,
    });
    try {
      await client.connect();
      console.log(`SUCCESS! Password is: "${pw}"`);
      await client.end();
      return;
    } catch (err) {
      console.log(`Failed for "${pw}": ${err.message}`);
    }
  }
}

test();
