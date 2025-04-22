export interface Email {
  id: string;
  from: string;
  to: string;
  subject: string;
  snippet: string;
  body: string;
  date: string;
  generated_reply?: string;
}
