import React, { useState, useEffect } from 'react';
import './App.css';

const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

function App() {
  const [currentView, setCurrentView] = useState('home');
  const [userType, setUserType] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({});

  useEffect(() => {
    fetchProjects();
    fetchStats();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/projects`);
      const data = await response.json();
      setProjects(data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/stats/dashboard`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const registerUser = async (userData) => {
    try {
      const response = await fetch(`${API_BASE}/api/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      const data = await response.json();
      if (response.ok) {
        setCurrentUser(data.user);
        setUserType(data.user.user_type);
        setCurrentView('dashboard');
        return { success: true };
      } else {
        return { success: false, error: data.detail };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const createProject = async (projectData) => {
    try {
      const response = await fetch(`${API_BASE}/api/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...projectData,
          company_id: currentUser.id,
          deadline: new Date(projectData.deadline).toISOString(),
        }),
      });
      const data = await response.json();
      if (response.ok) {
        fetchProjects();
        return { success: true };
      } else {
        return { success: false, error: data.detail };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const submitProject = async (submissionData) => {
    try {
      const response = await fetch(`${API_BASE}/api/submissions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...submissionData,
          student_id: currentUser.id,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        return { success: true };
      } else {
        return { success: false, error: data.detail };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const fetchProjectReviews = async (projectId) => {
    try {
      const response = await fetch(`${API_BASE}/api/leaderboard/${projectId}`);
      const data = await response.json();
      setReviews(data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const HomeView = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">PC</span>
              </div>
              <h1 className="ml-3 text-2xl font-bold text-gray-800">ProjectConnect</h1>
            </div>
            <div className="space-x-4">
              <button
                onClick={() => setCurrentView('register')}
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition duration-300"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-gray-800 mb-6">
            Bridge the Gap Between <span className="text-indigo-600">Students</span> & <span className="text-purple-600">Companies</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            AI-powered platform where students gain real-world experience through company projects, 
            get ranked by intelligent algorithms, and earn certificates while helping businesses innovate.
          </p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => setCurrentView('register')}
              className="bg-indigo-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-indigo-700 transition duration-300 transform hover:scale-105"
            >
              Start Your Journey
            </button>
            <button
              onClick={() => setCurrentView('browse')}
              className="bg-white text-indigo-600 border-2 border-indigo-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-indigo-50 transition duration-300"
            >
              Browse Projects
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition duration-300">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Real Projects</h3>
            <p className="text-gray-600">Work on actual business challenges across all domains - web dev, AI, design, marketing, and more.</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition duration-300">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">AI-Powered Reviews</h3>
            <p className="text-gray-600">Get intelligent feedback and rankings from GPT-4, providing fair and comprehensive project evaluations.</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition duration-300">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.832 18.477 19.246 18 17.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Earn Certificates</h3>
            <p className="text-gray-600">Build your resume with verified certificates from real companies for quality work and achievements.</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <h3 className="text-3xl font-bold text-center text-gray-800 mb-8">Platform Statistics</h3>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-600">{stats.total_projects || 0}</div>
              <div className="text-gray-600">Total Projects</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{stats.total_students || 0}</div>
              <div className="text-gray-600">Students</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">{stats.total_companies || 0}</div>
              <div className="text-gray-600">Companies</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">{stats.total_submissions || 0}</div>
              <div className="text-gray-600">Submissions</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );

  const RegisterView = () => {
    const [formData, setFormData] = useState({
      name: '',
      email: '',
      user_type: '',
      bio: '',
      skills: '',
      company_name: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      setError('');

      const userData = {
        ...formData,
        skills: formData.skills.split(',').map(skill => skill.trim()).filter(skill => skill)
      };

      const result = await registerUser(userData);
      if (!result.success) {
        setError(result.error);
      }
      setLoading(false);
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800">Join ProjectConnect</h2>
            <p className="text-gray-600 mt-2">Create your account to get started</p>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">I am a</label>
              <select
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={formData.user_type}
                onChange={(e) => setFormData({...formData, user_type: e.target.value})}
              >
                <option value="">Select your role</option>
                <option value="student">Student</option>
                <option value="company">Company</option>
              </select>
            </div>

            {formData.user_type === 'company' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={formData.company_name}
                  onChange={(e) => setFormData({...formData, company_name: e.target.value})}
                />
              </div>
            )}

            {formData.user_type === 'student' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Skills (comma-separated)</label>
                <input
                  type="text"
                  placeholder="React, Python, Design, Marketing..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={formData.skills}
                  onChange={(e) => setFormData({...formData, skills: e.target.value})}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows="3"
                value={formData.bio}
                onChange={(e) => setFormData({...formData, bio: e.target.value})}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setCurrentView('home')}
              className="text-indigo-600 hover:underline"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  };

  const BrowseProjectsView = () => (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">Browse Projects</h1>
          <button
            onClick={() => setCurrentView('home')}
            className="text-indigo-600 hover:underline"
          >
            Back to Home
          </button>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div key={project.id} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition duration-300">
              <div className="flex items-center justify-between mb-4">
                <span className="bg-indigo-100 text-indigo-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                  {project.domain}
                </span>
                <span className="text-green-600 font-semibold">
                  ${project.payment_amount || 0}
                </span>
              </div>
              
              <h3 className="text-xl font-bold text-gray-800 mb-2">{project.title}</h3>
              <p className="text-gray-600 mb-4 line-clamp-3">{project.description}</p>
              
              <div className="mb-4">
                <h4 className="font-semibold text-gray-700 mb-2">Requirements:</h4>
                <ul className="text-sm text-gray-600 list-disc list-inside">
                  {project.requirements.slice(0, 3).map((req, index) => (
                    <li key={index}>{req}</li>
                  ))}
                </ul>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>Deadline: {new Date(project.deadline).toLocaleDateString()}</span>
                {project.certificate_offered && (
                  <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Certificate</span>
                )}
              </div>

              <button
                onClick={() => {
                  if (!currentUser) {
                    setCurrentView('register');
                  } else if (userType === 'student') {
                    setCurrentView('submit');
                    // Set selected project for submission
                  }
                }}
                className="w-full mt-4 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition duration-300"
              >
                {!currentUser ? 'Login to Apply' : userType === 'student' ? 'Apply Now' : 'View Details'}
              </button>
            </div>
          ))}
        </div>

        {projects.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No projects available at the moment.</p>
          </div>
        )}
      </main>
    </div>
  );

  const DashboardView = () => {
    if (userType === 'company') {
      return <CompanyDashboard />;
    } else {
      return <StudentDashboard />;
    }
  };

  const CompanyDashboard = () => {
    const [showCreateProject, setShowCreateProject] = useState(false);
    const [companyProjects, setCompanyProjects] = useState([]);

    useEffect(() => {
      fetchCompanyProjects();
    }, []);

    const fetchCompanyProjects = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/projects/company/${currentUser.id}`);
        const data = await response.json();
        setCompanyProjects(data);
      } catch (error) {
        console.error('Error fetching company projects:', error);
      }
    };

    const CreateProjectForm = () => {
      const [projectData, setProjectData] = useState({
        title: '',
        domain: '',
        description: '',
        requirements: '',
        deliverables: '',
        deadline: '',
        payment_amount: '',
        certificate_offered: true
      });

      const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await createProject({
          ...projectData,
          requirements: projectData.requirements.split('\
').filter(req => req.trim()),
          deliverables: projectData.deliverables.split('\
').filter(del => del.trim()),
          payment_amount: parseFloat(projectData.payment_amount) || 0
        });

        if (result.success) {
          setShowCreateProject(false);
          fetchCompanyProjects();
        }
      };

      return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
            <h3 className="text-2xl font-bold mb-4">Create New Project</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Title</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={projectData.title}
                  onChange={(e) => setProjectData({...projectData, title: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Domain</label>
                <select
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={projectData.domain}
                  onChange={(e) => setProjectData({...projectData, domain: e.target.value})}
                >
                  <option value="">Select Domain</option>
                  <option value="Web Development">Web Development</option>
                  <option value="Mobile Development">Mobile Development</option>
                  <option value="Data Science">Data Science</option>
                  <option value="AI/ML">AI/ML</option>
                  <option value="UI/UX Design">UI/UX Design</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Business Analysis">Business Analysis</option>
                  <option value="DevOps">DevOps</option>
                  <option value="Content Writing">Content Writing</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  required
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={projectData.description}
                  onChange={(e) => setProjectData({...projectData, description: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Requirements (one per line)</label>
                <textarea
                  required
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={projectData.requirements}
                  onChange={(e) => setProjectData({...projectData, requirements: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deliverables (one per line)</label>
                <textarea
                  required
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={projectData.deliverables}
                  onChange={(e) => setProjectData({...projectData, deliverables: e.target.value})}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
                  <input
                    type="date"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={projectData.deadline}
                    onChange={(e) => setProjectData({...projectData, deadline: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Amount ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={projectData.payment_amount}
                    onChange={(e) => setProjectData({...projectData, payment_amount: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="certificate"
                  className="mr-2"
                  checked={projectData.certificate_offered}
                  onChange={(e) => setProjectData({...projectData, certificate_offered: e.target.checked})}
                />
                <label htmlFor="certificate" className="text-sm text-gray-700">Offer Certificate</label>
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  Create Project
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateProject(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      );
    };

    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow">
          <div className="container mx-auto px-6 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Company Dashboard</h1>
              <p className="text-gray-600">Welcome back, {currentUser?.name}</p>
            </div>
            <button
              onClick={() => setCurrentView('home')}
              className="text-indigo-600 hover:underline"
            >
              Logout
            </button>
          </div>
        </header>

        <main className="container mx-auto px-6 py-8">
          <div className="mb-8">
            <button
              onClick={() => setShowCreateProject(true)}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition duration-300"
            >
              Create New Project
            </button>
          </div>

          <div className="grid gap-6">
            {companyProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>

          {companyProjects.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No projects created yet. Create your first project!</p>
            </div>
          )}
        </main>

        {showCreateProject && <CreateProjectForm />}
      </div>
    );
  };

  const ProjectCard = ({ project }) => {
    const [showLeaderboard, setShowLeaderboard] = useState(false);
    const [leaderboard, setLeaderboard] = useState([]);

    const viewLeaderboard = async () => {
      await fetchProjectReviews(project.id);
      setLeaderboard(reviews);
      setShowLeaderboard(true);
    };

    return (
      <>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold text-gray-800">{project.title}</h3>
              <span className="bg-indigo-100 text-indigo-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                {project.domain}
              </span>
            </div>
            <div className="text-right">
              <div className="text-green-600 font-semibold">${project.payment_amount}</div>
              <div className="text-sm text-gray-500">{project.status}</div>
            </div>
          </div>

          <p className="text-gray-600 mb-4">{project.description}</p>

          <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
            <span>Deadline: {new Date(project.deadline).toLocaleDateString()}</span>
            <span>Created: {new Date(project.created_at).toLocaleDateString()}</span>
          </div>

          <button
            onClick={viewLeaderboard}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition duration-300"
          >
            View Submissions & Rankings
          </button>
        </div>

        {showLeaderboard && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-screen overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold">Project Leaderboard</h3>
                <button
                  onClick={() => setShowLeaderboard(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                {leaderboard.map((entry, index) => (
                  <div key={entry.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold mr-3 ${
                          index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-500' : 'bg-gray-300'
                        }`}>
                          {entry.rank || index + 1}
                        </div>
                        <div>
                          <h4 className="font-semibold">{entry.student_info?.name}</h4>
                          <p className="text-sm text-gray-600">{entry.student_info?.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-indigo-600">{entry.overall_score}/100</div>
                        <div className="text-sm text-gray-500">Overall Score</div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-4 gap-4 mb-4">
                      <div className="text-center">
                        <div className="font-semibold text-blue-600">{entry.technical_quality}/100</div>
                        <div className="text-xs text-gray-500">Technical</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-purple-600">{entry.creativity}/100</div>
                        <div className="text-xs text-gray-500">Creativity</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-green-600">{entry.completeness}/100</div>
                        <div className="text-xs text-gray-500">Completeness</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-orange-600">{entry.presentation}/100</div>
                        <div className="text-xs text-gray-500">Presentation</div>
                      </div>
                    </div>

                    <div className="text-sm text-gray-700 mb-2">
                      <strong>AI Feedback:</strong> {entry.detailed_feedback}
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <strong className="text-green-600">Strengths:</strong>
                        <ul className="list-disc list-inside text-gray-600">
                          {entry.strengths?.map((strength, i) => (
                            <li key={i}>{strength}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <strong className="text-orange-600">Areas for Improvement:</strong>
                        <ul className="list-disc list-inside text-gray-600">
                          {entry.improvements?.map((improvement, i) => (
                            <li key={i}>{improvement}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {leaderboard.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">No submissions yet for this project.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </>
    );
  };

  const StudentDashboard = () => {
    const [selectedProject, setSelectedProject] = useState(null);
    const [showSubmissionForm, setShowSubmissionForm] = useState(false);

    const SubmissionForm = () => {
      const [submissionData, setSubmissionData] = useState({
        project_id: selectedProject?.id || '',
        submission_text: '',
        github_link: '',
        demo_link: ''
      });
      const [loading, setLoading] = useState(false);

      const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const result = await submitProject(submissionData);
        if (result.success) {
          setShowSubmissionForm(false);
          setSelectedProject(null);
          alert('Submission successful! AI review is in progress.');
        } else {
          alert('Error: ' + result.error);
        }
        setLoading(false);
      };

      return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h3 className="text-2xl font-bold mb-4">Submit Your Work</h3>
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold">{selectedProject?.title}</h4>
              <p className="text-gray-600">{selectedProject?.domain}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Describe Your Solution *
                </label>
                <textarea
                  required
                  rows="6"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={submissionData.submission_text}
                  onChange={(e) => setSubmissionData({...submissionData, submission_text: e.target.value})}
                  placeholder="Explain your approach, what you built, technologies used, challenges faced, and how you solved the problem..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  GitHub Repository Link
                </label>
                <input
                  type="url"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={submissionData.github_link}
                  onChange={(e) => setSubmissionData({...submissionData, github_link: e.target.value})}
                  placeholder="https://github.com/username/project"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Live Demo Link
                </label>
                <input
                  type="url"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={submissionData.demo_link}
                  onChange={(e) => setSubmissionData({...submissionData, demo_link: e.target.value})}
                  placeholder="https://your-demo-site.com"
                />
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {loading ? 'Submitting...' : 'Submit for AI Review'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowSubmissionForm(false);
                    setSelectedProject(null);
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      );
    };

    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow">
          <div className="container mx-auto px-6 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Student Dashboard</h1>
              <p className="text-gray-600">Welcome back, {currentUser?.name}</p>
            </div>
            <button
              onClick={() => setCurrentView('home')}
              className="text-indigo-600 hover:underline"
            >
              Logout
            </button>
          </div>
        </header>

        <main className="container mx-auto px-6 py-8">
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Available Projects</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <div key={project.id} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <span className="bg-indigo-100 text-indigo-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                      {project.domain}
                    </span>
                    <span className="text-green-600 font-semibold">
                      ${project.payment_amount || 0}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{project.title}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">{project.description}</p>
                  
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-700 mb-2">Requirements:</h4>
                    <ul className="text-sm text-gray-600 list-disc list-inside">
                      {project.requirements.slice(0, 3).map((req, index) => (
                        <li key={index}>{req}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span>Deadline: {new Date(project.deadline).toLocaleDateString()}</span>
                    {project.certificate_offered && (
                      <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Certificate</span>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      setSelectedProject(project);
                      setShowSubmissionForm(true);
                    }}
                    className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition duration-300"
                  >
                    Apply Now
                  </button>
                </div>
              ))}
            </div>
          </div>
        </main>

        {showSubmissionForm && <SubmissionForm />}
      </div>
    );
  };

  // Main render
  return (
    <div className="App">
      {currentView === 'home' && <HomeView />}
      {currentView === 'register' && <RegisterView />}
      {currentView === 'browse' && <BrowseProjectsView />}
      {currentView === 'dashboard' && <DashboardView />}
    </div>
  );
}

export default App;