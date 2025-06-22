export interface UserProfile {
  personalInfo: {
    firstName: string;
    lastName: string;
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    linkedIn: string;
    website: string;
    github: string;
  };
  professional: {
    currentTitle: string;
    company: string;
    experience: string;
    salary: string;
    salaryMin: string;
    salaryMax: string;
    availability: string;
    workAuthorization: string;
    preferredLocation: string;
  };
  documents: {
    resumeUrl: string;
    coverLetterUrl: string;
  };
}

export const defaultUserProfile: UserProfile = {
  personalInfo: {
    firstName: 'John',
    lastName: 'Doe',
    fullName: 'John Doe',
    email: 'john.doe@email.com',
    phone: '(555) 123-4567',
    address: '123 Main Street',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94102',
    country: 'United States',
    linkedIn: 'https://linkedin.com/in/johndoe',
    website: 'https://johndoe.dev',
    github: 'https://github.com/johndoe'
  },
  professional: {
    currentTitle: 'Senior Software Engineer',
    company: 'Tech Corp',
    experience: '5+ years',
    salary: '$120,000',
    salaryMin: '$110,000',
    salaryMax: '$130,000',
    availability: 'Immediately',
    workAuthorization: 'US Citizen',
    preferredLocation: 'San Francisco, CA'
  },
  documents: {
    resumeUrl: '/resume.pdf',
    coverLetterUrl: '/cover-letter.pdf'
  }
};

export const mockProfiles = {
  'product-manager': {
    name: 'Product Manager',
    personalInfo: {
      firstName: 'John',
      lastName: 'Doe',
      fullName: 'John Doe',
      email: 'john.doe@email.com',
      phone: '(555) 123-4567',
      address: '123 Main Street',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94102',
      country: 'United States',
      linkedIn: 'https://linkedin.com/in/johndoe',
      website: 'https://johndoe.dev',
      github: 'https://github.com/johndoe'
    },
    professional: {
      currentTitle: 'Senior Product Manager',
      company: 'Tech Corp',
      experience: '5+ years',
      salary: '$140,000',
      salaryMin: '$130,000',
      salaryMax: '$150,000',
      availability: 'Immediately',
      workAuthorization: 'US Citizen',
      preferredLocation: 'San Francisco, CA'
    },
    documents: {
      resumeUrl: '/resume-pm.pdf',
      coverLetterUrl: '/cover-letter-pm.pdf'
    }
  },
  'software-engineer': {
    name: 'Software Engineer',
    personalInfo: {
      firstName: 'John',
      lastName: 'Doe',
      fullName: 'John Doe',
      email: 'john.doe@email.com',
      phone: '(555) 123-4567',
      address: '123 Main Street',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94102',
      country: 'United States',
      linkedIn: 'https://linkedin.com/in/johndoe',
      website: 'https://johndoe.dev',
      github: 'https://github.com/johndoe'
    },
    professional: {
      currentTitle: 'Senior Software Engineer',
      company: 'Tech Corp',
      experience: '5+ years',
      salary: '$120,000',
      salaryMin: '$110,000',
      salaryMax: '$130,000',
      availability: 'Immediately',
      workAuthorization: 'US Citizen',
      preferredLocation: 'San Francisco, CA'
    },
    documents: {
      resumeUrl: '/resume-swe.pdf',
      coverLetterUrl: '/cover-letter-swe.pdf'
    }
  }
};