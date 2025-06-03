-- EXISTING TABLES (from main project)
-- profiles
-- applications

-- ADDITIONAL TABLES for EduSmart

-- Universities table
CREATE TABLE IF NOT EXISTS public.universities (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  country TEXT NOT NULL,
  city TEXT,
  state TEXT,
  website_url TEXT,
  logo_url TEXT,
  description TEXT,
  ranking_world INTEGER,
  ranking_national INTEGER,
  acceptance_rate DECIMAL(5, 2),
  tuition_fees TEXT,
  programs TEXT[],
  established_year INTEGER,
  student_population INTEGER,
  international_students_percentage DECIMAL(5, 2),
  campus_size TEXT,
  notable_alumni TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Update applications table structure
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS university_name TEXT;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS program_name TEXT;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS country TEXT;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS deadline TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'planning';
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS tasks JSONB DEFAULT '[]';
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS documents JSONB DEFAULT '[]';

-- Courses table
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  duration TEXT,
  level TEXT,
  price DECIMAL(10, 2),
  image_url TEXT,
  is_featured BOOLEAN DEFAULT false,
  category TEXT,
  instructor_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Course content table (for lessons)
CREATE TABLE IF NOT EXISTS public.course_content (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  type TEXT, -- video, text, quiz, etc.
  duration TEXT,
  position INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Blogs table
CREATE TABLE IF NOT EXISTS public.blogs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT,
  excerpt TEXT,
  author_id UUID REFERENCES auth.users(id),
  author_name TEXT,
  image_url TEXT,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  slug TEXT UNIQUE,
  tags TEXT[]
);

-- Scholarships table
CREATE TABLE IF NOT EXISTS public.scholarships (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  provider TEXT,
  amount TEXT,
  deadline TIMESTAMP WITH TIME ZONE,
  eligibility TEXT,
  application_url TEXT,
  country TEXT,
  field TEXT,
  level TEXT,
  type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Resources table
CREATE TABLE IF NOT EXISTS public.resources (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT, -- document, video, website, etc.
  url TEXT,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Case studies table
CREATE TABLE IF NOT EXISTS public.case_studies (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT,
  student_name TEXT,
  university TEXT,
  program TEXT,
  year INTEGER,
  image_url TEXT,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.universities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scholarships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_studies ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Universities
CREATE POLICY "Anyone can view universities" 
  ON public.universities FOR SELECT USING (true);

CREATE POLICY "Only admins can manage universities" 
  ON public.universities FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  ));

-- RLS Policies for Courses
CREATE POLICY "Anyone can view courses" 
  ON public.courses FOR SELECT USING (true);

CREATE POLICY "Only admins can insert courses" 
  ON public.courses FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  ));

CREATE POLICY "Only admins can update courses" 
  ON public.courses FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  ));

CREATE POLICY "Only admins can delete courses" 
  ON public.courses FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  ));

-- Similar policies for other tables
-- Course Content
CREATE POLICY "Anyone can view course content" 
  ON public.course_content FOR SELECT USING (true);

CREATE POLICY "Only admins can manage course content" 
  ON public.course_content FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  ));

-- Blogs
CREATE POLICY "Anyone can view published blogs" 
  ON public.blogs FOR SELECT
  USING (is_published = true OR 
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "Only admins can manage blogs" 
  ON public.blogs FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  ));

-- Scholarships
CREATE POLICY "Anyone can view scholarships" 
  ON public.scholarships FOR SELECT USING (true);

CREATE POLICY "Only admins can manage scholarships" 
  ON public.scholarships FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  ));

-- Resources
CREATE POLICY "Anyone can view resources" 
  ON public.resources FOR SELECT USING (true);

CREATE POLICY "Only admins can manage resources" 
  ON public.resources FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  ));

-- Case Studies
CREATE POLICY "Anyone can view case studies" 
  ON public.case_studies FOR SELECT USING (true);

CREATE POLICY "Only admins can manage case studies" 
  ON public.case_studies FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  ));

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_universities_country ON public.universities(country);
CREATE INDEX IF NOT EXISTS idx_universities_name ON public.universities(name);
CREATE INDEX IF NOT EXISTS idx_applications_user_id ON public.applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON public.applications(status);
CREATE INDEX IF NOT EXISTS idx_courses_category ON public.courses(category);
CREATE INDEX IF NOT EXISTS idx_courses_is_featured ON public.courses(is_featured);
CREATE INDEX IF NOT EXISTS idx_course_content_course_id ON public.course_content(course_id);
CREATE INDEX IF NOT EXISTS idx_blogs_slug ON public.blogs(slug);
CREATE INDEX IF NOT EXISTS idx_blogs_is_published ON public.blogs(is_published);
CREATE INDEX IF NOT EXISTS idx_scholarships_deadline ON public.scholarships(deadline);
CREATE INDEX IF NOT EXISTS idx_resources_category ON public.resources(category);
CREATE INDEX IF NOT EXISTS idx_case_studies_is_featured ON public.case_studies(is_featured);

-- Create a function to make a user an admin
CREATE OR REPLACE FUNCTION public.make_user_admin(user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.profiles 
  SET is_admin = true 
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 