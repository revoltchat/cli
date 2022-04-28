import { Command, flags } from '@oclif/command';
import { openBaseDir } from '../revolt';
import concurrently from 'concurrently';
import { resolve } from 'path';

const commands: { [key: string]: string } = {
  'client': 'yarn',
  'server': 'cargo build --bin revolt',
  'autumn': 'cargo build',
  'january': 'cargo build',
  'bonfire': 'cargo build'
}

export default class Build extends Command {
  static description = 'Build Rust binaries and install Node dependencies.'

  static examples = [
    `$ revolt build
Built projects and installed dependencies.
`,
  ]

  static flags = {
    release: flags.boolean({char: 'r', description: 'Tell Rust to create release build.'}),
  }

  static args = [{name: 'baseFolder'}]

  async run() {
    const { flags, args } = this.parse(Build);
    const [ path, config ] = await openBaseDir(this, args.baseFolder ?? '.');

    for (let project of config.projects) {
      let command = commands[project];
      if (command) {
        if (flags.release) {
          command += ' --release';
        }

        await concurrently([
          command
        ], {
          cwd: resolve(path, project)
        });
      }
    }

    this.log('Built all projects.');
  }
}
