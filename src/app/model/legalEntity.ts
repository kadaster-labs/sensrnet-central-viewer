export interface ContactDetails {
  name?: string;
  email?: string;
  phone?: string;

  isPublic: boolean;
  forRole: string;
}

export interface LegalEntity {
  _id: string;
  name: string;
  website?: string;

  contactDetails?: ContactDetails[];
}
