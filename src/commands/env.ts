import { writeFile, symlink } from 'fs/promises';
import { Command, flags } from '@oclif/command';
import { openBaseDir } from '../revolt';
import { resolve } from 'path';
import axios from 'axios';

const EXAMPLE_ENV = 'https://raw.githubusercontent.com/revoltchat/self-hosted/master/.env.example';

const paths: { [key: string]: string } = {
  'delta': '.env',
  'client': '.env.local',
  'autumn': '.env',
  'january': '.env',
}

export default class Env extends Command {
  static description = 'Configure shared environment file.'

  static examples = [
    `$ revolt env
Configured environment files.
`,
  ]

  static flags = {
    empty: flags.boolean({char: 'e', description: 'Create an empty environment file.'}),
  }

  static args = [{name: 'baseFolder'}]

  async run() {
    const { flags, args } = this.parse(Env);
    const [ path, config ] = await openBaseDir(this, args.baseFolder ?? '.');

    let env = '';
    if (!flags.empty) {
      this.log('Downloading sample environment file.');
      env = await axios(EXAMPLE_ENV)
        .then(x => x.data);
    }

    this.log('Writing environment file.');
    writeFile(resolve(path, '.env'), env);

    this.log('Creating symbolic links for project environments.');
    for (let project of config.projects) {
      let file = paths[project];
      if (file) {
        try {
          await symlink(resolve(path, '.env'), resolve(path, project, file));
        } catch (err) {
          this.warn(`Environment file, ${file} already exists in project ${project}, skipping.`);
        }
      }
    }

    this.log('Configured environment files.');
  }
}
