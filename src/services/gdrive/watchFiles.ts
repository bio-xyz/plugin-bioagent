import { IAgentRuntime, logger } from "@elizaos/core";
import { initDriveClient, FOLDERS, getListFilesQuery } from "./client.js";
import { drive_v3 } from "googleapis";
import { fileURLToPath } from "url";
import { dirname } from "path";
import DKG from "dkg.js";
import { fromBuffer } from "pdf2pic";
import { pdf2PicOptions } from "./index.js";
import { OpenAIImage } from "./extract/types.js";
import { generateKa } from "./extract";
import { storeJsonLd } from "./storeJsonLdToKg.js";
import { db, fileMetadataTable } from "src/db";

type Schema$File = drive_v3.Schema$File;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

type DKGClient = typeof DKG | null;
let DkgClient: DKGClient = null;

interface FileInfo {
  id: string;
  name: string;
  md5Checksum: string;
  size: number;
}

async function downloadFile(
  drive: drive_v3.Drive,
  file: FileInfo
): Promise<Buffer> {
  const res = await drive.files.get(
    {
      fileId: file.id,
      alt: "media",
    },
    {
      responseType: "arraybuffer",
      params: {
        supportsAllDrives: true,
        acknowledgeAbuse: true,
      },
      headers: {
        Range: "bytes=0-",
      },
    }
  );

  return Buffer.from(res.data as ArrayBuffer);
}

async function getFilesInfo(): Promise<FileInfo[]> {
  const drive = await initDriveClient();
  const query = getListFilesQuery();
  const response = await drive.files.list(query);

  return (response.data.files || [])
    .filter(
      (
        f
      ): f is Schema$File & {
        id: string;
        name: string;
        md5Checksum: string;
        size: number;
      } =>
        f.id != null &&
        f.name != null &&
        f.md5Checksum != null &&
        f.size != null
    )
    .map((f) => ({
      id: f.id,
      name: f.name,
      md5Checksum: f.md5Checksum,
      size: f.size,
    }));
}

export async function watchFolderChanges(runtime: IAgentRuntime) {
  logger.info("Watching folder changes");
  DkgClient = new DKG({
    environment: runtime.getSetting("DKG_ENVIRONMENT"),
    endpoint: runtime.getSetting("DKG_HOSTNAME"),
    port: runtime.getSetting("DKG_PORT"),
    blockchain: {
      name: runtime.getSetting("DKG_BLOCKCHAIN_NAME"),
      publicKey: runtime.getSetting("DKG_PUBLIC_KEY"),
      privateKey: runtime.getSetting("DKG_PRIVATE_KEY"),
    },
    maxNumberOfRetries: 300,
    frequency: 2,
    contentType: "all",
    nodeApiVersion: "/v1",
  });
  let knownHashes = new Set<string>();
  let processedFilesId = new Set<string>();
  let response = await db
    .select({ hash: fileMetadataTable.hash, id: fileMetadataTable.id })
    .from(fileMetadataTable);
  for (const file of response) {
    knownHashes.add(file.hash);
    processedFilesId.add(file.id);
  }
  const drive = await initDriveClient();
  let intervalId: NodeJS.Timeout | null = null;
  let isRunning = true;

  const checkForChanges = async () => {
    if (!isRunning) return;

    try {
      const files = await getFilesInfo();
      logger.info(`Found ${files.length} files`);
      const currentHashes = new Set(files.map((f) => f.md5Checksum));

      // Check for new files by hash that we haven't processed yet
      const newFiles = files.filter(
        (f) => !knownHashes.has(f.md5Checksum) && !processedFilesId.has(f.id)
      );

      if (newFiles.length > 0) {
        logger.info(
          "New files detected:",
          newFiles.map((f) => `${f.name} (${f.md5Checksum})`)
        );

        // Download new files
        for (const file of newFiles) {
          logger.info(`Downloading ${file.name}...`);
          const pdfBuffer = await downloadFile(drive, file);
          logger.info(`Successfully downloaded ${file.name}`);

          // Mark as processed immediately after download
          processedFilesId.add(file.id);

          const converter = fromBuffer(pdfBuffer, pdf2PicOptions);
          const storeHandler = await converter.bulk(-1, {
            responseType: "base64",
          });
          const images: OpenAIImage[] = storeHandler
            .filter((page) => page.base64)
            .map((page) => ({
              type: "image_url",
              image_url: {
                url: `data:image/png;base64,${page.base64}`,
              },
            }));

          const ka = await generateKa(images);
          const res = await storeJsonLd(ka);
          if (!res) {
            continue;
          } else {
            logger.info("Successfully stored JSON-LD to Oxigraph");
          }

          try {
          } catch (error) {
            logger.error(
              "Error occurred while publishing message to DKG:",
              error.message
            );

            if (error.stack) {
              logger.error("Stack trace:", error.stack);
            }
            if (error.response) {
              logger.error(
                "Response data:",
                JSON.stringify(error.response.data, null, 2)
              );
            }
          }
        }
      }

      knownHashes = currentHashes;
    } catch (error) {
      logger.error("Error checking files:", error.stack);
    }
  };

  // Start the interval
  checkForChanges();
  intervalId = setInterval(checkForChanges, 10000); // Check every 10 seconds

  // Return a function to stop watching
  return {
    stop: () => {
      isRunning = false;
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    },
  };
}
