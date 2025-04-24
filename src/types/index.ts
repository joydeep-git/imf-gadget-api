


// Error Status codes

export enum StatusCode {
  OK = 200,
  CREATED = 201,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  INTERNAL_SERVER_ERROR = 500
}



// User Data type
export interface UserDataType {
  id: string;
  name: string;
  email: string;
  password: string;
  created_at: Date;
  updated_at: Date;
}


export interface GadgetDataType {
  id: string;
  name: string;
  codename: string;
  status: 'Available' | 'Deployed' | 'Destroyed' | 'Decommissioned';
  created_by: string;
  decommission_at: Date;
  created_at: Date;
  updated_at: Date;
}




export interface BlacklistedTokenType {
  token: string;
  blacklisted_at: Date;
}
