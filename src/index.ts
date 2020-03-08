import arg from 'arg';
import getPort from 'get-port';
import inquirer from 'inquirer';
import fse from 'fs-extra';
import path from 'path';
import { write, DEFAULT_CONTENT } from './db';
import { createServer } from './server';

const DEFAULT_FILE_NAME = 'todo--list-db.json';

export async function command() {
  const args = arg({
    '--file': String,
    '--port': Number,
    '--help': Boolean,
    // alias
    '-h': '--help',
    '-f': '--file',
    '-p': '--port',
  });

  const readmePath = path.resolve(__dirname, '..', 'README.md');
  const help = await fse.readFile(readmePath, { encoding: 'utf8' });

  if (args['--help']) {
    console.log(help);
    return;
  }

  const port = args['--port'];
  const file = args['--file'] || args._[0] || DEFAULT_FILE_NAME;

  if (file.endsWith('.json') === false) {
    throw new Error(`File must end with .json !`);
  }
  const base = process.cwd();
  const filePath = path.resolve(base, file);
  const fileExist = fse.existsSync(filePath);
  if (fileExist === false) {
    const createFile = (
      await inquirer.prompt([
        {
          name: 'confirm',
          type: 'confirm',
          message: `The file ${filePath} does not exist and will be created`,
        },
      ])
    ).confirm;
    if (!createFile) {
      return;
    }
    await write(filePath, DEFAULT_CONTENT);
  }

  const usedPort = await getPort({ port: port });
  const isDifferentPort = port && port !== usedPort;
  if (isDifferentPort) {
    const changePort = (
      await inquirer.prompt([
        {
          name: 'confirm',
          type: 'confirm',
          message: `${port} is already used, do you want to use ${usedPort} instead ?`,
        },
      ])
    ).confirm;
    if (!changePort) {
      return;
    }
  }

  const apiPath = path.resolve(__dirname, '..', 'api.html');
  const apiContent = await fse.readFile(apiPath, { encoding: 'utf8' });

  const server = createServer(filePath, apiContent);

  server.listen(usedPort, () => {
    console.log(`Server started on http://localhost:${usedPort}`);
  });
}
