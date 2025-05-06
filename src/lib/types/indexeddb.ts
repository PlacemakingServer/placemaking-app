import modelSamples from '@/lib/types/models'

export interface User {
  id: string; // UUID
  name: string;
  email: string;
  password: string;
  role: string; // 'admin', 'researcher', etc.
  status: string; // 'active', 'inactive', etc.
  created_at?: string;
  updated_at?: string;
}


export interface Field {
  id?: string;
  activity_id: string;
  title: string;
  input_type_id: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
  survey_id?: string;
  survey_type?: string;
  position?: number;
}

export interface Research {
  id?: string;
  title: string;
  description?: string;
  release_date?: string;
  lat?: number;
  long?: number;
  location_title?: string;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
  end_date?: string;
  status? : boolean;
}

// src/lib/types/indexeddb.ts

export interface SurveyTimeRange {
  id: string;
  survey_id: string;
  start_time: string;  // formato: "09:00"
  end_time: string;    // formato: "10:30"
  survey_type: string;
}


export interface SurveyRegion {
  id: string;
  name: string;
  lat: number;
  long: number;
  location_title: string;
  survey_type: string;
  survey_id: string;
}

export interface SurveyGroup {
  id: string;
  survey_type: string;
  survey_id: string;
}

export interface SurveyContributor {
  id: string;
  survey_id: string;
  survey_type: string;
  user_id: string;
  instruction?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SurveyAnswer {
  id: string;
  value: string;
  survey_type: string;
  survey_id: string;
  survey_group_id?: string;
  contributor_id: string;
  registered_at: string;
  survey_time_range_id?: string;
  survey_region_id?: string;
}

export interface StaticSurvey {
  id: string;
  title: string;
  description?: string;
  lat: number;
  long: number;
  location_title: string;
  research_id?: string;
  survey_type: string;
}

export interface FormSurvey {
  id: string;
  title: string;
  description?: string;
  lat: number;
  long: number;
  location_title: string;
  research_id?: string;
  survey_type: string;
}

export interface DynamicSurvey {
  id: string;
  title: string;
  description?: string;
  lat: number;
  long: number;
  location_title: string;
  research_id?: string;
  survey_type: string;
}

export interface ResearchContributor {
  id: string;
  research_id: string;
  user_id: string;
  instruction: string;
}

export interface InputType {
  id: string;
  name: string;
  stored_as: string;
}

export interface FieldOption {
  id: string;
  field_id: string;
  option_text: string;
  option_value?: string;
  created_at: string;
  updated_at: string;
}

export interface UnsyncedData {
  id: string;
  store: keyof StoreTypes; 
  payload: any;
}

export type StoreTypes = {
  users: User;
  fields: Field;
  researches: Research;
  survey_time_ranges: SurveyTimeRange;
  survey_regions: SurveyRegion;
  survey_group: SurveyGroup;
  survey_contributors: SurveyContributor;
  survey_answers: SurveyAnswer;
  static_surveys: StaticSurvey;
  form_surveys: FormSurvey;
  dynamic_surveys: DynamicSurvey;
  research_contributors: ResearchContributor;
  input_types: InputType;
  field_options: FieldOption;
  unsynced_data: UnsyncedData;
};





