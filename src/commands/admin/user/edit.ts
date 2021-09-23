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

    const { username, badges, flags, reset_profile, reset_avatar } = await prompts([
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
        },
        {
            type: 'toggle',
            name: 'reset_profile',
            message: `Reset profile?`,
            initial: false,
            inactive: 'No',
            active: 'Yes'
        },
        {
            type: 'toggle',
            name: 'reset_avatar',
            message: `Reset avatar?`,
            initial: false,
            inactive: 'No',
            active: 'Yes'
        }
    ]);

    let q: any = { $set: { username, badges, flags } };
    if (reset_profile || reset_avatar) {
        let $unset: any = {};
        if (reset_profile) $unset.profile = 1;
        if (reset_avatar) $unset.avatar = 1;
        q.$unset = $unset;
    }

    await client
        .db('revolt')
        .collection('users')
        .updateOne(
            { _id: args.id },
            q
        );
    
    await publishAsUser(user._id, {
        type: 'UserUpdate',
        id: user._id,
        data: {
            username, badges, flags
        }
    });

    if (reset_avatar) {
        await publishAsUser(user._id, {
            type: 'UserUpdate',
            id: user._id,
            data: {},
            clear: 'Avatar'
        });
    }

    if (reset_profile) {
        await publishAsUser(user._id, {
            type: 'UserUpdate',
            id: user._id,
            data: {},
            clear: 'ProfileBackground'
        });
    }

    client.close();
  }
}
