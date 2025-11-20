export interface Event {
  id: string;
  user_id: string;
  name: string;
  slug: string;
  description?: string;
  start_date: string;
  end_date?: string;
  venue?: string;
  banner_url?: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  custom_fields?: any;
  encryption_key?: string;
}

export interface EventSite {
  id: string;
  event_id: string;
  theme: string;
  sections: Section[];
  styles: Record<string, any>;
  config: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Section {
  id: string;
  type: 'hero' | 'about' | 'speakers' | 'agenda' | 'faq' | 'registration' | 'gallery';
  title: string;
  content: Record<string, any>;
  visible: boolean;
  order: number;
}

export interface Registration {
  id: string;
  event_id: string;
  full_name: string;
  email: string;
  phone?: string;
  ticket_type?: string;
  payment_status: string;
  payment_id?: string;
  form_data: Record<string, any>;
  created_at: string;
}

export interface Theme {
  id: string;
  name: string;
  preview: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
}
