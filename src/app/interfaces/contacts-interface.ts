/**
 * Interface defining the structure of a contact object
 * @interface ContactsInterface
 */
export interface ContactsInterface {
  /** Unique identifier for the contact */
  id?: string;
  /** Full name of the contact */
  name: string;
  /** Email address of the contact */
  email: string;
  /** Optional phone number */
  phone?: string;
  /** Flag indicating if this contact is the currently logged-in user */
  isLoggedInUser?: boolean;
}
