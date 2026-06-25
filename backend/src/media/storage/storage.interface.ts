export type SavedFile = {
  key: string;
  publicUrl: string;
};

export interface StorageDriver {
  save(listingId: number, file: Express.Multer.File): Promise<SavedFile>;
  delete(key: string): Promise<void>;
  deleteListingFolder(listingId: number): Promise<void>;
  getPublicUrl(listingId: number, filename: string): string;
  getFilePath(listingId: number, filename: string): string;
}
