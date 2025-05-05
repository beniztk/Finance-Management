export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      transactions: {
        Row: {
          id: string
          date: string
          amount: number
          description: string
          category: string
          person: string
          source: string
          notes: string | null
          created_at: string | null
          user_id: string | null
        }
        Insert: {
          id?: string
          date: string
          amount: number
          description: string
          category: string
          person: string
          source: string
          notes?: string | null
          created_at?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string
          date?: string
          amount?: number
          description?: string
          category?: string
          person?: string
          source?: string
          notes?: string | null
          created_at?: string | null
          user_id?: string | null
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          color: string
          keywords: string[]
          budget: number | null
          user_id: string | null
        }
        Insert: {
          id?: string
          name: string
          color: string
          keywords?: string[]
          budget?: number | null
          user_id?: string | null
        }
        Update: {
          id?: string
          name?: string
          color?: string
          keywords?: string[]
          budget?: number | null
          user_id?: string | null
        }
      }
      monthly_incomes: {
        Row: {
          id: string
          person: string
          amount: number
          date: string
          notes: string | null
          user_id: string | null
        }
        Insert: {
          id?: string
          person: string
          amount: number
          date: string
          notes?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string
          person?: string
          amount?: number
          date?: string
          notes?: string | null
          user_id?: string | null
        }
      }
      loans: {
        Row: {
          id: string
          initial_amount: number
          remaining_amount: number
          start_date: string
          lender: string
          user_id: string | null
        }
        Insert: {
          id?: string
          initial_amount: number
          remaining_amount: number
          start_date: string
          lender: string
          user_id?: string | null
        }
        Update: {
          id?: string
          initial_amount?: number
          remaining_amount?: number
          start_date?: string
          lender?: string
          user_id?: string | null
        }
      }
      loan_payments: {
        Row: {
          id: string
          loan_id: string | null
          date: string
          amount: number
          notes: string | null
          user_id: string | null
        }
        Insert: {
          id?: string
          loan_id?: string | null
          date: string
          amount: number
          notes?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string
          loan_id?: string | null
          date?: string
          amount?: number
          notes?: string | null
          user_id?: string | null
        }
      }
      investments: {
        Row: {
          id: string
          name: string
          type: string
          initial_amount: number
          current_amount: number
          start_date: string
          monthly_contribution: number | null
          notes: string | null
          user_id: string | null
        }
        Insert: {
          id?: string
          name: string
          type: string
          initial_amount: number
          current_amount: number
          start_date: string
          monthly_contribution?: number | null
          notes?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string
          name?: string
          type?: string
          initial_amount?: number
          current_amount?: number
          start_date?: string
          monthly_contribution?: number | null
          notes?: string | null
          user_id?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}