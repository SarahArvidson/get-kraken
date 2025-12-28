/**
 * Flying Fox Solutions - Supabase Integration
 * 
 * A comprehensive wrapper around the Supabase client that provides
 * type-safe database operations, authentication, and real-time subscriptions.
 *
 * Features:
 * - Database CRUD operations with TypeScript support
 * - Authentication (sign up, sign in, sign out, session management)
 * - Real-time subscriptions
 * - File storage operations
 * - Edge functions integration
 * - Built-in error handling and logging
 *
 * Usage:
 * ```typescript
 * import { SupabaseIntegration } from "@ffx/sdk/services";
 *
 * const supabase = new SupabaseIntegration({
 *   url: "https://your-project.supabase.co",
 *   anonKey: "your-anon-key"
 * });
 *
 * // Database operations
 * const { data, error } = await supabase.from("users").select("*");
 *
 * // Authentication
 * await supabase.auth.signUp({ email, password });
 * ```
 */

import { createClient, User, Session, AuthError } from "@supabase/supabase-js";

export interface SupabaseConfig {
  /** Supabase project URL */
  url: string;
  /** Supabase anonymous key */
  anonKey: string;
  /** Optional service role key for server-side operations */
  serviceKey?: string;
  /** Additional client options */
  options?: {
    /** Database schema (default: 'public') */
    db?: {
      schema?: string;
    };
    /** Authentication options */
    auth?: {
      /** Auto refresh token (default: true) */
      autoRefreshToken?: boolean;
      /** Persist session (default: true) */
      persistSession?: boolean;
      /** Detect session in URL (default: true) */
      detectSessionInUrl?: boolean;
    };
    /** Global options */
    global?: {
      /** Custom headers */
      headers?: Record<string, string>;
    };
  };
}

/** Supabase error interface */
export interface SupabaseError {
  message: string;
  code?: string;
  details?: string;
  hint?: string;
}

/** Database query value types */
export type DatabaseValue = string | number | boolean | null | Date;

export interface DatabaseTable<T = Record<string, unknown>> {
  select: (
    _columns?: string
  ) => Promise<{ data: T[] | null; error: SupabaseError | null }>;
  insert: (
    _data: Partial<T> | Partial<T>[]
  ) => Promise<{ data: T[] | null; error: SupabaseError | null }>;
  update: (
    _data: Partial<T>
  ) => Promise<{ data: T[] | null; error: SupabaseError | null }>;
  delete: () => Promise<{ data: T[] | null; error: SupabaseError | null }>;
  eq: (_column: string, _value: DatabaseValue) => DatabaseTable<T>;
  neq: (_column: string, _value: DatabaseValue) => DatabaseTable<T>;
  gt: (_column: string, _value: DatabaseValue) => DatabaseTable<T>;
  gte: (_column: string, _value: DatabaseValue) => DatabaseTable<T>;
  lt: (_column: string, _value: DatabaseValue) => DatabaseTable<T>;
  lte: (_column: string, _value: DatabaseValue) => DatabaseTable<T>;
  like: (_column: string, _pattern: string) => DatabaseTable<T>;
  ilike: (_column: string, _pattern: string) => DatabaseTable<T>;
  in: (_column: string, _values: DatabaseValue[]) => DatabaseTable<T>;
  order: (_column: string, _ascending?: boolean) => DatabaseTable<T>;
  limit: (_count: number) => DatabaseTable<T>;
  range: (_from: number, _to: number) => DatabaseTable<T>;
  single: () => Promise<{ data: T | null; error: SupabaseError | null }>;
}

export interface AuthResult {
  data: {
    user: User | null;
    session: Session | null;
  };
  error: AuthError | null;
}

export interface SignUpData {
  email: string;
  password: string;
  options?: {
    data?: Record<string, any>;
    redirectTo?: string;
  };
}

export interface SignInData {
  email: string;
  password: string;
}

export interface ResetPasswordData {
  email: string;
  redirectTo?: string;
}

/**
 * Supabase Integration Service
 *
 * Provides a high-level interface for interacting with Supabase
 * with built-in error handling, logging, and TypeScript support.
 */
export class SupabaseIntegration {
  private client: ReturnType<typeof createClient>;
  private config: SupabaseConfig;

  constructor(config: SupabaseConfig) {
    this.config = config;
    this.client = createClient(
      config.url,
      config.anonKey,
      config.options as any
    );
  }

  /**
   * Get the underlying Supabase client for advanced operations
   */
  get supabase(): ReturnType<typeof createClient> {
    return this.client;
  }

  /**
   * Get current user session
   */
  async getSession(): Promise<{
    data: { session: Session | null };
    error: AuthError | null;
  }> {
    try {
      const result = await this.client.auth.getSession();
      return result;
    } catch (error) {
      console.error("[SupabaseIntegration] Error getting session:", error);
      return { data: { session: null }, error: error as AuthError };
    }
  }

  /**
   * Get current user
   */
  async getUser(): Promise<{
    data: { user: User | null };
    error: AuthError | null;
  }> {
    try {
      const result = await this.client.auth.getUser();
      return result;
    } catch (error) {
      console.error("[SupabaseIntegration] Error getting user:", error);
      return { data: { user: null }, error: error as AuthError };
    }
  }

  /**
   * Sign up a new user
   */
  async signUp(data: SignUpData): Promise<AuthResult> {
    try {
      const result = await this.client.auth.signUp({
        email: data.email,
        password: data.password,
        options: data.options,
      });

      if (result.error) {
        console.error("[SupabaseIntegration] Sign up error:", result.error);
      }

      return result;
    } catch (error) {
      console.error("[SupabaseIntegration] Sign up exception:", error);
      return { data: { user: null, session: null }, error: error as AuthError };
    }
  }

  /**
   * Sign in an existing user
   */
  async signIn(data: SignInData): Promise<AuthResult> {
    try {
      const result = await this.client.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (result.error) {
        console.error("[SupabaseIntegration] Sign in error:", result.error);
      }

      return result;
    } catch (error) {
      console.error("[SupabaseIntegration] Sign in exception:", error);
      return { data: { user: null, session: null }, error: error as AuthError };
    }
  }

  /**
   * Sign out the current user
   */
  async signOut(): Promise<{ error: AuthError | null }> {
    try {
      const result = await this.client.auth.signOut();

      if (result.error) {
        console.error("[SupabaseIntegration] Sign out error:", result.error);
      }

      return result;
    } catch (error) {
      console.error("[SupabaseIntegration] Sign out exception:", error);
      return { error: error as AuthError };
    }
  }

  /**
   * Reset password for a user
   */
  async resetPassword(
    data: ResetPasswordData
  ): Promise<{ data: any; error: AuthError | null }> {
    try {
      const result = await this.client.auth.resetPasswordForEmail(data.email, {
        redirectTo: data.redirectTo,
      });

      if (result.error) {
        console.error(
          "[SupabaseIntegration] Reset password error:",
          result.error
        );
      }

      return result;
    } catch (error) {
      console.error("[SupabaseIntegration] Reset password exception:", error);
      return { data: null, error: error as AuthError };
    }
  }

  /**
   * Listen to authentication state changes
   */
  onAuthStateChange(
    callback: (_event: string, _session: Session | null) => void
  ) {
    return this.client.auth.onAuthStateChange(callback);
  }

  /**
   * Access a database table with a fluent interface
   */
  from<T = Record<string, unknown>>(table: string): any {
    return this.client.from(table);
  }

  /**
   * Execute a stored procedure or function
   */
  async rpc(
    functionName: string,
    params?: Record<string, unknown>
  ): Promise<{ data: any; error: any }> {
    try {
      const result = await this.client.rpc(functionName, params as any);

      if (result.error) {
        console.error(
          `[SupabaseIntegration] RPC ${functionName} error:`,
          result.error
        );
      }

      return result;
    } catch (error) {
      console.error(
        `[SupabaseIntegration] RPC ${functionName} exception:`,
        error
      );
      return { data: null, error };
    }
  }

  /**
   * Upload a file to Supabase Storage
   */
  async uploadFile(
    bucket: string,
    path: string,
    file: File | Blob,
    options?: {
      cacheControl?: string;
      contentType?: string;
      upsert?: boolean;
    }
  ): Promise<{ data: any; error: any }> {
    try {
      const result = await this.client.storage
        .from(bucket)
        .upload(path, file, options);

      if (result.error) {
        console.error("[SupabaseIntegration] File upload error:", result.error);
      }

      return result;
    } catch (error) {
      console.error("[SupabaseIntegration] File upload exception:", error);
      return { data: null, error };
    }
  }

  /**
   * Download a file from Supabase Storage
   */
  async downloadFile(
    bucket: string,
    path: string
  ): Promise<{ data: Blob | null; error: any }> {
    try {
      const result = await this.client.storage.from(bucket).download(path);

      if (result.error) {
        console.error(
          "[SupabaseIntegration] File download error:",
          result.error
        );
      }

      return result;
    } catch (error) {
      console.error("[SupabaseIntegration] File download exception:", error);
      return { data: null, error };
    }
  }

  /**
   * Get public URL for a file in Supabase Storage
   */
  getPublicUrl(bucket: string, path: string): { data: { publicUrl: string } } {
    return this.client.storage.from(bucket).getPublicUrl(path);
  }

  /**
   * Delete a file from Supabase Storage
   */
  async deleteFile(
    bucket: string,
    paths: string[]
  ): Promise<{ data: any; error: any }> {
    try {
      const result = await this.client.storage.from(bucket).remove(paths);

      if (result.error) {
        console.error("[SupabaseIntegration] File delete error:", result.error);
      }

      return result;
    } catch (error) {
      console.error("[SupabaseIntegration] File delete exception:", error);
      return { data: null, error };
    }
  }

  /**
   * Subscribe to real-time changes on a table
   */
  subscribe(table: string, callback: (_payload: any) => void, filter?: string) {
    const channel = this.client
      .channel(`realtime:${table}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table, filter },
        callback
      )
      .subscribe();

    return {
      unsubscribe: () => {
        this.client.removeChannel(channel);
      },
    };
  }

  /**
   * Health check - verify connection to Supabase
   */
  async healthCheck(): Promise<{ healthy: boolean; error?: any }> {
    try {
      // Try to fetch from a system table to test connection
      const { error } = await this.client
        .from("information_schema.tables")
        .select("table_name")
        .limit(1);

      if (error) {
        console.error("[SupabaseIntegration] Health check failed:", error);
        return { healthy: false, error };
      }

      return { healthy: true };
    } catch (error) {
      console.error("[SupabaseIntegration] Health check exception:", error);
      return { healthy: false, error };
    }
  }

  /**
   * Get connection info
   */
  getConnectionInfo(): { url: string; hasServiceKey: boolean } {
    return {
      url: this.config.url,
      hasServiceKey: !!this.config.serviceKey,
    };
  }
}

// Export both the class and as default for flexibility
export default SupabaseIntegration;
