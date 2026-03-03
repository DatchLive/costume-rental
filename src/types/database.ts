export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type CostumeCategory =
  | 'ラテン（女性）'
  | 'ラテン（男性）'
  | 'スタンダード（女性）'
  | 'スタンダード（男性）'
  | '練習着'
  | 'アクセサリー・小物'
  | 'その他'

export type CostumeStatus = 'available' | 'hidden'
export type RentalStatus = 'pending' | 'approved' | 'rejected' | 'active' | 'returned' | 'cancelled'
export type ReviewRole = 'owner' | 'renter'
export type NotificationType =
  | 'rental_requested'
  | 'rental_approved'
  | 'rental_rejected'
  | 'message_received'
  | 'rental_returned'
  | 'review_received'
  | 'return_reminder'
export type ReportStatus = 'pending' | 'resolved' | 'dismissed'
export type UserPlan = 'free' | 'premium'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          name: string | null
          area: string | null
          bio: string | null
          avatar_url: string | null
          is_verified: boolean
          good_count: number
          total_count: number
          plan: UserPlan
          created_at: string
        }
        Insert: {
          id: string
          name?: string | null
          area?: string | null
          bio?: string | null
          avatar_url?: string | null
          is_verified?: boolean
          good_count?: number
          total_count?: number
          plan?: UserPlan
          created_at?: string
        }
        Update: {
          id?: string
          name?: string | null
          area?: string | null
          bio?: string | null
          avatar_url?: string | null
          is_verified?: boolean
          good_count?: number
          total_count?: number
          plan?: UserPlan
          created_at?: string
        }
        Relationships: []
      }
      costumes: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          category: string
          height_min: number | null
          height_max: number | null
          rental_price: number
          student_price: number | null
          images: string[]
          area: string | null
          handover_area: string | null
          ships_nationwide: boolean
          allows_handover: boolean
          cleaning_responsibility: string
          cleaning_notes: string | null
          buffer_days: number
          tanning_policy: string
          safety_pin: boolean
          perfume: boolean
          colors: string[] | null
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          category: string
          height_min?: number | null
          height_max?: number | null
          rental_price: number
          student_price?: number | null
          images?: string[]
          area?: string | null
          handover_area?: string | null
          ships_nationwide?: boolean
          allows_handover?: boolean
          cleaning_responsibility?: string
          cleaning_notes?: string | null
          buffer_days?: number
          tanning_policy?: string
          safety_pin?: boolean
          perfume?: boolean
          colors?: string[] | null
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          category?: string
          height_min?: number | null
          height_max?: number | null
          rental_price?: number
          student_price?: number | null
          images?: string[]
          area?: string | null
          handover_area?: string | null
          ships_nationwide?: boolean
          allows_handover?: boolean
          cleaning_responsibility?: string
          cleaning_notes?: string | null
          buffer_days?: number
          tanning_policy?: string
          safety_pin?: boolean
          perfume?: boolean
          colors?: string[] | null
          status?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'costumes_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      rentals: {
        Row: {
          id: string
          costume_id: string
          renter_id: string
          owner_id: string
          start_date: string
          end_date: string
          total_price: number
          platform_fee: number
          status: string
          cancel_reason: string | null
          created_at: string
        }
        Insert: {
          id?: string
          costume_id: string
          renter_id: string
          owner_id: string
          start_date: string
          end_date: string
          total_price: number
          platform_fee?: number
          status?: string
          cancel_reason?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          costume_id?: string
          renter_id?: string
          owner_id?: string
          start_date?: string
          end_date?: string
          total_price?: number
          platform_fee?: number
          status?: string
          cancel_reason?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'rentals_costume_id_fkey'
            columns: ['costume_id']
            isOneToOne: false
            referencedRelation: 'costumes'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'rentals_renter_id_fkey'
            columns: ['renter_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'rentals_owner_id_fkey'
            columns: ['owner_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      messages: {
        Row: {
          id: string
          rental_id: string
          sender_id: string
          content: string
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          rental_id: string
          sender_id: string
          content: string
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          rental_id?: string
          sender_id?: string
          content?: string
          is_read?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'messages_rental_id_fkey'
            columns: ['rental_id']
            isOneToOne: false
            referencedRelation: 'rentals'
            referencedColumns: ['id']
          }
        ]
      }
      reviews: {
        Row: {
          id: string
          rental_id: string
          reviewer_id: string
          reviewee_id: string
          role: string
          rating: string
          tags: string[] | null
          comment: string | null
          is_published: boolean
          created_at: string
        }
        Insert: {
          id?: string
          rental_id: string
          reviewer_id: string
          reviewee_id: string
          role: string
          rating: string
          tags?: string[] | null
          comment?: string | null
          is_published?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          rental_id?: string
          reviewer_id?: string
          reviewee_id?: string
          role?: string
          rating?: string
          tags?: string[] | null
          comment?: string | null
          is_published?: boolean
          created_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          body: string | null
          link: string | null
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          title: string
          body?: string | null
          link?: string | null
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          title?: string
          body?: string | null
          link?: string | null
          is_read?: boolean
          created_at?: string
        }
        Relationships: []
      }
      favorites: {
        Row: {
          id: string
          user_id: string
          costume_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          costume_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          costume_id?: string
          created_at?: string
        }
        Relationships: []
      }
      reports: {
        Row: {
          id: string
          reporter_id: string
          target_user_id: string | null
          target_costume_id: string | null
          reason: string
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          reporter_id: string
          target_user_id?: string | null
          target_costume_id?: string | null
          reason: string
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          reporter_id?: string
          target_user_id?: string | null
          target_costume_id?: string | null
          reason?: string
          status?: string
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      try_publish_reviews: {
        Args: { p_rental_id: string }
        Returns: undefined
      }
      create_notification: {
        Args: {
          p_user_id: string
          p_type: string
          p_title: string
          p_body?: string
          p_link?: string
        }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Convenience row type aliases
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Costume = Database['public']['Tables']['costumes']['Row']
export type Rental = Database['public']['Tables']['rentals']['Row']
export type Message = Database['public']['Tables']['messages']['Row']
export type Review = Database['public']['Tables']['reviews']['Row']
export type Notification = Database['public']['Tables']['notifications']['Row']
export type Favorite = Database['public']['Tables']['favorites']['Row']
export type Report = Database['public']['Tables']['reports']['Row']

// Extended types with joined relations
export type CostumeWithProfile = Costume & {
  profiles: Pick<Profile, 'id' | 'name' | 'avatar_url' | 'good_count' | 'total_count' | 'is_verified'>
}

export type RentalWithDetails = Rental & {
  costumes: Pick<Costume, 'id' | 'title' | 'images' | 'rental_price'>
  renter: Pick<Profile, 'id' | 'name' | 'avatar_url'>
  owner: Pick<Profile, 'id' | 'name' | 'avatar_url'>
}

export type MessageWithSender = Message & {
  profiles: Pick<Profile, 'id' | 'name' | 'avatar_url'>
}
