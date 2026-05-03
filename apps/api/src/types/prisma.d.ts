declare module '@prisma/client' {
  export const Prisma: any;

  export type Json = any;

  export class PrismaClient {
    constructor(options?: any);
    $connect(): Promise<void>;
    $disconnect(): Promise<void>;
    $on(event: string, callback: (...args: any[]) => void): void;
    [key: string]: any;
  }

  export default PrismaClient;
}
