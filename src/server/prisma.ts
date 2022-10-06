import log from "electron-log";
import { PrismaClient } from "../generated/client";
import {dbUrl, mePath, qePath} from "./constants";
import path from "path";
import {fork} from "child_process";

log.info("DB URL", dbUrl);
log.info("QE Path", qePath);

export const prisma = new PrismaClient({
  log: ['info', 'warn', 'error',
    //     {
    //     emit: "event",
    //     level: "query",
    // },
  ],
  datasources: {
    db: {
      url: dbUrl
    }
  },
  // see https://github.com/prisma/prisma/discussions/5200
  // @ts-expect-error internal prop
  __internal: {
    engine: {
      binaryPath: qePath
    }
  }
});


export async function runPrismaCommand({command, dbUrl}: {
  command: string[];
  dbUrl: string;
}): Promise<number> {



  log.info("Migration engine path", mePath);
  log.info("Query engine path", qePath);

  // Currently we don't have any direct method to invoke prisma migration programatically.
  // As a workaround, we spawn migration script as a child process and wait for its completion.
  // Please also refer to the following GitHub issue: https://github.com/prisma/prisma/issues/4703
  try {
    const exitCode = await new Promise((resolve, _) => {
      const prismaPath = path.resolve(__dirname, "..", "..", "node_modules/prisma/build/index.js");
      log.info("Prisma path", prismaPath);

      const child = fork(
        prismaPath,
        command,
        {
          env: {
            ...process.env,
            DATABASE_URL: dbUrl,
            PRISMA_MIGRATION_ENGINE_BINARY: mePath,
            PRISMA_QUERY_ENGINE_LIBRARY: qePath,

            // Prisma apparently needs a valid path for the format and introspection binaries, even though
            // we don't use them. So we just point them to the query engine binary. Otherwise, we get
            // prisma:  Error: ENOTDIR: not a directory, unlink '/some/path/electron-prisma-trpc-example/packed/mac-arm64/ElectronPrismaTrpcExample.app/Contents/Resources/app.asar/node_modules/@prisma/engines/prisma-fmt-darwin-arm64'
            PRISMA_FMT_BINARY: qePath,
            PRISMA_INTROSPECTION_ENGINE_BINARY: qePath
          },
          stdio: "pipe"
        }
      );

      child.on("message", msg => {
        log.info(msg);
      })

      child.on("error", err => {
        log.error("Child process got error:", err);
      });

      child.on("close", (code, signal) => {
        resolve(code);
      })

      child.stdout?.on('data',function(data){
        log.info("prisma: ", data.toString());
      });

      child.stderr?.on('data',function(data){
        log.error("prisma: ", data.toString());
      });
    });

    if (exitCode !== 0) throw Error(`command ${command} failed with exit code ${exitCode}`);

    return exitCode;
  } catch (e) {
    log.error(e);
    throw e;
  }
}
