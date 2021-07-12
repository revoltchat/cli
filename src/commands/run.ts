import { Command, flags } from '@oclif/command';
import { openBaseDir } from '../revolt';
import concurrently from 'concurrently';

const commands: { [key: string]: string } = {
  'client': 'yarn dev --host --port 3001',
  'server': 'REVOLT_MONGO_URI=mongodb://localhost ROCKET_ADDRESS=0.0.0.0 cargo run --bin revolt',
  'autumn': 'AUTUMN_S3_ENDPOINT=http://localhost:9050 AUTUMN_HOST=0.0.0.0:3000 AUTUMN_MONGO_URI=mongodb://localhost cargo run',
  'january': 'cargo run',
}

export default class Run extends Command {
  static description = 'Run full stack.'

  static flags = {
    release: flags.boolean({char: 'r', description: 'Use release builds.'}),
  }

  static args = [{name: 'baseFolder'}]

  async run() {
    const { flags, args } = this.parse(Run);
    const [ cwd, config ] = await openBaseDir(this, args.baseFolder ?? '.');

    let tasks: string[] = [
      `docker run --rm -e MINIO_ROOT_USER=minioautumn -e MINIO_ROOT_PASSWORD=minioautumn -p 9050:9000 -v "${cwd}/data/minio:/data" minio/minio server /data`,
      `docker run --rm -p 27017:27017 -v "${cwd}/data/mongodb:/data/db" mongo`
    ];

    for (let project of config.projects) {
      let command = commands[project];
      if (command) {
        if (flags.release && project !== 'client') {
          command += ' --release';
        }

        tasks.push(
          `cd ${project} && ${command}`
        );
      }
    }

    await concurrently(tasks, { cwd });
  }
}
