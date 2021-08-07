import * as sqlite3 from 'sqlite3';

const db = new sqlite3.Database('./db.sqlite3');

db.serialize(() => {
  db.run('CREATE TABLE channels (channel TEXT)');
});

db.close();
