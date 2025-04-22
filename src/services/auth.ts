import { supabase } from "./supabase";
import { User as SupabaseUser } from "@supabase/supabase-js";

export type User = SupabaseUser;

export interface SignUpData {
  email: string;
  password: string;
  name: string;
  profession: string;
  jobDescription: string;
  emailSignature: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export class AuthService {
  static async signUp({
    email,
    password,
    name,
    profession,
    jobDescription,
    emailSignature,
  }: SignUpData): Promise<{ user: User | null; error: Error | null }> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            profession,
            jobDescription,
            emailSignature,
          },
        },
      });

      if (error) {
        console.error("Sign up error:", error);
        return { user: null, error };
      }

      return { user: data.user, error: null };
    } catch (error) {
      console.error("Unexpected error during sign up:", error);
      return { user: null, error: error as Error };
    }
  }

  static async signIn({
    email,
    password,
  }: SignInData): Promise<{ user: User | null; error: Error | null }> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Sign in error:", error);
        return { user: null, error };
      }

      return { user: data.user, error: null };
    } catch (error) {
      console.error("Unexpected error during sign in:", error);
      return { user: null, error: error as Error };
    }
  }

  static async signOut(): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Sign out error:", error);
        return { error };
      }
      return { error: null };
    } catch (error) {
      console.error("Unexpected error during sign out:", error);
      return { error: error as Error };
    }
  }

  static async getCurrentUser(): Promise<User | null> {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error) {
        console.error("Get current user error:", error);
        return null;
      }
      return user;
    } catch (error) {
      console.error("Unexpected error getting current user:", error);
      return null;
    }
  }

  static onAuthStateChange(callback: (user: User | null) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(session?.user ?? null);
    });
  }

  static async updateProfile(updates: {
    name: string;
    profession: string;
    jobDescription: string;
    emailSignature: string;
  }): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase.auth.updateUser({
        data: updates,
      });
      return { error: error || null };
    } catch (error) {
      return { error: error as Error };
    }
  }

  static async updatePassword(
    newPassword: string
  ): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      return { error: error || null };
    } catch (error) {
      return { error: error as Error };
    }
  }
}
