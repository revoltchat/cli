import { writeFile, readdir, mkdir } from 'fs/promises';
import { Command, flags } from '@oclif/command';
import { resolve } from 'path';
import sgit from 'simple-git';

const projects = {
  client: 'https://gitlab.insrt.uk/revolt/revite.git',
  'revolt.js': 'https://gitlab.insrt.uk/revolt/revolt.js.git',
  server: 'https://gitlab.insrt.uk/revolt/delta.git',
  autumn: 'https://gitlab.insrt.uk/revolt/autumn.git',
  january: 'https://gitlab.insrt.uk/revolt/january.git',
  rauth: 'https://gitlab.insrt.uk/insert/rauth.git',
}

const workspace = {
	"folders": [
		{
			"name": "client",
			"path": "client"
		},
		{
			"name": "revolt.js",
			"path": "revolt.js"
		},
		{
			"name": "server",
			"path": "server"
		},
		{
			"name": "january",
			"path": "january"
		},
		{
			"name": "autumn",
			"path": "autumn"
		},
		{
			"name": "rauth",
			"path": "rauth"
		}
	]
}

export default class Init extends Command {
  static description = 'Setup a new Revolt stack in the current or given folder.'

  static examples = [
    `$ revolt init
Configured new Revolt stack.
`,
  ]

  static flags = {
    force: flags.boolean({char: 'f'}),
  }

  static args = [{name: 'folder'}]

  async run() {
    const { args, flags } = this.parse(Init);
    const baseDir = resolve(args.folder ?? '.');

    if (flags.force) {
      this.warn('Not checking if folder is empty.');
    } else {
      try {
        const files = await readdir(baseDir);
        if (files.length > 0) {
          this.error('Folder is not empty, if you are sure then run with --force.');
        }
      } catch (err) {
        await mkdir(baseDir, { recursive: true });
      }
    }

    this.log('Pulling Git repositories...');
    for (let project in projects) {
      await sgit()
        .clone(projects[project as keyof typeof projects], resolve(baseDir, project), [ '--recursive' ]);
    }

    this.log('Setting up workspace...');
    await writeFile(resolve(baseDir, 'revolt.code-workspace'), JSON.stringify(workspace));

    this.log('Saving stack information.');
    await writeFile(resolve(baseDir, '.revolt'), JSON.stringify({ version: 1, projects: Object.keys(projects) }));

    this.log('Configured new Revolt stack.');
  }
}
