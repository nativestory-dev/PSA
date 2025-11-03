-- ============================================
-- SEED DATA FOR PEOPLE SEARCH APP
-- ============================================
-- This script populates the database with sample people data
-- Run this AFTER running schema.sql
-- ============================================

-- Clear existing data (optional - uncomment if you want to reset)
-- TRUNCATE TABLE public.social_profiles CASCADE;
-- TRUNCATE TABLE public.education CASCADE;
-- TRUNCATE TABLE public.experience CASCADE;
-- TRUNCATE TABLE public.people CASCADE;

-- ============================================
-- PEOPLE DATA
-- ============================================

-- Person 1: Sarah Johnson
INSERT INTO public.people (id, first_name, last_name, email, phone, company, position, location, linkedin_url, avatar_url, bio, skills, last_updated, created_at, updated_at)
VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'Sarah',
  'Johnson',
  'sarah.johnson@email.com',
  '+1 (555) 123-4567',
  'Google',
  'Senior Software Engineer',
  'Mountain View, CA',
  'https://linkedin.com/in/sarahjohnson',
  'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
  'Passionate software engineer with 8+ years of experience in full-stack development. I love building scalable applications and mentoring junior developers.',
  ARRAY['React', 'TypeScript', 'Node.js', 'Python', 'AWS', 'Docker', 'Kubernetes'],
  NOW(),
  NOW(),
  NOW()
);

-- Person 2: Michael Chen
INSERT INTO public.people (id, first_name, last_name, email, phone, company, position, location, linkedin_url, avatar_url, bio, skills, last_updated, created_at, updated_at)
VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
  'Michael',
  'Chen',
  'michael.chen@email.com',
  '+1 (555) 234-5678',
  'Microsoft',
  'Product Manager',
  'Seattle, WA',
  'https://linkedin.com/in/michaelchen',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
  'Strategic product manager with expertise in B2B SaaS platforms. I focus on user-centered design and data-driven decision making.',
  ARRAY['Product Strategy', 'Agile', 'Analytics', 'User Research', 'SQL', 'Figma'],
  NOW(),
  NOW(),
  NOW()
);

-- Person 3: Emily Rodriguez
INSERT INTO public.people (id, first_name, last_name, email, phone, company, position, location, linkedin_url, avatar_url, bio, skills, last_updated, created_at, updated_at)
VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13',
  'Emily',
  'Rodriguez',
  'emily.rodriguez@email.com',
  '+1 (555) 345-6789',
  'Apple',
  'UX Designer',
  'Cupertino, CA',
  'https://linkedin.com/in/emilyrodriguez',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
  'Creative UX designer focused on creating intuitive user experiences. I believe in the power of design to solve complex problems.',
  ARRAY['Figma', 'User Research', 'Prototyping', 'Design Systems', 'Sketch', 'Adobe Creative Suite'],
  NOW(),
  NOW(),
  NOW()
);

-- Person 4: David Kim
INSERT INTO public.people (id, first_name, last_name, email, phone, company, position, location, linkedin_url, avatar_url, bio, skills, last_updated, created_at, updated_at)
VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14',
  'David',
  'Kim',
  'david.kim@email.com',
  '+1 (555) 456-7890',
  'Netflix',
  'Data Scientist',
  'Los Gatos, CA',
  'https://linkedin.com/in/davidkim',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
  'Data scientist passionate about machine learning and big data. I enjoy solving complex problems using statistical analysis and AI.',
  ARRAY['Python', 'Machine Learning', 'TensorFlow', 'SQL', 'R', 'Apache Spark', 'Tableau'],
  NOW(),
  NOW(),
  NOW()
);

-- Person 5: Lisa Wang
INSERT INTO public.people (id, first_name, last_name, email, phone, company, position, location, linkedin_url, avatar_url, bio, skills, last_updated, created_at, updated_at)
VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15',
  'Lisa',
  'Wang',
  'lisa.wang@email.com',
  '+1 (555) 567-8901',
  'Tesla',
  'DevOps Engineer',
  'Palo Alto, CA',
  'https://linkedin.com/in/lisawang',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
  'DevOps engineer with expertise in cloud infrastructure and automation. I enjoy building scalable and reliable systems.',
  ARRAY['AWS', 'Docker', 'Kubernetes', 'Terraform', 'Jenkins', 'Python', 'Bash'],
  NOW(),
  NOW(),
  NOW()
);

-- ============================================
-- EXPERIENCE DATA
-- ============================================

-- Sarah Johnson's Experience
INSERT INTO public.experience (id, person_id, company, position, start_date, end_date, description, current, created_at, updated_at)
VALUES 
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a21', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Google', 'Senior Software Engineer', '2020-01-01', NULL, 'Leading development of scalable web applications using React and Node.js', true, NOW(), NOW()),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Microsoft', 'Software Engineer', '2018-06-01', '2019-12-31', 'Developed enterprise applications using C# and .NET Core', false, NOW(), NOW());

-- Michael Chen's Experience
INSERT INTO public.experience (id, person_id, company, position, start_date, end_date, description, current, created_at, updated_at)
VALUES 
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a23', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Microsoft', 'Product Manager', '2019-03-01', NULL, 'Managing product roadmap and feature development for enterprise software', true, NOW(), NOW()),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a24', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Amazon', 'Associate Product Manager', '2017-08-01', '2019-02-28', 'Worked on e-commerce platform features and customer experience improvements', false, NOW(), NOW());

-- Emily Rodriguez's Experience
INSERT INTO public.experience (id, person_id, company, position, start_date, end_date, description, current, created_at, updated_at)
VALUES 
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a25', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'Apple', 'UX Designer', '2021-06-01', NULL, 'Designing user interfaces for iOS applications and web platforms', true, NOW(), NOW()),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a26', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'Facebook', 'UI/UX Designer', '2019-09-01', '2021-05-31', 'Designed social media features and mobile applications', false, NOW(), NOW());

-- David Kim's Experience
INSERT INTO public.experience (id, person_id, company, position, start_date, end_date, description, current, created_at, updated_at)
VALUES 
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a27', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'Netflix', 'Data Scientist', '2020-08-01', NULL, 'Building recommendation algorithms and analyzing user behavior patterns', true, NOW(), NOW()),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a28', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'Uber', 'Data Analyst', '2018-07-01', '2020-07-31', 'Analyzed ride-sharing data to optimize pricing and routing algorithms', false, NOW(), NOW());

-- Lisa Wang's Experience
INSERT INTO public.experience (id, person_id, company, position, start_date, end_date, description, current, created_at, updated_at)
VALUES 
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a29', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'Tesla', 'DevOps Engineer', '2021-01-01', NULL, 'Managing cloud infrastructure and CI/CD pipelines for autonomous vehicle software', true, NOW(), NOW()),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a2a', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'Airbnb', 'Site Reliability Engineer', '2019-06-01', '2020-12-31', 'Ensured high availability and performance of web applications', false, NOW(), NOW());

-- ============================================
-- EDUCATION DATA
-- ============================================

-- Sarah Johnson's Education
INSERT INTO public.education (id, person_id, institution, degree, field, start_date, end_date, gpa, created_at, updated_at)
VALUES 
  ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a31', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Stanford University', 'Master of Science', 'Computer Science', '2016-09-01', '2018-06-01', 3.8, NOW(), NOW()),
  ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a32', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'UC Berkeley', 'Bachelor of Science', 'Computer Science', '2012-09-01', '2016-06-01', 3.6, NOW(), NOW());

-- Michael Chen's Education
INSERT INTO public.education (id, person_id, institution, degree, field, start_date, end_date, gpa, created_at, updated_at)
VALUES 
  ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'UC Berkeley', 'Bachelor of Science', 'Business Administration', '2014-09-01', '2018-06-01', 3.6, NOW(), NOW());

-- Emily Rodriguez's Education
INSERT INTO public.education (id, person_id, institution, degree, field, start_date, end_date, gpa, created_at, updated_at)
VALUES 
  ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a34', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'Art Center College of Design', 'Bachelor of Fine Arts', 'Graphic Design', '2017-09-01', '2021-06-01', 3.9, NOW(), NOW());

-- David Kim's Education
INSERT INTO public.education (id, person_id, institution, degree, field, start_date, end_date, gpa, created_at, updated_at)
VALUES 
  ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a35', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'MIT', 'Master of Science', 'Data Science', '2016-09-01', '2018-06-01', 3.9, NOW(), NOW()),
  ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a36', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'UC San Diego', 'Bachelor of Science', 'Mathematics', '2012-09-01', '2016-06-01', 3.7, NOW(), NOW());

-- Lisa Wang's Education
INSERT INTO public.education (id, person_id, institution, degree, field, start_date, end_date, gpa, created_at, updated_at)
VALUES 
  ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a37', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'Carnegie Mellon University', 'Master of Science', 'Computer Science', '2017-09-01', '2019-06-01', 3.8, NOW(), NOW()),
  ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a38', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'University of Washington', 'Bachelor of Science', 'Computer Science', '2013-09-01', '2017-06-01', 3.5, NOW(), NOW());

-- ============================================
-- SOCIAL PROFILES DATA
-- ============================================

-- Sarah Johnson's Social Profiles
INSERT INTO public.social_profiles (id, person_id, platform, url, username, created_at, updated_at)
VALUES 
  ('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a41', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'LinkedIn', 'https://linkedin.com/in/sarahjohnson', 'sarahjohnson', NOW(), NOW()),
  ('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a42', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'GitHub', 'https://github.com/sarahjohnson', 'sarahjohnson', NOW(), NOW());

-- Michael Chen's Social Profiles
INSERT INTO public.social_profiles (id, person_id, platform, url, username, created_at, updated_at)
VALUES 
  ('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a43', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'LinkedIn', 'https://linkedin.com/in/michaelchen', 'michaelchen', NOW(), NOW());

-- Emily Rodriguez's Social Profiles
INSERT INTO public.social_profiles (id, person_id, platform, url, username, created_at, updated_at)
VALUES 
  ('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'LinkedIn', 'https://linkedin.com/in/emilyrodriguez', 'emilyrodriguez', NOW(), NOW()),
  ('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a45', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'Dribbble', 'https://dribbble.com/emilyrodriguez', 'emilyrodriguez', NOW(), NOW());

-- David Kim's Social Profiles
INSERT INTO public.social_profiles (id, person_id, platform, url, username, created_at, updated_at)
VALUES 
  ('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a46', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'LinkedIn', 'https://linkedin.com/in/davidkim', 'davidkim', NOW(), NOW()),
  ('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a47', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'GitHub', 'https://github.com/davidkim', 'davidkim', NOW(), NOW());

-- Lisa Wang's Social Profiles
INSERT INTO public.social_profiles (id, person_id, platform, url, username, created_at, updated_at)
VALUES 
  ('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a48', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'LinkedIn', 'https://linkedin.com/in/lisawang', 'lisawang', NOW(), NOW());

-- ============================================
-- VERIFICATION QUERY
-- ============================================
-- Run this to verify data was inserted correctly:
-- SELECT 
--   p.first_name || ' ' || p.last_name as name,
--   p.company,
--   p.position,
--   COUNT(DISTINCT e.id) as experience_count,
--   COUNT(DISTINCT edu.id) as education_count,
--   COUNT(DISTINCT sp.id) as social_profiles_count
-- FROM public.people p
-- LEFT JOIN public.experience e ON e.person_id = p.id
-- LEFT JOIN public.education edu ON edu.person_id = p.id
-- LEFT JOIN public.social_profiles sp ON sp.person_id = p.id
-- GROUP BY p.id, p.first_name, p.last_name, p.company, p.position
-- ORDER BY p.last_name;

