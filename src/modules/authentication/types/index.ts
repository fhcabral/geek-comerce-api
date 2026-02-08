export type AuthResponseStatus =
  | { ok: true }                            
  | { ok: false }              
  | { accessToken: string; refreshToken: string }; 