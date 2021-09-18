import { resolve } from 'path';
import Command from '@oclif/command';
import { readFile } from 'fs/promises';

interface Config {
    version: number;
    projects: string[];
}

export async function parseConfig(fn: string): Promise<Config> {
    let file = await readFile(fn);
    return JSON.parse(file.toString());
}

export async function openBaseDir(command: Command, dir?: string): Promise<[ string, Config ]> {
    try {
        let path = resolve(dir ?? '.');
        while (path.length > 0 && path !== '/') {
            try {
                return [path, await parseConfig(resolve(path, '.revolt'))];
            } catch (err) { }

            path = resolve(path, '..');
        }

        throw "Could not find / read .revolt configuration.";
    } catch (err) {
        command.error(err as any);
        throw "";
    }
}
