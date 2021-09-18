import { Command } from '@oclif/command';
import { connectDB } from '../../util/db';

export default class Test extends Command {
  static description = 'Verify Revolt is configured.'

  async run() {
    const db = await connectDB();
    const migration = await db
      .db('revolt')
      .collection('migrations')
      .findOne({});

    if (migration) {
      this.log('Revolt appears to be configured.');
    } else {
      this.log('Could not find database migration information.');
    }

    db.close();
  }
}
