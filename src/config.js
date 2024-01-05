import { config } from "dotenv";
config();

export const PORT = process.env.PORT || 25439;
export const DB_USER = process.env.DB_USER || "root";
export const DB_PASSWORD =
  process.env.DB_PASSWORD || "5Ca4aADeh2fCg2cE-fBC52gff1CD4D2A";
export const DB_HOST = process.env.DB_HOST || "roundhouse.proxy.rlwy.net";
export const DB_DATABASE = process.env.DB_DATABASE || "railway";
export const DB_PORT = process.env.DB_PORT || 3306;
