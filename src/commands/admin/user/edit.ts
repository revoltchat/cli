import prompts from 'prompts';
import { Command } from '@oclif/command';
import { connectDB, publishAsUser } from '../../../util/db';

export default class EditUser extends Command {
  static description = 'Edit user information.'

  static args = [{name: 'id'}]

  async run() {
    const { args } = this.parse(EditUser);
    if (!args.id) this.error("No user ID specified.");

    const client = await connectDB();
    const user = await client
        .db('revolt')
        .collection('users')
        .findOne({ _id: args.id });
    
    if (!user) this.error("User not found!");

    const response = await prompts([
        {
            type: 'text',
            name: 'username',
            message: `Username`,
            initial: user.username
        },
        {
            type: 'number',
            name: 'badges',
            message: `Badges`,
            initial: user.badges ?? 0,
            validate: v => v <= 255
        },
        {
            type: 'number',
            name: 'flags',
            message: `Flags`,
            initial: user.flags ?? 0,
            validate: v => v <= 255
        }
    ]);

    await client
        .db('revolt')
        .collection('users')
        .updateOne(
            { _id: args.id },
            { $set: response }
        );
    
    await publishAsUser(user._id, {
        type: 'UserUpdate',
        id: user._id,
        data: {
            username: response.username,
            badges: response.badges,
            flags: response.flags
        }
    });

    client.close();
  }
}
