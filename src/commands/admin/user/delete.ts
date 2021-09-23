import prompts from 'prompts';
import { Command, flags } from '@oclif/command';
import { connectDB, publishAsUser } from '../../../util/db';

export default class DeleteUser extends Command {
  static description = 'Delete a user.'

  static flags = {
    email: flags.boolean({char: 'e', description: 'Take argument as email.'}),
    messages: flags.boolean({char: 'm', description: 'Delete all of user\'s messages.'}),
  }

  static args = [{name: 'id'}]

  async run() {
    const { args, flags } = this.parse(DeleteUser);
    if (!args.id) this.error("No user ID specified.");

    const client = await connectDB();

    let _id = args.id;
    if (flags.email) {
        const account = await client
            .db('revolt')
            .collection('accounts')
            .findOne(
                { email: _id },
                { collation: { locale: 'en', strength: 2 } }
            );
        
        console.log(account);

        if (!account) this.error("Email not found!");
        _id = account._id;
    } else {
        const account = await client
            .db('revolt')
            .collection('accounts')
            .findOne(
                { _id }
            );
        
        console.log(account);
    }

    const user = await client
        .db('revolt')
        .collection('users')
        .findOne({ _id });
    
    if (!user) this.error("User not found!");
    console.log(user);

    let response = await prompts({
        type: 'toggle',
        name: 'confirm',
        message: `Is this the correct user?`,
        initial: false,
        active: 'Yes',
        inactive: 'No'
    });

    if (!response.confirm) return client.close();

    if (flags.messages) {
        const count = await client
            .db('revolt')
            .collection('messages')
            .find({ author: _id })
            .count();

        response = await prompts({
            type: 'toggle',
            name: 'confirm',
            message: `Confirm deleting ${count} messages.`,
            initial: false,
            active: 'Yes',
            inactive: 'No'
        });

        if (!response.confirm) return client.close();

        await client
            .db('revolt')
            .collection('messages')
            .deleteMany({ author: _id });
    }

    const sessions = await client
        .db('revolt')
        .collection('sessions')
        .find({ user_id: _id })
        .toArray();

    console.log('Active Sessions:', sessions);
    console.log(`Will deactivate ${sessions.length} sessions.`);

    response = await prompts({
        type: 'toggle',
        name: 'confirm',
        message: `Are you sure you want to delete this account?`,
        initial: false,
        active: 'Yes',
        inactive: 'No'
    });

    if (!response.confirm) return client.close();

    await client
        .db('revolt')
        .collection('accounts')
        .updateOne(
            { _id: user._id },
            { $set: {
                email: `Deleted User ${user._id}`,
                email_normalised: `Deleted User ${user._id}`,
                disabled: true
            } }
        );

    await client
        .db('revolt')
        .collection('users')
        .updateOne(
            { _id: user._id },
            { $set: {
                username: `Deleted User ${user._id}`,
                flags: 2
            }, $unset: {
                badges: 1,
                status: 1,
                avatar: 1,
                profile: 1,
            } }
        );
    
    await publishAsUser(user._id, {
        type: 'UserUpdate',
        id: user._id,
        data: {
            username: `Deleted User ${user._id}`,
            online: false,
            badges: 0,
            flags: 2,
        },
        clear: 'Avatar'
    });

    await client
        .db('revolt')
        .collection('sessions')
        .deleteMany(
            { user_id: user._id }
        );

    client.close();
  }
}
