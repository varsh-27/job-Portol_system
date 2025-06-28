-- Insert sample users
INSERT INTO users (email, password_hash, user_type) VALUES
('john.doe@email.com', '$2b$10$rQZ9QmjlhQZ9QmjlhQZ9Qu', 'job_seeker'),
('jane.smith@email.com', '$2b$10$rQZ9QmjlhQZ9QmjlhQZ9Qu', 'job_seeker'),
('recruiter@techcorp.com', '$2b$10$rQZ9QmjlhQZ9QmjlhQZ9Qu', 'recruiter'),
('hr@innovate.com', '$2b$10$rQZ9QmjlhQZ9QmjlhQZ9Qu', 'recruiter')
ON CONFLICT (email) DO NOTHING;

-- Insert sample job seekers
INSERT INTO job_seekers (user_id, first_name, last_name, phone, location, title, bio, skills, experience_years, education) VALUES
(1, 'John', 'Doe', '+1-555-0123', 'San Francisco, CA', 'Full Stack Developer', 'Passionate developer with 3 years of experience in web development.', ARRAY['JavaScript', 'React', 'Node.js', 'Python', 'PostgreSQL'], 3, 'BS Computer Science - Stanford University'),
(2, 'Jane', 'Smith', '+1-555-0124', 'New York, NY', 'Data Scientist', 'Data scientist with expertise in machine learning and analytics.', ARRAY['Python', 'Machine Learning', 'SQL', 'TensorFlow', 'R'], 5, 'MS Data Science - MIT')
ON CONFLICT DO NOTHING;

-- Insert sample recruiters
INSERT INTO recruiters (user_id, company_name, contact_name, phone, company_website, company_description, company_size, industry) VALUES
(3, 'TechCorp Solutions', 'Sarah Johnson', '+1-555-0125', 'https://techcorp.com', 'Leading technology solutions provider specializing in enterprise software.', '500-1000', 'Technology'),
(4, 'Innovate Labs', 'Mike Chen', '+1-555-0126', 'https://innovatelabs.com', 'Cutting-edge AI and machine learning research company.', '50-100', 'Artificial Intelligence')
ON CONFLICT DO NOTHING;

-- Insert sample jobs
INSERT INTO jobs (recruiter_id, title, description, requirements, location, job_type, salary_min, salary_max, experience_required, skills_required) VALUES
(1, 'Senior Full Stack Developer', 'We are looking for a senior full stack developer to join our growing team. You will be responsible for developing and maintaining web applications using modern technologies.', 'Bachelor''s degree in Computer Science or related field. 3+ years of experience in full stack development. Strong knowledge of JavaScript, React, Node.js, and databases.', 'San Francisco, CA', 'full-time', 120000, 160000, 3, ARRAY['JavaScript', 'React', 'Node.js', 'PostgreSQL', 'AWS']),
(1, 'Frontend Developer', 'Join our frontend team to create amazing user experiences. You will work with designers and backend developers to implement responsive web applications.', '2+ years of frontend development experience. Proficiency in React, TypeScript, and CSS. Experience with modern build tools and version control.', 'Remote', 'full-time', 80000, 120000, 2, ARRAY['React', 'TypeScript', 'CSS', 'HTML', 'Git']),
(2, 'Machine Learning Engineer', 'We are seeking a talented ML engineer to develop and deploy machine learning models at scale. You will work on cutting-edge AI projects.', 'MS in Computer Science, Statistics, or related field. 3+ years of ML experience. Strong Python skills and experience with TensorFlow/PyTorch.', 'New York, NY', 'full-time', 140000, 180000, 3, ARRAY['Python', 'Machine Learning', 'TensorFlow', 'PyTorch', 'SQL']),
(2, 'Data Analyst', 'Looking for a data analyst to help drive business decisions through data insights. You will work with large datasets and create visualizations.', 'Bachelor''s degree in Statistics, Mathematics, or related field. 2+ years of data analysis experience. Proficiency in SQL, Python, and data visualization tools.', 'New York, NY', 'full-time', 70000, 95000, 2, ARRAY['SQL', 'Python', 'Tableau', 'Excel', 'Statistics'])
ON CONFLICT DO NOTHING;
