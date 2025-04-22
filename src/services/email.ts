import { supabase } from "./supabase";

export interface Email {
  id: string;
  user_id: string;
  subject: string;
  content: string;
  sender: string;
  recipient: string;
  created_at: string;
  is_read: boolean;
  is_draft: boolean;
  is_sent: boolean;
}

export class EmailService {
  static async getUnreadEmails(userId: string) {
    const { data, error } = await supabase
      .from("emails")
      .select("*")
      .eq("user_id", userId)
      .eq("is_read", false)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  }

  static async markAsRead(emailId: string) {
    const { error } = await supabase
      .from("emails")
      .update({ is_read: true })
      .eq("id", emailId);

    if (error) throw error;
  }

  static async sendEmail(email: Omit<Email, "id" | "created_at">) {
    const { data, error } = await supabase
      .from("emails")
      .insert([email])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getDrafts(userId: string) {
    const { data, error } = await supabase
      .from("emails")
      .select("*")
      .eq("user_id", userId)
      .eq("is_draft", true)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  }

  static async saveDraft(email: Omit<Email, "id" | "created_at">) {
    const { data, error } = await supabase
      .from("emails")
      .insert([{ ...email, is_draft: true }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updateDraft(emailId: string, updates: Partial<Email>) {
    const { data, error } = await supabase
      .from("emails")
      .update(updates)
      .eq("id", emailId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}
