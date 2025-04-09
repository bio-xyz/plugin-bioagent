import { logger } from "@elizaos/core";

interface ListFilesQueryStrategy {
  buildQuery(): Record<string, any>;
  getStartPageTokenParams(): Record<string, any>;
  getDriveType(): DriveType;
  getDriveId(): string;
  getWatchFolderParams(): Record<string, any>;
}

type DriveType = "shared_folder" | "shared_drive";

class SharedDriveFolderStrategy implements ListFilesQueryStrategy {
  constructor(private sharedDriveFolderId: string) {}

  buildQuery(): Record<string, any> {
    return {
      q: `'${this.sharedDriveFolderId}' in parents and mimeType='application/pdf' and trashed=false`,
      fields: "files(id, name, md5Checksum, size)",
      orderBy: "name",
    };
  }

  getStartPageTokenParams(): Record<string, any> {
    return {};
  }

  getDriveType(): DriveType {
    return "shared_folder";
  }

  getDriveId(): string {
    return this.sharedDriveFolderId;
  }
  getWatchFolderParams(): Record<string, any> {
    return {};
  }
}

class SharedDriveStrategy implements ListFilesQueryStrategy {
  constructor(private sharedDriveId: string) {}

  buildQuery(): Record<string, any> {
    return {
      q: `'${this.sharedDriveId}' in parents and mimeType='application/pdf' and trashed=false`,
      orderBy: "name",
      fields: "files(id, name, md5Checksum, size)",
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
      driveId: this.sharedDriveId,
      corpora: "drive",
    };
  }

  getStartPageTokenParams(): Record<string, any> {
    return {
      driveId: this.sharedDriveId,
      supportsAllDrives: true,
    };
  }

  getDriveType(): DriveType {
    return "shared_drive";
  }

  getDriveId(): string {
    return this.sharedDriveId;
  }
  getWatchFolderParams(): Record<string, any> {
    return {
      includeItemsFromAllDrives: true,
      supportsAllDrives: true,
      corpora: "drive",
    };
  }
}

export class ListFilesQueryContext {
  private strategy: ListFilesQueryStrategy;

  constructor(mainFolderId?: string, sharedDriveId?: string) {
    if (mainFolderId && sharedDriveId) {
      logger.error(
        "You cannot populate both GOOGLE_DRIVE_FOLDER_ID and SHARED_DRIVE_ID."
      );
      process.exit(1);
    } else if (sharedDriveId) {
      this.strategy = new SharedDriveStrategy(sharedDriveId);
    } else if (mainFolderId) {
      this.strategy = new SharedDriveFolderStrategy(mainFolderId);
    } else {
      logger.error(
        "Either GOOGLE_DRIVE_FOLDER_ID or SHARED_DRIVE_ID must be defined."
      );
      process.exit(1);
    }
  }

  buildQuery(): Record<string, any> {
    return this.strategy.buildQuery();
  }

  getStartPageTokenParams(): Record<string, any> {
    return this.strategy.getStartPageTokenParams();
  }

  getDriveType(): DriveType {
    return this.strategy.getDriveType();
  }

  getDriveId(): string {
    return this.strategy.getDriveId();
  }

  getWatchFolderParams(): Record<string, any> {
    return this.strategy.getWatchFolderParams();
  }
}
