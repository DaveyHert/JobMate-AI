import React, { useState, useEffect } from 'react';
import { 
  User, 
  Plus, 
  Edit, 
  Trash2, 
  Upload, 
  Download, 
  Check,
  X,
  FileText,
  Briefcase,
  Mail,
  Phone,
  MapPin,
  Globe,
  Github,
  Linkedin
} from 'lucide-react';

interface Profile {
  id: string;
  name: string;
  resumeUrl?: string;
  isActive: boolean;
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    location: string;
    linkedIn?: string;
    website?: string;
    github?: string;
  };
  professional: {
    title: string;
    experience: string;
    skills: string[];
    summary: string;
  };
}

interface ProfileManagerProps {
  profiles: Profile[];
  activeProfile: string;
  onProfilesChange: (profiles: Profile[]) => void;
  onActiveProfileChange: (profileId: string) => void;
  onClose: () => void;
}

const ProfileManager: React.FC<ProfileManagerProps> = ({
  profiles,
  activeProfile,
  onProfilesChange,
  onActiveProfileChange,
  onClose
}) => {
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [draggedFile, setDraggedFile] = useState<File | null>(null);

  const createNewProfile = (): Profile => ({
    id: Date.now().toString(),
    name: '',
    isActive: false,
    personalInfo: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      location: '',
      linkedIn: '',
      website: '',
      github: ''
    },
    professional: {
      title: '',
      experience: '',
      skills: [],
      summary: ''
    }
  });

  const handleCreateProfile = () => {
    setEditingProfile(createNewProfile());
    setShowCreateForm(true);
  };

  const handleSaveProfile = (profile: Profile) => {
    if (showCreateForm) {
      // Creating new profile
      const updatedProfiles = [...profiles, profile];
      onProfilesChange(updatedProfiles);
      setShowCreateForm(false);
    } else {
      // Updating existing profile
      const updatedProfiles = profiles.map(p => 
        p.id === profile.id ? profile : p
      );
      onProfilesChange(updatedProfiles);
    }
    setEditingProfile(null);
  };

  const handleDeleteProfile = (profileId: string) => {
    if (profiles.length <= 1) {
      alert('You must have at least one profile');
      return;
    }
    
    const updatedProfiles = profiles.filter(p => p.id !== profileId);
    
    // If deleting active profile, set another as active
    if (profileId === activeProfile) {
      const newActiveProfile = updatedProfiles[0];
      onActiveProfileChange(newActiveProfile.id);
    }
    
    onProfilesChange(updatedProfiles);
  };

  const handleSetActive = (profileId: string) => {
    onActiveProfileChange(profileId);
  };

  const handleFileUpload = (file: File, profileId: string) => {
    // In a real implementation, you would upload the file to a server
    // For now, we'll just create a local URL
    const fileUrl = URL.createObjectURL(file);
    
    const updatedProfiles = profiles.map(p => 
      p.id === profileId ? { ...p, resumeUrl: fileUrl } : p
    );
    onProfilesChange(updatedProfiles);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, profileId: string) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    const pdfFile = files.find(file => file.type === 'application/pdf');
    
    if (pdfFile) {
      handleFileUpload(pdfFile, profileId);
    }
  };

  if (editingProfile) {
    return <ProfileForm 
      profile={editingProfile}
      isCreating={showCreateForm}
      onSave={handleSaveProfile}
      onCancel={() => {
        setEditingProfile(null);
        setShowCreateForm(false);
      }}
    />;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <User className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Profile Manager</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <p className="text-gray-600">
              Manage your job application profiles. Switch between different roles and customize your information.
            </p>
            <button
              onClick={handleCreateProfile}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Profile
            </button>
          </div>

          <div className="grid gap-6">
            {profiles.map((profile) => (
              <div key={profile.id} className="border border-gray-200 rounded-xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-4 h-4 rounded-full ${
                      profile.id === activeProfile ? 'bg-green-500' : 'bg-gray-300'
                    }`} />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {profile.name || 'Unnamed Profile'}
                      </h3>
                      <p className="text-sm text-gray-600">{profile.professional.title}</p>
                      {profile.id === activeProfile && (
                        <span className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full mt-1">
                          Active Profile
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {profile.id !== activeProfile && (
                      <button
                        onClick={() => handleSetActive(profile.id)}
                        className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-lg hover:bg-blue-200 transition-colors"
                      >
                        Set Active
                      </button>
                    )}
                    <button
                      onClick={() => setEditingProfile(profile)}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    {profiles.length > 1 && (
                      <button
                        onClick={() => handleDeleteProfile(profile.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Personal Info */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Personal Information
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Mail className="w-4 h-4" />
                        {profile.personalInfo.email || 'No email'}
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone className="w-4 h-4" />
                        {profile.personalInfo.phone || 'No phone'}
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="w-4 h-4" />
                        {profile.personalInfo.location || 'No location'}
                      </div>
                      {profile.personalInfo.linkedIn && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Linkedin className="w-4 h-4" />
                          LinkedIn
                        </div>
                      )}
                      {profile.personalInfo.website && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Globe className="w-4 h-4" />
                          Website
                        </div>
                      )}
                      {profile.personalInfo.github && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Github className="w-4 h-4" />
                          GitHub
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Professional Info */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                      <Briefcase className="w-4 h-4" />
                      Professional Information
                    </h4>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p><strong>Experience:</strong> {profile.professional.experience || 'Not specified'}</p>
                      <p><strong>Skills:</strong> {profile.professional.skills.length > 0 ? profile.professional.skills.join(', ') : 'No skills listed'}</p>
                      {profile.professional.summary && (
                        <p><strong>Summary:</strong> {profile.professional.summary.substring(0, 100)}...</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Resume Upload */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-700">Resume</span>
                    </div>
                    
                    {profile.resumeUrl ? (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-green-600">✓ Uploaded</span>
                        <a
                          href={profile.resumeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-700"
                        >
                          View
                        </a>
                      </div>
                    ) : (
                      <div
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, profile.id)}
                        className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors"
                      >
                        <input
                          type="file"
                          accept=".pdf"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload(file, profile.id);
                          }}
                          className="hidden"
                          id={`resume-upload-${profile.id}`}
                        />
                        <label
                          htmlFor={`resume-upload-${profile.id}`}
                          className="cursor-pointer flex items-center gap-2 text-sm text-gray-600"
                        >
                          <Upload className="w-4 h-4" />
                          Upload Resume (PDF)
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    
    </div>
  );
};

// Profile Form Component
const ProfileForm: React.FC<{
  profile: Profile;
  isCreating: boolean;
  onSave: (profile: Profile) => void;
  onCancel: () => void;
}> = ({ profile, isCreating, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Profile>(profile);
  const [skillInput, setSkillInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Profile name is required');
      return;
    }
    onSave(formData);
  };

  const addSkill = () => {
    if (skillInput.trim() && !formData.professional.skills.includes(skillInput.trim())) {
      setFormData({
        ...formData,
        professional: {
          ...formData.professional,
          skills: [...formData.professional.skills, skillInput.trim()]
        }
      });
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData({
      ...formData,
      professional: {
        ...formData.professional,
        skills: formData.professional.skills.filter(skill => skill !== skillToRemove)
      }
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            {isCreating ? 'Create New Profile' : 'Edit Profile'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Basic Info */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Profile Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Product Manager Profile"
                  required
                />
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input
                  type="text"
                  value={formData.personalInfo.firstName}
                  onChange={(e) => setFormData({
                    ...formData,
                    personalInfo: { ...formData.personalInfo, firstName: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input
                  type="text"
                  value={formData.personalInfo.lastName}
                  onChange={(e) => setFormData({
                    ...formData,
                    personalInfo: { ...formData.personalInfo, lastName: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.personalInfo.email}
                  onChange={(e) => setFormData({
                    ...formData,
                    personalInfo: { ...formData.personalInfo, email: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={formData.personalInfo.phone}
                  onChange={(e) => setFormData({
                    ...formData,
                    personalInfo: { ...formData.personalInfo, phone: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  value={formData.personalInfo.location}
                  onChange={(e) => setFormData({
                    ...formData,
                    personalInfo: { ...formData.personalInfo, location: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., San Francisco, CA"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn URL</label>
                <input
                  type="url"
                  value={formData.personalInfo.linkedIn}
                  onChange={(e) => setFormData({
                    ...formData,
                    personalInfo: { ...formData.personalInfo, linkedIn: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                <input
                  type="url"
                  value={formData.personalInfo.website}
                  onChange={(e) => setFormData({
                    ...formData,
                    personalInfo: { ...formData.personalInfo, website: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">GitHub URL</label>
                <input
                  type="url"
                  value={formData.personalInfo.github}
                  onChange={(e) => setFormData({
                    ...formData,
                    personalInfo: { ...formData.personalInfo, github: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Professional Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                <input
                  type="text"
                  value={formData.professional.title}
                  onChange={(e) => setFormData({
                    ...formData,
                    professional: { ...formData.professional, title: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Senior Product Manager"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Experience Level</label>
                <select
                  value={formData.professional.experience}
                  onChange={(e) => setFormData({
                    ...formData,
                    professional: { ...formData.professional, experience: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select experience level</option>
                  <option value="Entry level (0-2 years)">Entry level (0-2 years)</option>
                  <option value="Mid level (2-5 years)">Mid level (2-5 years)</option>
                  <option value="Senior level (5-8 years)">Senior level (5-8 years)</option>
                  <option value="Lead level (8+ years)">Lead level (8+ years)</option>
                  <option value="Executive level (10+ years)">Executive level (10+ years)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Skills</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Add a skill and press Enter"
                  />
                  <button
                    type="button"
                    onClick={addSkill}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.professional.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Professional Summary</label>
                <textarea
                  value={formData.professional.summary}
                  onChange={(e) => setFormData({
                    ...formData,
                    professional: { ...formData.professional, summary: e.target.value }
                  })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Brief summary of your professional background and goals..."
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {isCreating ? 'Create Profile' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileManager;