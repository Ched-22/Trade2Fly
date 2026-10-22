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
  saveOrderFile(orderId: number, file: Express.Multer.File): Promise<SavedFile>;
  getOrderFilePath(orderId: number, filename: string): string;
  getOrderPublicUrl(orderId: number, filename: string): string;
}
